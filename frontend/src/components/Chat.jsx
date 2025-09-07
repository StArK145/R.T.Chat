import React, { useState, useEffect } from "react";
import { socket } from "../services/socket";
import axios from "axios";

function Chat({ chatId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!chatId) return;

    socket.emit("joinChat", chatId);

    axios
      .get(`/api/messages/${chatId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => setMessages(res.data));

    socket.on("newMessage", (msg) => {
      if (msg.chat === chatId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => socket.off("newMessage");
  }, [chatId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    await axios.post(
      `/api/messages/${chatId}`,
      { text },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    setText("");
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
        {messages.map((m) => (
          <div key={m._id} className="mb-3">
            <span className="font-semibold">{m.sender.username}: </span>
            <span>{m.text}</span>
          </div>
        ))}
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="flex p-3 border-t border-gray-300 bg-white"
      >
        <input
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat;
