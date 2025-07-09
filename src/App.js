import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import NewPasswordPage from "./pages/PasswordPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/new-password" element={<NewPasswordPage />} />
      </Routes>
    </Router>
  );
}

export default App;
