import React, { useState } from 'react';
import { X, Lock, KeyRound, Mail, User, ShieldCheck } from 'lucide-react';
import { StudentUser } from '../types';
import { DEMO_USERS } from '../data/mockData';
import { authApi } from '../api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: StudentUser) => void;
  onRegister: (newUser: StudentUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
}) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  // Login fields
  const [emailOrId, setEmailOrId] = useState('tormisneilmayo@gmail.com');
  const [password, setPassword] = useState('••••••••••••');

  // Register fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [degreeProgram, setDegreeProgram] = useState('BS Information Technology');
  const [registerPassword, setRegisterPassword] = useState('');
  const [academicYear, setAcademicYear] = useState('1st Year - Freshman');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const pwd = password === '••••••••••••' ? 'Password123!' : password;
      const user = await authApi.login({
        login: emailOrId.trim(),
        password: pwd,
      });
      onLogin(user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !studentId.trim() || !registerEmail.trim() || !registerPassword) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (registerPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);
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
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      
      {!isRegisterMode ? (
        /* Facebook-style Login Box in Modal */
        <div className="bg-white rounded-lg max-w-[396px] w-full shadow-2xl border border-slate-200 p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-[#606770] hover:text-slate-800 p-1 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center pb-4 pt-1">
            <h2 className="text-3xl font-extrabold text-[#1877f2] lowercase tracking-tight">
              vaulthub
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Sign in to access your secure academic vault
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <input
                type="text"
                required
                placeholder="Email address or Student ID"
                value={emailOrId}
                onChange={(e) => setEmailOrId(e.target.value)}
                className="w-full px-4 py-3 text-[15px] bg-white border border-[#ccd0d5] rounded-md focus:outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2]"
              />
            </div>

            <div>
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 text-[15px] bg-white border border-[#ccd0d5] rounded-md focus:outline-none focus:border-[#1877f2] focus:ring-1 focus:ring-[#1877f2]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#1877f2] hover:bg-[#166fe5] text-white font-bold text-lg rounded-md transition-colors shadow-xs"
            >
              Log In
            </button>

            <div className="text-center pt-1">
              <span className="text-xs text-[#1877f2] hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>

            <div className="border-b border-[#dadde1] my-3" />

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setIsRegisterMode(true);
                }}
                className="px-5 py-2.5 bg-[#42b72a] hover:bg-[#36a420] text-white font-bold text-sm rounded-md transition-colors shadow-xs"
              >
                Create New Account
              </button>
            </div>
          </form>

          {/* Quick Demo profiles */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400 block mb-1.5 text-center">
              Quick Demo Accounts
            </span>
            <div className="space-y-1">
              {DEMO_USERS.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    onLogin(u);
                    onClose();
                  }}
                  className="w-full p-2 text-left bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 text-xs flex justify-between items-center transition-colors"
                >
                  <span className="font-semibold text-slate-800">{u.fullName}</span>
                  <span className="text-[10px] text-indigo-600 font-medium">Use demo</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Facebook-style Sign Up Dialog */
        <div className="bg-white rounded-lg max-w-[432px] w-full shadow-2xl border border-slate-300 overflow-hidden">
          <div className="p-4 border-b border-[#dadde1] flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#1c1e21] leading-none">
                Sign Up
              </h2>
              <p className="text-[#606770] text-xs mt-1">
                It's quick and easy.
              </p>
            </div>
            <button
              onClick={() => setIsRegisterMode(false)}
              className="text-[#606770] hover:text-[#1c1e21] p-1 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleRegisterSubmit} className="p-4 space-y-3 text-xs">
            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-rose-700">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                required
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#f5f6f7] border border-[#ccd0d5] rounded-md focus:bg-white focus:outline-none focus:border-[#1877f2]"
              />
              <input
                type="text"
                required
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#f5f6f7] border border-[#ccd0d5] rounded-md focus:bg-white focus:outline-none focus:border-[#1877f2]"
              />
            </div>

            <div>
              <input
                type="text"
                required
                placeholder="Student ID (e.g. 2026-00123-MN)"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#f5f6f7] border border-[#ccd0d5] rounded-md focus:bg-white focus:outline-none focus:border-[#1877f2] font-mono"
              />
            </div>

            <div>
              <input
                type="email"
                required
                placeholder="Mobile number or email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#f5f6f7] border border-[#ccd0d5] rounded-md focus:bg-white focus:outline-none focus:border-[#1877f2]"
              />
            </div>

            <div>
              <input
                type="password"
                required
                placeholder="New password (Argon2 protected)"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#f5f6f7] border border-[#ccd0d5] rounded-md focus:bg-white focus:outline-none focus:border-[#1877f2]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-[#606770] mb-0.5">Program</label>
                <select
                  value={degreeProgram}
                  onChange={(e) => setDegreeProgram(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-[#f5f6f7] border border-[#ccd0d5] rounded-md focus:bg-white cursor-pointer"
                >
                  <option value="BS Information Technology">BS IT</option>
                  <option value="BS Computer Science">BS CS</option>
                  <option value="BS Computer Engineering">BS CpE</option>
                  <option value="BS Information Systems">BS IS</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-[#606770] mb-0.5">Year Level</label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-[#f5f6f7] border border-[#ccd0d5] rounded-md focus:bg-white cursor-pointer"
                >
                  <option value="1st Year - Freshman">1st Year</option>
                  <option value="2nd Year - Sophomore">2nd Year</option>
                  <option value="3rd Year - Junior">3rd Year</option>
                  <option value="4th Year - Senior">4th Year</option>
                </select>
              </div>
            </div>

            <p className="text-[10px] text-[#777] leading-tight">
              By clicking Sign Up, you agree to VaultHub's Academic Data Security Terms and AES-256 Storage Policy.
            </p>

            <div className="text-center pt-2">
              <button
                type="submit"
                className="px-10 py-2 bg-[#00a400] hover:bg-[#008f00] text-white font-bold text-sm rounded-md transition-colors shadow-xs"
              >
                Sign Up
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
