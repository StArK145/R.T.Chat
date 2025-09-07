const ChatUser = require("../models/ChatUser");

// Send friend request
exports.sendRequest = async (req, res) => {
  try {
    const { userId } = req.body; // target user
    const sender = await ChatUser.findById(req.user.id);
    const receiver = await ChatUser.findById(userId);

    if (!receiver) return res.status(404).json({ message: "ChatUser not found" });
    if (receiver.friendRequests.includes(sender._id) || sender.sentRequests.includes(receiver._id)) {
      return res.status(400).json({ message: "Request already sent" });
    }

    receiver.friendRequests.push(sender._id);
    sender.sentRequests.push(receiver._id);

    await receiver.save();
    await sender.save();

    res.json({ message: "Friend request sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Accept request
exports.acceptRequest = async (req, res) => {
  try {
    const { userId } = req.body; // sender of request
    const receiver = await ChatUser.findById(req.user.id);
    const sender = await ChatUser.findById(userId);

    if (!receiver.friendRequests.includes(sender._id)) {
      return res.status(400).json({ message: "No such request" });
    }

    // Remove from requests
    receiver.friendRequests = receiver.friendRequests.filter(
      (id) => id.toString() !== sender._id.toString()
    );
    sender.sentRequests = sender.sentRequests.filter(
      (id) => id.toString() !== receiver._id.toString()
    );

    // Add to friends
    receiver.friends.push(sender._id);
    sender.friends.push(receiver._id);

    await receiver.save();
    await sender.save();

    res.json({ message: "Friend request accepted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Reject request
exports.rejectRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    const receiver = await ChatUser.findById(req.user.id);
    const sender = await ChatUser.findById(userId);

    receiver.friendRequests = receiver.friendRequests.filter(
      (id) => id.toString() !== sender._id.toString()
    );
    sender.sentRequests = sender.sentRequests.filter(
      (id) => id.toString() !== receiver._id.toString()
    );

    await receiver.save();
    await sender.save();

    res.json({ message: "Friend request rejected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get requests + friends + sent requests
exports.getRequests = async (req, res) => {
  try {
    const user = await ChatUser.findById(req.user.id)
      .populate("friendRequests", "username email")
      .populate("friends", "username email")
      .populate("sentRequests", "username email");

    res.json({
      requests: user.friendRequests,
      sentRequests: user.sentRequests,
      friends: user.friends,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get friend suggestions
exports.getSuggestions = async (req, res) => {
  try {
    const user = await ChatUser.findById(req.user.id);

    const excludeIds = [
      ...user.friends,
      ...user.friendRequests,
      ...user.sentRequests,
      user._id,
    ];

    const suggestions = await ChatUser.find({
      _id: { $nin: excludeIds },
    }).select("username email");

    res.json(suggestions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
