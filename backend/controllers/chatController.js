const Chat = require("../models/Chat");
const ChatUser = require("../models/ChatUser");

// Create a private chat
exports.createPrivateChat = async (req, res) => {
  try {
    const { participantId } = req.body;
    const currentUser = req.user.id;

    // Check if private chat already exists
    const existingChat = await Chat.findOne({
      isGroup: false,
      participants: { $all: [currentUser, participantId], $size: 2 }
    }).populate("participants", "username email");

    if (existingChat) {
      return res.json(existingChat);
    }

    // Create new private chat
    const chat = await Chat.create({
      isGroup: false,
      participants: [currentUser, participantId]
    });

    const populatedChat = await Chat.findById(chat._id)
      .populate("participants", "username email");

    res.status(201).json(populatedChat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Create a group chat
exports.createGroupChat = async (req, res) => {
  try {
    const { name, participantIds } = req.body;
    const currentUser = req.user.id;

    // Validate input
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Group name is required" });
    }

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({ message: "At least one participant is required" });
    }

    // Check if all participant IDs are valid
    const participants = await ChatUser.find({
      _id: { $in: participantIds }
    });

    if (participants.length !== participantIds.length) {
      return res.status(400).json({ message: "Invalid participant IDs" });
    }

    // Add current user to participants
    const allParticipants = [...new Set([...participantIds, currentUser])];

    // Check if group name is already taken for this user
    const existingGroup = await Chat.findOne({
      isGroup: true,
      name: name.trim(),
      participants: currentUser
    });

    if (existingGroup) {
      return res.status(400).json({ message: "You already have a group with this name" });
    }

    // Create group chat
    const chat = await Chat.create({
      isGroup: true,
      name: name.trim(),
      participants: allParticipants,
      admins: [currentUser]
    });

    // Populate the chat with user details
    const populatedChat = await Chat.findById(chat._id)
      .populate("participants", "username email")
      .populate("admins", "username email");

    // Notify all participants about the new group
    const io = req.app.get("io");
    allParticipants.forEach(participantId => {
      io.to(participantId.toString()).emit("newChat", populatedChat);
    });

    res.status(201).json(populatedChat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get chat details
exports.getChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate("participants", "username email")
      .populate("admins", "username email");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Check if user is a participant
    if (!chat.participants.some(p => p._id.toString() === req.user.id)) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Add participants to group
exports.addToGroup = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { participantIds } = req.body;

    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (!chat.isGroup) {
      return res.status(400).json({ message: "Cannot add participants to private chat" });
    }

    // Check if user is admin
    if (!chat.admins.includes(req.user.id)) {
      return res.status(403).json({ message: "Only admins can add participants" });
    }

    // Check if new participants are valid users
    const newParticipants = await ChatUser.find({
      _id: { $in: participantIds }
    });

    if (newParticipants.length !== participantIds.length) {
      return res.status(400).json({ message: "Invalid participant IDs" });
    }

    // Filter out existing participants
    const participantsToAdd = participantIds.filter(
      id => !chat.participants.includes(id)
    );

    if (participantsToAdd.length === 0) {
      return res.status(400).json({ message: "All users are already in the group" });
    }

    // Add new participants
    chat.participants = [...chat.participants, ...participantsToAdd];
    await chat.save();

    const populatedChat = await Chat.findById(chatId)
      .populate("participants", "username email")
      .populate("admins", "username email");

    // Notify all participants about the update
    const io = req.app.get("io");
    io.to(chatId).emit("chatUpdated", populatedChat);

    // Notify new participants about the group
    participantsToAdd.forEach(participantId => {
      io.to(participantId.toString()).emit("newChat", populatedChat);
    });

    res.json(populatedChat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove from group
exports.removeFromGroup = async (req, res) => {
  try {
    const { chatId, userId } = req.params;

    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (!chat.isGroup) {
      return res.status(400).json({ message: "Cannot remove participants from private chat" });
    }

    // Check if user is admin or removing themselves
    if (!chat.admins.includes(req.user.id) && req.user.id !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if user is in the group
    if (!chat.participants.includes(userId)) {
      return res.status(400).json({ message: "User is not in this group" });
    }

    // Cannot remove the last admin
    if (chat.admins.includes(userId) && chat.admins.length === 1) {
      return res.status(400).json({ message: "Cannot remove the only admin" });
    }

    // Remove participant
    chat.participants = chat.participants.filter(
      p => p.toString() !== userId
    );

    // Remove from admins if they were admin
    chat.admins = chat.admins.filter(
      a => a.toString() !== userId
    );

    await chat.save();

    const populatedChat = await Chat.findById(chatId)
      .populate("participants", "username email")
      .populate("admins", "username email");

    // Notify all participants about the update
    const io = req.app.get("io");
    io.to(chatId).emit("chatUpdated", populatedChat);

    // Remove user from socket room
    io.to(chatId).emit("userRemoved", { chatId, userId });

    res.json(populatedChat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};