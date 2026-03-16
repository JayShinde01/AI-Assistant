/**
 * App.jsx
 * -------
 * Root component — sets up routing and wraps everything with
 * Ant Design's ConfigProvider for dark/light theming.
 *
 * Routes:
 *  /login        → Login page (public)
 *  /             → Home (protected)
 *  /chat/:chatId → Chat view (protected)
 *  /temp         → Temp chat (protected)
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, theme as antTheme } from "antd";

import Home      from "./pages/Home";
import Login     from "./pages/Login";
import TempChat  from "./pages/TempChat";
import PrivateRoute from "./components/PrivateRoute";
import { useTheme } from "./context/ThemeContext";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/"           element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/chat/:chatId" element={<PrivateRoute><Home /></PrivateRoute>} />
      <Route path="/temp"       element={<PrivateRoute><TempChat /></PrivateRoute>} />
      <Route path="*"           element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  const { isDark } = useTheme();

  return (
    // ConfigProvider applies Ant Design's built-in dark/light algorithm globally
    <ConfigProvider
      theme={{
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
          colorPrimary: "#1677ff",
          borderRadius: 8,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
      }}
    >
      <Router>
        <AppRoutes />
      </Router>
    </ConfigProvider>
  );
}

export default App;
