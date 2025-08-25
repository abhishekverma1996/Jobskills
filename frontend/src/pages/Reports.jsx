import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function Reports() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${API_URL}/api/user/apply-logs`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        setLogs(data.logs || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching logs:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-lg font-medium text-gray-600 dark:text-gray-300">
        ⏳ Loading Reports...
      </div>
    );
  }

  // ✅ Group by week
  const weeklyData = {};
  logs.forEach((log) => {
    const week = new Date(log.date).toLocaleDateString("en-GB", {
      month: "short",
      day: "numeric",
    });
    weeklyData[week] = (weeklyData[week] || 0) + 1;
  });
  const weeklyChartData = Object.entries(weeklyData).map(([week, count]) => ({
    week,
    applications: count,
  }));

  // ✅ Category wise (simple keyword match)
  const categoryCount = { Frontend: 0, Backend: 0, Fullstack: 0, Other: 0 };
  logs.forEach((log) => {
    const title = log.jobTitle?.toLowerCase() || "";
    if (title.includes("frontend")) categoryCount.Frontend++;
    else if (title.includes("backend")) categoryCount.Backend++;
    else if (title.includes("fullstack")) categoryCount.Fullstack++;
    else categoryCount.Other++;
  });
  const categoryData = Object.entries(categoryCount).map(([cat, matches]) => ({
    category: cat,
    matches,
  }));

  return (
    <div className="space-y-8">
      {/* Category Chart */}
      <div className="bg-white dark:bg-gray-800 dark:text-white p-6 rounded shadow transition-colors">
        <h2 className="text-xl font-semibold mb-4">Applications by Category</h2>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="category" stroke="currentColor" />
              <YAxis stroke="currentColor" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  color: "#fff",
                }}
              />
              <Legend />
              <Bar dataKey="matches" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Applications */}
      <div className="bg-white dark:bg-gray-800 dark:text-white p-6 rounded shadow transition-colors">
        <h2 className="text-xl font-semibold mb-4">Applications Over Time</h2>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={weeklyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="week" stroke="currentColor" />
              <YAxis stroke="currentColor" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "none",
                  color: "#fff",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="applications"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: "#10B981", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="bg-white dark:bg-gray-800 dark:text-white p-6 rounded shadow transition-colors">
        <h2 className="text-xl font-semibold mb-4">Recent Applications</h2>
        {logs.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            No applications logged yet.
          </p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {logs
              .slice(-5)
              .reverse()
              .map((log, idx) => (
                <li key={idx} className="py-2">
                  <div className="flex justify-between">
                    <span>
                      <strong>{log.jobTitle}</strong> @ {log.company}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">
                      {new Date(log.date).toLocaleDateString()}
                    </span>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}
