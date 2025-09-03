const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false }, // Google login ke liye optional
  provider: { type: String, default: "local" },
  phone: { type: String, default: "" },
  skills: { type: [String], default: [] },
  resumeUrl: { type: String, default: "" },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },

  // ✅ Apply Logs
  applyLogs: [
    {
      jobTitle: { type: String, required: true },
      company: { type: String, required: true },
      url: { type: String, default: "" },
      date: { type: Date, default: Date.now }
    }
  ],

  // ✅ User settings (new field)
  settings: {
    emailNotif: { type: Boolean, default: true },
    darkMode: { type: Boolean, default: false },
    notifFrequency: { type: String, enum: ["1m", "1h", "1d", "1w"], default: "1d" }
  },

// ✅ Store jobs already sent in email (avoid duplicates)
lastSentJobs: { type: [String], default: [] }

}, { timestamps: true });


module.exports = mongoose.model("User", userSchema);
