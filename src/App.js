import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function App() {
  const savedForm = JSON.parse(localStorage.getItem("macroForm")) || {
    age: "",
    sex: "male",
    weight: "",
    height: "",
    activity: "sedentary",
  };
  const savedLogs = JSON.parse(localStorage.getItem("weightLogs")) || [];
  const savedDark = JSON.parse(localStorage.getItem("darkMode")) || false;

  const [form, setForm] = useState(savedForm);
  const [results, setResults] = useState(null);
  const [logWeight, setLogWeight] = useState("");
  const [logNotes, setLogNotes] = useState("");
  const [logs, setLogs] = useState(savedLogs);
  const [darkMode, setDarkMode] = useState(savedDark);

  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9,
  };

  const activityDescriptions = {
    sedentary: "Little or no exercise, desk job.",
    light: "Light exercise or sports 1-3 days/week.",
    moderate: "Moderate exercise 3-5 days/week.",
    active: "Hard exercise 6-7 days/week.",
    veryActive: "Very hard exercise & physical job or training twice daily.",
  };

  useEffect(() => {
    localStorage.setItem("macroForm", JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    localStorage.setItem("weightLogs", JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Calculate macros, TDEE, water and salt intake
  const calculate = () => {
    const age = parseInt(form.age);
    const weight = parseFloat(form.weight);
    const height = parseFloat(form.height);
    const activityFactor = activityMultipliers[form.activity];

    if (!age || !weight || !height) {
      alert("Please enter valid numbers for age, weight, and height.");
      return;
    }

    let bmr;
    if (form.sex === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    const tdee = bmr * activityFactor;

    const proteinGrams = weight * 1.6; // g per kg
    const fatCalories = tdee * 0.25;
    const fatGrams = fatCalories / 9;
    const proteinCalories = proteinGrams * 4;
    const carbCalories = tdee - (proteinCalories + fatCalories);
    const carbGrams = carbCalories / 4;

    // Calculate water intake:
    // Simple guideline: 35ml water per kg bodyweight
    // Convert to liters
    const waterLiters = +(weight * 0.035).toFixed(2);

    // Calculate salt intake:
    // Recommended: 2.3 grams per day (general guideline),
    // but let’s tie loosely to activity, increase salt by 0.5g per 500 kcal TDEE over sedentary
    const sedentaryTDEE = bmr * activityMultipliers["sedentary"];
    const extraSalt = Math.max(0, (tdee - sedentaryTDEE) / 500) * 0.5;
    const saltGrams = +(2.3 + extraSalt).toFixed(2);

    setResults({
      tdee: Math.round(tdee),
      proteinGrams: Math.round(proteinGrams),
      fatGrams: Math.round(fatGrams),
      carbGrams: Math.round(carbGrams),
      waterLiters,
      saltGrams,
    });
  };

  const addLog = () => {
    const weightNum = parseFloat(logWeight);

    if (!weightNum) {
      alert("Please enter a valid weight for the log.");
      return;
    }

    const newEntry = {
      date: new Date().toLocaleDateString(),
      weight: weightNum,
      notes: logNotes.trim(),
    };

    setLogs((prev) => [newEntry, ...prev]);
    setLogWeight("");
    setLogNotes("");
  };

  const deleteLog = (index) => {
    setLogs((prev) => prev.filter((_, i) => i !== index));
  };

  // Prepare chart data (reverse logs so oldest is first)
  const chartData = [...logs]
    .slice()
    .reverse()
    .map((log) => ({
      date: log.date,
      weight: log.weight,
    }));

  // Styles depending on darkMode
  const bgColor = darkMode ? "#121212" : "#fefefe";
  const textColor = darkMode ? "#eee" : "#222";
  const secondaryText = darkMode ? "#bbb" : "#555";
  const inputBg = darkMode ? "#222" : "#fff";
  const inputBorder = darkMode ? "#555" : "#ccc";
  const btnPrimaryBg = darkMode ? "#0d6efd" : "#007bff";
  const btnPrimaryHover = darkMode ? "#0b5ed7" : "#0056b3";
  const btnSuccessBg = darkMode ? "#198754" : "#28a745";

  return (
    <div
      style={{
        maxWidth: 420,
        margin: "40px auto",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: 20,
        boxShadow: darkMode ? "0 0 15px #000" : "0 0 10px rgba(0,0,0,0.1)",
        borderRadius: 8,
        backgroundColor: bgColor,
        color: textColor,
        minHeight: "90vh",
        transition: "background-color 0.3s ease, color 0.3s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h2>Macro & Calorie Calculator</h2>
        <button
          onClick={() => setDarkMode((d) => !d)}
          style={{
            padding: "6px 12px",
            backgroundColor: darkMode ? "#444" : "#ddd",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            color: darkMode ? "#eee" : "#222",
            fontWeight: "600",
            transition: "background-color 0.3s ease",
          }}
          title="Toggle Dark Mode"
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        <label style={{ fontWeight: "600", color: textColor }}>
          Age (years):
          <input
            type="number"
            name="age"
            value={form.age}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: 8,
              marginTop: 5,
              borderRadius: 5,
              border: `1px solid ${inputBorder}`,
              fontSize: 16,
              backgroundColor: inputBg,
              color: textColor,
            }}
          />
        </label>

        <label style={{ fontWeight: "600", color: textColor }}>
          Sex:
          <select
            name="sex"
            value={form.sex}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: 8,
              marginTop: 5,
              borderRadius: 5,
              border: `1px solid ${inputBorder}`,
              fontSize: 16,
              backgroundColor: inputBg,
              color: textColor,
            }}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </label>

        <label style={{ fontWeight: "600", color: textColor }}>
          Weight (kg):
          <input
            type="number"
            name="weight"
            value={form.weight}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: 8,
              marginTop: 5,
              borderRadius: 5,
              border: `1px solid ${inputBorder}`,
              fontSize: 16,
              backgroundColor: inputBg,
              color: textColor,
            }}
          />
        </label>

        <label style={{ fontWeight: "600", color: textColor }}>
          Height (cm):
          <input
            type="number"
            name="height"
            value={form.height}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: 8,
              marginTop: 5,
              borderRadius: 5,
              border: `1px solid ${inputBorder}`,
              fontSize: 16,
              backgroundColor: inputBg,
              color: textColor,
            }}
          />
        </label>

        <label style={{ fontWeight: "600", color: textColor }}>
          Activity Level:
          <select
            name="activity"
            value={form.activity}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: 8,
              marginTop: 5,
              borderRadius: 5,
              border: `1px solid ${inputBorder}`,
              fontSize: 16,
              backgroundColor: inputBg,
              color: textColor,
            }}
          >
            <option value="sedentary">Sedentary</option>
            <option value="light">Lightly active</option>
            <option value="moderate">Moderately active</option>
            <option value="active">Active</option>
            <option value="veryActive">Very active</option>
          </select>
          <p style={{ fontSize: 14, color: secondaryText, marginTop: 4 }}>
            {activityDescriptions[form.activity]}
          </p>
        </label>

        <button
          onClick={calculate}
          style={{
            marginTop: 10,
            padding: "10px 0",
            fontSize: 18,
            fontWeight: "600",
            backgroundColor: btnPrimaryBg,
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = btnPrimaryHover)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = btnPrimaryBg)
          }
        >
          Calculate
        </button>
      </div>

      {results && (
        <div
          style={{
            marginTop: 20,
            padding: 15,
            backgroundColor: darkMode ? "#1f2a38" : "#e9f0ff",
            borderRadius: 8,
            textAlign: "center",
            color: textColor,
          }}
        >
          <h3>Results</h3>
          <p>
            <strong>TDEE:</strong> {results.tdee} kcal/day
          </p>
          <p>
            <strong>Protein:</strong> {results.proteinGrams} g/day
          </p>
          <p>
            <strong>Fats:</strong> {results.fatGrams} g/day
          </p>
          <p>
            <strong>Carbs:</strong> {results.carbGrams} g/day
          </p>
          <p>
            <strong>Water Intake:</strong> {results.waterLiters} L/day
          </p>
          <p>
            <strong>Salt Intake:</strong> {results.saltGrams} g/day
          </p>
        </div>
      )}

      <hr style={{ margin: "30px 0", borderColor: inputBorder }} />

      <h3 style={{ marginBottom: 15, color: textColor }}>Add Daily Log</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          type="number"
          step="0.1"
          placeholder="Weight (kg)"
          value={logWeight}
          onChange={(e) => setLogWeight(e.target.value)}
          style={{
            padding: 8,
            borderRadius: 5,
            border: `1px solid ${inputBorder}`,
            fontSize: 16,
            backgroundColor: inputBg,
            color: textColor,
          }}
        />
        <textarea
          placeholder="Notes (optional)"
          value={logNotes}
          onChange={(e) => setLogNotes(e.target.value)}
          style={{
            padding: 8,
            borderRadius: 5,
            border: `1px solid ${inputBorder}`,
            fontSize: 16,
            resize: "vertical",
            backgroundColor: inputBg,
            color: textColor,
          }}
          rows={3}
        />
        <button
          onClick={addLog}
          style={{
            padding: "10px 0",
            fontSize: 18,
            fontWeight: "600",
            backgroundColor: btnSuccessBg,
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Add Log
        </button>
      </div>

      {logs.length > 0 && (
        <>
          <h3 style={{ marginTop: 30, marginBottom: 15, color: textColor }}>
            Logs
          </h3>
          <ul
            style={{
              maxHeight: 280,
              overflowY: "auto",
              paddingLeft: 0,
              listStyle: "none",
              borderTop: `1px solid ${inputBorder}`,
              color: textColor,
            }}
          >
            {logs.map((log, i) => (
              <li
                key={i}
                style={{
                  padding: "10px 5px",
                  borderBottom: `1px solid ${inputBorder}`,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontWeight: "600",
                  }}
                >
                  <span>{log.date}</span>
                  <button
                    onClick={() => deleteLog(i)}
                    style={{
                      border: "none",
                      background: "none",
                      color: "#d33",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                    title="Delete log"
                  >
                    &times;
                  </button>
                </div>
                <div style={{ fontSize: 16, marginTop: 4 }}>
                  Weight: {log.weight} kg
                </div>
                {log.notes && (
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 14,
                      fontStyle: "italic",
                      color: secondaryText,
                    }}
                  >
                    Notes: {log.notes}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {logs.length > 1 && (
        <>
          <h3 style={{ marginTop: 30, marginBottom: 15, color: textColor }}>
            Weight Progress
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={darkMode ? "#444" : "#ccc"}
              />
              <XAxis dataKey="date" stroke={textColor} />
              <YAxis
                domain={["dataMin - 2", "dataMax + 2"]}
                stroke={textColor}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? "#222" : "#fff",
                  color: darkMode ? "#eee" : "#222",
                  borderRadius: 6,
                  border: darkMode ? "1px solid #555" : "1px solid #ccc",
                }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#007bff"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
