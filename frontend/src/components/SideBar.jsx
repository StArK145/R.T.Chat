import React from 'react'
import { useState,useEffect } from 'react';
import axios from 'axios';
import FriendRequests from "./FriendRequests";

function SideBar(setActiveChat) {
    const [chats, setChats] = useState([]);

      const [tab, setTab] = useState("chats");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (tab === "chats") {
      axios
        .get("/api/chats", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((res) => setChats(res.data))
        .catch((err) => console.error(err));
    }
  }, [tab]);

  useEffect(() => {
    if (tab === "suggestions") {
      axios
        .get("/api/users/suggestions", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
        .then((res) => setSuggestions(res.data))
        .catch((err) => console.error(err));
    }
  }, [tab]);

  const sendFriendRequest = async (userId) => {
    try {
      await axios.post(
        "/api/friends/send", // ✅ matches backend route
        { userId }, // ✅ send in body
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setSuggestions((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      console.error(err);
    }
  };
  return (
   <>
    {/* Sidebar */}
      <div className="w-1/4 border-r bg-gray-50 flex flex-col">
        {/* Tabs */}
        <div className="flex">
          <button
            onClick={() => setTab("chats")}
            className={`flex-1 p-2 ${tab === "chats" ? "bg-gray-200" : ""}`}
          >
            Chats
          </button>
          <button
            onClick={() => setTab("friends")}
            className={`flex-1 p-2 ${tab === "friends" ? "bg-gray-200" : ""}`}
          >
            Requests
          </button>
          <button
            onClick={() => setTab("suggestions")}
            className={`flex-1 p-2 ${
              tab === "suggestions" ? "bg-gray-200" : ""
            }`}
          >
            Suggestions
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {tab === "chats" && (
            <div>
              {chats.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => setActiveChat(chat)}
                  className="p-3 hover:bg-gray-100 cursor-pointer border-b"
                >
                  {chat.name || chat.participants.map((p) => p.name).join(", ")}
                </div>
              ))}
            </div>
          )}

          {tab === "friends" && <FriendRequests />}

          {tab === "suggestions" && (
            <div>
              {suggestions.length > 0 ? (
                suggestions.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-3 border-b"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.avatar || "/default-avatar.png"}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span>{user.name}</span>
                    </div>
                    <button
                      onClick={() => sendFriendRequest(user._id)}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Add Friend
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-3 text-gray-500">
                  No suggestions available
                </div>
              )}
            </div>
          )}
        </div>
      </div>
   </>
  )
}

export default SideBar
