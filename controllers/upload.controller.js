const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const { success } = require("../utils/ApiResponse");

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No file uploaded");
  }

  return success(
    res,
    {
      imageUrl: req.file.path,
    },
    "Image uploaded successfully"
  );
});

module.exports = { uploadImage };