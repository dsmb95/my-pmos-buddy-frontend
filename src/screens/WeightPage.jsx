import { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
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
  }, [updateWeight, updateWeightUnit]);

  function formatDate(date) {
    if (!date) return "No date found!";

    return new Date(date).toLocaleDateString("en-US", {
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
    } catch(err) {
        setError(err.message || "Failed to update weight.")
    } finally {
        setLoading(false);
    }
  };

  if (loading) return <CircularProgress aria-label="Loading..." />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <div className="page-container">
      <div className="menu">
        <Menu />
      </div>
      <div>
        <div>
          <h2>Summary</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="data-card" style={{ maxHeight: "350px", overflowY: "auto", textAlign: "left", padding: "20px" }}>
              <WeightChart></WeightChart>
            </div>
            <h3>Weight Logs</h3>
            <div className="data-card" style={{ maxHeight: "350px", overflowY: "auto", textAlign: "left", padding: "20px" }}>
              {weight?.map((weightEntry, index) => (
                <div
                  key={index}
                  style={{ borderBottom: "1px solid #eaeaea", marginBottom: "15px", paddingBottom: "15px" }}
                >
                  <p style={{ margin: "5px 0" }}><strong>Date:</strong> {formatDate(weightEntry.date)}</p>
                  <p style={{ margin: "5px 0" }}><strong>Weight:</strong> {weightEntry.weight} {weightEntry.unit}</p>
                </div>
              ))}
              {(!weight || weight.length === 0) && <p>No weight logs yet.</p>}
            </div>
          </div>
        </div>
        <div>
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
        </div>
      </div>
    </div>
  );
}

export default WeightPage;
