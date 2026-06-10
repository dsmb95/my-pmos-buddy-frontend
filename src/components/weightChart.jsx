import { useEffect, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

function WeightChart({ height = "350px" }) {
  const [weightData, setWeightData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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

        const data = response.ok ? await response.json() : [];
        const allWeight = data
          .flatMap((doc) => doc?.weightData || [])
          .filter((weight) => weight?.unit || weight?.weight);
        setWeightData(allWeight);
      } catch (err) {
        setError(err.message || "Failed to fetch weight data.");
      } finally {
        setLoading(false);
      }
    };

    getWeightData();
  }, []);

  const data = weightData?.map((weight) => {
    const dateObj = new Date(weight?.date);
    return {
      date: !isNaN(dateObj) ? dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "No date",
      value: weight?.weight,
    };
  });
  

  if (loading) return <CircularProgress aria-label="Loading..." />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <>
      <h2>Weight Trend</h2>
      <div style={{ width: "100%", height: height, marginTop: "20px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" />
            <XAxis dataKey="date" stroke="#5c434a" />
            <YAxis stroke="#5c434a" />
            <Tooltip contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              name="Weight" 
              stroke="#d67d8d" 
              strokeWidth={3} 
              activeDot={{ r: 8 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

export default WeightChart;
