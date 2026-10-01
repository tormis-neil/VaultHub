import React, { useState } from 'react';
import { X, Lock, CheckCircle2, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';
import { StudentUser } from '../types';
import { DEMO_USERS } from '../data/mockData';

interface FacebookAuthPageProps {
  onLogin: (user: StudentUser) => void;
  onRegister: (newUser: StudentUser) => void;
}

export const FacebookAuthPage: React.FC<FacebookAuthPageProps> = ({
  onLogin,
  onRegister,
}) => {
  const [emailOrStudentId, setEmailOrStudentId] = useState('tormisneilmayo@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [showForgotNotice, setShowForgotNotice] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Registration modal state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [degreeProgram, setDegreeProgram] = useState('BS Information Technology');
  const [academicYear, setAcademicYear] = useState('1st Year - Freshman');
  const [regError, setRegError] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const query = emailOrStudentId.trim().toLowerCase();
    const matched = DEMO_USERS.find(
      (u) => u.email.toLowerCase() === query || u.studentId.toLowerCase() === query
    ) || DEMO_USERS[0];

    onLogin(matched);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !regEmail.trim() || !regStudentId.trim() || !regPassword) {
      setRegError('Please fill in all required fields.');
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const initials = `${firstName.trim()[0] || ''}${lastName.trim()[0] || ''}`.toUpperCase();

    const newUser: StudentUser = {
      id: `usr-${Math.floor(100000 + Math.random() * 900000)}`,
      studentId: regStudentId.trim(),
      fullName,
      email: regEmail.trim(),
      degreeProgram,
      academicYear,
      storageQuotaBytes: 500 * 1024 * 1024,
      avatarInitials: initials || 'ST',
    };

    setIsSignUpModalOpen(false);
    onRegister(newUser);
  };

  const handleQuickDemoLogin = (user: StudentUser) => {
    setEmailOrStudentId(user.email);
    setPassword('••••••••••••');
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col justify-between font-sans text-[#1c1e21] antialiased">
      
      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-10 sm:py-20 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* Left Column: Brand & Tagline */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-3 lg:pr-6">
            <h1 className="text-5xl sm:text-6xl font-extrabold text-[#1877f2] tracking-tight lowercase">
              vaulthub
            </h1>
            <p className="text-xl sm:text-2xl md:text-[28px] text-[#1c1e21] font-normal leading-snug sm:leading-relaxed max-w-lg mx-auto lg:mx-0">
              VaultHub helps you store, organize, and secure your academic documents with verified encryption.
            </p>

            {/* Quick Demo Switcher Strip */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-[#1877f2]" />
                Demo Student Logins:
              </span>
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {DEMO_USERS.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickDemoLogin(u)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-medium rounded-full border border-slate-300 shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{u.fullName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({u.studentId})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Facebook-style Login Card */}
          <div className="lg:col-span-5 max-w-[396px] w-full mx-auto">
            <div className="bg-white p-4 sm:p-5 rounded-lg shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.1)] border border-slate-200/60">
              
              {loginError && (
                <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                {/* Email or Phone Input */}
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Email or Student ID Number"
                    value={emailOrStudentId}
                    onChange={(e) => setEmailOrStudentId(e.target.value)}
                    className="w-full px-4 py-3.5 text-[15px] sm:text-[17px] text-[#1c1e21] placeholder:text-[#8a8d91] bg-white border border-[#ccd0d5] rounded-md focus:outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] transition-all"
                  />
                </div>

                {/* Password Input */}
                <div>
                  <input
                    type="password"
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 text-[15px] sm:text-[17px] text-[#1c1e21] placeholder:text-[#8a8d91] bg-white border border-[#ccd0d5] rounded-md focus:outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2] transition-all"
                  />
                </div>

                {/* Blue Log In Button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-lg sm:text-xl rounded-md transition-colors shadow-xs active:scale-[0.99]"
                >
                  Log In
                </button>

                {/* Forgot Password Link */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForgotNotice(!showForgotNotice)}
                    className="text-[#1877f2] hover:underline text-xs sm:text-sm font-normal"
                  >
                    Forgot password?
                  </button>
                  {showForgotNotice && (
                    <p className="mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-200">
                      For student demo accounts, you can sign in directly or select any demo student profile.
                    </p>
                  )}
                </div>

                {/* Divider Line */}
                <div className="border-b border-[#dadde1] my-4" />

                {/* Green Create New Account Button */}
                <div className="text-center pt-1 pb-1">
                  <button
                    type="button"
                    onClick={() => {
                      setRegError(null);
                      setIsSignUpModalOpen(true);
                    }}
                    className="px-5 py-3 bg-[#42b72a] hover:bg-[#36a420] text-white font-bold text-base rounded-md transition-colors shadow-xs active:scale-[0.99] inline-block"
                  >
                    Create New Account
                  </button>
                </div>

              </form>
            </div>

            {/* Bottom Tagline matching "Create a Page for a celebrity, band or business." */}
            <div className="mt-7 text-center text-xs sm:text-[13px] text-[#1c1e21]">
              <span className="font-bold hover:underline cursor-pointer">
                Create a Vault
              </span>{' '}
              for your university, college, or academic department.
            </div>

          </div>

        </div>
      </div>

      {/* Classic Facebook-style Registration Dialog */}
      {isSignUpModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-white/70 sm:bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white rounded-lg max-w-[432px] w-full shadow-[0_12px_28px_0_rgba(0,0,0,0.2),0_2px_4px_0_rgba(0,0,0,0.1)] border border-slate-300 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-[#dadde1] flex items-start justify-between relative">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#1c1e21] leading-none">
                  Sign Up
                </h2>
                <p className="text-[#606770] text-sm mt-1">
                  It's quick and easy.
                </p>
              </div>
              <button
                onClick={() => setIsSignUpModalOpen(false)}
                className="text-[#606770] hover:text-[#1c1e21] p-1 -mr-1 -mt-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSignUpSubmit} className="p-4 space-y-3 text-xs">
              {regError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-700">
                  {regError}
                </div>
              )}

              {/* First Name & Last Name (Side by side) */}
              <div className="grid grid-cols-2 gap-2.5">
                <input
                  type="text"
                  required
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#f5f6f7] border border-[#ccd0d5] rounded-md focus:bg-white focus:outline-none focus:border-[#1877f2]"
                />
                <input
                  type="text"
                  required
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#f5f6f7] border border-[#ccd0d5] rounded-md focus:bg-white focus:outline-none focus:border-[#1877f2]"
                />
              </div>

              {/* Student ID */}
              <div>
                <input
                  type="text"
                  required
                  placeholder="Student ID number (e.g. 2026-00189-MN)"
                  value={regStudentId}
                  onChange={(e) => setRegStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#f5f6f7] border border-[#ccd0d5] rounded-md focus:bg-white focus:outline-none focus:border-[#1877f2] font-mono"
                />
              </div>

              {/* Email */}
              <div>
                <input
                  type="email"
                  required
                  placeholder="Mobile number or email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#f5f6f7] border border-[#ccd0d5] rounded-md focus:bg-white focus:outline-none focus:border-[#1877f2]"
                />
              </div>

              {/* Password */}
              <div>
                <input
                  type="password"
                  required
                  placeholder="New password (Argon2 protected)"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#f5f6f7] border border-[#ccd0d5] rounded-md focus:bg-white focus:outline-none focus:border-[#1877f2]"
                />
              </div>

              {/* Program & Year */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="block text-[11px] text-[#606770] mb-1 font-medium">Academic Program</label>
                  <select
                    value={degreeProgram}
                    onChange={(e) => setDegreeProgram(e.target.value)}
                    className="w-full px-2 py-2 text-xs bg-[#f5f6f7] border border-[#ccd0d5] rounded-md focus:bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="BS Information Technology">BS IT</option>
                    <option value="BS Computer Science">BS CS</option>
                    <option value="BS Computer Engineering">BS CpE</option>
                    <option value="BS Information Systems">BS IS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-[#606770] mb-1 font-medium">Year Level</label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-2 py-2 text-xs bg-[#f5f6f7] border border-[#ccd0d5] rounded-md focus:bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="1st Year - Freshman">1st Year</option>
                    <option value="2nd Year - Sophomore">2nd Year</option>
                    <option value="3rd Year - Junior">3rd Year</option>
                    <option value="4th Year - Senior">4th Year</option>
                  </select>
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-[11px] text-[#777] leading-tight pt-1">
                By clicking Sign Up, you agree to VaultHub's Academic Data Security Terms, AES-256 Storage Policy, and Cookie Policy. Free 500 MB quota included.
              </p>

              {/* Green Sign Up button */}
              <div className="text-center pt-2 pb-1">
                <button
                  type="submit"
                  className="px-12 py-2 bg-[#00a400] hover:bg-[#008f00] text-white font-bold text-base sm:text-lg rounded-md transition-colors shadow-xs"
                >
                  Sign Up
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Facebook-style Minimalist Footer */}
      <footer className="bg-white py-6 border-t border-[#dadde1] text-[#737373] text-[11px] sm:text-xs">
        <div className="max-w-5xl mx-auto px-4 space-y-2">
          {/* Language bar */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pb-2 border-b border-[#dadde1]">
            <span className="text-[#385898]">English (US)</span>
            <span className="hover:underline cursor-pointer">Filipino</span>
            <span className="hover:underline cursor-pointer">Bisaya</span>
            <span className="hover:underline cursor-pointer">Español</span>
            <span className="hover:underline cursor-pointer">日本語</span>
            <span className="hover:underline cursor-pointer">한국어</span>
            <span className="hover:underline cursor-pointer">Français (France)</span>
            <span className="w-5 h-5 bg-[#f5f6f7] border border-[#ccd0d5] rounded flex items-center justify-center font-bold text-[#4b4f56] cursor-pointer">
              +
            </span>
          </div>

          {/* Links list */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
            <span className="hover:underline cursor-pointer">Sign Up</span>
            <span className="hover:underline cursor-pointer">Log In</span>
            <span className="hover:underline cursor-pointer">VaultHub Lite</span>
            <span className="hover:underline cursor-pointer">Transcripts</span>
            <span className="hover:underline cursor-pointer">Certificates</span>
            <span className="hover:underline cursor-pointer">Student ID Cards</span>
            <span className="hover:underline cursor-pointer">Clearance Manager</span>
            <span className="hover:underline cursor-pointer">AES-256 Security</span>
            <span className="hover:underline cursor-pointer">Argon2 Authentication</span>
            <span className="hover:underline cursor-pointer">Privacy Policy</span>
            <span className="hover:underline cursor-pointer">Academic Terms</span>
            <span className="hover:underline cursor-pointer">Help Center</span>
          </div>

          <div className="pt-2 text-[#737373]">
            VaultHub © 2026 · Student Document Vault System
          </div>
        </div>
      </footer>

    </div>
  );
};
