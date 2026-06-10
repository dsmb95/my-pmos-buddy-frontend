import { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { Link } from "react-router-dom";
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

    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  if (loading) return <CircularProgress aria-label="Loading..." />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <div className="page-container">
      <div className="menu">
        <Menu/>
      </div>

      <div className="profile-container">
        <div className="profile-banner">
          <p>Welcome, {name}</p>
        </div>
        <div className="data-card">
          <Link to="/flow">
            <h2>Flow</h2>
          </Link>
          <p>Last period started on: {formatDate(flowData?.lastPeriod)}</p>
          <p>
            Cycle length: {flowData?.apiPrediction?.data?.cycle_length} days
          </p>
          <p>
            Next period starts:{" "}
            {formatDate(
              flowData?.apiPrediction?.data?.cycles[0]?.period?.start_date,
            )}
          </p>
          <p>
            Ovulation period:{" "}
            {formatDate(
              flowData?.apiPrediction?.data?.cycles[0]?.ovulation?.date,
            )}
          </p>
          <p>
            PMS period:{" "}
            {formatDate(
              flowData?.apiPrediction?.data?.cycles[0]?.pms_phase?.start_date,
            )}{" "}
            to{" "}
            {formatDate(
              flowData?.apiPrediction?.data?.cycles[0]?.pms_phase?.end_date,
            )}
          </p>
        </div>
        <div className="data-card">
          <Link to="/skin">
            <h2>Skin</h2>
          </Link>
          <p>Last logged on: {formatDate(skinData?.date)}</p>
          <p>
            Skin Log:{" "}
            {skinData?.skinLog && skinData.skinLog.length > 0 
              ? skinData.skinLog.join(", ") 
              : "None logged"}
          </p>
          <p>Notes: {skinData?.skinNotes}</p>
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
              {med.name} {med.dosage} {med.frequency}
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
          <p>Last logged on: {formatDate(weightData?.date)}</p>
          <p>
            {weightData?.weight} {weightData?.unit}
          </p>
        </div>
      </div>

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
    </div>
  );
}

export default ProfilePage;
