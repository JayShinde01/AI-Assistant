/**
 * components/ChatInput.jsx
 * ------------------------
 * Message input bar — dark/light aware, responsive.
 * Shows character count and supports file attachments.
 */

import { useState } from "react";
import { Input, Button, Tag, Tooltip, Typography } from "antd";
import { SendOutlined, CloseOutlined, FileOutlined } from "@ant-design/icons";

import FileUploadButton from "./FileUploadButton";
import { UPLOADS_BASE_URL } from "../constants/config";
import { useBreakpoint } from "../hooks/useBreakpoint";
import { useTheme }      from "../context/ThemeContext";

const { TextArea } = Input;
const { Text } = Typography;

// Max characters before we warn the user (keeps token usage reasonable)
const MAX_CHARS = 4000;

function ChatInput({ onSend, isLoading = false }) {
  const [message, setMessage]       = useState("");
  const [attachment, setAttachment] = useState(null);

  const isMobile = useBreakpoint();
  const { isDark } = useTheme();

  function handleSend() {
    if (!message.trim() && !attachment) return;
    onSend(message.trim(), attachment?.url || null, attachment?.mime_type || null);
    setMessage("");
    setAttachment(null);
  }

  function handleKeyDown(e) {
    // Enter sends on desktop; Shift+Enter adds a new line
    if (!isMobile && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const isImage    = attachment?.mime_type?.startsWith("image/");
  const charCount  = message.length;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <div style={{
      borderTop: `1px solid ${isDark ? "#303030" : "#e8e8e8"}`,
      background: isDark ? "#1a1a1a" : "#fff",
      padding: isMobile ? "8px 10px" : "10px 16px",
      flexShrink: 0,
    }}>
      {/* Attachment preview */}
      {attachment && (
        <div style={{ marginBottom: 6 }}>
          {isImage ? (
            <div style={{ position: "relative", display: "inline-block" }}>
              <img
                src={`${UPLOADS_BASE_URL}/${attachment.url.split("/uploads/")[1]}`}
                alt="attachment preview"
                style={{
                  maxHeight: isMobile ? 60 : 80, maxWidth: isMobile ? 140 : 200,
                  borderRadius: 6, border: "1px solid #d9d9d9",
                  objectFit: "cover", display: "block",
                }}
              />
              <Button size="small" icon={<CloseOutlined />} onClick={() => setAttachment(null)}
                style={{
                  position: "absolute", top: -8, right: -8,
                  borderRadius: "50%", padding: 0, width: 18, height: 18, minWidth: 18, fontSize: 9,
                }}
                aria-label="Remove attachment"
              />
            </div>
          ) : (
            <Tag icon={<FileOutlined />} closable onClose={() => setAttachment(null)} color="blue">
              {attachment.original_name}
            </Tag>
          )}
        </div>
      )}

      {/* Input row */}
      <div style={{ display: "flex", gap: isMobile ? 6 : 8, alignItems: "flex-end" }}>
        <FileUploadButton onUploadComplete={setAttachment} disabled={isLoading} />

        <div style={{ flex: 1, position: "relative" }}>
          <TextArea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? "Waiting for response…" : "Type a message… (Enter to send)"}
            autoSize={{ minRows: 1, maxRows: isMobile ? 3 : 4 }}
            disabled={isLoading}
            style={{
              resize: "none",
              borderColor: isOverLimit ? "#ff4d4f" : undefined,
            }}
            aria-label="Message input"
          />
          {/* Character count — only show when user has typed something */}
          {charCount > 0 && (
            <Text style={{
              position: "absolute", bottom: 4, right: 8,
              fontSize: 10, color: isOverLimit ? "#ff4d4f" : "#aaa",
              pointerEvents: "none",
            }}>
              {charCount}/{MAX_CHARS}
            </Text>
          )}
        </div>

        <Tooltip title={isMobile ? "" : "Send (Enter)"}>
          <Button
            type="primary" icon={<SendOutlined />}
            onClick={handleSend} loading={isLoading}
            disabled={(!message.trim() && !attachment) || isOverLimit}
            style={{ flexShrink: 0 }}
            aria-label="Send message"
          >
            {!isMobile && "Send"}
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}

export default ChatInput;
