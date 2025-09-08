import React from 'react'
import { useState, useEffect } from 'react';
import axios from 'axios';
import FriendRequests from "./FriendRequests";

function SideBar({ setActiveChat, onFriendAccepted }){
    const [tab, setTab] = useState("suggestions");
    const [suggestions, setSuggestions] = useState([]);

    

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

    return (
        <>
            {/* Sidebar */}
            <div className="w-1/4 border-r bg-gray-50 flex flex-col">
                {/* Tabs */}
                <div className="flex">
                    <button
                        onClick={() => setTab("friends")}
                        className={`flex-1 p-2 ${tab === "friends" ? "bg-gray-200" : ""}`}
                    >
                        Requests
                    </button>
                    <button
                        onClick={() => setTab("suggestions")}
                        className={`flex-1 p-2 ${tab === "suggestions" ? "bg-gray-200" : ""}`}
                    >
                        Suggestions
                    </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto">

                    {tab === "friends" && (
                        <FriendRequests onFriendAccepted={onFriendAccepted} />
                    )}

                    {tab === "suggestions" && (
                        <div>
                            {suggestions.length > 0 ? (
                                suggestions.map((user) => (
                                    <div
                                        key={user._id}
                                        className="flex items-center justify-between p-3 border-b"
                                    >
                                        <span>{user.username}</span>
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
    );
}

export default SideBar;