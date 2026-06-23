import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

function Menu() {
  const [, setError] = useState("");
  const navigate = useNavigate();

  const logout = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await fetch(
        `https://my-pmos-buddy-backend.onrender.com/api/auth/logout`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Logout failed");
        return;
      }

      navigate("/login");
    } catch (err) {
      setError(err.message || "An error occurred during logout.");
    }
  };
  return (
    <>
      <div className="menu-brand">
        <h1>My PMOS Buddy</h1>
        <p>Daily tracker</p>
      </div>
      <NavLink to="/profile">Home</NavLink>
      <NavLink to="/flow">Flow</NavLink>
      <NavLink to="/skin">Skin</NavLink>
      <NavLink to="/weight">Weight</NavLink>
      <NavLink to="/medication">Medication</NavLink>
      <a href="/" style={{ cursor: "pointer" }} onClick={logout}>
        Logout
      </a>
    </>
  );
}

export default Menu;
