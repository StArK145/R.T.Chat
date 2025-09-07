import React, { useState } from "react";
import { loginUser } from "../services/AuthService";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // <-- React Router navigation

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(form);

      // Save token and user info to localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setMessage("Login successful!");
      navigate("/dashboard"); // 🔀 Navigate to dashboard
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div>
      <nav>
        <Link to="/">Register</Link> | <Link to="/login">Login</Link>
      </nav>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="identifier"
          placeholder="Username or Email"
          value={form.identifier}
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
        <p>
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Login;
