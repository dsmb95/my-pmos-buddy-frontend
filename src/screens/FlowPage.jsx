import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";
import Menu from "../components/menu.jsx";

import Tooltip from "@mui/material/Tooltip";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";

function FlowPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  const [lastPeriod, setLastPeriod] = useState("");
  const [cycleLength, setCycleLength] = useState("");
  const [periodLength, setPeriodLength] = useState("");
  const [dataBaseLastPeriod, setDataBaseLastPeriod] = useState("");
  const [dataBaseCycleLength, setDataBaseCycleLength] = useState("");
  const [dataBasePeriodLength, setDataBasePeriodLength] = useState("");

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

  /*-Helper Functions to display different cycles in the calendar component-*/
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

  const periodSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const body = {
        updateLastPeriod: (isFirstDay && periodDate)
          ? new Date(periodDate.replace(/-/g, "/"))
          : (dataBaseLastPeriod ? new Date(dataBaseLastPeriod) : null),
        updateCycleLength: cycleLength
          ? Number(cycleLength)
          : Number(dataBaseCycleLength) || 28,
        updatePeriodLength: periodLength
          ? Number(periodLength)
          : Number(dataBasePeriodLength) || 5,
        periodDay: periodDate
          ? new Date(periodDate.replace(/-/g, "/"))
          : null,
        firstDay: isFirstDay,
        flowLevel: flowLevel,
        periodNotes: periodNotes,
      };

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

      setSuccess("Flow log successfully updated!");
      setIsFirstDay(null);
      setPeriodDate("");
      setFlowLevel(null);
      setPeriodNotes("");
      setCycleLength("");
      setPeriodLength("");
      setRefreshTrigger((prev) => !prev);
    } catch (err) {
      setError(err.message || "An error occured.");
    } finally {
      setLoading(false);
    }
  };

  const symptomSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const body = {
        symptomList: symptoms,
        additionalNotes: additionalNotes,
      };

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
        setError(data.message || "Failed to submit symptoms.");
        return;
      }

      setSuccess("Symptoms successfully logged!");
      setSymptoms([]);
      setAdditionalNotes("");
      setRefreshTrigger((prev) => !prev);
    } catch (err) {
      setError(err.message || "An error occurred.");
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

    let parsedDate = new Date(date);

    // If the date is UTC midnight or a raw YYYY-MM-DD string, parse it as local time
    // by replacing dashes with slashes. This prevents it from shifting a day behind.
    if (
      String(date).endsWith("T00:00:00.000Z") ||
      (typeof date === "string" && !date.includes("T"))
    ) {
      parsedDate = new Date(String(date).substring(0, 10).replace(/-/g, "/"));
    }

    return parsedDate.toLocaleDateString("en-US", {
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

        const cycleDataArray = response.ok ? await response.json() : [];
        const latestFlowDoc = cycleDataArray[cycleDataArray.length - 1];
        const cycles =
          latestFlowDoc?.apiPrediction?.data?.cycles ||
          latestFlowDoc?.flowData?.apiPrediction?.data?.cycles;

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
        } else {
          // If there is no prediction data, clear the calendar highlights safely
          setApiPeriod1([]);
          setApiPeriod2([]);
          setApiPeriod3([]);
          setApiFertile1([]);
          setApiFertile2([]);
          setApiFertile3([]);
          setApiPms1([]);
          setApiPms2([]);
          setApiPms3([]);
        }
      } catch (err) {
        setError(err.message || "Unable to fetch flow data.");
      }
    };

    cycles();
  }, [refreshTrigger]);

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

        const dataFlow = response.ok ? await response.json() : [];

        // Flatten all symptoms and period dates from across all cycle documents
        const allSymptoms = dataFlow
          .flatMap((doc) => doc?.flowData?.symptoms || [])
          .filter(
            (symptom) =>
              (symptom?.symptomList && symptom.symptomList.length > 0) ||
              symptom?.additionalNotes,
          )
          .reverse();
        const allPeriodDates = dataFlow
          .flatMap((doc) => doc?.flowData?.periodDates || [])
          .filter(
            (period) =>
              period?.periodDay || period?.flowLevel || period?.periodNotes,
          )
          .reverse();

        setSymptomsFlowData(allSymptoms);
        setPeriodFlowData(allPeriodDates);

        const latestFlowDoc = dataFlow[dataFlow.length - 1];
        setDataBaseLastPeriod(
          latestFlowDoc?.lastPeriod ||
            latestFlowDoc?.flowData?.lastPeriod ||
            "",
        );
        setDataBaseCycleLength(
          latestFlowDoc?.cycleLength ||
            latestFlowDoc?.flowData?.cycleLength ||
            "",
        );
        setDataBasePeriodLength(
          latestFlowDoc?.periodLength ||
            latestFlowDoc?.flowData?.periodLength ||
            "",
        );
      } catch (err) {
        setError(err.message || "Failed to fetch flow data.");
      }
    };
    getFlowData();
  }, [refreshTrigger]);

  if (loading) return <CircularProgress aria-label="Loading..." />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box
      className="page-container"
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        minHeight: "100vh",
      }}
    >
      <Box
        className="menu"
        sx={{ width: { xs: "100%", md: "250px" }, flexShrink: 0 }}
      >
        <Menu />
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          width: { xs: "100%", md: "calc(100% - 250px)" },
          boxSizing: "border-box",
        }}
      >
        <Box sx={{ mb: 4 }}>
          <h2>Cycle Predictor</h2>
          <Calendar
            onChange={setDate}
            value={date}
            selectRange={true}
            tileClassName={getTileClassName}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "15px",
              marginTop: "15px",
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span
                style={{
                  width: "15px",
                  height: "15px",
                  backgroundColor: "#ffb6b9",
                  borderRadius: "4px",
                }}
              ></span>
              <span style={{ fontSize: "0.9rem", color: "#5c434a" }}>
                Period
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span
                style={{
                  width: "15px",
                  height: "15px",
                  backgroundColor: "#b2cefe",
                  borderRadius: "4px",
                }}
              ></span>
              <span style={{ fontSize: "0.9rem", color: "#5c434a" }}>
                Fertile Window
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <span
                style={{
                  width: "15px",
                  height: "15px",
                  backgroundColor: "#a8e6cf",
                  borderRadius: "4px",
                }}
              ></span>
              <span style={{ fontSize: "0.9rem", color: "#5c434a" }}>
                PMS Phase
              </span>
            </div>
          </div>
        </Box>

        <Box>
          <h2>Summary</h2>
          <div>
            <h4>Symptoms</h4>
            <div
              className="data-card"
              style={{
                maxHeight: "350px",
                overflowY: "auto",
                textAlign: "left",
                padding: "20px",
              }}
            >
              {symptomsFlowData?.map((symptomLog, index) => (
                <div
                  key={index}
                  style={{
                    borderBottom: "1px solid #eaeaea",
                    marginBottom: "15px",
                    paddingBottom: "15px",
                  }}
                >
                  <p style={{ margin: "5px 0" }}>
                    <strong>Date:</strong>{" "}
                    {formatDate(symptomLog.date) || "No date found!"}
                  </p>
                  <p style={{ margin: "5px 0" }}>
                    <strong>Symptoms:</strong>{" "}
                    {symptomLog.symptomList?.join(", ")}
                  </p>
                  <p style={{ margin: "5px 0" }}>
                    <strong>Notes:</strong> {symptomLog.additionalNotes}
                  </p>
                </div>
              ))}
              {(!symptomsFlowData || symptomsFlowData.length === 0) && (
                <p>No symptoms logged yet.</p>
              )}
            </div>
          </div>

          <div>
            <h4>Period</h4>
            <div
              className="data-card"
              style={{
                maxHeight: "350px",
                overflowY: "auto",
                textAlign: "left",
                padding: "20px",
              }}
            >
              {periodFlowData?.map((periodLog, index) => (
                <div
                  key={index}
                  style={{
                    borderBottom: "1px solid #eaeaea",
                    marginBottom: "15px",
                    paddingBottom: "15px",
                  }}
                >
                  <p style={{ margin: "5px 0" }}>
                    <strong>Date:</strong> {formatDate(periodLog.periodDay)}
                  </p>
                  <p style={{ margin: "5px 0" }}>
                    <strong>First Day:</strong>{" "}
                    {periodLog.firstDay ? "Yes" : "No"}
                  </p>
                  <p style={{ margin: "5px 0" }}>
                    <strong>Flow Level:</strong> {periodLog.flowLevel}
                  </p>
                  <p style={{ margin: "5px 0" }}>
                    <strong>Notes:</strong> {periodLog.periodNotes}
                  </p>
                </div>
              ))}
              {(!periodFlowData || periodFlowData.length === 0) && (
                <p>No periods logged yet.</p>
              )}
            </div>
          </div>

          <div>
            <h2>Flow Log</h2>
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              <div className="data-card" style={{ textAlign: "left" }}>
                <h3 style={{ marginTop: 0 }}>Log your period</h3>
                <form onSubmit={periodSubmit}>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      gap: "40px",
                      marginBottom: "20px",
                    }}
                  >
                    <div>
                      <h4>Date</h4>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          label="Date"
                          value={periodDate ? dayjs(periodDate) : null}
                          onChange={(newValue) =>
                            setPeriodDate(
                              newValue ? newValue.format("YYYY-MM-DD") : "",
                            )
                          }
                          slotProps={{
                            textField: {
                              id: "outline-required",
                            },
                          }}
                        />
                      </LocalizationProvider>
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

                    <div style={{ width: "100%", textAlign: "center" }}>
                      <h4 style={{ marginTop: 0, marginBottom: "15px" }}>
                        Update to Improve cycle predictions
                      </h4>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          justifyContent: "center",
                          gap: "40px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <TextField
                            id="cycle-length-input"
                            label="New Cycle Length (Optional)"
                            value={cycleLength}
                            onChange={({ target }) =>
                              setCycleLength(target.value)
                            }
                            placeholder={String(dataBaseCycleLength) || "28"}
                            sx={{ flex: 1 }}
                          />
                          <Tooltip title="Optional: Update your average cycle length. If left blank, your previous average will be used.">
                            <div
                              style={{
                                cursor: "help",
                                background: "#ffb6b9",
                                color: "#5c434a",
                                borderRadius: "50%",
                                width: "24px",
                                height: "24px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "14px",
                                fontWeight: "bold",
                                flexShrink: 0,
                              }}
                            >
                              ?
                            </div>
                          </Tooltip>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <TextField
                            id="period-length-input"
                            label="New Period Length (Optional)"
                            value={periodLength}
                            onChange={({ target }) =>
                              setPeriodLength(target.value)
                            }
                            placeholder={String(dataBasePeriodLength) || "5"}
                            sx={{ flex: 1 }}
                          />
                          <Tooltip title="Optional: Update your average period length. If left blank, your previous average will be used.">
                            <div
                              style={{
                                cursor: "help",
                                background: "#ffb6b9",
                                color: "#5c434a",
                                borderRadius: "50%",
                                width: "24px",
                                height: "24px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "14px",
                                fontWeight: "bold",
                                flexShrink: 0,
                              }}
                            >
                              ?
                            </div>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <Button type="submit" variant="contained" size="medium">
                      Submit
                    </Button>
                  </div>
                </form>
              </div>

              <div className="data-card" style={{ textAlign: "left" }}>
                <h3 style={{ marginTop: 0 }}>How are you feeling today?</h3>
                <form onSubmit={symptomSubmit}>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      justifyContent: "center",
                      gap: "40px",
                      marginBottom: "20px",
                    }}
                  >
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
                        onChange={({ target }) =>
                          setAdditionalNotes(target.value)
                        }
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
            </div>
          </div>
        </Box>
      </Box>
    </Box>
  );
}

export default FlowPage;
