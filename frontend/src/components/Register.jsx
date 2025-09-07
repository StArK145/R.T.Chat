// src/components/Register.jsx
import React, { useState } from "react";
import { registerUser } from "../services/AuthService";
import { Link } from "react-router-dom";

function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(form);
      setMessage("Registered successfully! You can now login.");
      setForm({ username: "", email: "", password: "" });
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div>
      <nav>
        <Link to="/">Register</Link> | <Link to="/login">Login</Link>
      </nav>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Register</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Register;
