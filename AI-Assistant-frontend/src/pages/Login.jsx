import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, Typography, Spin } from "antd";

const { Title, Text } = Typography;

function Login() {

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  async function handleSuccess(credentialResponse) {

    const token = credentialResponse.credential;
    setLoading(true);

    try {

      const res = await axios.post(
        "http://localhost:8000/api/auth/google",
        { token }
      );

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(res.data));

      navigate("/");

    } catch (err) {

      console.log("Login error", err);

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
        background: "#f5f7fb"
      }}
    >

      <Card
        style={{
          width: 350,
          textAlign: "center",
          borderRadius: "10px"
        }}
      >

        <Title level={3}>AI Chat Assistant</Title>

        <Text type="secondary">
          Sign in to continue
        </Text>

        <div style={{ marginTop: "30px" }}>

          {loading ? (
            <Spin />
          ) : (
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => console.log("Login Failed")}
            />
          )}

        </div>

      </Card>

    </div>

  );
}

export default Login;