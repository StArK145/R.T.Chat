const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const messageRoutes = require("./routes/message");
const uploadRoutes = require("./routes/upload");
const chatRoutes = require("./routes/chat");
const friendRoutes = require("./routes/friends");
const userRoutes = require("./routes/users"); // Fixed import name
const userStatusRoutes = require("./routes/userStatus");
const ChatUser = require("./models/ChatUser");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// API Routes - THESE MUST COME BEFORE STATIC FILES
app.use('/api/auth', authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/users", userRoutes); // Use consistent naming
app.use("/api/users/status", userStatusRoutes);

// ✅ Attach io instance to app for message controller
app.set("io", io);

// ✅ Serve frontend build - THIS SHOULD COME AFTER API ROUTES
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// ✅ Catch-all route to serve index.html for SPA - THIS SHOULD BE LAST
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// --- 🔹 SOCKET.IO ---
io.on("connection", async (socket) => {
  console.log("⚡ New socket connected:", socket.id);

  // Authenticate socket
  const token = socket.handshake.auth.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.join(decoded.id);
      
      // Update user's online status
      await ChatUser.findByIdAndUpdate(decoded.id, {
        isOnline: true,
        lastSeen: new Date()
      });
      
      console.log(`✅ User ${decoded.id} authenticated and online`);
      
      // Notify friends that user is online
      const user = await ChatUser.findById(decoded.id).populate("friends");
      user.friends.forEach(friend => {
        socket.to(friend._id.toString()).emit("userOnline", { userId: decoded.id });
      });
      
    } catch (err) {
      console.error("Socket authentication error:", err);
      socket.disconnect();
      return;
    }
  } else {
    console.error("No token provided");
    socket.disconnect();
    return;
  }

  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.userId} joined chat: ${chatId}`);
  });

  socket.on("leaveChat", (chatId) => {
    socket.leave(chatId);
    console.log(`User ${socket.userId} left chat: ${chatId}`);
  });

  socket.on("sendMessage", async (msg) => {
    try {
      const Message = require("./models/Message");
      const Chat = require("./models/Chat");
      
      const message = await Message.create({
        chat: msg.chatId,
        sender: socket.userId,
        text: msg.text,
        media: msg.media
      });
      
      await Chat.findByIdAndUpdate(msg.chatId, { 
        lastMessageAt: new Date(),
        lastMessage: message._id
      });
      
      const populatedMessage = await Message.findById(message._id)
        .populate("sender", "username email");
      
      io.to(msg.chatId).emit("newMessage", populatedMessage);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  });

  // Typing indicators
  socket.on("typingStart", (data) => {
    socket.to(data.chatId).emit("userTyping", {
      userId: socket.userId,
      chatId: data.chatId,
      username: data.username
    });
  });

  socket.on("typingStop", (data) => {
    socket.to(data.chatId).emit("userStopTyping", {
      userId: socket.userId,
      chatId: data.chatId
    });
  });

  // Handle disconnection
  socket.on("disconnect", async () => {
    console.log("❌ Socket disconnected:", socket.id);
    
    try {
      // Update user's offline status
      await ChatUser.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date()
      });
      
      // Notify friends that user went offline
      const user = await ChatUser.findById(socket.userId).populate("friends");
      user.friends.forEach(friend => {
        socket.to(friend._id.toString()).emit("userOffline", { userId: socket.userId });
      });
    } catch (err) {
      console.error("Error updating offline status:", err);
    }
  });
});

// MongoDB connection & start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error('MongoDB connection error:', err));