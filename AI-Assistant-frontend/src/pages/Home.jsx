/**
 * pages/Home.jsx
 * --------------
 * Main chat page — responsive, dark/light aware.
 *
 * Features:
 *  - Model selector in the top bar (shared via ChatModelContext)
 *  - Dark / light toggle button
 *  - Mobile: hamburger → Drawer sidebar
 *  - Desktop: fixed Sider
 *  - Optimistic message rendering
 *  - Token usage display
 */

import React, { useState, useEffect, useCallback } from "react";
import { Layout, Button, Typography, Space, Drawer, Tooltip, Tag } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import {
  PlusOutlined, MenuOutlined, BulbOutlined, BulbFilled, ThunderboltOutlined,
} from "@ant-design/icons";
import { message as antMessage } from "antd";

import ChatSidebar   from "../components/ChatSidebar";
import ChatWindow    from "../components/ChatWindow";
import ChatInput     from "../components/ChatInput";
import ModelSelector from "../components/ModelSelector";

import { loadMessages, sendMessage, createChat } from "../services/chat_services";
import { useChatModel }  from "../context/ChatModelContext";
import { useTheme }      from "../context/ThemeContext";
import { useBreakpoint } from "../hooks/useBreakpoint";

const { Sider, Content } = Layout;
const { Text } = Typography;

function Home() {
  const [messages, setMessages]     = useState([]);
  const [isLoading, setIsLoading]   = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { chatId }  = useParams();
  const navigate    = useNavigate();
  const isMobile    = useBreakpoint();
  const { isDark, toggleTheme } = useTheme();
  const { selectedModel, setSelectedModel } = useChatModel();

  // ── Load messages ─────────────────────────────────────────────────────────
  const fetchMessages = useCallback(async () => {
    if (!chatId) return;
    try {
      const data = await loadMessages(chatId);
      setMessages(data);
    } catch {
      antMessage.error("Failed to load messages");
    }
  }, [chatId]);

  useEffect(() => {
    setMessages([]);
    fetchMessages();
    setDrawerOpen(false);
  }, [fetchMessages]);

  // ── Send message ──────────────────────────────────────────────────────────
  async function handleSend(text, attachmentUrl, attachmentType) {
    if (!chatId) return;
    const optimistic = {
      id: `temp-${Date.now()}`, role: "user",
      message: text, attachment_url: attachmentUrl, attachment_type: attachmentType,
    };
    setMessages((p) => [...p, optimistic]);
    setIsLoading(true);
    try {
      const res = await sendMessage(chatId, text, attachmentUrl, attachmentType);
      setMessages((p) => [...p, {
        id: `ai-${Date.now()}`, role: "assistant",
        message: res.reply, tokens_used: res.tokens_used,
      }]);
    } catch {
      antMessage.error("Failed to send message. Please try again.");
      setMessages((p) => p.filter((m) => m.id !== optimistic.id));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleQuickNewChat() {
    try {
      const c = await createChat("New Chat", selectedModel);
      navigate(`/chat/${c.id}`);
    } catch {
      antMessage.error("Failed to create chat");
    }
  }

  // ── Top bar ───────────────────────────────────────────────────────────────
  const topBar = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: isMobile ? "8px 10px" : "8px 16px",
        borderBottom: "1px solid var(--border)",
        background: "var(--header-bg)",
        flexShrink: 0,
        gap: 8,
        minHeight: 52,
      }}
    >
      {/* Left: hamburger (mobile) or app name (desktop) */}
      <Space size={8}>
        {isMobile && (
          <Button icon={<MenuOutlined />} type="text" onClick={() => setDrawerOpen(true)} />
        )}
        <Text strong style={{ fontSize: isMobile ? 14 : 16 }}>
          {isMobile ? "AI Assistant" : "✦ AI Assistant"}
        </Text>
      </Space>

      {/* Center: model selector — always visible */}
      <div style={{ flex: 1, maxWidth: isMobile ? 160 : 280, margin: "0 8px" }}>
        <ModelSelector
          value={selectedModel}
          onChange={setSelectedModel}
          disabled={isLoading}
        />
      </div>

      {/* Right: temp chat shortcut + theme toggle */}
      <Space size={6}>
        {!isMobile && (
          <Tooltip title="Temp Chat — not saved">
            <Button
              icon={<ThunderboltOutlined />}
              type="text"
              onClick={() => navigate("/temp")}
            >
              Temp
            </Button>
          </Tooltip>
        )}
        <Tooltip title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
          <Button
            icon={isDark ? <BulbFilled style={{ color: "#faad14" }} /> : <BulbOutlined />}
            type="text"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          />
        </Tooltip>
      </Space>
    </div>
  );

  const sidebarContent = <ChatSidebar onNavigate={() => setDrawerOpen(false)} />;

  return (
    <Layout style={{ height: "100vh", overflow: "hidden", background: "var(--bg)" }}>

      {/* Desktop sidebar */}
      {!isMobile && (
        <Sider
          width={260}
          theme={isDark ? "dark" : "light"}
          style={{ borderRight: "1px solid var(--border)", overflow: "hidden" }}
        >
          {sidebarContent}
        </Sider>
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          placement="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={280}
          styles={{ body: { padding: 0, background: "var(--sidebar-bg)" } }}
          title="Chats"
        >
          {sidebarContent}
        </Drawer>
      )}

      <Layout style={{ overflow: "hidden", background: "var(--bg)" }}>
        {topBar}

        <Content style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {chatId ? (
            <>
              <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <ChatWindow messages={messages} isLoading={isLoading} />
              </div>
              <ChatInput onSend={handleSend} isLoading={isLoading} />
            </>
          ) : (
            /* Welcome / empty state */
            <div
              style={{
                flex: 1, display: "flex", flexDirection: "column",
                justifyContent: "center", alignItems: "center",
                gap: 20, padding: 24, textAlign: "center",
              }}
            >
              <div style={{ fontSize: isMobile ? 48 : 64 }}>🤖</div>
              <div>
                <Text
                  strong
                  style={{ fontSize: isMobile ? 20 : 26, display: "block", marginBottom: 8 }}
                >
                  Welcome to AI Assistant
                </Text>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Powered by Google Gemini · Select a model above and start chatting
                </Text>
              </div>

              {/* Current model badge */}
              <Tag color="blue" style={{ fontSize: 12, padding: "4px 12px" }}>
                {selectedModel.replace("models/", "")}
              </Tag>

              <Space wrap justify="center">
                <Button
                  type="primary" size={isMobile ? "middle" : "large"}
                  icon={<PlusOutlined />} onClick={handleQuickNewChat}
                >
                  New Chat
                </Button>
                <Button
                  size={isMobile ? "middle" : "large"}
                  icon={<ThunderboltOutlined />}
                  onClick={() => navigate("/temp")}
                >
                  Temp Chat
                </Button>
              </Space>

              {/* Feature hints */}
              {!isMobile && (
                <div
                  style={{
                    display: "flex", gap: 12, flexWrap: "wrap",
                    justifyContent: "center", marginTop: 8,
                  }}
                >
                  {[
                    "📎 Attach images & files",
                    "⚡ Temp chat — no history",
                    "🌙 Dark mode support",
                    "📋 Copy AI responses",
                  ].map((hint) => (
                    <Tag key={hint} style={{ padding: "6px 12px", fontSize: 12 }}>{hint}</Tag>
                  ))}
                </div>
              )}
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
}

export default Home;
