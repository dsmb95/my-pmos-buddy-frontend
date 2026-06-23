import { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Menu from "../components/menu.jsx";
import WeightChart from '../components/weightChart.jsx';

function WeightPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [weight, setWeight] = useState([]);
  const [initialWeightUnit, setInitialWeightUnit] = useState("");
  const [initialWeight, setInitialWeight] = useState("");
  const [updateWeightUnit, setUpdateWeightUnit] = useState("");
  const [updateWeight, setUpdateWeight] = useState("");

  const [showInitialWeight, setShowInitialWeight] = useState(true);
  const [showUpdateWeight, setShowUpdateWeight] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  useEffect(() => {
    const getWeightData = async () => {
      try {
        const response = await fetch(
          "https://my-pmos-buddy-backend.onrender.com/api/weight",
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (response.status === 404) {
          setWeight([]);
          return;
        }

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to fetch weight data.");
          return;
        }

        const weightData = data
          .flatMap((doc) => doc?.weightData || [])
          .reverse();

        setWeight(weightData);

        if (weightData.length > 0) {
          setShowInitialWeight(false);
          setShowUpdateWeight(true);
        }
      } catch (err) {
        setError(err.message || "An error occurred while fetching.");
      } finally {
        setLoading(false);
      }
    };

    getWeightData();
  }, [refreshTrigger]);

  function formatDate(date) {
    if (!date) return "No date found!";

    let parsedDate = new Date(date);
    
    // If the date is UTC midnight or a raw YYYY-MM-DD string, parse it as local time 
    // by replacing dashes with slashes. This prevents it from shifting a day behind.
    if (String(date).endsWith("T00:00:00.000Z") || (typeof date === "string" && !date.includes("T"))) {
      parsedDate = new Date(String(date).substring(0, 10).replace(/-/g, "/"));
    }

    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  const submitInitialWeight = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const response = await fetch(
        "https://my-pmos-buddy-backend.onrender.com/api/weight",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            unit: initialWeightUnit,
            weight: initialWeight,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to submit initial weight");
        return;
      }

      setSuccess("Successfully created your initial weight log!");
      setInitialWeight("");
      setInitialWeightUnit("");
      setRefreshTrigger((prev) => !prev);
    } catch (err) {
      setError(err.message || "Failed to submit your initial weight.");
    } finally {
      setLoading(false);
    }
  };

  const submitWeightUpdate = async(e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
        const response = await fetch('https://my-pmos-buddy-backend.onrender.com/api/weight', 
            {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({
                    unit: updateWeightUnit,
                    weight: updateWeight
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            setError(data.message || "Failed to update weight.");
            return;
        }

        setUpdateWeight("");
        setUpdateWeightUnit("");
        setSuccess("Weight successfully updated.")
        setRefreshTrigger((prev) => !prev);
    } catch(err) {
        setError(err.message || "Failed to update weight.")
    } finally {
        setLoading(false);
    }
  };

  const deleteWeightLog = async (weightId) => {
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `https://my-pmos-buddy-backend.onrender.com/api/weight/${weightId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to delete weight log.");
        return;
      }

      setSuccess("Weight log deleted.");
      setRefreshTrigger((prev) => !prev);
    } catch (err) {
      setError(err.message || "Failed to delete weight log.");
    }
  };

  if (loading) return <CircularProgress aria-label="Loading..." />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box className="page-container" sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, minHeight: "100vh" }}>
      <Box className="menu" sx={{ width: { xs: "100%", md: "250px" }, flexShrink: 0 }}>
        <Menu />
      </Box>
      <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, width: { xs: "100%", md: "calc(100% - 250px)" }, boxSizing: "border-box" }}>
        <Box sx={{ mb: 4 }}>
          <h2>Summary</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="data-card" style={{ maxHeight: "350px", overflowY: "auto", textAlign: "left", padding: "20px" }}>
              <WeightChart></WeightChart>
            </div>
            <h3>Weight Logs</h3>
            <div className="data-card" style={{ maxHeight: "350px", overflowY: "auto", textAlign: "left", padding: "20px" }}>
              {weight?.map((weightEntry, index) => (
                <div
                  key={weightEntry?._id || index}
                  style={{
                    borderBottom: "1px solid #eaeaea",
                    marginBottom: "15px",
                    paddingBottom: "15px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "15px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "5px 0" }}><strong>{formatDate(weightEntry.date)}</strong></p>
                    <p style={{ margin: "5px 0" }}> {weightEntry.weight} {weightEntry.unit}</p>
                  </div>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => deleteWeightLog(weightEntry._id)}
                    sx={{ flexShrink: 0, mt: 0.5 }}
                  >
                    Delete
                  </Button>
                </div>
              ))}
              {(!weight || weight.length === 0) && <p>No weight logs yet.</p>}
            </div>
          </div>
        </Box>
        <Box>
          <h2>Manage Weight</h2>
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {showInitialWeight && (
              <div className="data-card" style={{ textAlign: "left" }}>
                <h3 style={{ marginTop: 0 }}>Log Initial Weight</h3>
                <form onSubmit={submitInitialWeight}>
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "40px", marginBottom: "20px" }}>
                    <TextField
                      id="outline-required"
                      required
                      label="Unit"
                      value={initialWeightUnit}
                      onChange={({ target }) => setInitialWeightUnit(target.value)}
                      placeholder="eg. lbs or kg"
                    />
                    <TextField
                      id="outline-required"
                      required
                      label="Weight"
                      value={initialWeight}
                      onChange={({ target }) => setInitialWeight(target.value)}
                      placeholder="eg. 121.4"
                    />
                  </div>
                  <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <Button type="submit" variant="contained" size="medium">
                      Submit
                    </Button>
                  </div>
                </form>
              </div>
            )}
            
            {showUpdateWeight && (
              <div className="data-card" style={{ textAlign: "left" }}>
                <h3 style={{ marginTop: 0 }}>Log Weight</h3>
                <form onSubmit={submitWeightUpdate}>
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "40px", marginBottom: "20px" }}>
                    <TextField
                      id="outline-required"
                      required
                      label="Unit"
                      value={updateWeightUnit}
                      onChange={({ target }) => setUpdateWeightUnit(target.value)}
                      placeholder="eg. lbs or kg"
                    />
                    <TextField
                      id="outline-required"
                      required
                      label="Weight"
                      value={updateWeight}
                      onChange={({ target }) => setUpdateWeight(target.value)}
                      placeholder="eg. 121.4"
                    />
                  </div>
                  <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <Button type="submit" variant="contained" size="medium">
                      Submit
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </Box>
      </Box>
    </Box>
  );
}

export default WeightPage;
