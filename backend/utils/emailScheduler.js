const cron = require("node-cron");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const axios = require("axios");
const { computeMatch } = require("../controllers/jobsController");

// Mail transport config
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function: send job recommendations
async function sendJobEmail(user) {
  try {
    if (!user.skills || user.skills.length === 0) {
      return;
    }

    const { data } = await axios.get(process.env.N8N_WEBHOOK);
    let jobs = Array.isArray(data) ? data : (data?.data || data?.jobs || []);

    const skills = user.skills || [];
    let withScore = jobs
      .map((j) => ({
        ...j,
        matchScore: computeMatch(j, skills),
      }))
      .filter((j) => j.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    // Remove duplicates by title+company
    const seen = new Set();
    withScore = withScore.filter((job) => {
      const key = `${job.title}-${job.company}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Remove jobs already sent to this user
    const alreadySent = new Set(user.lastSentJobs || []);
    withScore = withScore.filter(
      (job) => !alreadySent.has(`${job.title}-${job.company}`)
    );

    // Only top 10 fresh jobs
    withScore = withScore.slice(0, 10);

    if (withScore.length === 0) {
      return;
    }

    // HTML table with Apply button
    const jobRows = withScore
      .map(
        (j, i) => `
        <tr>
          <td style="padding:8px; border:1px solid #ddd;">${i + 1}</td>
          <td style="padding:8px; border:1px solid #ddd;">${j.title}</td>
          <td style="padding:8px; border:1px solid #ddd;">${j.company}</td>
          <td style="padding:8px; border:1px solid #ddd; text-align:center;">${j.matchScore}%</td>
          <td style="padding:8px; border:1px solid #ddd; text-align:center;">
            ${
              j.url
                ? `<a href="${j.url}" target="_blank"
                     style="background:#4F46E5; color:#fff; padding:6px 12px; 
                     text-decoration:none; border-radius:4px; font-size:13px;">
                     Apply</a>`
                : "N/A"
            }
          </td>
        </tr>`
      )
      .join("");

    const htmlContent = `
      <h2 style="font-family:Arial; color:#333;">Your Fresh Job Matches 🚀</h2>
      <p>Based on your skills, here are the latest jobs for you:</p>
      <table style="border-collapse: collapse; width:100%; font-family:Arial; font-size:14px;">
        <thead>
          <tr style="background-color:#f2f2f2;">
            <th style="padding:8px; border:1px solid #ddd;">Sr.No.</th>
            <th style="padding:8px; border:1px solid #ddd;">Job Title</th>
            <th style="padding:8px; border:1px solid #ddd;">Company</th>
            <th style="padding:8px; border:1px solid #ddd;">Match %</th>
            <th style="padding:8px; border:1px solid #ddd;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${jobRows}
        </tbody>
      </table>
      <p style="margin-top:20px;">Good luck!✨</p>
    `;

    await transporter.sendMail({
      from: `"JobSkills" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Your Fresh Job Recommendations",
      html: htmlContent,
    });

    // Update user.lastSentJobs
    const sentKeys = withScore.map((j) => `${j.title}-${j.company}`);
    user.lastSentJobs = [...(user.lastSentJobs || []), ...sentKeys];
    await user.save();
  } catch (err) {
    console.error("Email send failed:", err.message);
  }
}

// Scheduler
function startEmailScheduler() {
  // Every minute (for testing)
  cron.schedule("* * * * *", async () => {
    const users = await User.find({ "settings.emailNotif": true });
    for (let user of users) {
      if (user.settings.notifFrequency === "1m") {
        await sendJobEmail(user);
      }
    }
  });

  // Hourly
  cron.schedule("0 * * * *", async () => {
    const users = await User.find({
      "settings.emailNotif": true,
      "settings.notifFrequency": "1h",
    });
    for (let user of users) await sendJobEmail(user);
  });

  // Daily (9 AM)
  cron.schedule("0 9 * * *", async () => {
    const users = await User.find({
      "settings.emailNotif": true,
      "settings.notifFrequency": "1d",
    });
    for (let user of users) await sendJobEmail(user);
  });

  // Weekly (Monday 9 AM)
  cron.schedule("0 9 * * 1", async () => {
    const users = await User.find({
      "settings.emailNotif": true,
      "settings.notifFrequency": "1w",
    });
    for (let user of users) await sendJobEmail(user);
  });

  console.log("✅ Email scheduler started...");
}

module.exports = { startEmailScheduler };
