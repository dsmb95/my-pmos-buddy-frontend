import { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { useNavigate, Link } from "react-router-dom";
import Box from "@mui/material/Box";
import logo from "../assets/My PMOS Buddy Logo.png";

function RegistrationPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const response = await fetch(
        "https://my-pmos-buddy-backend.onrender.com/api/auth/register",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name,
            email: email,
            password: password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Registration failed.");
        setLoading(false);
        return;
      }

      setLoading(false);
      navigate("/login");
    } catch (err) {
      setError(err.message || "An error occurred while registering.");
      setLoading(false);
    }
  };

  function handleSubmit(e) {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please enter all the required fields.");
      return;
    }
    setLoading(true);
    fetchData();
  }

  if (loading) return <CircularProgress aria-label="Loading..." />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box className="registration-container" sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, minHeight: "100vh" }}>
      <Box className="registration-col-1" sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", p: { xs: 4, md: 8 } }}>
        <div className="welcome-banner">
          <h1>Welcome to My PMOS Buddy</h1>
          <h3>Your bestfriend in learning your patterns.</h3>
          <img src={logo} alt="My PMOS Buddy Logo" style={{ maxWidth: "100%", height: "auto" }} />
        </div>
      </Box>
      <Box className="registration-col-2" sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", p: { xs: 4, md: 8 } }}>
        <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "400px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <TextField
            required
            id="outlined-required"
            label="Name"
            value={name}
            onChange={({ target }) => setName(target.value)}
            placeholder="Full name"
          />
          <TextField
            required
            id="outline-required"
            type="email"
            label="Email"
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            placeholder="Email"
          />
          <TextField
            required
            id="outline-required"
            type="password"
            label="Password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
          <Button type="submit" variant="contained" size="medium">
            Sign up
          </Button>
        </form>
        <div className="option" style={{ marginTop: "20px", textAlign: "center" }}>
          <p>
            Already registered? <Link to="/login">Sign in.</Link>
          </p>
        </div>
      </Box>
    </Box>
  );
}

export default RegistrationPage;
