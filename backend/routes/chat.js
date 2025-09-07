const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Chat = require("../models/Chat");

// Get all chats for logged-in user
router.get("/", auth, async (req, res) => {
  const chats = await Chat.find({ participants: req.user.id })
    .populate("participants", "username email")
    .sort({ updatedAt: -1 });

  res.json(chats);
});

module.exports = router;
