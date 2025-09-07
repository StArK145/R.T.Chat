import React, { useEffect, useState } from "react";
import {
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
} from "../services/FriendService";

function FriendRequests() {
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);

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
  };

  const handleReject = async (id) => {
    await rejectFriendRequest(id);
    fetchRequests();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3">Friend Requests</h2>
      {requests.length === 0 && <p>No pending requests</p>}
      {requests.map((req) => (
        <div
          key={req._id}
          className="flex items-center justify-between border p-2 rounded mb-2"
        >
          <span>{req.username}</span>
          <div>
            <button
              className="bg-green-500 text-white px-3 py-1 rounded mr-2"
              onClick={() => handleAccept(req._id)}
            >
              Accept
            </button>
            <button
              className="bg-red-500 text-white px-3 py-1 rounded"
              onClick={() => handleReject(req._id)}
            >
              Reject
            </button>
          </div>
        </div>
      ))}

      <h2 className="text-xl font-semibold mt-6 mb-3">Friends</h2>
      {friends.map((f) => (
        <div key={f._id} className="p-2 border rounded mb-2">
          {f.username}
        </div>
      ))}
    </div>
  );
}

export default FriendRequests;
