import React, { useState } from "react";

function ChatInput({ onSend }) {

  const [message, setMessage] = useState("");

  const handleSend = () => {

    if (!message.trim()) return;

    onSend(message);

    setMessage("");
  };

  return (
    <div style={{ display: "flex", marginTop: "10px" }}>

      <input
        style={{ flex: 1, padding: "10px" }}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
      />

      <button
        onClick={handleSend}
        style={{ padding: "10px 20px" }}
      >
        Send
      </button>

    </div>
  );
}

export default ChatInput;