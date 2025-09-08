const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const ChatUser = require("../models/ChatUser");

// Get online status of friends
router.get("/", auth, async (req, res) => {
  try {
    const user = await ChatUser.findById(req.user.id).populate("friends");
    
    // Check if user has friends
    if (!user.friends || user.friends.length === 0) {
      return res.json([]);
    }
    
    const friendStatuses = await ChatUser.find({
      _id: { $in: user.friends.map(f => f._id) }
    }).select("_id isOnline lastSeen username");
    
    res.json(friendStatuses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;