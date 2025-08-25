// routes/user.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const multer = require("multer");

// Production-ready multer configuration
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.mimetype.startsWith('text/')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOCX, and TXT files are allowed'), false);
    }
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ message: 'File upload error: ' + err.message });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

const { uploadResume } = require("../controllers/userController");
const User = require("../models/User");

// Resume Upload with error handling
router.post("/upload-resume", auth, upload.single("resume"), handleMulterError, uploadResume);

// Update user profile
router.post("/update-profile", auth, async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update profile fields
    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        skills: user.skills,
        resumeUrl: user.resumeUrl,
        isVerified: user.isVerified,
        settings: user.settings,
        applyLogs: user.applyLogs,
        lastSentJobs: user.lastSentJobs
      }
    });
  } catch (err) {
    console.error("Profile update failed:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// Apply log save
router.post("/apply-log", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { jobTitle, company, url } = req.body;

    user.applyLogs = user.applyLogs || [];
    user.applyLogs.push({ jobTitle, company, url });
    await user.save();

    res.json({ message: "Application logged" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to log application" });
  }
});

// Get user apply logs / reports
router.get("/apply-logs", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ logs: user.applyLogs || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch logs" });
  }
});

// Get current user data (including latest stats)
router.get("/current", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        skills: user.skills,
        resumeUrl: user.resumeUrl,
        isVerified: user.isVerified,
        settings: user.settings,
        applyLogs: user.applyLogs,
        lastSentJobs: user.lastSentJobs
      }
    });
  } catch (err) {
    console.error("Failed to fetch current user:", err);
    res.status(500).json({ message: "Failed to fetch user data" });
  }
});

// Get user settings
router.get("/settings", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("settings").lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(
      user.settings || { emailNotif: true, darkMode: false, notifFrequency: "1d" }
    );
  } catch (err) {
    console.error("Settings fetch failed:", err);
    res.status(500).json({ message: "Failed to fetch settings" });
  }
});

// Update user settings
router.post("/settings", auth, async (req, res) => {
  try {
    const { emailNotif, darkMode, notifFrequency } = req.body;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.settings = {
      emailNotif: emailNotif ?? user.settings?.emailNotif ?? true,
      darkMode: darkMode ?? user.settings?.darkMode ?? false,
      notifFrequency: notifFrequency ?? user.settings?.notifFrequency ?? "1d",
    };

    await user.save();

    res.json({
      message: "Settings updated successfully",
      settings: user.settings,
    });
  } catch (err) {
    console.error("Settings update failed:", err);
    res.status(500).json({ message: "Failed to update settings" });
  }
});

// Delete account
router.delete("/delete", auth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Delete account failed:", err);
    res.status(500).json({ message: "Failed to delete account" });
  }
});

module.exports = router;
