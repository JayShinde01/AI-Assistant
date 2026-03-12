import React from "react";
import { Avatar, Space } from "antd";
import { UserOutlined, RobotOutlined } from "@ant-design/icons";

function MessageBox({ role, message }) {

  const isUser = role === "user";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginBottom: 12
      }}
    >
      <Space
        direction={isUser ? "horizontal-reverse" : "horizontal"}
        align="start"
      >
        <Avatar
          icon={isUser ? <UserOutlined /> : <RobotOutlined />}
        />

        <div
          style={{
            background: isUser ? "#1677ff" : "#f5f5f5",
            color: isUser ? "white" : "black",
            padding: "10px 14px",
            borderRadius: "10px",
            maxWidth: "400px",
            wordBreak: "break-word"
          }}
        >
          {message}
        </div>

      </Space>
    </div>
  );
}

export default MessageBox;