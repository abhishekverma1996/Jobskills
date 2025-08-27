import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function AuthPage() {
  const [mode, setMode] = useState("signup");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleMode = () => setMode(mode === "signup" ? "login" : "signup");
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Signup/Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = mode === "signup" ? `${API_URL}/api/auth/signup` : `${API_URL}/api/auth/login`;
      const { data } = await axios.post(url, form);

      if (mode === "signup") {
        alert("OTP sent to your email!");
        if (data.otp) {
          alert(`Development OTP: ${data.otp}`);
        }
        setOtpStep(true);
      } else {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "/dashboard";
      }
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // OTP Verify
  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        email: form.email,
        otp
      });

      alert(data.message);
      setOtpStep(false);
      setMode("login");
    } catch (err) {
      alert(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/resend-otp`, {
        email: form.email
      });

      alert(data.message);
      if (data.otp) {
        alert(`Development OTP: ${data.otp}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // Google Login
  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;
      const idToken = await googleUser.getIdToken();

      // <-- Add this log to verify token being sent
    console.log("🔑 Sending Google ID token to backend:", idToken);
      const { data } = await axios.post(`${API_URL}/api/auth/google-login`, { idToken: idToken });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      alert("Google Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl w-full max-w-md border border-white/20">
        {!otpStep ? (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <img src="/logo.svg" alt="JobSkills Logo" className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {mode === "signup" ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-gray-600 mt-2">
                {mode === "signup" ? "Join JobSkills today" : "Sign in to your account"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {mode === "signup" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    onChange={handleChange} 
                    placeholder="Enter your full name" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm" 
                    required 
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  onChange={handleChange} 
                  placeholder="Enter your email" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <input 
                  type="password" 
                  name="password" 
                  onChange={handleChange} 
                  placeholder="Enter your password" 
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm" 
                  required 
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {mode === "signup" ? "Creating Account..." : "Signing In..."}
                  </span>
                ) : (
                  mode === "signup" ? "Create Account" : "Sign In"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-8">
              <div className="flex-grow h-px bg-gray-300"></div>
              <span className="px-4 text-gray-500 text-sm font-medium">OR</span>
              <div className="flex-grow h-px bg-gray-300"></div>
            </div>

            {/* Google Sign In */}
            <button 
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 border-2 border-gray-300 hover:border-blue-400 rounded-xl py-3 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              <span className="font-semibold">Continue with Google</span>
            </button>

            {/* Toggle Mode */}
            <div className="text-center mt-8">
              <button 
                onClick={toggleMode} 
                className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors"
              >
                {mode === "signup" ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* OTP Verification */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <img src="/logo.svg" alt="JobSkills Logo" className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Verify Your Email
              </h2>
              <p className="text-gray-600 mt-2">
                Enter the 6-digit code sent to <br />
                <span className="font-semibold text-blue-600">{form.email}</span>
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">OTP Code</label>
                <input 
                  type="text" 
                  maxLength="6" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  placeholder="Enter 6-digit OTP"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm text-center text-2xl font-mono tracking-widest" 
                />
              </div>

              <button 
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verifying...
                  </span>
                ) : (
                  "Verify OTP"
                )}
              </button>

              <div className="flex gap-3">
                <button 
                  onClick={handleResendOtp}
                  disabled={loading}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Resend OTP"}
                </button>
                <button 
                  onClick={() => setOtpStep(false)}
                  className="flex-1 text-gray-600 hover:text-gray-800 font-semibold py-2 transition-colors"
                >
                  ← Back
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
