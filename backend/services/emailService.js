const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendResetEmail = async (email, token) => {
  const resetUrl = `${process.env.BACKEND_URL}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <p>You requested a password reset. Click the link below to reset your password (valid for 5 minutes):</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};