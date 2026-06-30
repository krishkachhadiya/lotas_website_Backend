const Inquiry = require('../models/Inquiry.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/ApiResponse');
const nodemailer = require('nodemailer'); // 1. Imported nodemailer

// 2. Transporter configured using your .env credentials
const sendAdminEmailNotification = async (name, email, phone, subject, message) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.ADMIN_EMAIL) {
    console.warn("Email configuration missing in .env. Notification skipped.");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: process.env.SMTP_SERVICE || 'gmail',
    auth: {
      user: process.env.SMTP_USER, // Your Gmail address
      pass: process.env.SMTP_PASS  // The 16-character App Password you just added
    }
  });

  const mailOptions = {
    from: `"Website Contact Form" <${process.env.SMTP_USER}>`, 
    to: process.env.ADMIN_EMAIL, // Admin recipient email
    subject: `New Inquiry: ${subject || 'No Subject'} - From ${name}`,
    text: `You have received a new contact form submission.\n\n` +
          `Details:\n` +
          `Name: ${name}\n` +
          `Email: ${email}\n` +
          `Phone: ${phone || 'N/A'}\n\n` +
          `Message:\n${message}`,
    replyTo: email // Clicking reply in your inbox goes directly to the user
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Admin notification email sent successfully.");
  } catch (error) {
    console.error("Failed to send admin email notification:", error);
  }
};

const getInquiries = asyncHandler(async (req, res) => {
  const inquiries = await Inquiry.find().sort({ createdAt: -1 });
  return res.json(inquiries);
});

// 3. Updated Inquiry controller
const createInquiry = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message, captchaToken } = req.body;

  if (!name || !email || !message) {
    throw new ApiError(400, 'Name, email, and message are required');
  }

  if (!captchaToken) {
    throw new ApiError(400, 'Captcha verification token is missing');
  }

  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;

    const response = await fetch(verifyUrl, { method: 'POST' });
    const captchaResult = await response.json();

    if (!captchaResult.success) {
      throw new ApiError(400, 'Captcha verification failed. Please try again.');
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Error processing captcha verification');
  }

  // Create the record in your MongoDB database
  const inquiry = await Inquiry.create({ name, email, phone, subject, message });

  // ⚡ Fire off the email notification instantly in the background
  sendAdminEmailNotification(name, email, phone, subject, message);

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