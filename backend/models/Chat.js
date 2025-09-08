const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  isGroup: { type: Boolean, default: false },
  name: String,
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "ChatUser" }],
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "ChatUser" }],
  lastMessageAt: Date,
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" }, // Add this field
  groupImage: String,
}, { timestamps: true });

module.exports = mongoose.model("Chat", chatSchema);