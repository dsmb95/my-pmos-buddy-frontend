import { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Menu from "../components/menu.jsx";
import WeightChart from '../components/weightChart.jsx';

function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flowData, setFlowData] = useState("");
  const [skinData, setSkinData] = useState();
  const [medData, setMedData] = useState("");
  const [weightData, setWeightData] = useState("");
  const [name, setName] = useState("");
  const [expandedPhoto, setExpandedPhoto] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const fetchOptions = {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        };

        const [nameRes, flowRes, skinRes, medRes, weightRes] =
          await Promise.all([
            fetch(
              "https://my-pmos-buddy-backend.onrender.com/api/auth",
              fetchOptions,
            ),
            fetch(
              "https://my-pmos-buddy-backend.onrender.com/api/flow",
              fetchOptions,
            ),
            fetch(
              "https://my-pmos-buddy-backend.onrender.com/api/skin",
              fetchOptions,
            ),
            fetch(
              "https://my-pmos-buddy-backend.onrender.com/api/medication",
              fetchOptions,
            ),
            fetch(
              "https://my-pmos-buddy-backend.onrender.com/api/weight",
              fetchOptions,
            ),
          ]);

        if (
          !nameRes.ok
        ) {
          setError("Unable to fetch user data.");
          return;
        }

        const nameDataJSON = await nameRes.json();
        const flowDataJSON = flowRes.ok ? await flowRes.json() : [];
        const skinDataJSON = skinRes.ok ? await skinRes.json() : [];
        const medDataJSON = medRes.ok ? await medRes.json() : { medications: [] };
        const weightDataJSON = weightRes.ok ? await weightRes.json() : [];

        const latestFlowDoc = flowDataJSON[flowDataJSON.length - 1];
        const latestFlowData = latestFlowDoc?.flowData;

        const latestSkinDoc = skinDataJSON[skinDataJSON.length - 1];
        const latestSkinData =
          latestSkinDoc?.skinData?.[latestSkinDoc?.skinData.length - 1];

        const latestWeightDoc = weightDataJSON[weightDataJSON.length - 1];
        const latestWeightData =
          latestWeightDoc?.weightData?.[latestWeightDoc?.weightData.length - 1];

        setName(nameDataJSON.name);
        setFlowData(latestFlowData);
        setSkinData(latestSkinData);
        setMedData(medDataJSON);
        setWeightData(latestWeightData);
      } catch (err) {
        setError(err.message || "An error occured while fetching.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  function formatDate(date) {
    if (!date) return "No date";

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

  if (loading) return <CircularProgress aria-label="Loading..." />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box className="page-container" sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, minHeight: "100vh" }}>
      <Box className="menu" sx={{ width: { xs: "100%", md: "250px" }, flexShrink: 0 }}>
        <Menu/>
      </Box>

      <Box className="profile-container" sx={{ flexGrow: 1, px: { xs: 2, md: 4 }, pb: { xs: 2, md: 4 }, pt: 0, mt: { xs: 0, md: -4 }, width: { xs: "100%", md: "calc(100% - 250px)" }, boxSizing: "border-box", display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, columnGap: 3, rowGap: 2, alignContent: "start" }}>
        <Box className="profile-banner" sx={{ gridColumn: "1 / -1", mb: 0 }}>
          <p>Welcome, {name}</p>
        </Box>
        <div className="data-card">
          <Link to="/flow">
            <h2>Flow</h2>
          </Link>
          <p><strong>Last Menstrual Period </strong> <br></br> {formatDate(flowData?.lastPeriod)}</p>
          <p>
            <strong>Cycle length</strong> <br></br> {flowData?.apiPrediction?.data?.cycle_length} days
          </p>
          <p>
            <strong>Next Menstrual Cycle Starts</strong> <br></br> {" "}
            {formatDate(
              flowData?.apiPrediction?.data?.cycles[0]?.period?.start_date,
            )}
          </p>
          <p>
            <strong>Ovulation Period Starts</strong> <br></br> {" "}
            {formatDate(
              flowData?.apiPrediction?.data?.cycles[0]?.ovulation?.date,
            )}
          </p>
          <p>
            <strong>PMS Period Starts</strong> <br></br> {" "}
            {formatDate(
              flowData?.apiPrediction?.data?.cycles[0]?.pms_phase?.start_date,
            )}
          </p>
        </div>
        <div className="data-card">
          <Link to="/skin">
            <h2>Skin</h2>
          </Link>
          <p><strong>Last Log</strong> <br></br> {formatDate(skinData?.date)}</p>
          <p>
            <strong>Skin Log</strong> <br></br>{" "}
            {skinData?.skinLog && skinData.skinLog.length > 0 
              ? skinData.skinLog.join(", ") 
              : "None logged"}
          </p>
          <p><strong>Note</strong> <br></br> {skinData?.skinNotes}</p>
        {skinData?.photos && skinData.photos.length > 0 && (
          <div style={{ 
            display: "flex", 
            flexWrap: "nowrap", 
            gap: "10px", 
            overflowX: "auto", 
            padding: "10px 0", 
            scrollSnapType: "x mandatory",
            justifyContent: "center"
          }}>
            {skinData.photos.map((photo, index) => (
              <img 
                key={index} 
                src={photo.url} 
                alt={`Skin log ${index + 1}`} 
                style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "12px", flexShrink: 0, scrollSnapAlign: "start", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", cursor: "pointer" }} 
                onClick={() => setExpandedPhoto(photo.url)}
              />
            ))}
          </div>
        )}
        </div>
        <div className="data-card">
          <Link to="/medication"><h2>Medications</h2></Link>
          {medData?.medications?.map((med, index) => (
            <p key={index}>
              <strong style={{fontSize:18}}>{med.name}</strong> <br></br> {med.dosage} {med.frequency}
            </p>
          ))}
        </div>
        <div className="data-card">
          <Link to="/weight">
            <h2>Weight</h2>
          </Link>
          <div>
            <WeightChart height="200px" />
          </div>
          <p><strong>Last Log</strong> <br></br> {formatDate(weightData?.date)}</p>
          <p style={{fontSize: 20}}>
            <strong>{weightData?.weight} {weightData?.unit}</strong>
          </p>
        </div>
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

export default ProfilePage;
