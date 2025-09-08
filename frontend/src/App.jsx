// frontend/src/App.jsx - Ensure proper layout
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import { connectSocket, disconnectSocket } from "./services/socket";
import { ThemeProvider } from "./contexts/ThemeContext";

function App() {
  useEffect(() => {
    if (localStorage.getItem("token")) {
      connectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <ThemeProvider>
      <div className="h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
       
          <Routes>
            <Route path="/" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<h2>Page Not Found</h2>} />
          </Routes>
        
      </div>
    </ThemeProvider>
  );
}

export default App;