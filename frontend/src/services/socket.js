import { io } from "socket.io-client";

const URL = "http://localhost:5000";

// Create socket instance but don't connect immediately
export const socket = io(URL, {
  autoConnect: false,
  auth: {
    token: localStorage.getItem("token")
  }
});

// Connect socket with authentication
export const connectSocket = () => {
  const token = localStorage.getItem("token");
  if (token) {
    socket.auth.token = token;
    socket.connect();
  }
};

// Disconnect socket
export const disconnectSocket = () => {
  socket.disconnect();
};

// Typing functions
export const startTyping = (chatId, username) => {
  socket.emit("typingStart", { chatId, username });
};

export const stopTyping = (chatId) => {
  socket.emit("typingStop", { chatId });
};

// Online status functions
export const setupOnlineStatusListeners = (onUserOnline, onUserOffline) => {
  socket.on("userOnline", (data) => {
    if (onUserOnline) onUserOnline(data.userId);
  });
  
  socket.on("userOffline", (data) => {
    if (onUserOffline) onUserOffline(data.userId);
  });
};

// Remove online status listeners
export const removeOnlineStatusListeners = () => {
  socket.off("userOnline");
  socket.off("userOffline");
};

// Listen for new chat events
export const setupChatListeners = (onNewChat) => {
  socket.on("newChat", (chat) => {
    if (onNewChat) onNewChat(chat);
  });
};

// Remove chat listeners
export const removeChatListeners = () => {
  socket.off("newChat");
};

// Typing indicators listeners
export const setupTypingListeners = (onUserTyping, onUserStopTyping) => {
  socket.on("userTyping", (data) => {
    if (onUserTyping) onUserTyping(data);
  });
  
  socket.on("userStopTyping", (data) => {
    if (onUserStopTyping) onUserStopTyping(data);
  });
};

// Remove typing listeners
export const removeTypingListeners = () => {
  socket.off("userTyping");
  socket.off("userStopTyping");
};