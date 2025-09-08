// frontend/src/components/Login.jsx - Improved responsive design
import React, { useState } from "react";
import { loginUser } from "../services/AuthService";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

function Login() {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setMessage("Login successful!");
      navigate("/dashboard");
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`p-6 rounded-lg shadow-md w-full max-w-md ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}`}>
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              name="identifier"
              placeholder="Username or Email"
              value={form.identifier}
              onChange={handleChange}
              className={`w-full p-3 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
              required
            />
          </div>
          <div>
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className={`w-full p-3 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
              required
            />
          </div>
          <div className="text-sm text-right">
            <Link to="/forgot-password" className="text-blue-500 hover:text-blue-600">
              Forgot Password?
            </Link>
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600"
          >
            Login
          </button>
        </form>
        {message && (
          <div className={`mt-4 p-3 rounded ${message.includes("successful") ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}
        <div className="mt-4 text-center">
          <span>Don't have an account? </span>
          <Link to="/" className="text-blue-500 hover:text-blue-600">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;