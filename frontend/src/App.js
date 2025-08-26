import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ProfileSetup from "./pages/ProfileSetup";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-gray-900 dark:text-white transition-colors">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route
            path="/dashboard"
            element={<Dashboard darkMode={darkMode} setDarkMode={setDarkMode} />}
          />
        </Routes>
      </div>
    </Router>
  );
}
