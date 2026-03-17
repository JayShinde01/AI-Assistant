/**
 * pages/Home.jsx
 * --------------
 * Main chat page — streaming responses, dark/light aware, responsive.
 *
 * Features:
 *  - Live streaming AI responses (like ChatGPT)
 *  - Model selector in top bar
 *  - Mobile drawer sidebar
 *  - Optimistic message rendering
 *  - Regenerate last AI response
 */

import { useState, useEffect, useCallback } from "react";
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

import { loadMessages, streamMessage, createChat } from "../services/chat_services";
import { useChatModel }  from "../context/ChatModelContext";
import { useTheme }      from "../context/ThemeContext";
import { useBreakpoint } from "../hooks/useBreakpoint";

const { Sider, Content } = Layout;
const { Text } = Typography;

function Home() {
  const [messages, setMessages]     = useState([]);
  const [isLoading, setIsLoading]   = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { chatId }  = useParams();
  const navigate    = useNavigate();
  const isMobile    = useBreakpoint();
  const { isDark, toggleTheme } = useTheme();
  const { selectedModel, setSelectedModel } = useChatModel();

  // ── Load messages when chat changes ──────────────────────────────────────
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

  // ── Send message with live streaming ─────────────────────────────────────
  async function handleSend(text, attachmentUrl, attachmentType) {
    if (!chatId || isStreaming) return;

    // Add user message immediately (optimistic)
    const userMsg = {
      id: `user-${Date.now()}`, role: "user",
      message: text, attachment_url: attachmentUrl, attachment_type: attachmentType,
    };
    // Placeholder for the AI reply that will be filled in chunk by chunk
    const aiPlaceholder = {
      id: `ai-${Date.now()}`, role: "assistant",
      message: "", isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, aiPlaceholder]);
    setIsLoading(true);
    setIsStreaming(true);

    try {
      await streamMessage(
        chatId, text,
        // onChunk — append each piece of text to the last message
        (chunk) => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last?.isStreaming) {
              updated[updated.length - 1] = { ...last, message: last.message + chunk };
            }
            return updated;
          });
        },
        // onDone — mark streaming as complete
        () => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last?.isStreaming) {
              updated[updated.length - 1] = { ...last, isStreaming: false };
            }
            return updated;
          });
          setIsStreaming(false);
          setIsLoading(false);
        },
        attachmentUrl,
        attachmentType,
      );
    } catch {
      antMessage.error("Failed to send message. Please try again.");
      // Remove the optimistic messages on error
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id && m.id !== aiPlaceholder.id));
      setIsStreaming(false);
      setIsLoading(false);
    }
  }

  // ── Regenerate last AI response ───────────────────────────────────────────
  async function handleRegenerate() {
    if (isStreaming || messages.length < 2) return;

    // Find the last user message to re-send
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) return;

    // Remove the last AI message and re-send
    setMessages((prev) => prev.filter((m) => m.id !== prev[prev.length - 1].id));
    await handleSend(lastUserMsg.message, lastUserMsg.attachment_url, lastUserMsg.attachment_type);
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
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: isMobile ? "8px 10px" : "8px 16px",
      borderBottom: "1px solid var(--border)",
      background: "var(--header-bg)",
      flexShrink: 0, gap: 8, minHeight: 52,
    }}>
      <Space size={8}>
        {isMobile && (
          <Button icon={<MenuOutlined />} type="text" onClick={() => setDrawerOpen(true)} />
        )}
        <Text strong style={{ fontSize: isMobile ? 14 : 16 }}>
          {isMobile ? "AI Assistant" : "✦ AI Assistant"}
        </Text>
      </Space>

      <div style={{ flex: 1, maxWidth: isMobile ? 160 : 280, margin: "0 8px" }}>
        <ModelSelector value={selectedModel} onChange={setSelectedModel} disabled={isLoading} />
      </div>

      <Space size={6}>
        {!isMobile && (
          <Tooltip title="Temp Chat — not saved">
            <Button icon={<ThunderboltOutlined />} type="text" onClick={() => navigate("/temp")}>
              Temp
            </Button>
          </Tooltip>
        )}
        <Tooltip title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
          <Button
            icon={isDark ? <BulbFilled style={{ color: "#faad14" }} /> : <BulbOutlined />}
            type="text" onClick={toggleTheme} aria-label="Toggle theme"
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
          placement="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}
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
                <ChatWindow
                  messages={messages}
                  isLoading={isLoading}
                  isStreaming={isStreaming}
                  onRegenerate={handleRegenerate}
                />
              </div>
              <ChatInput onSend={handleSend} isLoading={isLoading || isStreaming} />
            </>
          ) : (
            /* Welcome screen */
            <div style={{
              flex: 1, display: "flex", flexDirection: "column",
              justifyContent: "center", alignItems: "center",
              gap: 20, padding: 24, textAlign: "center",
            }}>
              <div style={{ fontSize: isMobile ? 48 : 64 }} className="welcome-icon">🤖</div>
              <div>
                <Text strong style={{ fontSize: isMobile ? 20 : 26, display: "block", marginBottom: 8 }}>
                  Welcome to AI Assistant
                </Text>
                <Text type="secondary" style={{ fontSize: 14 }}>
                  Powered by Google Gemini · Select a model above and start chatting
                </Text>
              </div>

              <Tag color="blue" style={{ fontSize: 12, padding: "4px 12px" }}>
                {selectedModel.replace("models/", "")}
              </Tag>

              <Space wrap>
                <Button type="primary" size={isMobile ? "middle" : "large"}
                  icon={<PlusOutlined />} onClick={handleQuickNewChat}>
                  New Chat
                </Button>
                <Button size={isMobile ? "middle" : "large"}
                  icon={<ThunderboltOutlined />} onClick={() => navigate("/temp")}>
                  Temp Chat
                </Button>
              </Space>

              {!isMobile && (
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginTop: 8 }}>
                  {["📎 Attach images & files", "⚡ Temp chat — no history", "🌙 Dark mode support", "📋 Copy AI responses", "🔄 Regenerate responses"].map((hint) => (
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
