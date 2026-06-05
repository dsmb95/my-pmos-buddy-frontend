import { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { useNavigate, Link } from "react-router-dom";

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
      setError(err);
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
    <div className="registration-container">
      <div className="registration-col-1">
        <div className="welcome-banner">
          <h1>Welcome to My PMOS Buddy</h1>
          <h3>Your bestfriend in learning your patterns.</h3>
          {/* <img /> */}
        </div>
      </div>
      <div className="registration-col-2">
        <form onSubmit={handleSubmit}>
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
            label="Email"
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            placeholder="Email"
          />
          <TextField
            required
            id="outline-required"
            label="Password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
          <Button type="submit" variant="contained" size="medium">
            Sign up
          </Button>
        </form>
        <div className="option">
          <p>
            Already registered? <Link to="/login">Sign in.</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegistrationPage;
