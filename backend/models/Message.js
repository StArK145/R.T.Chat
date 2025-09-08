const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "ChatUser", required: true },
  text: String,
  media: [{
    url: String,
    publicId: String,
    type: { type: String, enum: ["image", "video", "file"] }
  }],
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "ChatUser" }], // Track read messages
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);