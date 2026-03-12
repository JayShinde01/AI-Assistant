import React, { useState, useEffect } from "react";
import { Layout } from "antd";
import { useParams } from "react-router-dom";

import ChatSidebar from "../components/ChatSidebar";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import API from "../services/api";

const { Sider, Content } = Layout;

function Home() {

  const [messages, setMessages] = useState([]);
  const { chatId } = useParams();

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

    <Layout style={{ height: "90vh" }}>

      <Sider width={260} theme="light">
        <ChatSidebar />
      </Sider>

      <Layout>

        <Content
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            padding: "20px"
          }}
        >

          {/* Chat Messages */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            <ChatWindow messages={messages} />
          </div>

          {/* Input */}
          <div style={{ marginTop: "10px" }}>
            <ChatInput onSend={handleSend} />
          </div>

        </Content>

      </Layout>

    </Layout>

  );
}

export default Home;