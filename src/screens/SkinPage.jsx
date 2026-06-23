import { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Menu from "../components/menu.jsx";
import Box from "@mui/material/Box";

function SkinPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [skinData, setSkinData] = useState([]);
  const [skinRoutineAm, setSkinRoutineAm] = useState([]);
  const [skinRoutinePm, setSkinRoutinePm] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  const [showInitialRoutine, setShowInitialRoutine] = useState(true);
  const [showUpdatedRoutine, setShowUpdatedRoutine] = useState(false);

  const [symptoms, setSymptoms] = useState([]);
  const [skinNotes, setSkinNotes] = useState("");
  const [skinCareAm, setSkinCareAm] = useState("");
  const [skinCarePm, setSkinCarePm] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [expandedPhoto, setExpandedPhoto] = useState(null);

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
  }, [refreshTrigger]);

  const toggleSymptom = (value) => {
    setSymptoms((prev) => {
      if (prev.includes(value)) {
        return prev.filter((symptom) => symptom !== value);
      }
      return [...prev, value];
    });
  };

  const handlePhotoChange = (e) => {
    if (e.target.files) {
      // Add newly selected files to the existing array instead of replacing them
      setSelectedPhotos((prev) => [...prev, ...Array.from(e.target.files)]);
    }
    e.target.value = null; // Reset the input so the user can select the same file again if needed
  };

  const removePhoto = (indexToRemove) => {
    setSelectedPhotos((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const submitSkinData = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // If the user already has skin logs, use PUT to push to the array. Otherwise, use POST to create it!
      const method = skinData && skinData.length > 0 ? "PUT" : "POST";

      const formData = new FormData();
      formData.append("skinNotes", skinNotes);
      
      symptoms.forEach(symptom => {
        formData.append("skinLog", symptom);
      });

      selectedPhotos.forEach(photo => {
        formData.append("photos", photo);
      });

      const response = await fetch(
        "https://my-pmos-buddy-backend.onrender.com/api/skin",
        {
          method: method,
          credentials: "include",
          body: formData,
        },
      );

      // Safely parse the response as text first, in case the backend crashed and returned HTML
      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        data = { message: responseText };
      }

      if (!response.ok) {
        console.error("Backend Error Response:", data);
        const errorString = JSON.stringify(data);
        setError(data.message || data.error || (errorString !== "{}" ? errorString : "Server error: Check your backend terminal (Cloudinary keys are likely missing or invalid)."));
        return;
      }

      setSuccess("Skin log successfully updated!");
      setSymptoms([]);
      setSkinNotes("");
      setSelectedPhotos([]);
      setRefreshTrigger((prev) => !prev);
    } catch (err) {
      setError(err.message || "Failed to submit your skin data.");
    } finally {
      setLoading(false);
    }
  };

  const deleteSkinLog = async (skinDataId) => {
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `https://my-pmos-buddy-backend.onrender.com/api/skin/logs/${skinDataId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        data = { message: responseText };
      }

      if (!response.ok) {
        const errorString = JSON.stringify(data);
        setError(
          data.message ||
            data.error ||
            (errorString !== "{}"
              ? errorString
              : "Failed to delete skin log."),
        );
        return;
      }

      setSuccess("Skin log deleted.");
      setRefreshTrigger((prev) => !prev);
    } catch (err) {
      setError(err.message || "Failed to delete skin log.");
    }
  };

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
      setRefreshTrigger((prev) => !prev);
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
      setRefreshTrigger((prev) => !prev);
    } catch (err) {
      setError(err.message || "Failed to submit Skin Care Routine.");
    } finally {
      setLoading(false);
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Box>
            <h2>Summary</h2>
            <div className="data-card" style={{ maxHeight: "350px", overflowY: "auto", textAlign: "left", padding: "20px" }}>
              {skinData?.map((entry, index) => (
                <div
                  key={entry?._id || index}
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
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "5px 0" }}><strong style={{fontSize: 19}}>{formatDate(entry?.date)}</strong></p>
                    <p style={{ margin: "5px 0" }}>
                      <strong>Skin Log:</strong>{" "}
                      {Array.isArray(entry?.skinLog)
                        ? entry.skinLog.join(", ")
                        : entry?.skinLog}
                    </p>
                    <p style={{ margin: "5px 0" }}><strong>Notes:</strong> {entry?.skinNotes}</p>
                    {entry?.photos && entry.photos.length > 0 && (
                      <>
                        <p style={{ margin: "5px 0" }}><strong>Photos:</strong></p>
                        <div style={{ 
                          display: "flex", 
                          flexWrap: "nowrap", 
                          gap: "10px", 
                          overflowX: "auto", 
                          padding: "10px 0", 
                          scrollSnapType: "x mandatory"
                        }}>
                          {entry.photos.map((photo, photoIdx) => (
                            <img 
                              key={photoIdx} 
                              src={photo.url} 
                              alt={`Skin log ${photoIdx + 1}`} 
                              style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px", flexShrink: 0, scrollSnapAlign: "start", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", cursor: "pointer" }}
                              onClick={() => setExpandedPhoto(photo.url)}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => deleteSkinLog(entry._id)}
                    sx={{ flexShrink: 0, mt: 0.5 }}
                  >
                    Delete
                  </Button>
                </div>
              ))}
              {(!skinData || skinData.length === 0) && <p>No skin logs yet.</p>}
            </div>
          </Box>
          <Box>
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
          </Box>
        </Box>
        <Box sx={{ mt: 4 }}>
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

                  <div style={{ textAlign: "center" }}>
                    <h4>Photos:</h4>
                    <Button variant="outlined" component="label" sx={{ mb: 2 }}>
                      Select Photos
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        hidden
                        onChange={handlePhotoChange}
                      />
                    </Button>
                    {selectedPhotos.length > 0 && (
                      <div>
                        <p style={{ marginTop: 0 }}>{selectedPhotos.length} photo(s) selected.</p>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center", marginBottom: "15px" }}>
                          {selectedPhotos.map((photo, index) => (
                            <div key={index} style={{ position: "relative" }}>
                              <img
                                src={URL.createObjectURL(photo)}
                                alt={`preview-${index}`}
                                style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}
                              />
                              <button
                                type="button"
                                onClick={() => removePhoto(index)}
                                style={{
                                  position: "absolute",
                                  top: "-8px",
                                  right: "-8px",
                                  background: "#ffb6b9",
                                  color: "#5c434a",
                                  border: "none",
                                  borderRadius: "50%",
                                  width: "20px",
                                  height: "20px",
                                  cursor: "pointer",
                                  fontSize: "10px",
                                  fontWeight: "bold",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center"
                                }}
                              >
                                X
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
        </Box>
      </Box>

      {/* Expanded Photo Overlay Modal */}
      {expandedPhoto && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            cursor: "pointer",
          }}
          onClick={() => setExpandedPhoto(null)}
        >
          <img
            src={expandedPhoto}
            alt="Expanded skin log"
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              objectFit: "contain",
              borderRadius: "12px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
            }}
          />
          <button
            style={{ position: "absolute", top: "20px", right: "30px", background: "transparent", color: "white", border: "none", fontSize: "2rem", cursor: "pointer", fontWeight: "bold" }}
          >
            &times;
          </button>
        </div>
      )}
    </Box>
  );
}

export default SkinPage;
