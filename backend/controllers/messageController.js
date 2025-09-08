// Update backend/controllers/messageController.js or add to existing message routes
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    
    // Check if user is in the chat
    const chat = await Chat.findById(message.chat);
    if (!chat.participants.includes(req.user.id)) {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    // Add user to readBy if not already there
    if (!message.readBy.includes(req.user.id)) {
      message.readBy.push(req.user.id);
      await message.save();
      
      // Notify other participants
      const io = req.app.get("io");
      io.to(message.chat.toString()).emit("messageRead", {
        messageId,
        userId: req.user.id
      });
    }
    
    res.json({ message: "Marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

