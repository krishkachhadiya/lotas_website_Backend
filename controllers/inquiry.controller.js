const Inquiry = require('../models/Inquiry.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/ApiResponse');

const getInquiries = asyncHandler(async (req, res) => {
  const inquiries = await Inquiry.find().sort({ createdAt: -1 });
  return res.json(inquiries);
});

const createInquiry = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) throw new ApiError(400, 'Name, email, and message are required');

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
