import React, { useState, useEffect } from "react";
import ChatSidebar from "../components/ChatSidebar";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import { useParams } from "react-router-dom";
import API from "../services/api";

function Home() {

  const [messages, setMessages] = useState([]);
  const { chatId } = useParams();

  // load messages when chat changes
  useEffect(() => {

    if (!chatId) return;

    const loadMessages = async () => {

      const res = await API.get(`/chats/${chatId}/messages`);

      setMessages(res.data);
    };

    loadMessages();

  }, [chatId]);



  const handleSend = async (text) => {

    const res = await API.post(`/chats/${chatId}/messages`, {
      message: text
    });

    const userMsg = { role: "user", message: text };
    const aiMsg = { role: "assistant", message: res.data.reply };

    setMessages(prev => [...prev, userMsg, aiMsg]);

  };


  return (

    <div style={{ display: "flex" }}>

      <ChatSidebar />

      <div style={{
        flex: 1,
        padding: "20px"
      }}>

        <ChatWindow messages={messages} />

        <ChatInput onSend={handleSend} />

      </div>

    </div>

  );
}

export default Home;