import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const OnlineStatusContext = createContext();

export const useOnlineStatus = () => {
  return useContext(OnlineStatusContext);
};

export const OnlineStatusProvider = ({ children }) => {
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [userStatuses, setUserStatuses] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch initial online status for friends
  const fetchFriendStatuses = async () => {
    try {
      setLoading(true);
      
      const res = await axios.get('/api/users/status', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        validateStatus: (status) => status < 500 // Don't throw for 4xx errors
      });
      
      // Check if response is HTML (indicating a routing issue)
      if (typeof res.data === 'string' && res.data.includes('<!DOCTYPE html>')) {
        console.warn('API returned HTML instead of JSON. Route may not be configured correctly.');
        // Fallback: manually set some online statuses based on socket connections
        setUserStatuses({});
        setOnlineUsers(new Set());
        return;
      }
      
      // Handle case where response is not an array
      if (!Array.isArray(res.data)) {
        console.warn('Expected array but got:', res.data);
        setUserStatuses({});
        setOnlineUsers(new Set());
        return;
      }
      
      const statusMap = {};
      const onlineSet = new Set();
      
      res.data.forEach(user => {
        if (user && user._id) {
          statusMap[user._id] = user.isOnline || false;
          if (user.isOnline) {
            onlineSet.add(user._id);
          }
        }
      });
      
      setUserStatuses(statusMap);
      setOnlineUsers(onlineSet);
    } catch (err) {
      console.error('Error fetching friend statuses:', err);
      // Set empty state on error
      setUserStatuses({});
      setOnlineUsers(new Set());
    } finally {
      setLoading(false);
    }
  };

  const updateOnlineStatus = (userId) => {
    setOnlineUsers(prev => new Set(prev).add(userId));
    setUserStatuses(prev => ({ ...prev, [userId]: true }));
  };

  const updateOfflineStatus = (userId) => {
    setOnlineUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
    setUserStatuses(prev => ({ ...prev, [userId]: false }));
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  const getUserStatus = (userId) => {
    return userStatuses[userId] || false;
  };

  useEffect(() => {
    fetchFriendStatuses();
  }, []);

  const value = {
    onlineUsers,
    userStatuses,
    loading,
    updateOnlineStatus,
    updateOfflineStatus,
    isUserOnline,
    getUserStatus,
    refreshStatuses: fetchFriendStatuses
  };

  return (
    <OnlineStatusContext.Provider value={value}>
      {children}
    </OnlineStatusContext.Provider>
  );
};