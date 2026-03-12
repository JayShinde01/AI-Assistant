import React, { useState } from "react";
import { Input, Button } from "antd";
import { SendOutlined } from "@ant-design/icons";

const { TextArea } = Input;

function ChatInput({ onSend }) {

  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;

    onSend(message);
    setMessage("");
  };

  return (

    <div
      style={{
        display: "flex",
        width: "100%",
        gap: "10px",
        padding: "10px",
        borderTop: "1px solid #eee",
        background: "#fff"
      }}
    >

      <TextArea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        autoSize={{ minRows: 1, maxRows: 4 }}
        style={{
          flex: 1   // ⭐ This makes it full width
        }}
        onPressEnter={(e) => {
          if (!e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
      />

      <Button
        type="primary"
        icon={<SendOutlined />}
        onClick={handleSend}
      >
        Send
      </Button>

    </div>

  );
}

export default ChatInput;