const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Message = require("../models/Message");
const Chat = require("../models/Chat");

// Get messages of a chat
router.get("/:chatId", auth, async (req, res) => {
  const messages = await Message.find({ chat: req.params.chatId })
    .populate("sender", "username email")
    .sort({ createdAt: 1 });
  res.json(messages);
});

// Send message
router.post("/:chatId", auth, async (req, res) => {
  const { text, media } = req.body;
  const message = await Message.create({
    chat: req.params.chatId,
    sender: req.user.id,
    text,
    media,
  });

  await Chat.findByIdAndUpdate(req.params.chatId, { lastMessageAt: new Date() });

  // 🔹 emit through socket.io
  const io = req.app.get("io");
  io.to(req.params.chatId).emit("newMessage", message);

  res.json(message);
});

module.exports = router;
