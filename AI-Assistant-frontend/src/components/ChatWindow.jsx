/**
 * components/ChatWindow.jsx
 * -------------------------
 * Scrollable message list — dark/light aware.
 */

import React, { useEffect, useRef } from "react";
import { Typography } from "antd";
import { RobotOutlined } from "@ant-design/icons";

import MessageBox from "./MessageBox";
import { useTheme } from "../context/ThemeContext";

const { Text } = Typography;

function ChatWindow({ messages, isLoading = false }) {
  const bottomRef = useRef(null);
  const { isDark } = useTheme();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "16px 8px",
        background: isDark ? "#141414" : "#f5f7fb",
        display: "flex",
        flexDirection: "column",
      }}
    >
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

      {messages.map((msg, i) => (
        <MessageBox
          key={msg.id || i}
          role={msg.role}
          message={msg.message}
          attachmentUrl={msg.attachment_url}
          attachmentType={msg.attachment_type}
          tokensUsed={msg.tokens_used}
        />
      ))}

      {isLoading && <MessageBox role="assistant" message="" isLoading />}

      <div ref={bottomRef} />
    </div>
  );
}

export default ChatWindow;
