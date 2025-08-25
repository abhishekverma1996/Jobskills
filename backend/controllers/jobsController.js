const axios = require("axios");
const User = require("../models/User");

// basic score: skill overlap / total skills * 100
function computeMatch(job, skills) {
  const hay = (
    (job.title || "") + " " +
    (job.description || "") + " " +
    (job.skills || []).join(" ")
  ).toLowerCase();

  let hits = 0;
  skills.forEach((s) => {
    const r = new RegExp(`\\b${s.replace(".", "\\.")}\\b`, "i");
    if (r.test(hay)) hits++;
  });

  if (skills.length === 0) return 0;
  return Math.round((hits / skills.length) * 100);
}

async function getMatchedJobs(req, res) {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).lean();
    const skills = user?.skills || [];

    // Jobs laao n8n se
    const { data } = await axios.get(process.env.N8N_WEBHOOK);
    const jobs = Array.isArray(data)
      ? data
      : data?.data || data?.jobs || [];

    // score + sort
    const withScore = jobs
      .map((j) => ({
        ...j,
        matchScore: computeMatch(j, skills),
      }))
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json({ skills, jobs: withScore });
  } catch (err) {
    console.error("Get Matched Jobs Error:", err);
    res.status(500).json({ message: "Failed to fetch jobs" });
  }
}

// ✅ dono export karo
module.exports = {
  computeMatch,
  getMatchedJobs,
};
