import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

function FlowPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [lastPeriod, setLastPeriod] = useState("");
  const [cycleLength, setCycleLength] = useState("");
  const [periodLength, setPeriodLength] = useState("");

  const [apiPeriod1, setApiPeriod1] = useState([]);
  const [apiPeriod2, setApiPeriod2] = useState([]);
  const [apiPeriod3, setApiPeriod3] = useState([]);

  const [apiFertile1, setApiFertile1] = useState([]);
  const [apiFertile2, setApiFertile2] = useState([]);
  const [apiFertile3, setApiFertile3] = useState([]);

  const [apiPms1, setApiPms1] = useState([]);
  const [apiPms2, setApiPms2] = useState([]);
  const [apiPms3, setApiPms3] = useState([]);

  const [date, setDate] = useState("");
  const [symptoms, setSymptoms] = useState([]);
  const [additionalNotes, setAdditionalNotes] = useState("");

  const [isFirstDay, setIsFirstDay] = useState(null);
  const [periodDate, setPeriodDate] = useState("");
  const [flowLevel, setFlowLevel] = useState(null);
  const [periodNotes, setPeriodNotes] = useState("");

  const [symptomsFlowData, setSymptomsFlowData] = useState([]);
  const [periodFlowData, setPeriodFlowData] = useState([]);

  /*--SYMPTOMS ARRAY--*/
  const feelings = [
    "Mood Swings",
    "Sad",
    "Happy",
    "Depressed",
    "Angry",
    "Irritable",
    "Anxious",
    "Indifferent",
  ];
  const pain = [
    "Pain free",
    "Cramps",
    "Breast tenderness",
    "Headache",
    "Migraine",
    "Lower back",
    "Joint pain",
    "Leg pain",
  ];
  const energy = ["Exhausted", "Tired", "Energetic", "Fully energized"];

  /*-Helper Functions-*/
  const isWithinRange = (calendarDate, range) => {
    if (!range || !range[0] || !range[1]) return false;
    const d = new Date(calendarDate).setHours(0, 0, 0, 0);

    // Replace dashes with slashes to prevent JavaScript from converting YYYY-MM-DD to UTC.
    // "2026-06-03" parses as UTC (which shifts to the previous day in Western timezones).
    // "2026/06/03" parses safely as local time.
    const start = new Date(String(range[0]).replace(/-/g, "/")).setHours(
      0,
      0,
      0,
      0,
    );
    const end = new Date(String(range[1]).replace(/-/g, "/")).setHours(
      0,
      0,
      0,
      0,
    );

    return d >= start && d <= end;
  };

  const getTileClassName = ({ date, view }) => {
    if (view === "month") {
      if (
        isWithinRange(date, apiPeriod1) ||
        isWithinRange(date, apiPeriod2) ||
        isWithinRange(date, apiPeriod3)
      )
        return "highlight-period";
      if (
        isWithinRange(date, apiFertile1) ||
        isWithinRange(date, apiFertile2) ||
        isWithinRange(date, apiFertile3)
      )
        return "highlight-fertile";
      if (
        isWithinRange(date, apiPms1) ||
        isWithinRange(date, apiPms2) ||
        isWithinRange(date, apiPms3)
      )
        return "highlight-pms";
    }
    return null;
  };

  const cycleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const body = {};

      if (lastPeriod) body.updateLastPeriod = lastPeriod;
      if (cycleLength) body.updateCycleLength = Number(cycleLength);
      if (periodLength) body.updatePeriodLength = Number(periodLength);

      const response = await fetch(
        "https://my-pmos-buddy-backend.onrender.com/api/flow",
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to submit.");
        return;
      }

      setSuccess("Cycle log successfully updated!");
      setLastPeriod("");
      setCycleLength("");
      setPeriodLength("");
    } catch (err) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const symptomSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSymptoms([]);
    setAdditionalNotes("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://my-pmos-buddy-backend.onrender.com/api/flow",
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            symptomList: symptoms,
            additionalNotes: additionalNotes,
          }),
        },
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to submit.");
        return;
      }

      setSuccess("Flow log successfully updated!");
      setSymptoms("");
      setAdditionalNotes("");
    } catch (err) {
      setError(err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const periodSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch(
        "https://my-pmos-buddy-backend.onrender.com/api/flow",
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            periodDay: periodDate,
            firstDay: isFirstDay,
            flowLevel: flowLevel,
            periodNotes: periodNotes,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to submit.");
        return;
      }

      setSuccess("Flow log successfully updated!");
      setIsFirstDay(null);
      setPeriodDate("");
      setFlowLevel(null);
      setPeriodNotes("");
    } catch (err) {
      setError(err.message || "An error occured.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSymptom = (value) => {
    setSymptoms((prevSymptoms) => {
      if (prevSymptoms.includes(value)) {
        return prevSymptoms.filter((symptom) => symptom !== value);
      }
      return [...prevSymptoms, value];
    });
  };

  function formatDate(date) {
    if (!date) return "No date";

    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  useEffect(() => {
    const cycles = async () => {
      try {
        const response = await fetch(
          "https://my-pmos-buddy-backend.onrender.com/api/flow",
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        const cycleDataArray = await response.json();
        const latestFlowDoc = cycleDataArray[cycleDataArray.length - 1];
        const cycles = latestFlowDoc?.flowData?.apiPrediction?.data?.cycles;

        if (cycles) {
          // Set hooks for predicted menstrual cycle days.
          setApiPeriod1([
            cycles[0]?.period?.start_date,
            cycles[0]?.period?.end_date,
          ]);
          setApiPeriod2([
            cycles[1]?.period?.start_date,
            cycles[1]?.period?.end_date,
          ]);
          setApiPeriod3([
            cycles[2]?.period?.start_date,
            cycles[2]?.period?.end_date,
          ]);

          // Set hooks for predicted fertile cycle days.
          setApiFertile1([
            cycles[0]?.fertile_window?.start_date,
            cycles[0]?.fertile_window?.end_date,
          ]);
          setApiFertile2([
            cycles[1]?.fertile_window?.start_date,
            cycles[1]?.fertile_window?.end_date,
          ]);
          setApiFertile3([
            cycles[2]?.fertile_window?.start_date,
            cycles[2]?.fertile_window?.end_date,
          ]);

          // Set hooks for predicted PMS cycle days.
          setApiPms1([
            cycles[0]?.pms_phase?.start_date,
            cycles[0]?.pms_phase?.end_date,
          ]);
          setApiPms2([
            cycles[1]?.pms_phase?.start_date,
            cycles[1]?.pms_phase?.end_date,
          ]);
          setApiPms3([
            cycles[2]?.pms_phase?.start_date,
            cycles[2]?.pms_phase?.end_date,
          ]);
        }
      } catch (err) {
        setError(err.message || "Unable to fetch flow data.");
      }
    };

    cycles();
  }, [lastPeriod, cycleLength, periodLength]);

  useEffect(() => {
    const getFlowData = async () => {
      try {
        const response = await fetch(
          "https://my-pmos-buddy-backend.onrender.com/api/flow",
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        const dataFlow = await response.json();

        // Flatten all symptoms and period dates from across all cycle documents
        const allSymptoms = dataFlow.flatMap(
          (doc) => doc?.flowData?.symptoms || [],
        );
        const allPeriodDates = dataFlow.flatMap(
          (doc) => doc?.flowData?.periodDates || [],
        );

        setSymptomsFlowData(allSymptoms);
        setPeriodFlowData(allPeriodDates);

        console.log(symptomsFlowData);
      } catch (err) {
        setError(err.message || "Failed to fetch flow data.");
      }
    };
    getFlowData();
  }, []);

  if (loading) return <CircularProgress aria-label="Loading..." />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <div className="page-container">
      <div className="menu">
        <h1>Menu</h1>
      </div>
      <div>
        <div>
          <h2>Cycle Predictor</h2>
          <Calendar
            onChange={setDate}
            value={date}
            selectRange={true}
            tileClassName={getTileClassName}
          />
        </div>

        <div>
          <h2>Flow Log</h2>
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <div>
            <h3>
              Update your current cycle patterns to improve cycle predictions.
            </h3>
            <form onSubmit={cycleSubmit}>
              <TextField
                id="last-period-input"
                label="Starting Period"
                value={lastPeriod}
                onChange={({ target }) => setLastPeriod(target.value)}
                placeholder="YYYY-MM-DD"
              />
              <TextField
                id="cycle-length-input"
                label="Cycle Length"
                value={cycleLength}
                onChange={({ target }) => setCycleLength(target.value)}
                placeholder="Number of days"
              />
              <TextField
                id="period-length-input"
                label="Period Length"
                value={periodLength}
                onChange={({ target }) => setPeriodLength(target.value)}
                placeholder="Number of days"
              />
              <Button type="submit" variant="contained" size="medium">
                Submit
              </Button>
            </form>
          </div>

          <div>
            <h3>How are you feeling today?</h3>
            <form onSubmit={symptomSubmit}>
              <div>
                <h4>Feelings</h4>
                {feelings.map((feeling) => (
                  <div key={feeling} style={{ marginBottom: "15px" }}>
                    <label style={{ marginRight: "10px" }}>
                      <input
                        type="checkbox"
                        value={feeling}
                        checked={symptoms.includes(feeling)}
                        onChange={() => toggleSymptom(feeling)}
                      />
                      {feeling}
                    </label>
                  </div>
                ))}
              </div>
              <div>
                <h4>Pain</h4>
                {pain.map((pain) => (
                  <div key={pain} style={{ marginBottom: "15px" }}>
                    <label style={{ marginRight: "10px" }}>
                      <input
                        type="checkbox"
                        value={pain}
                        checked={symptoms.includes(pain)}
                        onChange={() => toggleSymptom(pain)}
                      />
                      {pain}
                    </label>
                  </div>
                ))}
              </div>
              <div>
                <h4>Energy</h4>
                {energy.map((energy) => (
                  <div key={energy} style={{ marginBottom: "15px" }}>
                    <label style={{ marginRight: "10px" }}>
                      <input
                        type="checkbox"
                        value={energy}
                        checked={symptoms.includes(energy)}
                        onChange={() => toggleSymptom(energy)}
                      />
                      {energy}
                    </label>
                  </div>
                ))}
              </div>
              <div>
                <h4>Notes:</h4>
                <TextField
                  id="outline"
                  label="Notes"
                  value={additionalNotes}
                  onChange={({ target }) => setAdditionalNotes(target.value)}
                />
              </div>
              <Button type="submit" variant="contained" size="medium">
                Submit
              </Button>
            </form>
          </div>

          <div>
            <h3>Log your period</h3>
            <form onSubmit={periodSubmit}>
              <div>
                <h4>Date</h4>
                <TextField
                  id="outline-required"
                  required
                  label="Date"
                  placeholder="YYYY-MM-DD"
                  value={periodDate}
                  onChange={({ target }) => setPeriodDate(target.value)}
                />
              </div>
              <div>
                <h4>Is this your first day?</h4>
                <label>
                  <input
                    type="radio"
                    name="firstDayGroup"
                    checked={isFirstDay === true}
                    onChange={() => setIsFirstDay(true)}
                  />
                  Yes
                </label>
                <label>
                  <input
                    type="radio"
                    name="firstDayGroup"
                    checked={isFirstDay === false}
                    onChange={() => setIsFirstDay(false)}
                  />
                  No
                </label>
              </div>
              <div>
                <h4>Flow Level</h4>
                <label>
                  <input
                    type="radio"
                    name="flowLevelGroup"
                    checked={flowLevel === "light"}
                    onChange={() => setFlowLevel("light")}
                  />
                  Light
                </label>
                <label>
                  <input
                    type="radio"
                    name="flowLevelGroup"
                    checked={flowLevel === "medium"}
                    onChange={() => setFlowLevel("medium")}
                  />
                  Medium
                </label>
                <label>
                  <input
                    type="radio"
                    name="flowLevelGroup"
                    checked={flowLevel === "heavy"}
                    onChange={() => setFlowLevel("heavy")}
                  />
                  Heavy
                </label>
              </div>
              <div>
                <h4>Notes:</h4>
                <TextField
                  id="outline"
                  label="Notes"
                  value={periodNotes}
                  onChange={({ target }) => setPeriodNotes(target.value)}
                />
              </div>
              <Button type="submit" variant="contained" size="medium">
                Submit
              </Button>
            </form>
          </div>
        </div>

        <div>
          <h3>Past Data</h3>

          <div>
            <h4>Symptoms</h4>
            {symptomsFlowData?.map((symptomLog, index) => (
              <div key={index}>
                <p> Date: {formatDate(symptomLog.date) || "No date found!"}</p> 
                {symptomLog.symptomList.map((symptom) => (
                    <p>{symptom}</p>
                ))}
                <p>Notes: {symptomLog.additionalNotes}</p>
              </div>
            ))}
          </div>

          <div>
            <h4>Period</h4>
            {periodFlowData?.map((periodLog, index) => (
                <div key={index}>
                    <p>Date: {formatDate(periodLog.periodDay)}</p>
                    <p>First Day: {periodLog.firstDay ? "Yes" : "No"}</p>
                    <p>Flow Level: {periodLog.flowLevel}</p>
                    <p>Notes: {periodLog.periodNotes}</p>
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FlowPage;
