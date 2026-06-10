import { Navigate, Routes, Route } from "react-router-dom";
import "./App.css";
import RegistrationPage from "./screens/RegistrationPage.jsx";
import LoginPage from "./screens/LoginPage.jsx";
import ProfilePage from "./screens/ProfilePage.jsx";
import FlowPage from "./screens/FlowPage.jsx";
import SkinPage from "./screens/SkinPage.jsx";
import WeightPage from './screens/WeightPage.jsx';
import MedicationPage from './screens/MedicationPage.jsx';

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/flow" element={<FlowPage/>} />
        <Route path="/skin" element={<SkinPage/>} />
        <Route path="/weight" element={<WeightPage />} />
        <Route path="/medication" element={<MedicationPage/>} />
      </Routes>
    </>
  );
}

export default App;
