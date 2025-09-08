const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const Chat = require("../models/Chat");
const {
  createPrivateChat,
  createGroupChat,
  getChat,
  addToGroup,
  removeFromGroup
} = require("../controllers/chatController");

// Get all chats for logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user.id })
      .populate("participants", "username email")
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "username"
        }
      })
      .sort({ lastMessageAt: -1 });

    res.json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create private chat
router.post("/private", auth, createPrivateChat);

// Create group chat
router.post("/group", auth, createGroupChat);

// Get specific chat
router.get("/:chatId", auth, getChat);

// Add participants to group
router.post("/:chatId/participants", auth, addToGroup);

// Remove participant from group
router.delete("/:chatId/participants/:userId", auth, removeFromGroup);

module.exports = router;