import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function JobMatches() {
  const [jobs, setJobs] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const jobsPerPage = 8;

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${API_URL}/api/jobs/matches`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        const validJobs = (data.jobs || []).filter((j) => j.matchScore > 0);
        setJobs(validJobs);
        setSkills(data.skills || []);
      })
      .catch((err) => console.error("Error fetching jobs:", err))
      .finally(() => setLoading(false));
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm sm:text-lg font-medium text-gray-600 dark:text-gray-300 text-center px-4">
          Finding your perfect job matches...
        </p>
      </div>
    );
  }

  // Filtered jobs based on selected skills
  const filteredJobs =
    selectedSkills.length === 0
      ? jobs
      : jobs.filter((job) =>
          selectedSkills.some((skill) =>
            (job.title + " " + job.description + " " + (job.skills || []).join(" "))
              .toLowerCase()
              .includes(skill.toLowerCase())
          )
        );

  // Pagination logic
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  // Handle checkbox change
  const handleSkillToggle = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
    setCurrentPage(1);
  };

  // Handle Apply click
  const handleApply = async (job, e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/user/apply-log`,
        {
          jobTitle: job.title,
          company: job.company,
          url: job.url || "",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("❌ Failed to log application", err);
    }

    if (job.url) {
      window.open(job.url, "_blank");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="text-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
          Job Matches
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          {filteredJobs.length} jobs found based on your skills
        </p>
      </div>

      {/* Skills Filter */}
      {skills.length > 0 && (
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
              Filter by Skills
            </h3>
            <button
              onClick={() => setShowAllSkills(!showAllSkills)}
              className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {showAllSkills ? "Show Less" : `+${skills.length - 5} more skills`}
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {(showAllSkills ? skills : skills.slice(0, 5)).map((skill) => (
              <label
                key={skill}
                className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedSkills.includes(skill)}
                  onChange={() => handleSkillToggle(skill)}
                  className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{skill}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Job Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {currentJobs.map((job, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-2 sm:mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base line-clamp-2 flex-1 mr-2">
                {job.title}
              </h3>
              <span className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                {Math.round(job.matchScore)}% match
              </span>
            </div>
            
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
              {job.company}
            </p>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-500">
                {job.location || "Remote"}
              </span>
              <button
                onClick={(e) => handleApply(job, e)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 sm:py-2 rounded transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6 sm:mt-8">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            Previous
          </button>
          
          <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-xs sm:text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
          >
            Next
          </button>
        </div>
      )}

      {/* No jobs found */}
      {filteredJobs.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"></path>
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No jobs found
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Try adjusting your skill filters or upload your resume to get better matches.
          </p>
        </div>
      )}
    </div>
  );
}
