import { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { NavLink, useNavigate } from "react-router-dom";
import Menu from "../components/menu.jsx";

function MedicationPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [medications, setMedications] = useState([]);
  const [updateMedsName, setUpdateMedsName] = useState("");
  const [updateMedsDosage, setUpdateMedsDosage] = useState("");
  const [updateMedsFrequency, setUpdateMedsFrequency] = useState("");
  

  useEffect(() => {
    const getMedicationData = async () => {
      try {
        const response = await fetch(
          "https://my-pmos-buddy-backend.onrender.com/api/medication",
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          if (response.status === 404) {
            setMedications([]);
          } else {
            setError("Failed to fetch medication data.");
          }
          return;
        }

        const data = await response.json();

        // Safely extract the array whether it's nested or returned directly
        const medsArray = data?.medications || (Array.isArray(data) ? data : []);
        
        // Guarantee it is strictly an array so .map() never crashes the page
        setMedications(Array.isArray(medsArray) ? medsArray : []);
      } catch (err) {
        setError(err.message || "Failed to fetch medication data.");
      } finally {
        setLoading(false);
      }
    };

    getMedicationData();
  }, []);

  const deleteMedication = async (medicationId) => {
    setError("");
    try {
      const res = await fetch(
        `https://my-pmos-buddy-backend.onrender.com/api/medication/${medicationId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!res.ok) {
        setError("Failed to delete medication.");
        return;
      }

      const data = await res.json();
      
      // Safely apply the same array extraction here
      const medsArray = data?.medications || (Array.isArray(data) ? data : []);
      setMedications(Array.isArray(medsArray) ? medsArray : []);
    } catch (err) {
      setError(err.message || "An error occurred while deleting.");
    }
  };

  const addMedication = async(e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
        const response = await fetch('https://my-pmos-buddy-backend.onrender.com/api/medication', 
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type" : "application/json"
                },
                body: JSON.stringify({
                    name: updateMedsName,
                    dosage: updateMedsDosage,
                    frequency: updateMedsFrequency
                })
            }
        );

        if (!response.ok) {
            setError("Failed to submit medication");
            return;
        }

        const data = await response.json();
        setSuccess("Medication successfully added!");
        
        if (Array.isArray(data?.medications)) {
            setMedications(data.medications);
        } else if (data.medication) {
            setMedications((prev) => [...prev, data.medication]);
        } else if (Array.isArray(data)) {
            setMedications(data);
        }
        
        setUpdateMedsName("");
        setUpdateMedsDosage("");
        setUpdateMedsFrequency("");
    } catch(err) {
        setError(err.message || "Failed to add medication.")
    } finally {
        setLoading(false);
    }
  }

  if (loading) return <CircularProgress aria-label="Loading..." />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <div className="page-container">
      <div className="menu">
        <Menu />
      </div>
      <div>
        <div>
          <h2>Medications</h2>
          <div className="data-card" style={{ maxHeight: "350px", overflowY: "auto", textAlign: "left", padding: "20px" }}>
            {medications?.map((med, index) => (
              <div
                key={index}
                style={{ borderBottom: "1px solid #eaeaea", marginBottom: "15px", paddingBottom: "15px" }}
              >
                <p style={{ margin: "5px 0" }}><strong>Name:</strong> {med.name}</p>
                <p style={{ margin: "5px 0" }}><strong>Dosage:</strong> {med.dosage}</p>
                <p style={{ margin: "5px 0" }}><strong>Frequency:</strong> {med.frequency}</p>
                <Button variant="outlined" color="error" size="small" onClick={() => deleteMedication(med._id)} sx={{ mt: 1 }}>
                  Delete
                </Button>
              </div>
            ))}
            {(!medications || medications.length === 0) && <p>No medications logged yet.</p>}
          </div>
        </div>
        <div>
          <h2>Manage Medications</h2>
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="data-card" style={{ textAlign: "left" }}>
              <h3 style={{ marginTop: 0 }}>Add Medication</h3>
              <form onSubmit={addMedication}>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "40px", marginBottom: "20px" }}>
                  <TextField
                    id="outline-required"
                    label="Medication Name"
                    required
                    value={updateMedsName}
                    onChange={({ target }) => setUpdateMedsName(target.value)}
                    placeholder="Medication Name"
                  />
                  <TextField
                    id="outline-required"
                    label="Dose"
                    required
                    value={updateMedsDosage}
                    onChange={({ target }) => setUpdateMedsDosage(target.value)}
                    placeholder="eg. 200 mg"
                  />
                  <TextField
                    id="outline-required"
                    label="Frequency"
                    required
                    value={updateMedsFrequency}
                    onChange={({ target }) => setUpdateMedsFrequency(target.value)}
                    placeholder="eg. Once a day"
                  />
                </div>
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                  <Button type="submit" variant="contained" size="medium">
                    Submit
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MedicationPage;
