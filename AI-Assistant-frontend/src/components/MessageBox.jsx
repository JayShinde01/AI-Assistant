import React from "react";

function MessageBox({ role, message }) {

  return (
    <div style={{
      display: "flex",
      justifyContent: role === "user" ? "flex-end" : "flex-start",
      marginBottom: "10px"
    }}>
      
      <div style={{
        background: role === "user" ? "#4CAF50" : "#E0E0E0",
        color: role === "user" ? "white" : "black",
        padding: "10px",
        borderRadius: "10px",
        maxWidth: "60%"
      }}>
        {message}
      </div>

    </div>
  );
}

export default MessageBox;