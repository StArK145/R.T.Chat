const ChatUser = require('../models/ChatUser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendResetEmail } = require('../services/emailService');

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const userExists = await ChatUser.findOne({ $or: [{ email }, { username }] });
    if (userExists) return res.status(400).json({ message: "Username or email already taken" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await ChatUser.create({ username, email, password: hashedPassword });

    res.status(201).json({ message: "ChatUser registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { identifier, password } = req.body; // identifier = email OR username
  try {
    const user = await ChatUser.findOne({ $or: [{ email: identifier }, { username: identifier }] });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await ChatUser.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email not found" });

    // Generate token and set expiry (5 minutes from now)
    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 300000; // 5 minutes
    await user.save();

    await sendResetEmail(user.email, token);
    
    res.status(200).json({ message: "Reset link sent to email" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const user = await ChatUser.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    // Update password and clear token
    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};