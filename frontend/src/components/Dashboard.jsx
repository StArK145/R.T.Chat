// frontend/src/components/Dashboard.jsx - Fixed layout
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
import { useTheme } from "../contexts/ThemeContext";
import axios from "axios";

// Custom hook for responsive design
const useMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

function DashboardContent() {
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [mobileView, setMobileView] = useState('list'); // 'sidebar', 'list', or 'chat'
  const [showOverlay, setShowOverlay] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isMobile = useMobile();
  const { updateOnlineStatus, updateOfflineStatus } = useOnlineStatus();
  const { isDarkMode, toggleTheme } = useTheme();

  useEffect(() => {
    connectSocket();
    fetchChats();
    setupChatListeners(handleNewChat);
    setupOnlineStatusListeners(handleUserOnline, handleUserOffline);
    
    return () => {
      removeChatListeners();
      removeOnlineStatusListeners();
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    // Reset to list view when active chat is cleared on mobile
    if (isMobile && !activeChat && mobileView === 'chat') {
      setMobileView('list');
    }
  }, [activeChat, isMobile, mobileView]);

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
      const existingIndex = prevChats.findIndex(chat => chat._id === newChat._id);
      if (existingIndex !== -1) {
        const updatedChats = [...prevChats];
        updatedChats[existingIndex] = newChat;
        return updatedChats;
      } else {
        return [...prevChats, newChat];
      }
    });
  };

  const handleGroupCreated = (newChat) => {
    setChats(prevChats => [...prevChats, newChat]);
    setActiveChat(newChat);
    if (isMobile) {
      setMobileView('chat');
      setShowOverlay(false);
    }
    setShowGroupModal(false);
  };

  const handleFriendAccepted = () => {
    fetchChats();
  };

  const handleChatSelect = (chat) => {
    setActiveChat(chat);
    if (isMobile) {
      setMobileView('chat');
      setShowOverlay(false);
    }
  };

  const handleBackToList = () => {
    setActiveChat(null);
    if (isMobile) {
      setMobileView('list');
    }
  };

  const handleToggleSidebar = () => {
    if (isMobile) {
      setMobileView('sidebar');
      setShowOverlay(true);
    } else {
      setIsSidebarCollapsed(prev => !prev);
    }
  };

  const handleCloseSidebar = () => {
    if (isMobile) {
      setMobileView('list');
      setShowOverlay(false);
    }
  };

  const handleOverlayClick = () => {
    setMobileView('list');
    setShowOverlay(false);
  };

  const handleSidebarCollapse = (collapsed) => {
    if (!isMobile) {
      setIsSidebarCollapsed(collapsed);
    }
  };

  // Determine what to show based on device and view state
  const showSidebar = !isMobile || mobileView === 'sidebar';
  const showChatList = !isMobile || mobileView === 'list';
  const showChat = !isMobile || mobileView === 'chat';

  // Calculate widths for desktop layout
  const sidebarWidth = isSidebarCollapsed ? 'w-16' : 'w-64';
  const chatListWidth = isSidebarCollapsed ? 'w-1/4' : 'w-1/3';

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 overflow-hidden relative">
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && showOverlay && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={handleOverlayClick}
        ></div>
      )}
      
      {/* Sidebar - Hidden on mobile when not in sidebar view */}
      <div className={`
        ${isMobile ? 'fixed inset-y-0 left-0 z-50 w-3/4 max-w-sm transform' : `${sidebarWidth} relative`} 
        transition-all duration-300 ease-in-out
        ${isMobile && mobileView !== 'sidebar' ? '-translate-x-full' : 'translate-x-0'}
        flex-shrink-0
      `}>
        <SideBar 
          setActiveChat={handleChatSelect} 
          onFriendAccepted={handleFriendAccepted}
          isMobile={isMobile}
          onCloseSidebar={handleCloseSidebar}
          onCollapseChange={handleSidebarCollapse}
        />
      </div>
      
      {/* Main content area - expands to fill available space */}
      <div className="flex-1 flex min-w-0">
        {/* Chat List - Hidden on mobile when in chat or sidebar view */}
        <div className={`
          ${isMobile ? 'absolute inset-0 z-30 w-full' : `${chatListWidth} flex flex-col`} 
          border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800
          transition-all duration-300 ease-in-out
          ${isMobile && mobileView !== 'list' ? 'translate-x-full' : 'translate-x-0'}
          flex-shrink-0
        `}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between flex-shrink-0">
            {isMobile && (
              <button
                onClick={handleToggleSidebar}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 mr-2 touch-target"
                aria-label="Toggle sidebar"
              >
                ⟫
              </button>
            )}
            <h2 className="text-xl font-semibold flex-1">Chats</h2>
            <div className="flex items-center space-x-4">
              {/* <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 touch-target"
                aria-label="Toggle theme"
              >
                {isDarkMode ? (
                  <span className="text-yellow-400">☀️</span>
                ) : (
                  <span className="text-gray-700">🌙</span>
                )}
              </button> */}
              <button
                onClick={() => setShowGroupModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm touch-target"
              >
                New Group
              </button>
            </div>
          </div>
          <ChatList 
            chats={chats}
            setActiveChat={handleChatSelect}
            onCreateGroup={() => setShowGroupModal(true)}
          />
        </div>
        
        {/* Chat Window - Hidden on mobile when in list or sidebar view */}
        <div className={`
  ${isMobile ? 'absolute inset-0 z-40 w-full' : 'flex-1'} 
  bg-gray-50 dark:bg-gray-900
  transition-transform duration-300 ease-in-out
  ${isMobile && mobileView !== 'chat' ? 'translate-x-full' : 'translate-x-0'}
  flex flex-col min-h-0
`}>

          {activeChat ? (
            <Chat 
              chat={activeChat} 
              isMobile={isMobile}
              onBack={isMobile ? handleBackToList : null}
            />
          ) : !isMobile && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-gray-500 dark:text-gray-400 text-center">
                <p className="text-xl mb-2">Welcome to ChatApp</p>
                <p>Select a chat to start messaging</p>
              </div>
            </div>
          )}
        </div>
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