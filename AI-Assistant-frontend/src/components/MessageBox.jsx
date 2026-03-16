/**
 * components/MessageBox.jsx
 * -------------------------
 * Single message bubble.
 *
 * New features:
 *  - Copy button on AI messages (hover to reveal)
 *  - Dark mode aware bubble colors
 *  - Responsive width
 */

import React, { useState } from "react";
import { Avatar, Typography, Tooltip, Button, message as antMessage } from "antd";
import { UserOutlined, RobotOutlined, FileOutlined, CopyOutlined, CheckOutlined } from "@ant-design/icons";
import ReactMarkdown from "react-markdown";

import { UPLOADS_BASE_URL } from "../constants/config";
import { useTheme }      from "../context/ThemeContext";
import { useBreakpoint } from "../hooks/useBreakpoint";

const { Text } = Typography;

function MessageBox({
  role, message, attachmentUrl = null, attachmentType = null,
  tokensUsed = null, isLoading = false,
}) {
  const isUser    = role === "user";
  const isMobile  = useBreakpoint();
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);

  const fullAttachmentUrl = attachmentUrl
    ? `${UPLOADS_BASE_URL}/${attachmentUrl.split("/uploads/")[1]}`
    : null;
  const isImage = attachmentType?.startsWith("image/");

  // ── Copy AI message to clipboard ─────────────────────────────────────────
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      antMessage.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      antMessage.error("Failed to copy");
    }
  }

  // ── Dark mode colors ──────────────────────────────────────────────────────
  const aiBubbleBg    = isDark ? "#1f1f1f" : "#f0f0f0";
  const aiBubbleColor = isDark ? "#e8e8e8" : "#000";
  const userBubbleBg  = "#1677ff";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: isMobile ? 12 : 16,
        padding: isMobile ? "0 4px" : "0 8px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: isUser ? "row-reverse" : "row",
          alignItems: "flex-start",
          gap: isMobile ? 6 : 10,
          maxWidth: isMobile ? "90%" : "75%",
        }}
      >
        {/* Avatar */}
        <Avatar
          icon={isUser ? <UserOutlined /> : <RobotOutlined />}
          size={isMobile ? 28 : 32}
          style={{ backgroundColor: isUser ? "#1677ff" : "#52c41a", flexShrink: 0 }}
        />

        {/* Bubble + actions */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              background: isUser ? userBubbleBg : aiBubbleBg,
              color: isUser ? "#fff" : aiBubbleColor,
              padding: isMobile ? "8px 10px" : "10px 14px",
              borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
              wordBreak: "break-word",
              lineHeight: 1.6,
              fontSize: isMobile ? 13 : 14,
            }}
          >
            {/* Image attachment */}
            {fullAttachmentUrl && isImage && (
              <img src={fullAttachmentUrl} alt="attachment"
                style={{
                  maxWidth: "100%", maxHeight: isMobile ? 200 : 300,
                  borderRadius: 8, marginBottom: message ? 8 : 0, display: "block",
                }}
              />
            )}

            {/* File attachment */}
            {fullAttachmentUrl && !isImage && (
              <a href={fullAttachmentUrl} target="_blank" rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  color: isUser ? "#fff" : "#1677ff",
                  marginBottom: message ? 8 : 0,
                }}>
                <FileOutlined /> View attached file
              </a>
            )}

            {/* Typing dots */}
            {isLoading ? (
              <span>
                <span className="typing-dot">●</span>
                <span className="typing-dot">●</span>
                <span className="typing-dot">●</span>
              </span>
            ) : isUser ? (
              <span style={{ whiteSpace: "pre-wrap" }}>{message}</span>
            ) : (
              <div className={`markdown-body${isDark ? " markdown-dark" : ""}`}>
                <ReactMarkdown>{message}</ReactMarkdown>
              </div>
            )}
          </div>

          {/* Copy button — AI messages only, shown below bubble */}
          {!isUser && !isLoading && message && (
            <Tooltip title={copied ? "Copied!" : "Copy response"}>
              <Button
                size="small"
                type="text"
                icon={copied ? <CheckOutlined style={{ color: "#52c41a" }} /> : <CopyOutlined />}
                onClick={handleCopy}
                style={{
                  marginTop: 4,
                  opacity: 0.6,
                  fontSize: 11,
                  height: 22,
                  padding: "0 6px",
                }}
              >
                {!isMobile && (copied ? "Copied" : "Copy")}
              </Button>
            </Tooltip>
          )}

          {/* Token count */}
          {!isUser && tokensUsed != null && tokensUsed > 0 && (
            <Text type="secondary" style={{ fontSize: 10, display: "block", marginTop: 2 }}>
              {tokensUsed} tokens
            </Text>
          )}
        </div>
      </div>
    </div>
  );
}

export default MessageBox;
