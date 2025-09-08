import React, { useState, useEffect, useRef, useCallback } from "react";
import { socket, startTyping, stopTyping } from "../services/socket";
import { useOnlineStatus } from "../contexts/OnlineStatusContext";
import axios from "axios";

function Chat({ chat }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUsers, setTypingUsers] = useState({});
  const { isUserOnline } = useOnlineStatus();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingDebounceRef = useRef({}); // Initialize as empty object instead of null

  useEffect(() => {
    if (!chat) return;

    // Join chat room
    socket.emit("joinChat", chat._id);

    // Fetch messages
    fetchMessages();

    // Set up socket listeners
    const handleNewMessage = (msg) => {
      if (msg.chat === chat._id) {
        setMessages(prev => [...prev, msg]);
      }
    };

    const handleUserTyping = (data) => {
      setTypingUsers(prev => ({
        ...prev,
        [data.userId]: data.username
      }));

      // Clear typing after 3 seconds
      if (typingDebounceRef.current[data.userId]) {
        clearTimeout(typingDebounceRef.current[data.userId]);
      }

      typingDebounceRef.current[data.userId] = setTimeout(() => {
        setTypingUsers(prev => {
          const newTyping = { ...prev };
          delete newTyping[data.userId];
          return newTyping;
        });
      }, 3000);
    };

    const handleUserStopTyping = (data) => {
      setTypingUsers(prev => {
        const newTyping = { ...prev };
        delete newTyping[data.userId];
        return newTyping;
      });
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("userTyping", handleUserTyping);
    socket.on("userStopTyping", handleUserStopTyping);

    return () => {
      socket.emit("leaveChat", chat._id);
      socket.off("newMessage", handleNewMessage);
      socket.off("userTyping", handleUserTyping);
      socket.off("userStopTyping", handleUserStopTyping);
      
      // Clear all timeouts
      Object.values(typingDebounceRef.current).forEach(clearTimeout);
      typingDebounceRef.current = {}; // Reset to empty object
    };
  }, [chat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`/api/messages/${chat._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMessages(res.data);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const messageData = {
        chatId: chat._id,
        text: text.trim(),
      };

      // Stop typing when sending message
      stopTyping(chat._id);
      
      // Emit via socket
      socket.emit("sendMessage", messageData);
      setText("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleTyping = useCallback(() => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    
    // Start typing
    startTyping(chat._id, currentUser.username);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(chat._id);
    }, 1000);
  }, [chat._id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getChatName = () => {
    if (chat.isGroup) return chat.name;
    
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const otherParticipant = chat.participants.find(
      p => p._id !== currentUser.id
    );
    
    return otherParticipant ? otherParticipant.username : "Unknown";
  };

  const getOtherParticipant = () => {
    if (chat.isGroup) return null;
    
    const currentUser = JSON.parse(localStorage.getItem("user"));
    return chat.participants.find(p => p._id !== currentUser.id);
  };

  const typingUsersList = Object.values(typingUsers);
  const isSomeoneTyping = typingUsersList.length > 0;

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header with Online Status */}
      <div className="p-4 border-b bg-white flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">{getChatName()}</h2>
          {!chat.isGroup && (
            <p className="text-sm text-gray-500">
              {isUserOnline(getOtherParticipant()?._id) ? (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Online
                </span>
              ) : (
                "Offline"
              )}
            </p>
          )}
        </div>
        
        {/* Typing Indicator */}
        {isSomeoneTyping && (
          <div className="text-sm text-gray-500 italic">
            {typingUsersList.length === 1 
              ? `${typingUsersList[0]} is typing...`
              : `${typingUsersList.join(', ')} are typing...`
            }
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`mb-4 ${message.sender._id === JSON.parse(localStorage.getItem("user")).id ? 'text-right' : ''}`}
          >
            <div
              className={`inline-block p-3 rounded-lg max-w-xs ${
                message.sender._id === JSON.parse(localStorage.getItem("user")).id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(message.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="p-4 border-t bg-white"
      >
        <div className="flex space-x-2">
          <input
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default Chat;