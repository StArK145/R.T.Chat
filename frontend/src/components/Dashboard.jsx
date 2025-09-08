import React, { useState, useEffect } from "react";
import ChatList from "./ChatList";
import Chat from "./Chat";
import SideBar from "./SideBar";
import GroupCreateModal from "./GroupCreateModal";
import { 
  setupChatListeners, 
  removeChatListeners,
  setupOnlineStatusListeners,
  removeOnlineStatusListeners,
  connectSocket,
  disconnectSocket 
} from "../services/socket";
import { OnlineStatusProvider, useOnlineStatus } from "../contexts/OnlineStatusContext";
import axios from "axios";

function DashboardContent() {
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const { updateOnlineStatus, updateOfflineStatus } = useOnlineStatus();

  useEffect(() => {
    // Connect socket
    connectSocket();
    
    // Fetch initial chats
    fetchChats();
    
    // Set up socket listeners
    setupChatListeners(handleNewChat);
    setupOnlineStatusListeners(handleUserOnline, handleUserOffline);
    
    return () => {
      removeChatListeners();
      removeOnlineStatusListeners();
      disconnectSocket();
    };
  }, []);

  const handleUserOnline = (userId) => {
    updateOnlineStatus(userId);
  };

  const handleUserOffline = (userId) => {
    updateOfflineStatus(userId);
  };

  const fetchChats = async () => {
    try {
      const res = await axios.get("/api/chats", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setChats(res.data);
    } catch (err) {
      console.error("Error fetching chats:", err);
    }
  };

  const handleNewChat = (newChat) => {
    setChats(prevChats => {
      // Check if chat already exists to avoid duplicates
      const existingIndex = prevChats.findIndex(chat => chat._id === newChat._id);
      if (existingIndex !== -1) {
        // Update existing chat
        const updatedChats = [...prevChats];
        updatedChats[existingIndex] = newChat;
        return updatedChats;
      } else {
        // Add new chat
        return [...prevChats, newChat];
      }
    });
  };

  const handleGroupCreated = (newChat) => {
    // Add the new group chat to the list and set it as active
    setChats(prevChats => [...prevChats, newChat]);
    setActiveChat(newChat);
    setShowGroupModal(false);
  };

  const handleFriendAccepted = () => {
    // Refresh chats when a friend is accepted (might create new private chat)
    fetchChats();
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar with tabs */}
      <SideBar setActiveChat={setActiveChat} onFriendAccepted={handleFriendAccepted} />
      
      {/* Chat List */}
      <div className="w-1/3 border-r">
        <ChatList 
          chats={chats}
          setActiveChat={setActiveChat} 
          onCreateGroup={() => setShowGroupModal(true)}
        />
      </div>
      
      {/* Chat Window */}
      <div className="flex-1">
        {activeChat ? (
          <Chat chat={activeChat} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>

      {/* Group Creation Modal */}
      <GroupCreateModal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        onGroupCreated={handleGroupCreated}
      />
    </div>
  );
}

function Dashboard() {
  return (
    <OnlineStatusProvider>
      <DashboardContent />
    </OnlineStatusProvider>
  );
}

export default Dashboard;