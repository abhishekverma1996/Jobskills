// src/pages/Landing.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navbar */}
      <nav className={`relative z-10 flex justify-between items-center px-4 sm:px-8 py-4 sm:py-6 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <img src="/logo.svg" alt="JobSkills Logo" className="w-4 h-4 sm:w-6 sm:h-6" />
          </div>
          JobSkills
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/auth" className="text-gray-600 hover:text-blue-600 transition-colors text-sm sm:text-base">
            Sign In
          </Link>
          <Link
            to="/auth"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className={`relative z-10 flex flex-col items-center text-center px-4 sm:px-6 py-12 sm:py-20 max-w-6xl mx-auto transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="mb-6 sm:mb-8">
          <span className="inline-block bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
            🎯 Skill-Based Job Matching Platform
          </span>
        </div>
        
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold mb-4 sm:mb-6 leading-tight px-2">
          Match Your Skills to{" "}
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Perfect Jobs
          </span>
        </h1>
        
        <p className="text-base sm:text-xl text-gray-600 max-w-3xl mb-8 sm:mb-12 leading-relaxed px-4">
          Upload your resume and let our smart skill matching find the perfect job opportunities 
          that align with your expertise. Get personalized job recommendations based on your skills.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-12 sm:mb-16 w-full max-w-md sm:max-w-none justify-center items-center mx-auto">
          <Link
            to="/auth"
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold text-base sm:text-lg"
          >
            Start Free Trial
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 w-full max-w-4xl">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">10K+</div>
            <div className="text-sm sm:text-base text-gray-600">Happy Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1 sm:mb-2">95%</div>
            <div className="text-sm sm:text-base text-gray-600">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-indigo-600 mb-1 sm:mb-2">50K+</div>
            <div className="text-sm sm:text-base text-gray-600">Jobs Matched</div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className={`relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
            Why Choose JobSkills?
          </h2>
          <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Our platform uses advanced skill matching to connect you with the perfect job opportunities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Feature 1 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Smart Skill Matching</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Our AI analyzes your resume and matches you with jobs that require your specific skills and experience.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Instant Results</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Get personalized job recommendations instantly after uploading your resume. No waiting, no delays.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Save Time</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Stop spending hours searching for jobs. Let our platform find the perfect matches for you automatically.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
          Ready to Find Your Dream Job?
        </h2>
        <p className="text-sm sm:text-lg text-gray-600 mb-8 sm:mb-12">
          Join thousands of professionals who have already found their perfect job matches.
        </p>
        <Link
          to="/auth"
          className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 sm:px-12 py-4 sm:py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-semibold text-lg sm:text-xl"
        >
          Get Started Now
        </Link>
      </section>

      {/* Footer */}
      <footer className={`relative z-10 bg-white/80 backdrop-blur-sm border-t border-gray-200/50 py-8 sm:py-12 transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            JobSkills
          </div>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            Connecting skills with opportunities, one resume at a time.
          </p>
          <div className="text-xs sm:text-sm text-gray-500">
            © 2025 JobSkills. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
