/**
 * components/ChatWindow.jsx
 * -------------------------
 * Scrollable message list with hover prompt navigator and regenerate button.
 */

import { useEffect, useRef, useState } from "react";
import { Typography, Button, Tooltip } from "antd";
import { RobotOutlined, ReloadOutlined } from "@ant-design/icons";

import MessageBox from "./MessageBox";
import { useTheme } from "../context/ThemeContext";

const { Text } = Typography;

function ChatWindow({ messages, isLoading = false, isStreaming = false, onRegenerate }) {
  const bottomRef = useRef(null);
  const { isDark } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  console.log("chatwindows",messages);
  

  // Auto-scroll to bottom when new messages arrive or stream updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Only show user messages in the prompt navigator
  const userPrompts = messages
    .map((msg, index) => ({ ...msg, originalId: msg.id || index }))
    .filter((msg) => msg.role === "user");

  function scrollToPrompt(id) {
    document.getElementById(`message-${id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // The last message — used to decide if we show the regenerate button
  const lastMsg = messages[messages.length - 1];
  const showRegenerate = lastMsg?.role === "assistant" && !isStreaming && !isLoading && onRegenerate;

  return (
    <div style={{ flex: 1, display: "flex", position: "relative", overflow: "hidden" }}>

      {/* Main chat area */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "16px 8px", paddingRight: "32px",
        background: isDark ? "#141414" : "#f5f7fb",
        display: "flex", flexDirection: "column",
      }}>

        {/* Empty state */}
        {messages.length === 0 && !isLoading && (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            justifyContent: "center", alignItems: "center", gap: 8,
          }}>
            <RobotOutlined style={{ fontSize: 40, color: "#aaa" }} />
            <Text type="secondary" style={{ fontSize: 13 }}>
              Start the conversation by typing a message below.
            </Text>
          </div>
        )}

        {/* Message list */}
        {messages.map((msg, i) => {
          const messageId = msg.id || i;
          return (
            <div key={messageId} id={`message-${messageId}`} className="message-enter">
              <MessageBox
                role={msg.role}
                message={msg.message}
                attachmentUrl={msg.attachment_url}
                attachmentType={msg.attachment_type}
                tokensUsed={msg.tokens_used}
                isLoading={isLoading && i === messages.length - 1 && msg.role === "assistant" && !msg.message}
                isStreaming={msg.isStreaming}
              />
            </div>
          );
        })}

        {/* Regenerate button — shown below the last AI message */}
        {showRegenerate && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 4, marginBottom: 8 }}>
            <Tooltip title="Regenerate response">
              <Button
                size="small" icon={<ReloadOutlined />} onClick={onRegenerate}
                style={{ opacity: 0.7, fontSize: 12 }}
              >
                Regenerate
              </Button>
            </Tooltip>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Hover sidebar — prompt navigator */}
      <div
        onMouseEnter={() => setIsSidebarOpen(true)}
        onMouseLeave={() => setIsSidebarOpen(false)}
        style={{
          position: "absolute", right: 0, top: 0, height: "100%",
          width: isSidebarOpen ? "260px" : "16px",
          background: isDark ? "#1f1f1f" : "#ffffff",
          borderLeft: `1px solid ${isDark ? "#333" : "#e8e8e8"}`,
          boxShadow: isSidebarOpen ? "-4px 0 15px rgba(0,0,0,0.1)" : "none",
          transition: "width 0.2s ease-in-out",
          zIndex: 50, overflow: "hidden",
          display: "flex", flexDirection: "column",
        }}
      >
        {isSidebarOpen ? (
          <div style={{ padding: "16px", overflowY: "auto", height: "100%" }}>
            <Text type="secondary" style={{
              fontSize: "11px", fontWeight: "bold", textTransform: "uppercase",
              display: "block", marginBottom: "12px", letterSpacing: "0.5px",
            }}>
              Prompts
            </Text>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {userPrompts.map((prompt) => (
                <div
                  key={prompt.originalId}
                  onClick={() => scrollToPrompt(prompt.originalId)}
                  title={prompt.message}
                  style={{
                    fontSize: "12px", padding: "6px 8px", borderRadius: "6px",
                    cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden",
                    textOverflow: "ellipsis", color: isDark ? "#d9d9d9" : "#333",
                    transition: "background 0.15s",
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = isDark ? "#333" : "#f0f0f0")}
                  onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {prompt.message}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            paddingTop: "24px", gap: "8px", height: "100%", overflow: "hidden",
          }}>
            {userPrompts.map((prompt) => (
              <div key={prompt.originalId} style={{
                width: "8px", height: "2px", borderRadius: "2px",
                background: isDark ? "#555" : "#ccc",
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatWindow;
