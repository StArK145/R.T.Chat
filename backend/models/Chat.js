const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  isGroup: { type: Boolean, default: false },
  name: String,
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "ChatUser" }],
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "ChatUser" }],
  lastMessageAt: Date,
}, { timestamps: true });

module.exports = mongoose.model("Chat", chatSchema);
