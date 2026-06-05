import { useState } from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import "./App.css";
import RegistrationPage from "./screens/RegistrationPage.jsx";
import LoginPage from "./screens/LoginPage.jsx";
import ProfilePage from "./screens/ProfilePage.jsx";

function App() {
  const [show, setShow] = useState(true);

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </>
  );
}

export default App;
