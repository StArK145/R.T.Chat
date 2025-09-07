// backend/index.js
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const messageRoutes = require("./routes/message");
const uploadRoutes = require("./routes/upload");
const chatRoutes = require("./routes/chat");
const friendRoutes = require("./routes/friends");
const Users = require("./routes/users");




const app = express();
const server = createServer(app); // wrap with HTTP
const io = new Server(server, {
  cors: { origin: "*" } // allow frontend
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/users", Users);


// ✅ Attach io instance to app for message controller
app.set("io", io);

// ✅ Serve frontend build
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// ✅ Catch-all route to serve index.html for SPA
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// --- 🔹 SOCKET.IO ---
io.on("connection", (socket) => {
  console.log("⚡ New socket connected:", socket.id);

  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat: ${chatId}`);
  });

  socket.on("sendMessage", (msg) => {
    io.to(msg.chatId).emit("newMessage", msg);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
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
