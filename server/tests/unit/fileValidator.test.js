const { validateUploadedFile } = require('../../utils/fileValidator');

describe('Unit Test: 5-Layer File Upload Security Engine', () => {
  it('should accept a valid JPEG image file', async () => {
    const validJpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
    const file = {
      originalname: 'student_avatar.jpg',
      mimetype: 'image/jpeg',
      size: 1024 * 50, // 50 KB
      buffer: validJpegBuffer
    };

    const result = await validateUploadedFile(file, 'image');
    expect(result.isValid).toBe(true);
    expect(result.sanitizedName).toContain('student_avatar');
  });

  it('should reject dangerous executable / double extensions (.php.jpg)', async () => {
    const fakeBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
    const file = {
      originalname: 'malicious.php.jpg',
      mimetype: 'image/jpeg',
      size: 1024,
      buffer: fakeBuffer
    };

    const result = await validateUploadedFile(file, 'image');
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/double extension/i);
  });

  it('should reject files exceeding maximum size limits', async () => {
    const file = {
      originalname: 'huge_file.png',
      mimetype: 'image/png',
      size: 10 * 1024 * 1024, // 10 MB (limit is 5MB for images)
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    };

    const result = await validateUploadedFile(file, 'image');
    expect(result.isValid).toBe(false);
    expect(result.error).toMatch(/exceeds maximum allowed size/i);
  });

  it('should detect and reject embedded malicious script tags', async () => {
    const scriptBuffer = Buffer.from('<script>alert("xss")</script>');
    const file = {
      originalname: 'innocent.svg',
      mimetype: 'image/svg+xml',
      size: 200,
      buffer: scriptBuffer
    };

    const result = await validateUploadedFile(file, 'image');
    expect(result.isValid).toBe(false);
  });
});
