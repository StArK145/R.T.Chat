import React from "react";
import { useOnlineStatus } from "../contexts/OnlineStatusContext";

function ChatList({ chats, setActiveChat, onCreateGroup }) {
  const { isUserOnline } = useOnlineStatus();

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
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold">Chats</h2>
        <button
          onClick={onCreateGroup}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
        >
          New Group
        </button>
      </div>
      
      {chats.map((chat) => {
        const otherParticipant = getOtherParticipant(chat);
        const isOnline = otherParticipant ? isUserOnline(otherParticipant._id) : false;
        
        return (
          <div
            key={chat._id}
            onClick={() => setActiveChat(chat)}
            className="p-4 border-b hover:bg-gray-50 cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center">
                <h3 className="font-semibold">{getChatName(chat)}</h3>
                {!chat.isGroup && isOnline && (
                  <span className="w-2 h-2 bg-green-500 rounded-full ml-2"></span>
                )}
              </div>
              {chat.lastMessageAt && (
                <span className="text-xs text-gray-500">
                  {new Date(chat.lastMessageAt).toLocaleTimeString()}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 truncate">
              {getLastMessage(chat)}
            </p>
          </div>
        );
      })}
      
      {chats.length === 0 && (
        <div className="p-4 text-center text-gray-500">
          No chats yet. Start a conversation!
        </div>
      )}
    </div>
  );
}

export default ChatList;