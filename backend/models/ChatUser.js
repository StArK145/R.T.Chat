const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "ChatUser" }],
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "ChatUser" }], // incoming
    sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "ChatUser" }], // outgoing
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatUser", userSchema);
