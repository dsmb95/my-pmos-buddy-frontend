import { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import Menu from "../components/menu.jsx";

function SkinPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [skinData, setSkinData] = useState([]);
  const [skinRoutineAm, setSkinRoutineAm] = useState([]);
  const [skinRoutinePm, setSkinRoutinePm] = useState([]);

  const [showInitialRoutine, setShowInitialRoutine] = useState(true);
  const [showUpdatedRoutine, setShowUpdatedRoutine] = useState(false);

  const [symptoms, setSymptoms] = useState([]);
  const [skinNotes, setSkinNotes] = useState("");
  const [skinCareAm, setSkinCareAm] = useState("");
  const [skinCarePm, setSkinCarePm] = useState("");

  const [updateRoutineAm, setUpdateRoutineAm] = useState("");
  const [updateRoutinePm, setUpdateRoutinePm] = useState("");

  /*--List of skin symptoms--*/
  const skinSymptoms = ["Good", "Acne", "Dry", "Oily", "Itchy"];

  useEffect(() => {
    const getSkinData = async () => {
      try {
        const fetchOptions = {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        };
        const [skinRes, skinRoutineRes] = await Promise.all([
          fetch(
            "https://my-pmos-buddy-backend.onrender.com/api/skin",
            fetchOptions,
          ),
          fetch(
            "https://my-pmos-buddy-backend.onrender.com/api/skin/routine",
            fetchOptions,
          ),
        ]);

        const skinResData = skinRes.ok ? await skinRes.json() : [];
        const skinRoutineResData = skinRoutineRes.ok ? await skinRoutineRes.json() : [];

        
        const allSkinEntries = skinResData
          .flatMap((doc) => doc?.skinData || [])
          .reverse();

        const skinRoutineDataAm = skinRoutineResData.flatMap(
          (doc) => doc?.amProducts || [],
        );
        const skinRoutineDataPm = skinRoutineResData.flatMap(
          (doc) => doc?.pmProducts || [],
        );

        setSkinData(allSkinEntries);

        setSkinRoutineAm(skinRoutineDataAm);
        setSkinRoutinePm(skinRoutineDataPm);

        // Hides the inital skin routine form when the user creates their skin care routine, and show the update skincare routine form.
        if (skinRoutineDataAm.length > 0 || skinRoutineDataPm.length > 0) {
          setShowInitialRoutine(false);
          setShowUpdatedRoutine(true);
        }
      } catch (err) {
        setError(err.message || "Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    getSkinData();
  }, [skinData, skinRoutineAm, skinRoutinePm]);

  const toggleSymptom = (value) => {
    setSymptoms((prev) => {
      if (prev.includes(value)) {
        return prev.filter((symptom) => symptom !== value);
      }
      return [...prev, value];
    });
  };

  const submitSkinData = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://my-pmos-buddy-backend.onrender.com/api/skin",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            skinLog: symptoms,
            skinNotes: skinNotes,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Submit failed.");
        return;
      }

      setSuccess("Skin log successfully updated!");
      setSymptoms([]);
      setSkinNotes("");
    } catch (err) {
      setError(err.message || "Failed to submit your skin data.");
    } finally {
      setLoading(false);
    }
  };

  function formatDate(date) {
    if (!date) return "No date found!";

    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  const submitInitalRoutine = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://my-pmos-buddy-backend.onrender.com/api/skin/routine",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            am: skinCareAm
              ? skinCareAm.split(",").map((item) => item.trim())
              : [],
            pm: skinCarePm
              ? skinCarePm.split(",").map((item) => item.trim())
              : [],
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to submit Skin Care Routine.");
        return;
      }

      setSuccess("Skin routine successfully created.");
      setSkinCareAm("");
      setSkinCarePm("");
      setShowInitialRoutine(false);
      setShowUpdatedRoutine(true);
    } catch (err) {
      setError(err.message || "Failed to submit Skin Care Routine.");
    } finally {
      setLoading(false);
    }
  };
  const updateRoutine = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {

        const update = {};

        if (updateRoutineAm) {
            update.am = updateRoutineAm.split(",").map((item) => item.trim());
        }
        
        if (updateRoutinePm) {
            update.pm = updateRoutinePm.split(",").map((item) => item.trim());
        }
      const response = await fetch(
        "https://my-pmos-buddy-backend.onrender.com/api/skin/routine",
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(update),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to submit Skin Care Routine.");
        return;
      }

      setSuccess("Skin routine successfully updated.");
      setUpdateRoutineAm("");
      setUpdateRoutinePm("");
      setShowInitialRoutine(false);
    } catch (err) {
      setError(err.message || "Failed to submit Skin Care Routine.");
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
          <div>
            <h2>Summary</h2>
            <div className="data-card" style={{ maxHeight: "350px", overflowY: "auto", textAlign: "left", padding: "20px" }}>
              {skinData?.map((entry, index) => (
                <div
                  key={index}
                  style={{
                    borderBottom: "1px solid #eaeaea",
                    marginBottom: "15px",
                    paddingBottom: "15px",
                  }}
                >
                  <p style={{ margin: "5px 0" }}><strong>Date:</strong> {formatDate(entry?.date)}</p>
                  <p style={{ margin: "5px 0" }}>
                    <strong>Skin Log:</strong>{" "}
                    {Array.isArray(entry?.skinLog)
                      ? entry.skinLog.join(", ")
                      : entry?.skinLog}
                  </p>
                  <p style={{ margin: "5px 0" }}><strong>Notes:</strong> {entry?.skinNotes}</p>
                </div>
              ))}
              {(!skinData || skinData.length === 0) && <p>No skin logs yet.</p>}
            </div>
          </div>
          <div>
            <h2>Skin Care Routine</h2>
            <div className="data-card" style={{ maxHeight: "350px", overflowY: "auto", textAlign: "center", padding: "20px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "40px" }}>
                <div style={{ flex: 1, minWidth: "150px" }}>
                  <h3 style={{ marginTop: 0 }}>Morning</h3>
                  {skinRoutineAm?.map((routine, index) => (
                    <p key={index} style={{ margin: "5px 0" }}>
                      {typeof routine === "object"
                        ? routine?.name ||
                          routine?.productName ||
                          JSON.stringify(routine)
                        : routine}
                    </p>
                  ))}
                  {(!skinRoutineAm || skinRoutineAm.length === 0) && <p style={{ margin: "5px 0" }}>No morning routine logged yet.</p>}
                </div>
                
                <div style={{ flex: 1, minWidth: "150px" }}>
                  <h3 style={{ marginTop: 0 }}>Night</h3>
                  {skinRoutinePm?.map((routine, index) => (
                    <p key={index} style={{ margin: "5px 0" }}>
                      {typeof routine === "object"
                        ? routine?.name ||
                          routine?.productName ||
                          JSON.stringify(routine)
                        : routine}
                    </p>
                  ))}
                  {(!skinRoutinePm || skinRoutinePm.length === 0) && <p style={{ margin: "5px 0" }}>No night routine logged yet.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h2>Manage Skin Data</h2>
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {showInitialRoutine && (
              <div className="data-card" style={{ textAlign: "left" }}>
                <h3 style={{ marginTop: 0 }}>What's your current skin care routine?</h3>
                <form onSubmit={submitInitalRoutine}>
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "40px", marginBottom: "20px" }}>
                    <TextField
                      id="outline"
                      label="Morning"
                      value={skinCareAm}
                      onChange={({ target }) => setSkinCareAm(target.value)}
                      placeholder="Eg. CeraVe Foaming Wash, Roundlab Toner, Purito Bamboo Cream etc..."
                    />
                    <TextField
                      id="outline"
                      label="Night"
                      value={skinCarePm}
                      onChange={({ target }) => setSkinCarePm(target.value)}
                      placeholder="Eg. CeraVe Foaming Wash, Roundlab Toner, Purito Bamboo Cream etc..."
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

            <div className="data-card" style={{ textAlign: "left" }}>
              <h3 style={{ marginTop: 0 }}>How's your skin?</h3>
              <form onSubmit={submitSkinData}>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "40px", marginBottom: "20px" }}>
                  <div>
                    <h4>Symptoms</h4>
                    {skinSymptoms.map((symptom) => (
                      <div key={symptom} style={{ marginBottom: "15px" }}>
                        <label style={{ marginRight: "10px" }}>
                          <input
                            type="checkbox"
                            value={symptom}
                            checked={symptoms.includes(symptom)}
                            onChange={() => toggleSymptom(symptom)}
                          />
                          {symptom}
                        </label>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h4>Notes:</h4>
                    <TextField
                      id="outline"
                      label="Notes"
                      value={skinNotes}
                      onChange={({ target }) => setSkinNotes(target.value)}
                    />
                  </div>
                </div>
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                  <Button type="submit" variant="contained" size="medium">
                    Submit
                  </Button>
                </div>
              </form>
            </div>

            {showUpdatedRoutine && (
              <div className="data-card" style={{ textAlign: "left" }}>
                <h3 style={{ marginTop: 0 }}>Update Skin Care Routine</h3>
                <form onSubmit={updateRoutine}>
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "40px", marginBottom: "20px" }}>
                    <TextField
                      id="outline"
                      label="Morning"
                      value={updateRoutineAm}
                      onChange={({ target }) => setUpdateRoutineAm(target.value)}
                      placeholder="Eg. CeraVe Foaming Wash, Roundlab Toner, Purito Bamboo Cream etc..."
                    />
                    <TextField
                      id="outline"
                      label="Night"
                      value={updateRoutinePm}
                      onChange={({ target }) => setUpdateRoutinePm(target.value)}
                      placeholder="Eg. CeraVe Foaming Wash, Roundlab Toner, Purito Bamboo Cream etc..."
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

export default SkinPage;
