import React, { useState } from 'react';
import { 
  FolderLock, 
  Eye, 
  EyeOff, 
  X, 
  Plus, 
  Lock, 
  ShieldCheck, 
  CheckCircle2,
  HardDrive,
  GraduationCap
} from 'lucide-react';
import { StudentUser } from '../types';
import { DEMO_USERS } from '../data/mockData';
import { authApi } from '../api';

interface AuthPageProps {
  onLogin: (user: StudentUser) => void;
  onRegister: (newUser: StudentUser) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onRegister }) => {
  const [emailOrStudentId, setEmailOrStudentId] = useState('tormisneilmayo@gmail.com');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showForgotNotice, setShowForgotNotice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Register form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [degreeProgram, setDegreeProgram] = useState('BS Information Technology');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [academicYear, setAcademicYear] = useState('1st Year - Freshman');
  const [regError, setRegError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrStudentId.trim()) {
      setErrorMessage('Please enter your student email or ID number.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const user = await authApi.login({
        login: emailOrStudentId.trim(),
        password: password,
      });
      onLogin(user);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Invalid student credentials. Please verify your ID/email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectStudentClick = async (demoUser: StudentUser) => {
    setEmailOrStudentId(demoUser.email);
    setPassword('Password123!');
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const user = await authApi.login({
        login: demoUser.email,
        password: 'Password123!',
      });
      onLogin(user);
    } catch (err: any) {
      setErrorMessage(err?.message || `Sign in failed for ${demoUser.fullName}.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !registerEmail.trim() || !studentId.trim() || !registerPassword) {
      setRegError('Please complete all required fields.');
      return;
    }

    if (registerPassword.length < 8) {
      setRegError('Password must be at least 8 characters long.');
      return;
    }

    setRegError(null);
    setIsRegistering(true);

    try {
      const newUser = await authApi.register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: registerEmail.trim(),
        password: registerPassword,
        studentId: studentId.trim().toUpperCase(),
        degreeProgram,
        academicYear,
      });
      onRegister(newUser);
      setIsRegisterOpen(false);
    } catch (err: any) {
      setRegError(err?.message || 'Registration failed. Please review your details and try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans text-slate-900 antialiased selection:bg-indigo-500/20">
      
      {/* Main Content Area: Centered 2-column Facebook structural layout rendered in VaultHub's native theme */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 lg:py-20 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          
          {/* Left Column: Brand, Headline, and Recent Logins (Iconic Facebook sign-in structure) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* VaultHub Native Brand Header */}
            <div>
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
                  <FolderLock className="w-6 h-6" />
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
                  Vault<span className="text-indigo-600">Hub</span>
                </h1>
              </div>

              {/* Tagline / Value Sentence */}
              <p className="text-xl sm:text-2xl text-slate-700 font-normal leading-snug sm:leading-relaxed max-w-lg mx-auto lg:mx-0">
                VaultHub helps students securely store, organize, and access academic documents anywhere.
              </p>
            </div>

            {/* Recent Logins Structure (Structured directly from Facebook's multi-account sign-in feature) */}
            <div className="pt-2">
              <div className="mb-3">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Recent logins</h2>
                <p className="text-xs text-slate-500">Click your profile picture or enter your credentials.</p>
              </div>

              {/* Profile Account Cards Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-w-md mx-auto lg:mx-0">
                {DEMO_USERS.map((demoUser, idx) => (
                  <button
                    key={demoUser.id}
                    onClick={() => handleDirectStudentClick(demoUser)}
                    className="group bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-indigo-300 rounded-xl p-3 shadow-2xs hover:shadow-md transition-all text-left flex flex-col items-center sm:items-start text-center sm:text-left cursor-pointer relative overflow-hidden"
                  >
                    {/* Top Accent Bar on Hover */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Avatar Badge */}
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-indigo-50 to-indigo-100 border border-indigo-200/60 flex items-center justify-center font-bold text-indigo-700 text-base mb-2 group-hover:scale-105 transition-transform shadow-2xs">
                      {demoUser.avatarInitials}
                    </div>

                    <div className="w-full">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {demoUser.fullName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono truncate">
                        {demoUser.studentId}
                      </div>
                      <div className="mt-1.5 inline-block text-[10px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-100/80 px-1.5 py-0.5 rounded">
                        {idx === 0 ? 'Senior' : 'Junior'}
                      </div>
                    </div>
                  </button>
                ))}

                {/* Add Account Card */}
                <button
                  onClick={() => {
                    setEmailOrStudentId('');
                    setPassword('');
                    setIsRegisterOpen(true);
                  }}
                  className="bg-white hover:bg-slate-50 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-3 shadow-2xs hover:shadow-sm transition-all text-center flex flex-col items-center justify-center cursor-pointer group"
                >
                  <div className="w-14 h-14 rounded-xl bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 mb-2 transition-colors">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">
                    Add Account
                  </span>
                  <span className="text-[10px] text-slate-400">
                    New student
                  </span>
                </button>
              </div>
            </div>

            {/* Security Highlights (Quiet trust indicators) */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2.5 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-full text-slate-600 shadow-2xs">
                <Lock className="w-3 h-3 text-emerald-600" />
                AES-256 Storage
              </span>
              <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-full text-slate-600 shadow-2xs">
                <ShieldCheck className="w-3 h-3 text-indigo-600" />
                Argon2id Hashing
              </span>
              <span className="inline-flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-full text-slate-600 shadow-2xs">
                <HardDrive className="w-3 h-3 text-sky-600" />
                500 MB Free Tier
              </span>
            </div>

          </div>

          {/* Right Column: Sign In Card (Structured identical to Facebook's login card, using VaultHub's native colors) */}
          <div className="lg:col-span-5 max-w-[396px] w-full mx-auto">
            
            {/* The Floating Login Card Container */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xl border border-slate-200/90 space-y-4">
              
              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-start gap-2">
                  <X className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                
                {/* 1st Input: Email or Student ID */}
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Email address or student ID"
                    value={emailOrStudentId}
                    onChange={(e) => {
                      setEmailOrStudentId(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="w-full px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/10 transition-all"
                  />
                </div>

                {/* 2nd Input: Password */}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50/60 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-3 focus:ring-indigo-600/10 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Primary Action Button: Full-width in VaultHub Indigo */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 text-white font-bold text-base sm:text-lg rounded-xl transition-all shadow-xs hover:shadow active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    'Log In'
                  )}
                </button>

                {/* Forgotten Password Text Link */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForgotNotice(!showForgotNotice)}
                    className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-800 font-medium hover:underline transition-colors cursor-pointer"
                  >
                    Forgotten password?
                  </button>

                  {showForgotNotice && (
                    <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-left">
                      <p className="font-semibold text-slate-800 mb-1">Demo Student Accounts:</p>
                      <p>Click either profile in the "Recent logins" area to automatically log into the vault without a password.</p>
                    </div>
                  )}
                </div>

                {/* Horizontal Dividing Line (Classic Facebook structural separator) */}
                <div className="border-b border-slate-200 pt-1 pb-1" />

                {/* Secondary Action Button: Centered "Create new account" button in VaultHub Emerald Accent */}
                <div className="text-center pt-1 pb-1">
                  <button
                    type="button"
                    onClick={() => {
                      setRegError(null);
                      setIsRegisterOpen(true);
                    }}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-xs hover:shadow active:scale-[0.99] cursor-pointer inline-block"
                  >
                    Create new account
                  </button>
                </div>

              </form>

            </div>

          </div>

        </div>
      </main>

      {/* Registration Dialog Modal: Replicating Facebook's exact sign-up modal structure in VaultHub theme */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Modal Header: Title, subtitle, close button */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                  Sign Up
                </h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  It's quick and easy. Get your 500 MB secure academic vault.
                </p>
              </div>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleRegisterSubmit} className="p-5 space-y-3.5 text-xs">
              
              {regError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700">
                  {regError}
                </div>
              )}

              {/* Side-by-side First name and Surname */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Surname"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Student ID */}
              <div>
                <input
                  type="text"
                  required
                  placeholder="Student ID number (e.g. 2026-00189-MN)"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 font-mono"
                />
              </div>

              {/* University Email */}
              <div>
                <input
                  type="email"
                  required
                  placeholder="Institutional email address"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* Password */}
              <div>
                <input
                  type="password"
                  required
                  placeholder="New password (Argon2 protected)"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-600 font-mono"
                />
              </div>

              {/* Degree Program & Year Level Dropdowns */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Academic Program</label>
                  <select
                    value={degreeProgram}
                    onChange={(e) => setDegreeProgram(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none cursor-pointer text-slate-800"
                  >
                    <option value="BS Information Technology">BS Information Tech</option>
                    <option value="BS Computer Science">BS Computer Science</option>
                    <option value="BS Computer Engineering">BS Computer Eng</option>
                    <option value="BS Information Systems">BS Information Systems</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Year Level</label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none cursor-pointer text-slate-800"
                  >
                    <option value="1st Year - Freshman">1st Year (Freshman)</option>
                    <option value="2nd Year - Sophomore">2nd Year (Sophomore)</option>
                    <option value="3rd Year - Junior">3rd Year (Junior)</option>
                    <option value="4th Year - Senior">4th Year (Senior)</option>
                  </select>
                </div>
              </div>

              {/* Terms and Privacy policy notice */}
              <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                By clicking Sign Up, you agree to VaultHub's Academic Data Security Terms and AES-256 Storage Policy.
              </p>

              {/* Centered Sign Up Button in Emerald */}
              <div className="text-center pt-2 pb-1">
                <button
                  type="submit"
                  disabled={isRegistering}
                  className="px-10 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-all shadow-xs hover:shadow cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  {isRegistering ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating vault...</span>
                    </>
                  ) : (
                    'Sign Up'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Sign Up Modal Dialog */}

    </div>
  );
};
