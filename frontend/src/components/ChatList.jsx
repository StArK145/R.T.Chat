// frontend/src/components/ChatList.jsx - Updated for mobile
import React from "react";
import { useOnlineStatus } from "../contexts/OnlineStatusContext";
import { useTheme } from "../contexts/ThemeContext";

function ChatList({ chats, setActiveChat, onCreateGroup }) {
  const { isUserOnline } = useOnlineStatus();
  const { isDarkMode } = useTheme();

  const getChatName = (chat) => {
    if (chat.isGroup) return chat.name;
    
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const otherParticipant = chat.participants.find(
      p => p._id !== currentUser.id
    );
    
    return otherParticipant ? otherParticipant.username : "Unknown";
  };

  const getOtherParticipant = (chat) => {
    if (chat.isGroup) return null;
    
    const currentUser = JSON.parse(localStorage.getItem("user"));
    return chat.participants.find(p => p._id !== currentUser.id);
  };

  const getLastMessage = (chat) => {
    if (chat.lastMessage) {
      return chat.lastMessage.text || "Media file";
    }
    return "No messages yet";
  };

  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-gray-800 min-h-0">
      {chats.map((chat) => {
        const otherParticipant = getOtherParticipant(chat);
        const isOnline = otherParticipant ? isUserOnline(otherParticipant._id) : false;
        
        return (
          <div
            key={chat._id}
            onClick={() => setActiveChat(chat)}
            className="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{getChatName(chat)}</h3>
                {!chat.isGroup && isOnline && (
                  <span className="w-2 h-2 bg-green-500 rounded-full ml-2 flex-shrink-0"></span>
                )}
              </div>
              {chat.lastMessageAt && (
                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                  {new Date(chat.lastMessageAt).toLocaleTimeString()}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
              {getLastMessage(chat)}
            </p>
          </div>
        );
      })}
      
      {chats.length === 0 && (
        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
          No chats yet. Start a conversation!
        </div>
      )}
    </div>
  );
}

export default ChatList;