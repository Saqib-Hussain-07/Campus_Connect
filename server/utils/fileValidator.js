const path = require('path');
const logger = require('./logger');

/**
 * File Security & Upload Validation Engine
 * Validates MIME types, extensions, magic byte signatures, file size, and scans for malware/embedded scripts.
 */

// Whitelisted MIME types & extensions for user uploads
const ALLOWED_IMAGE_TYPES = {
  mimes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  extensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  maxSize: 5 * 1024 * 1024 // 5MB
};

const ALLOWED_DOCUMENT_TYPES = {
  mimes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ],
  extensions: ['.pdf', '.doc', '.docx', '.txt'],
  maxSize: 25 * 1024 * 1024 // 25MB
};

// Known binary magic byte signatures
const MAGIC_NUMBERS = {
  jpg: [0xFF, 0xD8, 0xFF],
  png: [0x89, 0x50, 0x4E, 0x47],
  gif: [0x47, 0x49, 0x46, 0x38],
  webp: [0x52, 0x49, 0x46, 0x46], // Starts with "RIFF"
  pdf: [0x25, 0x50, 0x44, 0x46]   // "%PDF"
};

/**
 * Sanitize filename to prevent directory traversal and null byte injections
 */
const sanitizeFileName = (originalName) => {
  if (!originalName || typeof originalName !== 'string') {
    return 'file-' + Date.now();
  }

  // Remove null bytes and path traversal patterns
  let cleanName = originalName.replace(/\0/g, '').replace(/(\.\.[\/\\])+/g, '');
  
  // Extract extension safely
  const ext = path.extname(cleanName).toLowerCase();
  const baseName = path.basename(cleanName, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  
  return `${baseName.slice(0, 50)}${ext}`;
};

/**
 * Validate extension against whitelist and check against double-extensions (e.g. exploit.php.png)
 */
const validateFileExtension = (filename, allowedExtensions = ALLOWED_IMAGE_TYPES.extensions) => {
  const ext = path.extname(filename).toLowerCase();
  
  if (!allowedExtensions.includes(ext)) {
    return {
      isValid: false,
      code: 'INVALID_FILE_EXTENSION',
      message: `Invalid file extension "${ext}". Allowed: ${allowedExtensions.join(', ')}`
    };
  }

  // Check for dangerous double extensions (e.g. .php.jpg, .exe.png, .sh.webp)
  const parts = filename.split('.');
  if (parts.length > 2) {
    const dangerousExts = ['php', 'phtml', 'exe', 'sh', 'bat', 'cmd', 'js', 'vbs', 'scr', 'cgi', 'pl'];
    const secondLast = parts[parts.length - 2].toLowerCase();
    if (dangerousExts.includes(secondLast)) {
      return {
        isValid: false,
        code: 'SUSPICIOUS_FILE_NAME',
        message: 'Potentially malicious double extension detected.'
      };
    }
  }

  return { isValid: true };
};

/**
 * Validate MIME type against whitelist
 */
const validateMimeType = (mimeType, allowedMimes = ALLOWED_IMAGE_TYPES.mimes) => {
  if (!mimeType || !allowedMimes.includes(mimeType.toLowerCase())) {
    return {
      isValid: false,
      code: 'INVALID_MIME_TYPE',
      message: `Invalid MIME type "${mimeType}". Allowed: ${allowedMimes.join(', ')}`
    };
  }
  return { isValid: true };
};

/**
 * Verify Magic Byte header of file buffer
 */
const validateMagicBytes = (buffer, mimeType) => {
  if (!buffer || buffer.length < 4) {
    return { isValid: false, code: 'INVALID_FILE_CONTENT', message: 'File is empty or corrupted.' };
  }

  const mime = (mimeType || '').toLowerCase();

  if (mime.includes('jpeg') || mime.includes('jpg')) {
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return { isValid: true };
  } else if (mime.includes('png')) {
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return { isValid: true };
  } else if (mime.includes('gif')) {
    if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) return { isValid: true };
  } else if (mime.includes('webp')) {
    if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) return { isValid: true };
  } else if (mime.includes('pdf')) {
    if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) return { isValid: true };
  } else {
    // For non-binary or unlisted types, accept if mime check passed
    return { isValid: true };
  }

  return {
    isValid: false,
    code: 'FILE_SIGNATURE_MISMATCH',
    message: 'File content does not match its claimed MIME type or extension.'
  };
};

/**
 * Malware & Embedded Script Scanner (Heuristics + Pluggable Anti-malware hook)
 */
const scanForMalware = async (buffer, filename) => {
  if (!buffer || buffer.length === 0) {
    return { isClean: true };
  }

  // 1. Static signature / script injection heuristics for polyglot files
  const sample = buffer.slice(0, Math.min(buffer.length, 4096)).toString('latin1').toLowerCase();
  
  const maliciousSignatures = [
    '<script',
    '<?php',
    'eval(',
    'base64_decode',
    'document.cookie',
    'javascript:',
    'powershell',
    '/bin/sh',
    '/bin/bash'
  ];

  for (const sig of maliciousSignatures) {
    if (sample.includes(sig)) {
      logger.warn(`Security alert: Suspicious payload signature "${sig}" found in uploaded file "${filename}".`);
      return {
        isClean: false,
        code: 'SECURITY_THREAT_DETECTED',
        message: 'Malware or executable script signature detected in uploaded file.'
      };
    }
  }

  // 2. Future integration hook: External Anti-Malware engine (e.g. ClamAV daemon or cloud scanner)
  if (process.env.ENABLE_CLAMAV_SCAN === 'true') {
    try {
      // Plug in ClamAV scanner integration here when ClamAV daemon is provisioned
      // const clamScan = await clamav.scanBuffer(buffer);
      // if (clamScan.isInfected) return { isClean: false, message: 'Virus detected' };
    } catch (err) {
      logger.error('Anti-malware scanner error:', err.message);
    }
  }

  return { isClean: true };
};

module.exports = {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  sanitizeFileName,
  validateFileExtension,
  validateMimeType,
  validateMagicBytes,
  scanForMalware
};
