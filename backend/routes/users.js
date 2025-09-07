// routes/users.js
const express = require("express");
const router = express.Router();
const ChatUser = require("../models/ChatUser");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/users/suggestions
router.get("/suggestions", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Load current user with friends + requests
    const user = await ChatUser.findById(userId).populate(
      "friends sentRequests friendRequests"
    );

    const excludedIds = [
      userId,
      ...user.friends.map((f) => f._id.toString()),
      ...user.sentRequests.map((r) => r._id.toString()),
      ...user.friendRequests.map((r) => r._id.toString()),
    ];

    const suggestions = await ChatUser.find({
      _id: { $nin: excludedIds },
    }).select("username email");

    res.json(suggestions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
