const Inquiry = require('../models/Inquiry.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/ApiResponse');

const getInquiries = asyncHandler(async (req, res) => {
  const inquiries = await Inquiry.find().sort({ createdAt: -1 });
  return res.json(inquiries);
});

// UPGRADED: Added Captcha Verification Logic
const createInquiry = asyncHandler(async (req, res) => {
  // 1. Grab captchaToken from the frontend request body
  const { name, email, phone, subject, message, captchaToken } = req.body;

  // 2. Validate standard required fields
  if (!name || !email || !message) {
    throw new ApiError(400, 'Name, email, and message are required');
  }

  // 3. Ensure the captcha token exists
  if (!captchaToken) {
    throw new ApiError(400, 'Captcha verification token is missing');
  }

  try {
    // 4. Verify token with Google reCAPTCHA API
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;

    const response = await fetch(verifyUrl, { method: 'POST' });
    const captchaResult = await response.json();

    // 5. If Google says it's a bot or invalid token, block the request
    if (!captchaResult.success) {
      throw new ApiError(400, 'Captcha verification failed. Please try again.');
    }
  } catch (error) {
    // Catch syntax errors or network timeouts during verification
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Error processing captcha verification');
  }

  // 6. If everything passes, create the record in the database
  const inquiry = await Inquiry.create({ name, email, phone, subject, message });

  return success(res, { inquiry }, 'Inquiry submitted successfully', 201);
});

const updateInquiryStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const inquiry = await Inquiry.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!inquiry) throw new ApiError(404, 'Inquiry not found');
  return success(res, { inquiry }, 'Status updated');
});

const deleteInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
  if (!inquiry) throw new ApiError(404, 'Inquiry not found');
  return success(res, {}, 'Inquiry deleted');
});

module.exports = { getInquiries, createInquiry, updateInquiryStatus, deleteInquiry };