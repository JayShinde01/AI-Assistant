/**
 * pages/Login.jsx
 * ---------------
 * Login page — dark/light aware, responsive.
 * Includes a theme toggle so users can switch before logging in.
 */

import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, Typography, Spin, Alert, Space, Button, Tooltip } from "antd";
import { RobotOutlined, BulbOutlined, BulbFilled } from "@ant-design/icons";

import { API_BASE_URL, STORAGE_KEYS } from "../constants/config";
import { useTheme } from "../context/ThemeContext";

const { Title, Text } = Typography;

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const { isDark, toggleTheme } = useTheme();

  async function handleSuccess(credentialResponse) {
    const token = credentialResponse.credential;
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/google`, { token });
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(res.data));
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: isDark
          ? "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)"
          : "linear-gradient(135deg, #e0f0ff 0%, #f5f7fb 100%)",
        position: "relative",
        padding: 16,
      }}
    >
      {/* Theme toggle — top right corner */}
      <Tooltip title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
        <Button
          type="text"
          icon={isDark ? <BulbFilled style={{ color: "#faad14" }} /> : <BulbOutlined />}
          onClick={toggleTheme}
          style={{ position: "absolute", top: 16, right: 16 }}
          aria-label="Toggle theme"
        />
      </Tooltip>

      <Card
        style={{
          width: "min(400px, calc(100vw - 32px))",
          textAlign: "center",
          borderRadius: 20,
          boxShadow: isDark
            ? "0 8px 40px rgba(0,0,0,0.6)"
            : "0 8px 40px rgba(22,119,255,0.12)",
          padding: "8px 0",
        }}
      >
        {/* Icon */}
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "linear-gradient(135deg, #1677ff, #52c41a)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <RobotOutlined style={{ fontSize: 36, color: "#fff" }} />
        </div>

        <Title level={3} style={{ marginBottom: 4 }}>AI Chat Assistant</Title>
        <Text type="secondary" style={{ fontSize: 13 }}>Powered by  Gemini</Text>

        {/* Feature pills */}
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", margin: "16px 0" }}>
          {["🤖 Multi-model", "📎 File upload", "⚡ Temp chat", "🌙 Dark mode"].map((f) => (
            <span key={f} style={{
              fontSize: 11, padding: "3px 10px", borderRadius: 20,
              background: isDark ? "#2a2a2a" : "#f0f5ff",
              color: isDark ? "#aaa" : "#555",
            }}>{f}</span>
          ))}
        </div>

        <div style={{ marginTop: 8, marginBottom: 16 }}>
          {loading ? (
            <Space direction="vertical" align="center">
              <Spin size="large" />
              <Text type="secondary">Signing you in…</Text>
            </Space>
          ) : (
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => setError("Google sign-in failed. Please try again.")}
              theme={isDark ? "filled_black" : "outline"}
              size="large"
              text="signin_with"
              shape="rectangular"
            />
          )}
        </div>

        {error && (
          <Alert message={error} type="error" showIcon
            style={{ marginTop: 12, textAlign: "left" }} />
        )}

        <Text type="secondary" style={{ fontSize: 11, display: "block", marginTop: 16 }}>
          By signing in, you agree to use this app responsibly.
        </Text>
      </Card>
    </div>
  );
}

export default Login;
