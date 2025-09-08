import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import { connectSocket, disconnectSocket } from "./services/socket";

function App() {
  useEffect(() => {
    // Connect socket when app loads if user is authenticated
    if (localStorage.getItem("token")) {
      connectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, []);

  return (
      <div className="h-screen">
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
  );
}

export default App;