import { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { useNavigate, Link } from "react-router-dom";
import Box from "@mui/material/Box";
import logo from "../assets/My PMOS Buddy Logo.png";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import Tooltip from "@mui/material/Tooltip";

function RegistrationPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [periodDate, setPeriodDate] = useState("");
  const [cycleLength, setCycleLength] = useState("");
  const [periodLength, setPeriodLength] = useState("");
  const navigate = useNavigate();

  const register = async () => {
    try {
      const registrationRes = await fetch("https://my-pmos-buddy-backend.onrender.com/api/auth/register", {
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
      });

      const registrationData = await registrationRes.json();

      if (!registrationRes.ok) {
        setError(registrationData.message || "Registration failed.");
        setLoading(false);
        return;
      }

      const loginRes = await fetch("https://my-pmos-buddy-backend.onrender.com/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      if (!loginRes.ok) {
        const loginData = await loginRes.json();
        setError(loginData.message || "Registration succeeded, but auto-login failed.");
        setLoading(false);
        return;
      }
      
      const flowRes = await fetch("https://my-pmos-buddy-backend.onrender.com/api/flow", {
        method: "POST", 
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          lastPeriod: periodDate ? new Date(periodDate.replace(/-/g, "/")) : null,
          cycleLength: cycleLength ? cycleLength : 28,
          periodLength: periodLength ? periodLength : 5
        })
      });

      const flowData = await flowRes.json();

      if (!flowRes.ok) {
        setError(flowData.message || "Registration succeeded, but failed to save period date.");
        setLoading(false);
        return;
      }

      setLoading(false);
      navigate("/profile"); // Skip the login page entirely for a better UX!
    } catch (err) {
      setError(err.message || "An error occurred while registering.");
      setLoading(false);
    }
  };

  function handleSubmit(e) {
    e.preventDefault();
    if (!name || !email || !password || !periodDate) {
      setError("Please enter all the required fields.");
      return;
    }
    setLoading(true);
    register();
  }

  if (loading) return <CircularProgress aria-label="Loading..." />;

  return (
    <Box
      className="registration-container"
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        minHeight: "100vh",
      }}
    >
      <Box
        className="registration-col-1"
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          p: { xs: 4, md: 8 },
        }}
      >
        <div className="welcome-banner">
          <h1>Welcome to My PMOS Buddy</h1>
          <h3>Your bestfriend in learning your patterns.</h3>
          <img
            src={logo}
            alt="My PMOS Buddy Logo"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </div>
      </Box>
      <Box
        className="registration-col-2"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: { xs: 4, md: 8 },
        }}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2, width: "100%", maxWidth: "400px" }}>
            {error}
          </Alert>
        )}
        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            maxWidth: "400px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
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
            placeholder="user@email.com"
          />
          <TextField
            required
            id="outline-required"
            type="password"
            label="Password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
          />
           <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <DatePicker
                label="First Day of Last Menstrual Period"
                value={periodDate ? dayjs(periodDate) : null}
                onChange={(newValue) => setPeriodDate(newValue ? newValue.format('YYYY-MM-DD') : '')}
                sx={{ flex: 1 }}
                slotProps={{
                  textField: { required: true }
                }}
              />
              <Tooltip title="The first day of your most recent period. This helps predict your upcoming cycles.">
                <div style={{ cursor: "help", background: "#ffb6b9", color: "#5c434a", borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "bold", flexShrink: 0 }}>
                  ?
                </div>
              </Tooltip>
            </div>
          </LocalizationProvider>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <TextField
              id="outline"
              label="Cycle Length"
              value={cycleLength}
              placeholder="28"
              onChange={({target}) => setCycleLength(target.value)}
              sx={{ flex: 1 }}
            />
            <Tooltip title="The average number of days from the start of one period to the start of the next (typically 28 days).">
              <div style={{ cursor: "help", background: "#ffb6b9", color: "#5c434a", borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "bold", flexShrink: 0 }}>
                ?
              </div>
            </Tooltip>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <TextField
              id="outline"
              label="Period Length"
              value={periodLength}
              placeholder="5"
              onChange={({target}) => setPeriodLength(target.value)}
              sx={{ flex: 1 }}
            />
            <Tooltip title="The average number of days your bleeding lasts (typically 5 days).">
              <div style={{ cursor: "help", background: "#ffb6b9", color: "#5c434a", borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "bold", flexShrink: 0 }}>
                ?
              </div>
            </Tooltip>
          </div>
          <Button type="submit" variant="contained" size="medium">
            Sign up
          </Button>
        </form>
        <div
          className="option"
          style={{ marginTop: "20px", textAlign: "center" }}
        >
          <p>
            Already registered? <Link to="/login">Sign in.</Link>
          </p>
        </div>
      </Box>
    </Box>
  );
}

export default RegistrationPage;
