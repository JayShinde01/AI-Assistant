/**
 * context/ChatModelContext.jsx
 * ----------------------------
 * Global context that stores the currently selected AI model.
 *
 * This lets the model selector in the top bar (Home) and TempChat
 * share the same value without prop-drilling.
 *
 * Persists to localStorage so the choice survives page refresh.
 *
 * Usage anywhere in the tree:
 *   const { selectedModel, setSelectedModel } = useChatModel();
 */

import React, { createContext, useContext, useState } from "react";
import { DEFAULT_MODEL } from "../constants/models";

const ChatModelContext = createContext(null);

export function ChatModelProvider({ children }) {
  const [selectedModel, setSelectedModel] = useState(
    () => localStorage.getItem("selectedModel") || DEFAULT_MODEL
  );

  function changeModel(model) {
    setSelectedModel(model);
    localStorage.setItem("selectedModel", model);
  }

  return (
    <ChatModelContext.Provider value={{ selectedModel, setSelectedModel: changeModel }}>
      {children}
    </ChatModelContext.Provider>
  );
}

export function useChatModel() {
  const ctx = useContext(ChatModelContext);
  if (!ctx) throw new Error("useChatModel must be used inside <ChatModelProvider>");
  return ctx;
}
