const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sendError } = require('../utils/apiResponse');
const {
  ALLOWED_IMAGE_TYPES,
  sanitizeFileName,
  validateFileExtension,
  validateMimeType,
  validateMagicBytes,
  scanForMalware
} = require('../utils/fileValidator');

const uploadDir = path.join(__dirname, '../../assets/uploads/avatars');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const sanitized = sanitizeFileName(file.originalname);
    const ext = path.extname(sanitized).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  // 1. Validate MIME type
  const mimeCheck = validateMimeType(file.mimetype, ALLOWED_IMAGE_TYPES.mimes);
  if (!mimeCheck.isValid) {
    const err = new Error(mimeCheck.message);
    err.code = mimeCheck.code;
    return cb(err, false);
  }

  // 2. Validate Extension
  const extCheck = validateFileExtension(file.originalname, ALLOWED_IMAGE_TYPES.extensions);
  if (!extCheck.isValid) {
    const err = new Error(extCheck.message);
    err.code = extCheck.code;
    return cb(err, false);
  }

  cb(null, true);
};

const rawMulter = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: ALLOWED_IMAGE_TYPES.maxSize, // 5MB limit
    files: 1
  }
});

/**
 * Middleware wrapper for single file upload with Magic Byte and Malware inspection
 */
const uploadSingle = (fieldName) => {
  const uploadHandler = rawMulter.single(fieldName);

  return (req, res, next) => {
    uploadHandler(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return sendError(res, 'File exceeds the maximum allowed size of 5MB', 400, 'FILE_TOO_LARGE');
          }
          return sendError(res, `Upload error: ${err.message}`, 400, 'UPLOAD_ERROR');
        }
        return sendError(res, err.message, 400, err.code || 'INVALID_FILE');
      }

      if (req.file) {
        try {
          // Read the first 4KB chunk of uploaded file to verify magic bytes and scan malware
          const buffer = Buffer.alloc(4096);
          const fd = fs.openSync(req.file.path, 'r');
          const bytesRead = fs.readSync(fd, buffer, 0, 4096, 0);
          fs.closeSync(fd);
          const fileSlice = buffer.slice(0, bytesRead);

          // 3. Verify Magic Byte signature
          const magicCheck = validateMagicBytes(fileSlice, req.file.mimetype);
          if (!magicCheck.isValid) {
            fs.unlink(req.file.path, () => {});
            return sendError(res, magicCheck.message, 400, magicCheck.code);
          }

          // 4. Scan for malware / malicious script payloads
          const malwareScan = await scanForMalware(fileSlice, req.file.originalname);
          if (!malwareScan.isClean) {
            fs.unlink(req.file.path, () => {});
            return sendError(res, malwareScan.message, 400, malwareScan.code);
          }
        } catch (readErr) {
          if (req.file.path && fs.existsSync(req.file.path)) {
            fs.unlink(req.file.path, () => {});
          }
          return sendError(res, 'Failed to inspect uploaded file security', 500, 'FILE_INSPECTION_FAILED');
        }
      }

      next();
    });
  };
};

module.exports = {
  uploadSingle,
  single: uploadSingle,
  rawMulter
};
