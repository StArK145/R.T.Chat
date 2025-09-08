// frontend/src/components/FriendRequests.jsx - Fixed version
import React, { useEffect, useState } from "react";
import {
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
} from "../services/FriendService";
import { useTheme } from "../contexts/ThemeContext";

function FriendRequests({ onFriendAccepted })  {
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const { isDarkMode } = useTheme();

  const fetchRequests = async () => {
    const res = await getFriendRequests();
    setRequests(res.data.requests);
    setFriends(res.data.friends);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (id) => {
    await acceptFriendRequest(id);
    fetchRequests();
    
    if (onFriendAccepted) {
      onFriendAccepted();
    }
  };

  const handleReject = async (id) => {
    await rejectFriendRequest(id);
    fetchRequests();
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 h-full overflow-y-auto">
      <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Friend Requests</h2>
      {requests.length === 0 && <p className="text-gray-500 dark:text-gray-400">No pending requests</p>}
      {requests.map((req) => (
        <div
          key={req._id}
          className="flex items-center justify-between border border-gray-200 dark:border-gray-700 p-2 rounded mb-2 bg-white dark:bg-gray-800"
        >
          <span className="text-gray-900 dark:text-gray-100 truncate">{req.username}</span>
          <div className="flex flex-shrink-0">
            <button
              className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
              onClick={() => handleAccept(req._id)}
            >
              Accept
            </button>
            <button
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              onClick={() => handleReject(req._id)}
            >
              Reject
            </button>
          </div>
        </div>
      ))}

      <h2 className="text-xl font-semibold mt-6 mb-3 text-gray-900 dark:text-gray-100">Friends</h2>
      <div className="overflow-y-auto" style={{ maxHeight: '200px' }}>
        {friends.map((f) => (
          <div key={f._id} className="p-2 border border-gray-200 dark:border-gray-700 rounded mb-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
            {f.username}
          </div>
        ))}
      </div>
    </div>
  );
}

export default FriendRequests;