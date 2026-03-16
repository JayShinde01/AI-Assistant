/**
 * pages/TempChat.jsx
 * ------------------
 * Stateless chat — nothing saved to DB.
 * Uses ChatModelContext so the model selector stays in sync with Home.
 */

import React, { useState } from "react";
import { Layout, Button, Space, Typography, Tag, Divider, message as antMessage } from "antd";
import {
  ArrowLeftOutlined, DeleteOutlined, ThunderboltOutlined,
  BulbOutlined, BulbFilled,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import ChatWindow    from "../components/ChatWindow";
import ChatInput     from "../components/ChatInput";
import ModelSelector from "../components/ModelSelector";
import { sendTempMessage }   from "../services/chat_services";
import { useChatModel }      from "../context/ChatModelContext";
import { useTheme }          from "../context/ThemeContext";
import { useBreakpoint }     from "../hooks/useBreakpoint";

const { Header, Content } = Layout;
const { Text } = Typography;

function TempChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const navigate  = useNavigate();
  const isMobile  = useBreakpoint();
  const { isDark, toggleTheme } = useTheme();
  const { selectedModel, setSelectedModel } = useChatModel();

  async function handleSend(text) {
    if (!text.trim()) return;
    const snapshot = [...messages, { role: "user", message: text }];
    setMessages(snapshot);
    setIsLoading(true);
    try {
      const res = await sendTempMessage(text, messages, selectedModel);
      setMessages((p) => [...p, {
        role: "assistant", message: res.reply, tokens_used: res.tokens_used,
      }]);
    } catch {
      antMessage.error("Failed to get AI response.");
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Layout style={{ height: "100vh", overflow: "hidden", background: "var(--bg)" }}>
      <Header
        style={{
          background: "var(--header-bg)",
          borderBottom: "1px solid var(--border)",
          padding: "0 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: isMobile ? 52 : 56,
          flexShrink: 0,
          gap: 8,
        }}
      >
        {/* Left */}
        <Space size={6}>
          <Button icon={<ArrowLeftOutlined />} type="text" size="small"
            onClick={() => navigate("/")}>
            {!isMobile && "Back"}
          </Button>
          {!isMobile && <Divider type="vertical" style={{ margin: 0 }} />}
          <ThunderboltOutlined style={{ color: "#faad14" }} />
          <Text strong style={{ fontSize: isMobile ? 13 : 15 }}>Temp Chat</Text>
          <Tag color="orange" style={{ fontSize: 10, margin: 0 }}>Not saved</Tag>
        </Space>

        {/* Right */}
        <Space size={6}>
          <div style={{ width: isMobile ? 150 : 240 }}>
            <ModelSelector value={selectedModel} onChange={setSelectedModel} disabled={isLoading} />
          </div>
          <Button
            icon={<DeleteOutlined />} danger size={isMobile ? "small" : "middle"}
            onClick={() => setMessages([])}
            disabled={messages.length === 0 || isLoading}
          >
            {!isMobile && "Clear"}
          </Button>
          <Button
            type="text"
            icon={isDark
              ? <BulbFilled style={{ color: "#faad14" }} />
              : <BulbOutlined />}
            onClick={toggleTheme}
            aria-label="Toggle theme"
          />
        </Space>
      </Header>

      <Content style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {messages.length === 0 && (
          <div style={{
            background: isDark ? "#2a2000" : "#fffbe6",
            borderBottom: `1px solid ${isDark ? "#5a4000" : "#ffe58f"}`,
            padding: "6px 16px", textAlign: "center", flexShrink: 0,
          }}>
            <Text type="warning" style={{ fontSize: 12 }}>
              Temporary chat — messages disappear when you leave this page.
            </Text>
          </div>
        )}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <ChatWindow messages={messages} isLoading={isLoading} />
        </div>
        <ChatInput onSend={handleSend} isLoading={isLoading} />
      </Content>
    </Layout>
  );
}

export default TempChat;
