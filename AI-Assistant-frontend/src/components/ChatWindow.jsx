import React from "react";
import MessageBox from "./MessageBox";

function ChatWindow({ messages }) {

  return (
    <div style={{
      height: "500px",
      overflowY: "auto",
      border: "1px solid #ddd",
      padding: "10px"
    }}>
      
      {messages.map((msg, index) => (
        <MessageBox
          key={index}
          role={msg.role}
          message={msg.message}
        />
      ))}

    </div>
  );
}

export default ChatWindow;