// frontend/src/components/Chat.jsx - Updated with back button
import React, { useState, useEffect, useRef, useCallback } from "react";
import { socket, startTyping, stopTyping } from "../services/socket";
import { useOnlineStatus } from "../contexts/OnlineStatusContext";
import { useTheme } from "../contexts/ThemeContext";
import axios from "axios";

function Chat({ chat, isMobile, onBack }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUsers, setTypingUsers] = useState({});
  const { isUserOnline } = useOnlineStatus();
  const { isDarkMode } = useTheme();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingDebounceRef = useRef({});

  useEffect(() => {
    if (!chat) return;

    socket.emit("joinChat", chat._id);
    fetchMessages();

    const handleNewMessage = (msg) => {
      if (msg.chat === chat._id) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleUserTyping = (data) => {
      setTypingUsers((prev) => ({
        ...prev,
        [data.userId]: data.username,
      }));

      if (typingDebounceRef.current[data.userId]) {
        clearTimeout(typingDebounceRef.current[data.userId]);
      }

      typingDebounceRef.current[data.userId] = setTimeout(() => {
        setTypingUsers((prev) => {
          const newTyping = { ...prev };
          delete newTyping[data.userId];
          return newTyping;
        });
      }, 3000);
    };

    const handleUserStopTyping = (data) => {
      setTypingUsers((prev) => {
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

      Object.values(typingDebounceRef.current).forEach(clearTimeout);
      typingDebounceRef.current = {};
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

      stopTyping(chat._id);
      socket.emit("sendMessage", messageData);
      setText("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleTyping = useCallback(() => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    startTyping(chat._id, currentUser.username);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

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
      (p) => p._id !== currentUser.id
    );

    return otherParticipant ? otherParticipant.username : "Unknown";
  };

  const getOtherParticipant = () => {
    if (chat.isGroup) return null;

    const currentUser = JSON.parse(localStorage.getItem("user"));
    return chat.participants.find((p) => p._id !== currentUser.id);
  };

  const typingUsersList = Object.values(typingUsers);
  const isSomeoneTyping = typingUsersList.length > 0;

  return (
    <div className="flex flex-col h-full max-h-screen bg-white dark:bg-gray-900">
      {/* Chat Header with Back Button and Online Status */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center">
          {/* Back Button - Only show if onBack handler is provided */}
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 mr-3 touch-target"
              aria-label="Back to chats"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {getChatName()}
            </h2>
            {!chat.isGroup && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
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
        </div>

        {/* Typing Indicator */}
        {isSomeoneTyping && (
          <div className="text-sm text-gray-500 dark:text-gray-400 italic">
            {typingUsersList.length === 1
              ? `${typingUsersList[0]} is typing...`
              : `${typingUsersList.join(", ")} are typing...`}
          </div>
        )}
      </div>

      {/* Messages - Fixed scrolling container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900"

      >
        {messages.map((message) => (
          <div
            key={message._id}
            className={`mb-4 ${
              message.sender._id === JSON.parse(localStorage.getItem("user")).id
                ? "text-right"
                : ""
            }`}
          >
            <div
              className={`inline-block p-3 rounded-lg max-w-xs ${
                message.sender._id ===
                JSON.parse(localStorage.getItem("user")).id
                  ? "bg-blue-500 text-white"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100"
              }`}
            >
              <p className="text-sm break-words">{message.text}</p>
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
        className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0"
      >
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 flex-shrink-0">
          <input
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex-shrink-0"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default Chat;
