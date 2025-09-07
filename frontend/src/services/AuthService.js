// src/services/AuthService.js
import axios from 'axios';


export const registerUser = async (data) => {
  return axios.post("api/auth/register", data);
};

export const loginUser = async (data) => {
  return axios.post("api/auth/login", data);
};
export const forgotPassword = async (email) => {
  return axios.post("api/auth/forgot-password", { email });
};

export const resetPassword = async (data) => {
  return axios.post("api/auth/reset-password", data);
};