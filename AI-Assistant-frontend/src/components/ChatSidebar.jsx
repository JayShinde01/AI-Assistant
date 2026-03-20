/**
 * components/ChatSidebar.jsx
 * --------------------------
 * Left sidebar — chat list with search, dark/light aware.
 */

import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button, Menu, Modal, Input, Space, Avatar,
  Typography, Divider, Tooltip, message,
} from "antd";
import {
  MessageOutlined, DeleteOutlined, EditOutlined,
  PlusOutlined, LogoutOutlined, ThunderboltOutlined,
  BulbOutlined, BulbFilled, SearchOutlined,
} from "@ant-design/icons";

import ModelSelector from "./ModelSelector";
import { handleLogout, createChat, onDeleteChat, loadChats, renameChat } from "../services/chat_services";
import { useChatModel } from "../context/ChatModelContext";
import { useTheme }     from "../context/ThemeContext";
import { STORAGE_KEYS } from "../constants/config";

const { Text } = Typography;

function ChatSidebar({ onNavigate }) {
  const [chats, setChats]                   = useState([]);
  const [loading, setLoading]               = useState(false);
  const [searchQuery, setSearchQuery]       = useState("");
  const [newChatVisible, setNewChatVisible] = useState(false);
  const [renameVisible, setRenameVisible]   = useState(false);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [newTitle, setNewTitle]             = useState("");

  const navigate   = useNavigate();
  const { chatId } = useParams();
  const user       = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || "{}");

  const { selectedModel, setSelectedModel } = useChatModel();
  const { isDark, toggleTheme } = useTheme();

  const fetchChats = useCallback(async () => {
    try { setChats(await loadChats()); }
    catch { message.error("Failed to load chats"); }
  }, []);

  useEffect(() => { fetchChats(); }, [fetchChats]);

  async function handleCreateChat() {
    setLoading(true);
    try {
      const newChat = await createChat("New Chat", selectedModel);
      await fetchChats();
      setNewChatVisible(false);
      navigate(`/chat/${newChat.id}`);
      onNavigate?.();
    } catch { message.error("Failed to create chat"); }
    finally { setLoading(false); }
  }

  async function handleDelete(id) {
    try {
      await onDeleteChat(id);
      await fetchChats();
      if (chatId === id) { navigate("/"); onNavigate?.(); }
    } catch { message.error("Failed to delete chat"); }
  }

  async function handleRename() {
    if (!newTitle.trim()) return;
    try {
      await renameChat(selectedChatId, newTitle.trim());
      setRenameVisible(false);
      await fetchChats();
    } catch { message.error("Failed to rename chat"); }
  }

  // Filter chats by search query
  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%",
      padding: "12px 8px", background: "var(--sidebar-bg)",
    }}>

      {/* User profile */}
      <Space style={{ marginBottom: 12, padding: "0 4px" }}>
        <Avatar src={user.picture} size={32}>{user.name?.[0] || "U"}</Avatar>
        <Text ellipsis style={{ maxWidth: 150, fontSize: 13 }}>
          {user.name || user.email || "User"}
        </Text>
      </Space>

      <Divider style={{ margin: "0 0 10px 0" }} />

      {/* Action buttons */}
      <Space style={{ width: "100%", marginBottom: 8, flexDirection: "column", gap: 6 }}>
        <Button type="primary" icon={<PlusOutlined />} block onClick={() => setNewChatVisible(true)}>
          New Chat
        </Button>
        <Tooltip title="Messages are not saved">
          <Button icon={<ThunderboltOutlined />} block
            onClick={() => { navigate("/temp"); onNavigate?.(); }}>
            Temp Chat
          </Button>
        </Tooltip>
      </Space>

      <Divider style={{ margin: "8px 0" }} />

      {/* Search input */}
      <Input
        prefix={<SearchOutlined style={{ color: "#aaa" }} />}
        placeholder="Search chats…"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        allowClear
        size="small"
        style={{ marginBottom: 8 }}
      />

      {/* Chat list */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {filteredChats.length === 0 && (
          <Text type="secondary" style={{ fontSize: 12, padding: "8px 4px", display: "block" }}>
            {searchQuery ? "No chats match your search." : "No chats yet. Create one above."}
          </Text>
        )}
        <Menu
          mode="inline"
          theme={isDark ? "dark" : "light"}
          selectedKeys={chatId ? [chatId] : []}
          onClick={({ key }) => { navigate(`/chat/${key}`); onNavigate?.(); }}
          style={{ border: "none", background: "transparent" }}
          items={filteredChats.map((chat) => ({
            key: chat.id,
            icon: <MessageOutlined />,
            label: (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{
                  maxWidth: 100, overflow: "hidden",
                  textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 13,
                }}>
                  {chat.title}
                </span>
                <Space size={4}>
               <Tooltip title="Rename Chat">
                   <EditOutlined style={{ color: "#1677ff", fontSize: 12 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedChatId(chat.id);
                      setNewTitle(chat.title);
                      setRenameVisible(true);
                    }} />
               </Tooltip>
                  <Tooltip title="Delete Chat">
                    <DeleteOutlined style={{ color: "#ff4d4f", fontSize: 12 }}
                    onClick={(e) => { e.stopPropagation(); handleDelete(chat.id); }} />
                  </Tooltip>
                </Space>
              </div>
            ),
          }))}
        />
      </div>

      <Divider style={{ margin: "8px 0" }} />

      {/* Theme toggle + logout */}
      <Space style={{ width: "100%", flexDirection: "column", gap: 6 }}>
        <Button
          block icon={isDark ? <BulbFilled style={{ color: "#faad14" }} /> : <BulbOutlined />}
          onClick={toggleTheme}
        >
          {isDark ? "Light Mode" : "Dark Mode"}
        </Button>
         <Button danger icon={<LogoutOutlined />} block onClick={() => handleLogout(navigate)}>
          Logout
        </Button>
      </Space>

      {/* New Chat Modal */}
      <Modal title="Create New Chat" open={newChatVisible} onOk={handleCreateChat}
        onCancel={() => setNewChatVisible(false)} confirmLoading={loading} okText="Create">
        <Space style={{ width: "100%", flexDirection: "column", gap: 8 }}>
          <Text>Choose an AI model for this chat:</Text>
          <ModelSelector value={selectedModel} onChange={setSelectedModel} />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Model cannot be changed after creation.
          </Text>
        </Space>
      </Modal>

      {/* Rename Modal */}
      <Modal title="Rename Chat" open={renameVisible} onOk={handleRename}
        onCancel={() => setRenameVisible(false)} okText="Save">
        <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Enter new chat name" onPressEnter={handleRename} maxLength={200} />
      </Modal>
    </div>
  );
}

export default ChatSidebar;
