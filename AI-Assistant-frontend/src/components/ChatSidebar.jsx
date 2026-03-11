import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function ChatSidebar() {

  const [chats, setChats] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {

    const res = await API.get("/chats");

    setChats(res.data);
  };

  const createChat = async () => {
    console.log("in create chat funtionc");
    const res = await API.post("/chats", {
      title: "New Chat"
    });
    console.log(res);
    
    navigate(`/chat/${res.data.id}`);
  };

  return (

    <div style={{
      width: "250px",
      background: "#f5f5f5",
      padding: "10px",
      height: "100vh"
    }}>

      <button
        onClick={createChat}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "10px"
        }}
      >
        + New Chat
      </button>

      {chats.map(chat => (
        <div
          key={chat.id}
          style={{
            padding: "8px",
            cursor: "pointer"
          }}
          onClick={() => navigate(`/chat/${chat.id}`)}
        >
          {chat.title}
        </div>
      ))}

    </div>

  );
}

export default ChatSidebar;