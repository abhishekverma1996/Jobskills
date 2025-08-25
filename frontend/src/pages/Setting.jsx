import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function Settings() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [notifFrequency, setNotifFrequency] = useState("1d"); // ✅ new state
  const [loading, setLoading] = useState(true);

  // ✅ Load user preferences from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API_URL}/api/user/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setEmailNotif(data.emailNotif ?? true);
        setDarkMode(data.darkMode ?? false);
        setNotifFrequency(data.notifFrequency ?? "1d"); // ✅ load from backend

        if (data.darkMode) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } catch (err) {
        console.error("❌ Failed to fetch settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // ✅ Update backend when settings change
  useEffect(() => {
    if (loading) return; // first load par skip karo

    const saveSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          `${API_URL}/api/user/settings`,
          { emailNotif, darkMode, notifFrequency }, // ✅ include frequency
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (darkMode) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } catch (err) {
        console.error("❌ Failed to save settings", err);
      }
    };

    saveSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emailNotif, darkMode, notifFrequency]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40 text-lg font-medium text-gray-600">
        ⏳ Loading settings...
      </div>
    );
  }

  // ✅ ToggleSwitch
  const ToggleSwitch = ({ enabled, setEnabled }) => (
    <div
      onClick={() => setEnabled(!enabled)}
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition ${
        enabled ? "bg-green-500" : "bg-gray-400"
      }`}
    >
      <div
        className={`bg-white w-5 h-5 rounded-full shadow-md transform transition ${
          enabled ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 dark:text-white p-6 rounded shadow max-w-xl space-y-6 transition-colors">
      <h2 className="text-2xl font-semibold mb-4">⚙️ Settings</h2>

      {/* Email Notifications + Dropdown */}
      <div className="flex items-center justify-between">
        <span>Email Notifications</span>
        <div className="flex gap-3 items-center">
          <ToggleSwitch enabled={emailNotif} setEnabled={setEmailNotif} />
          {emailNotif && (
            <select
              value={notifFrequency}
              onChange={(e) => setNotifFrequency(e.target.value)}
              className="border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
            >
              <option value="1m">Every 1 Minute (test)</option>
              <option value="1h">Every Hour</option>
              <option value="1d">Every Day</option>
              <option value="1w">Weekly (Monday)</option>
            </select>
          )}
        </div>
      </div>

      {/* Dark Mode */}
      <div className="flex items-center justify-between">
        <span>Enable Dark Mode</span>
        <ToggleSwitch enabled={darkMode} setEnabled={setDarkMode} />
      </div>

      {/* Delete Account */}
      <div className="pt-4">
        <button
          onClick={async () => {
            const confirmDelete = window.confirm(
              "⚠️ Are you sure you want to delete your account? This action cannot be undone."
            );
            if (!confirmDelete) return;

            try {
              const token = localStorage.getItem("token");
              await axios.delete(`${API_URL}/api/user/delete`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              alert("Account deleted successfully.");
              localStorage.clear();
              window.location.href = "/auth";
            } catch (err) {
              console.error("❌ Delete account failed", err);
              alert("Failed to delete account. Try again later.");
            }
          }}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
}
