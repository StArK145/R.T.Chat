import React, { useState, useEffect } from "react";
import axios from "axios";
import Chat from "./Chat";
import SideBar from "./SideBar";

function Dashboard() {
  
  const [activeChat, setActiveChat] = useState(null);


  return (
    <div className="flex h-screen">
     
      <SideBar setActiveChat />
      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <Chat chatId={activeChat._id} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
