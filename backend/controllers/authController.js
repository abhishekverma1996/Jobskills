const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// 🔹 Signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // Agar google provider se bana tha
      if (existingUser.provider === "google") {
        return res.status(400).json({
          message: "This email is already registered with Google login. Please use Google Sign-In."
        });
      }
      return res.status(400).json({ message: "User already exists. Please login." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      otp,
      otpExpiry: Date.now() + 10 * 60 * 1000, // 10 minutes
      provider: "local" // 👈 yeh add kiya
    });

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // For development/testing - log OTP to console
    console.log(`🔐 OTP for ${email}: ${otp}`);
    
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your OTP Code - JobSkills",
        text: `Welcome to JobSkills! Your OTP is ${otp}. It will expire in 10 minutes.`
      });
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError.message);
    }

    res.status(201).json({
      message: "Signup successful. Please verify OTP.",
      otp: process.env.NODE_ENV === 'development' ? otp : undefined // Only send OTP in development
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 🔹 Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "User already verified" });
    if (!user.otp || !user.otpExpiry) return res.status(400).json({ message: "No OTP found" });
    if (Date.now() > user.otpExpiry) return res.status(400).json({ message: "OTP expired" });
    if (user.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ message: "OTP verified successfully. You can now login." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 🔹 Resend OTP
exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // For development/testing - log OTP to console
    console.log(`🔐 New OTP for ${email}: ${otp}`);

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Your New OTP Code - JobSkills",
        text: `Your new OTP is ${otp}. It will expire in 10 minutes.`
      });
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError.message);
    }

    res.status(200).json({
      message: "New OTP sent successfully",
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 🔹 Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });
    if (!user.isVerified) return res.status(400).json({ message: "Please verify your email first" });
    if (!user.password) return res.status(400).json({ message: "Please use Google login" });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        skills: user.skills,
        resumeUrl: user.resumeUrl,
        phone: user.phone,
        applyLogs: user.applyLogs,
        lastSentJobs: user.lastSentJobs,
        settings: user.settings,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// 🔹 Google Login
exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, picture } = decodedToken;

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = await User.create({
        name,
        email,
        isVerified: true,
        provider: "google",
        profilePicture: picture,
      });
    } else if (user.provider !== "google") {
      return res.status(400).json({
        message: "This email is already registered with local login. Please use email/password."
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Google login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        skills: user.skills,
        resumeUrl: user.resumeUrl,
        phone: user.phone,
        applyLogs: user.applyLogs,
        lastSentJobs: user.lastSentJobs,
        settings: user.settings,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};