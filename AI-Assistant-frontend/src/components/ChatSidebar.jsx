import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Button, Modal, Input, Space } from "antd";
import { MessageOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";

import {
  handleLogout,
  createChat,
  onDeleteChat,
  loadChats,
  renameChat
} from "../services/chat_services";

function ChatSidebar() {

  const [chats, setChats] = useState([]);
  const [renameVisible, setRenameVisible] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    loadChat();
  }, []);

  async function loadChat() {
    const res = await loadChats();
    setChats(res);
  }

  async function newChat() {
    const res = await createChat();
    loadChat();
    navigate(`/chat/${res.id}`);
  }

  async function handleDelete(id) {
    await onDeleteChat(id);
    loadChat();
  }

  function openRename(chat) {
    setSelectedChat(chat.id);
    setNewTitle(chat.title);
    setRenameVisible(true);
  }

  async function handleRename() {
    if(newTitle != "")
    await renameChat(selectedChat, newTitle);
    setRenameVisible(false);
    loadChat();
  }

  return (
    <>
      <Space style={{ marginBottom: 10 }}>
        <Button type="primary" onClick={newChat}>
          New Chat
        </Button>

        <Button danger onClick={() => handleLogout(navigate)}>
          Logout
        </Button>
      </Space>

      <Menu
        mode="inline"
        style={{ height: "100%" }}
        onClick={(item) => navigate(`/chat/${item.key}`)}
        items={chats.map(chat => ({
          key: chat.id,
          icon: <MessageOutlined />,
          label: (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span
                style={{
                  maxWidth: "120px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {chat.title}
              </span>

              <Space size={8}>
                <EditOutlined
                  style={{ color: "#1677ff" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    openRename(chat);
                  }}
                />

                <DeleteOutlined
                  style={{ color: "red" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(chat.id);
                  }}
                />
              </Space>
            </div>
          )
        }))}
      />

      <Modal
        title="Rename Chat"
        open={renameVisible}
        onOk={handleRename}
        onCancel={() => setRenameVisible(false)}
      >
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Enter new chat name"
        />
      </Modal>
    </>
  );
}

export default ChatSidebar;