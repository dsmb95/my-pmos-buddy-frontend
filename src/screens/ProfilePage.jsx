import { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { useNavigate, Link } from "react-router-dom";

function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [flowData, setFlowData] = useState("");
  const [skinData, setSkinData] = useState();
  const [medData, setMedData] = useState("");
  const [weightData, setWeightData] = useState("");
  const [name, setName] = useState("");

  function formatDate(date) {
    if (!date) return "No date";

    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

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
          !flowRes.ok ||
          !skinRes.ok ||
          !medRes.ok ||
          !weightRes.ok ||
          !nameRes.ok
        ) {
          setError("Unable to fetch user data.");
          return;
        }

        const nameDataJSON = await nameRes.json();
        const flowDataJSON = await flowRes.json();
        const skinDataJSON = await skinRes.json();
        const medDataJSON = await medRes.json();
        const weightDataJSON = await weightRes.json();

        const latestFlowDoc = flowDataJSON[flowDataJSON.length - 1];
        const latestFlowData =
          latestFlowDoc?.flowData;

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

  if (loading) return <CircularProgress aria-label="Loading..." />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <div className="page-container">
      <div className="menu">
        <h1>Menu</h1>
      </div>

      <div className="profile-container">
        <div className="profile-banner">
          <p>Welcome, {name}</p>
        </div>
        <div className="data-card">
          <Link to="/flow"><h2>Flow</h2></Link>
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
          <h2>Skin</h2>
          <p>Last logged on: {formatDate(skinData?.date)}</p>
          <p>
            Skin Log:{" "}
            {skinData?.skinLog.map((data) => (
              <p>{data}</p>
            ))}
          </p>
          <p>Notes: {skinData?.skinNotes}</p>
          {skinData?.photos.map((photo) => (
            <img src={photo.url} />
          ))}
        </div>
        <div className="data-card">
          <h2>Medications</h2>
          {medData?.medications.map((med) => (
            <p>
              {med.name} {med.dosage} {med.frequency}
            </p>
          ))}
        </div>
        <div className="data-card">
          <h2>Weight</h2>
          <p>Last taken on: {formatDate(weightData?.date)}</p>
          <p>
            {weightData?.weight} {weightData?.unit}
          </p>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
