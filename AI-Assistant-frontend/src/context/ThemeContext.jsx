/**
 * context/ThemeContext.jsx
 * ------------------------
 * Global theme context — provides dark/light mode state to the entire app.
 *
 * Usage anywhere in the tree:
 *   const { isDark, toggleTheme } = useTheme();
 *
 * Persists the user's preference to localStorage so it survives page refresh.
 */

import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Read saved preference, default to light
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // Persist preference whenever it changes
  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");
    // Also set a data attribute on <html> so CSS can target it if needed
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** Hook — throws if used outside ThemeProvider */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
