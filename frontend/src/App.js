import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import ProfileSetup from "./pages/ProfileSetup";
import Dashboard from "./pages/Dashboard";
import JobMatches from "./pages/JobMatches";
import DashboardHome from "./pages/DashboardHome";
import Settings from "./pages/Setting";
import Reports from "./pages/Reports";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 transition-all duration-300">
        {/* Main Content */}
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected Routes */}
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/home" element={<DashboardHome />} />
            <Route path="/job-matches" element={<JobMatches />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/reports" element={<Reports />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Landing />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
