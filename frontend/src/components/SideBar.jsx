// frontend/src/components/SideBar.jsx - Updated with collapse callback
import React, { useState, useEffect } from "react";
import axios from "axios";
import FriendRequests from "./FriendRequests";
import { useTheme } from "../contexts/ThemeContext";

function SideBar({
  setActiveChat,
  onFriendAccepted,
  isMobile,
  onCloseSidebar,
  onCollapseChange,
}) {
  const [tab, setTab] = useState("suggestions");
  const [suggestions, setSuggestions] = useState([]);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? JSON.parse(saved) : false;
  });
  const { isDarkMode } = useTheme();

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
    if (onCollapseChange) {
      onCollapseChange(isCollapsed);
    }
  }, [isCollapsed, onCollapseChange]);

  useEffect(() => {
    if (tab === "suggestions" && !isCollapsed) {
      axios
        .get("/api/users/suggestions", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((res) => setSuggestions(res.data))
        .catch((err) => console.error(err));
    }
  }, [tab, isCollapsed]);

  const sendFriendRequest = async (userId) => {
    try {
      await axios.post(
        "/api/friends/send",
        { userId },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setSuggestions((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSidebar = () => {
    if (!isMobile) {
      setIsCollapsed((prev) => !prev);
    }
  };

  const handleSetActiveChat = (chat) => {
    setActiveChat(chat);
    if (isMobile && onCloseSidebar) {
      onCloseSidebar();
    }
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    // On mobile, don't collapse when changing tabs
    if (isMobile && isCollapsed) {
      setIsCollapsed(false);
    }
  };

  return (
    <div
      className={`relative flex flex-col min-h-0 h-full transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-16" : "w-64"
      } border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800`}
    >
      {/* Close Button - Only show on mobile */}
      {isMobile && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800">
          <h2 className="text-xl font-semibold">Menu</h2>
          <button
            onClick={onCloseSidebar}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 touch-target"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>
      )}

      {/* Toggle Button - Only show on desktop */}
      {!isMobile && (
        <button
          onClick={toggleSidebar}
          className={`absolute -right-3 top-73 z-10 w-6 h-6 rounded-md flex items-center justify-center ${
            isDarkMode ? "bg-gray-700 text-gray-100" : "bg-white text-gray-900"
          } border border-gray-300 dark:border-gray-600 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors touch-target`}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? "⟫" : "⟪"}
        </button>
      )}

      {/* Tabs - Only show when expanded or on mobile */}
      {(!isCollapsed || isMobile) && (
        <div className="flex flex-shrink-0 bg-white dark:bg-gray-800">
          <button
            onClick={() => handleTabChange("friends")}
            className={`flex-1 p-3 ${
              tab === "friends"
                ? "bg-gray-200 dark:bg-gray-700"
                : "bg-white dark:bg-gray-800"
            } text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700 touch-target`}
          >
            {isCollapsed && !isMobile ? "👥" : "Requests"}
          </button>
          <button
            onClick={() => handleTabChange("suggestions")}
            className={`flex-1 p-3 ${
              tab === "suggestions"
                ? "bg-gray-200 dark:bg-gray-700"
                : "bg-white dark:bg-gray-800"
            } text-gray-900 dark:text-gray-100 touch-target`}
          >
            {isCollapsed && !isMobile ? "💡" : "Suggestions"}
          </button>
        </div>
      )}

      {/* Tab Content */}
      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto min-h-0 bg-white dark:bg-gray-800">
        {isCollapsed && !isMobile ? (
          // Collapsed view (compact mode)
          <div className="flex flex-col items-center py-4 space-y-4">
            {tab === "friends" && (
              <div className="flex flex-col items-center space-y-3">
                <span className="text-gray-500 dark:text-gray-400">👥</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Requests
                </p>
              </div>
            )}

            {tab === "suggestions" && (
              <div className="flex flex-col items-center space-y-3">
                {suggestions.length > 0 ? (
                  suggestions.map((user) => (
                    <button
                      key={user._id}
                      onClick={() => handleSetActiveChat(user)}
                      className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-400 dark:hover:bg-gray-500 transition"
                      title={user.username}
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </button>
                  ))
                ) : (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    No users
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          // Expanded view (full content)
          <>
            {tab === "friends" && (
              <FriendRequests onFriendAccepted={onFriendAccepted} />
            )}

            {tab === "suggestions" && (
              <div className="bg-white dark:bg-gray-800">
                {suggestions.length > 0 ? (
                  suggestions.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 touch-target"
                      onClick={() => handleSetActiveChat(user)}
                    >
                      <span className="text-gray-900 dark:text-gray-100 truncate">
                        {user.username}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          sendFriendRequest(user._id);
                        }}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 flex-shrink-0 ml-2 touch-target"
                      >
                        Add
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-gray-500 dark:text-gray-400">
                    No suggestions available
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SideBar;
