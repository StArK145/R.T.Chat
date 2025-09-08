// frontend/src/components/GroupCreateModal.jsx - Fixed version
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getFriendRequests } from "../services/FriendService";
import { useTheme } from "../contexts/ThemeContext";

function GroupCreateModal({ isOpen, onClose, onGroupCreated }) {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (isOpen) {
      fetchSuggestions();
      setGroupName("");
      setSelectedUsers([]);
      setError("");
    }
  }, [isOpen]);

  const fetchSuggestions = async () => {
    const res = await getFriendRequests();
    setSuggestions(res.data.friends);
  };

  const toggleUserSelection = (user) => {
    setSelectedUsers(prev =>
      prev.some(u => u._id === user._id)
        ? prev.filter(u => u._id !== user._id)
        : [...prev, user]
    );
  };

  const createGroup = async () => {
    if (!groupName.trim()) {
      setError("Group name is required");
      return;
    }

    if (selectedUsers.length === 0) {
      setError("Please select at least one participant");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "/api/chats/group",
        {
          name: groupName,
          participantIds: selectedUsers.map(u => u._id)
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      
      onGroupCreated(res.data);
      onClose();
    } catch (err) {
      console.error("Error creating group:", err);
      setError(err.response?.data?.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}>
        <h2 className="text-xl font-semibold mb-4">Create Group Chat</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <input
          type="text"
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className={`w-full p-2 border rounded mb-4 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
          disabled={loading}
        />
        
        <h3 className="font-semibold mb-2">Select Participants ({selectedUsers.length} selected)</h3>
        
        {/* Selected users */}
        {selectedUsers.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map(user => (
                <span
                  key={user._id}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center"
                >
                  {user.username}
                  <button
                    type="button"
                    onClick={() => toggleUserSelection(user)}
                    className="ml-1 text-red-500 hover:text-red-700"
                    disabled={loading}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Suggestions list with proper scrolling */}
        <div className={`flex-1 overflow-y-auto mb-4 border rounded ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`} style={{ minHeight: '200px', maxHeight: '300px' }}>
          {suggestions.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No suggestions available. Add some friends first!
            </div>
          ) : (
            suggestions.map(user => (
              <div
                key={user._id}
                className={`flex items-center p-3 cursor-pointer ${
                  selectedUsers.some(u => u._id === user._id) 
                    ? 'bg-blue-50 dark:bg-blue-900' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                onClick={() => toggleUserSelection(user)}
              >
                <input
                  type="checkbox"
                  checked={selectedUsers.some(u => u._id === user._id)}
                  onChange={() => {}}
                  className="mr-3"
                  disabled={loading}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{user.username}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className={`px-4 py-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 ${
              isDarkMode ? 'border-gray-600 text-gray-100' : 'border-gray-300 text-gray-900'
            }`}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={createGroup}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={loading || !groupName.trim() || selectedUsers.length === 0}
          >
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default GroupCreateModal;