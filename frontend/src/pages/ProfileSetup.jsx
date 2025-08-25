import { useEffect, useState } from "react";
import axios from "axios";

export default function ProfileSetup({ setSkills }) {
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const safeSetSkills = setSkills || (() => {});
  const [uploaded, setUploaded] = useState(false);
  const [skills, setLocalSkills] = useState([]);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    phone: user?.phone || ""
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.skills?.length) {
      setLocalSkills(user.skills);
      setUploaded(true);
    }
    setProfileData({
      name: user?.name || "",
      phone: user?.phone || ""
    });
  }, []);

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File validation
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a PDF, DOCX, or TXT file only.");
      return;
    }

    if (file.size > maxSize) {
      alert("File size should be less than 5MB.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login first.");
      return;
    }

    const form = new FormData();
    form.append("resume", file);

    try {
      const { data } = await axios.post(`${API_URL}/api/user/upload-resume`, form, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      safeSetSkills(data.skills || []);
      setLocalSkills(data.skills || []);
      setUploaded(true);

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.skills = data.skills;
      user.phone = data.personalInfo?.phone || user.phone || "";
      user.resumeUrl = data.user?.resumeUrl || file.name;
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      setProfileData({
        name: user.name || "",
        phone: user.phone || ""
      });

      alert("Resume parsed successfully! Skills and phone number updated.");
    } catch (err) {
      console.error("Resume upload error:", err);
      const errorMessage = err.response?.data?.message || err.response?.data?.error || "Resume upload failed";
      alert(`Upload failed: ${errorMessage}`);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/user/update-profile`,
        profileData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.name = profileData.name;
      user.phone = profileData.phone;
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      setEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update profile");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 dark:text-white p-4 sm:p-6 rounded shadow max-w-2xl mx-auto">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Profile Setup</h2>

      {/* Personal Information Section */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="font-medium text-sm sm:text-base">Personal Information</h3>
          <button
            onClick={() => setEditing(!editing)}
            className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {editing ? (
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                placeholder="Enter your phone number"
              />
            </div>
            <button
              onClick={handleProfileUpdate}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium"
            >
              Update Profile
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Name:</span>
              <span className="font-medium text-xs sm:text-sm">{user?.name || "Not set"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Phone:</span>
              <span className="font-medium text-xs sm:text-sm">{user?.phone || "Not set"}</span>
            </div>
          </div>
        )}
      </div>

      {/* Resume Upload Section */}
      <div className="mb-4 sm:mb-6">
        <h3 className="font-medium mb-3 sm:mb-4 text-sm sm:text-base">Resume Upload</h3>

        {uploaded ? (
          <div className="space-y-3 sm:space-y-4">
            <p className="text-green-600 dark:text-green-400 font-semibold text-xs sm:text-sm">
              ✅ Resume uploaded successfully!
            </p>

            {skills.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-xs sm:text-sm">Detected Skills:</h4>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {skills.map((s, i) => (
                    <span
                      key={i}
                      className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 px-2 py-1 rounded-full text-xs"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block font-medium mb-2 text-xs sm:text-sm">
                Update Resume (Upload Again)
              </label>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleResumeUpload}
                className="file-input text-xs sm:text-sm"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block font-medium mb-2 text-xs sm:text-sm">
                Upload Resume (PDF/DOCX/TXT)
              </label>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleResumeUpload}
                className="file-input text-xs sm:text-sm"
              />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
              We'll parse your resume to detect skills and improve your job matches.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
