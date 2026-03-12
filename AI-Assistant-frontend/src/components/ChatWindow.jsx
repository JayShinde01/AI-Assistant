import React, { useEffect, useRef } from "react";
import { List, Avatar } from "antd";
import { UserOutlined, RobotOutlined } from "@ant-design/icons";

function ChatWindow({ messages }) {

  const bottomRef = useRef(null);

  // auto scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "10px",
        background: "#fafafa"
      }}
    >
      <List
        dataSource={messages}
        renderItem={(msg, index) => {

          const isUser = msg.role === "user";

          return (
            <List.Item key={index} style={{ border: "none" }}>

              <div
                style={{
                  display: "flex",
                  width: "100%",
                  justifyContent: isUser ? "flex-end" : "flex-start"
                }}
              >

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexDirection: isUser ? "row-reverse" : "row",
                    alignItems: "flex-start"
                  }}
                >

                  <Avatar
                    icon={isUser ? <UserOutlined /> : <RobotOutlined />}
                  />

                  <div
                    style={{
                      background: isUser ? "#1677ff" : "#f0f0f0",
                      color: isUser ? "white" : "black",
                      padding: "10px 14px",
                      borderRadius: "10px",
                      maxWidth: "600px",
                      wordBreak: "break-word"
                    }}
                  >
                    {msg.message}
                  </div>

                </div>

              </div>

            </List.Item>
          );
        }}
      />

      {/* Auto scroll target */}
      <div ref={bottomRef} />

    </div>
  );
}

export default ChatWindow;