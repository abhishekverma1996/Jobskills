import { useEffect, useState } from "react";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function DashboardHome() {
  const [jobs, setJobs] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get(`${API_URL}/api/jobs/matches`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        setJobs((data.jobs || []).slice(0, 5)); // sirf top 5
        setSkills(data.skills || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const chartData = jobs.map((j) => ({
    name: j.title,
    value: j.matchScore,
  }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#a83279"];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-lg font-medium text-gray-600 dark:text-gray-300">
        ⏳ Loading, please wait...
      </div>
    );
  }

  return (
    <>
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Hi, {user?.name?.split(" ")[0] || "there"}! Here’s your latest job
          matches
        </h1>
      </header>

      {/* Top Section: Skills + Chart side by side */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Skills */}
        <div className="bg-white dark:bg-gray-800 dark:text-white p-6 rounded shadow transition-colors">
          <h2 className="text-xl font-semibold mb-4">Your Skills</h2>
          {skills.length ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span
                  key={s}
                  className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 rounded text-sm"
                >
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              Upload your resume in Profile to extract skills.
            </p>
          )}
        </div>

        {/* Chart */}
        {jobs.length > 0 && (
          <div className="bg-white dark:bg-gray-800 dark:text-white p-6 rounded shadow transition-colors">
            <h2 className="text-xl font-semibold mb-4">Job Match Distribution</h2>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label
                  >
                    {chartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#eceff2ff",
                      color: "#fcf6f6ff",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </section>

      {/* Jobs Section */}
      <section className="bg-white dark:bg-gray-800 dark:text-white p-6 rounded shadow overflow-x-auto transition-colors">
        <h2 className="text-xl font-semibold mb-4">Top Matches</h2>
        {!jobs.length ? (
          <p className="text-gray-500 dark:text-gray-400">
            No matches yet. Upload resume to get personalized jobs.
          </p>
        ) : (
          <table className="w-full border-collapse border dark:border-gray-700">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="border px-4 py-2 text-left">Job Title</th>
                  <th className="border px-4 py-2 text-left">Company</th>
                  <th className="border px-4 py-2 text-left">Source</th>
                <th className="border px-4 py-2 text-right">Match %</th>
                <th className="border px-4 py-2 text-center">Apply</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                >
                  <td className="border px-4 py-2 dark:border-gray-700">
                    {j.title}
                  </td>
                  <td className="border px-4 py-2 dark:border-gray-700">
                    {j.company}
                  </td>
                  <td className="border px-4 py-2 dark:border-gray-700">
                    {j.source}
                  </td>
                  <td className="border px-4 py-2 text-right dark:border-gray-700">
                    {j.matchScore}%
                  </td>
                  <td className="border px-4 py-2 text-center dark:border-gray-700">
                    {j.url ? (
                      <a
                        href={j.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Apply
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
