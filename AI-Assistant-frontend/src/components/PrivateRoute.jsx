/**
 * components/PrivateRoute.jsx
 * ---------------------------
 * A wrapper component that protects routes from unauthenticated access.
 *
 * If the user has a token in localStorage, render the child component.
 * Otherwise, redirect them to the /login page.
 *
 * Usage:
 *   <Route path="/chat" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
 */

import React from "react";
import { Navigate } from "react-router-dom";
import { STORAGE_KEYS } from "../constants/config";

function PrivateRoute({ children }) {
  // Check if the user has a stored auth token
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

  // If authenticated, render the protected page; otherwise redirect to login
  return token ? children : <Navigate to="/login" replace />;
}

export default PrivateRoute;
