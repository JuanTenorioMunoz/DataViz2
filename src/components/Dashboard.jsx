import React, { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut, Radar, Line } from "react-chartjs-2";
import "./Dashboard.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const chartTypes = {
  Bar: Bar,
  Doughnut: Doughnut,
  Radar: Radar,
  Line: Line,
};

const Dashboard = () => {
  const [charts, setCharts] = useState([]);
  const [fileName, setFileName] = useState(""); // <- file name without extension

  const colors = {
    primary: "#865cf0",
    secondary: "#6B4AC7",
    accent: "#9D7AF3",
    complement: "#CF8A65",
    light: "#F8F9FA",
  };

  const toNumbers = (arr) =>
    arr.map((val) => {
      if (val === null || val === undefined || val === "") return 0;
      if (typeof val === "number") return val;
      const cleaned = String(val)
        .replace(/[, ]+/g, "")
        .replace(/M$/i, "")
        .replace(/%$/i, "");
      const n = Number(cleaned);
      return Number.isFinite(n) ? n : 0;
    });

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // remove extension
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    setFileName(nameWithoutExt);

    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const newCharts = [];

      workbook.SheetNames.forEach((sheetName, idx) => {
        const arr = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
          header: 1,
        });
        if (!arr || arr.length < 2) return;

        const title = arr[0][0] || sheetName; // first cell or sheet name fallback
        const labels = (arr[0] || []).slice(1).map((l) => String(l || ""));
        const rows = arr.slice(1).filter((r) => r && r.length > 0);

        const datasets = rows.map((row, i) => ({
          label: row[0] ?? `Series ${i + 1}`,
          data: toNumbers(row.slice(1)),
          backgroundColor: i === 0 ? colors.primary : colors.secondary,
        }));

        newCharts.push({
          id: idx,
          title,
          data: { labels, datasets },
          type: "Bar",
        });
      });

      setCharts(newCharts);
    };

    reader.readAsArrayBuffer(file);
  };

  const baseOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: { legend: { position: "top" } },
    }),
    []
  );

  return (
    <div className="dashboard">
      <header className="header">
        <h1>{fileName || "Upload a file to start"}</h1>
        <p>
          Análisis Estratégico para la Universidad Icesi • Consejo Académico
          2025
        </p>
        <input type="file" accept=".xlsx" onChange={handleFileUpload} />
      </header>

      <div className="dashboard-container">
        {charts.map((chart) => {
          const ChartComp = chartTypes[chart.type] || Bar;
          return (
            <div key={chart.id} className="card">
              <div className="card-header">
                <h2 className="card-title">{chart.title}</h2>
                <select
                  value={chart.type}
                  onChange={(e) =>
                    setCharts((prev) =>
                      prev.map((c) =>
                        c.id === chart.id
                          ? { ...c, type: e.target.value }
                          : c
                      )
                    )
                  }
                >
                  {Object.keys(chartTypes).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="chart-container">
                <ChartComp data={chart.data} options={baseOptions} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
