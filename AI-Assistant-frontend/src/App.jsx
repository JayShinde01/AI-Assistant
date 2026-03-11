import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute"
function App() {

  return (
    <Router>
      <Routes>

        <Route path="/login" element={<Login />} />

        <Route path="/chat/:chatId" element={<Home />} />

        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute> } />

      </Routes>
    </Router>
  );
}

export default App;