import axios from "axios";

const API = "/api/friends";
const token = localStorage.getItem("token");

const config = {
  headers: { Authorization: `Bearer ${token}` },
};

export const sendFriendRequest = (userId) =>
  axios.post(`${API}/send`, { userId }, config);

export const acceptFriendRequest = (userId) =>
  axios.post(`${API}/accept`, { userId }, config);

export const rejectFriendRequest = (userId) =>
  axios.post(`${API}/reject`, { userId }, config);

export const getFriendRequests = () => axios.get(API, config);
