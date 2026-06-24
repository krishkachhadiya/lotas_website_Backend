const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/ApiResponse');

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded');
  }

  const uploadDir = path.join(__dirname, '../uploads');
  const uploadedFilePath = req.file.path;

  // Hash uploaded image
  const uploadedBuffer = fs.readFileSync(uploadedFilePath);
  const uploadedHash = crypto
    .createHash('md5')
    .update(uploadedBuffer)
    .digest('hex');

  const files = fs.readdirSync(uploadDir);

  for (const file of files) {
    const existingFilePath = path.join(uploadDir, file);

    // Skip current uploaded file
    if (existingFilePath === uploadedFilePath) {
      continue;
    }

    if (fs.statSync(existingFilePath).isFile()) {
      const existingBuffer = fs.readFileSync(existingFilePath);

      const existingHash = crypto
        .createHash('md5')
        .update(existingBuffer)
        .digest('hex');

      // Duplicate found
      if (existingHash === uploadedHash) {
        fs.unlinkSync(uploadedFilePath);

        return success(
          res,
          {
            imageUrl: `/uploads/${file}`,
          },
          'Duplicate image detected. Existing image reused.'
        );
      }
    }
  }

  return success(
    res,
    {
      imageUrl: `/uploads/${req.file.filename}`,
    },
    'Image uploaded successfully'
  );
});

module.exports = { uploadImage };