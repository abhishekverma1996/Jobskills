import { useState, useEffect } from "react";
import axios from "axios";
import DashboardHome from "./DashboardHome";
import JobMatches from "./JobMatches";
import ProfileSetup from "./ProfileSetup";
import Reports from "./Reports";
import Settings from "./Setting";

export default function Dashboard({ darkMode, setDarkMode }) {
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [skills, setSkills] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));

  // Fetch fresh user data from API
  const fetchFreshUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(`${API_URL}/api/user/current`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const freshUserData = response.data.user;
      setUser(freshUserData);
      setSkills(freshUserData.skills || []);
      
      // Update localStorage with fresh data
      localStorage.setItem("user", JSON.stringify(freshUserData));
    } catch (err) {
      console.error("Failed to fetch fresh user data:", err);
    }
  };

  // ✅ Fetch skills once
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (userData.skills) {
      setSkills(userData.skills);
    }
    setUser(userData);
  }, []);

  // Refresh user data to get latest stats
  useEffect(() => {
    // Fetch fresh data immediately
    fetchFreshUserData();
    
    // Then refresh every 30 seconds
    const interval = setInterval(fetchFreshUserData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const menuItems = [
    { key: "dashboard", label: "Dashboard", icon: "🏠" },
    { key: "jobMatches", label: "Job Matches", icon: "💼" },
    { key: "profile", label: "Profile", icon: "👤" },
    { key: "reports", label: "Reports", icon: "📊" },
    { key: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-300">
      {/* Navbar */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
              
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <img src="/logo.svg" alt="JobSkills Logo" className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                JobSkills
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    Hi, {user?.name?.split(" ")[0] || "User"}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </div>
                </div>
              </div>
              
              <button
                onClick={logout}
                className="px-2 sm:px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 transform hover:scale-105 shadow-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Layout */}
      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-r border-gray-200/50 dark:border-gray-700/50 shadow-sm transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <div className="p-4 sm:p-6">
            {/* Navigation */}
            <nav className="flex-1 space-y-2 sm:space-y-3">
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setActivePage(item.key);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 text-sm sm:text-base ${
                    activePage === item.key
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <span className="text-base sm:text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Quick Stats */}
            <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-xl border border-blue-100 dark:border-gray-600">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300">Quick Stats</h3>
                </div>
                <button
                  onClick={fetchFreshUserData}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                  title="Refresh stats"
                >
                  🔄 Refresh
                </button>
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between p-2 bg-white/50 dark:bg-gray-600/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Skills</span>
                  </div>
                  <span className="font-bold text-blue-600 dark:text-blue-400 text-xs sm:text-sm">{skills.length}</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-white/50 dark:bg-gray-600/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Applications</span>
                  </div>
                  <span className="font-bold text-green-600 dark:text-green-400 text-xs sm:text-sm">{user?.applyLogs?.length || 0}</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-white/50 dark:bg-gray-600/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Job Matches</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-purple-600 dark:text-purple-400 text-xs sm:text-sm block">
                      {user?.lastSentJobs?.length || 0}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.lastSentJobs?.length > 0 ? 'Total Sent' : 'No Jobs Sent'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-white/50 dark:bg-gray-600/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">Resume</span>
                  </div>
                  <span className={`font-bold text-xs px-1 sm:px-2 py-1 rounded-full ${
                    user?.resumeUrl 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    {user?.resumeUrl ? 'Uploaded' : 'Not Uploaded'}
                  </span>
                </div>
              </div>
              
              {/* Job Matching Status */}
              {user?.lastSentJobs?.length > 0 && (
                <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-xs text-green-700 dark:text-green-300">
                    ✅ <strong>Active:</strong> Job matching system is working. {user.lastSentJobs.length} jobs have been sent via email.
                  </p>
                </div>
              )}
              
              {user?.skills?.length > 0 && user?.lastSentJobs?.length === 0 && (
                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    💡 <strong>Ready:</strong> Skills detected. Job matches will appear here after the email scheduler sends recommendations.
                  </p>
                </div>
              )}
              
              {user?.skills?.length === 0 && (
                <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    📄 <strong>Action Required:</strong> Upload your resume to extract skills and start getting job matches!
                  </p>
                </div>
              )}
              
              <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-blue-200 dark:border-gray-600">
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Last updated: {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Content */}
        <main className="flex-1 p-4 sm:p-8 w-full">
          <div className="max-w-6xl mx-auto">
            {activePage === "dashboard" && <DashboardHome />}
            {activePage === "jobMatches" && <JobMatches />}
            {activePage === "profile" && (
              <ProfileSetup setSkills={setSkills} skills={skills} />
            )}
            {activePage === "reports" && <Reports />}
            {activePage === "settings" && (
              <Settings darkMode={darkMode} setDarkMode={setDarkMode} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
