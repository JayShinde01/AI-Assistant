/**
 * main.jsx
 * --------
 * Application entry point.
 *
 * Provider order (outermost → innermost):
 *  1. GoogleOAuthProvider  — Google Sign-In
 *  2. ThemeProvider        — dark / light mode (Context API + localStorage)
 *  3. ChatModelProvider    — globally shared AI model selection
 *  4. App                  — routing + Ant Design ConfigProvider
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { ThemeProvider }     from "./context/ThemeContext";
import { ChatModelProvider } from "./context/ChatModelContext";
import App from "./App.jsx";
import "./index.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <ChatModelProvider>
          <App />
        </ChatModelProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
