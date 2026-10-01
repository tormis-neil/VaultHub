import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  GraduationCap, 
  Calendar, 
  CreditCard, 
  HardDrive, 
  Edit2, 
  Check, 
  X, 
  LogOut, 
  Trash2, 
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import { StudentUser } from '../types';
import { formatBytes } from '../utils/formatters';

interface ProfileViewProps {
  user: StudentUser;
  totalUsedBytes: number;
  onUpdateUser: (updatedUser: StudentUser) => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  totalUsedBytes,
  onUpdateUser,
  onLogout,
  onDeleteAccount,
}) => {
  // Individual field editing states
  const [editingField, setEditingField] = useState<string | null>(null);

  // Field values during edit
  const [fullName, setFullName] = useState(user.fullName);
  const [studentId, setStudentId] = useState(user.studentId);
  const [email, setEmail] = useState(user.email);
  const [degreeProgram, setDegreeProgram] = useState(user.degreeProgram);
  const [academicYear, setAcademicYear] = useState(user.academicYear);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');

  const calculateInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase();
    }
    return (name.slice(0, 2) || 'ST').toUpperCase();
  };

  const handleSaveField = (field: 'fullName' | 'studentId' | 'email' | 'degreeProgram' | 'academicYear') => {
    let updated: StudentUser = { ...user };

    if (field === 'fullName') {
      if (!fullName.trim()) return;
      updated.fullName = fullName.trim();
      updated.avatarInitials = calculateInitials(fullName.trim());
    } else if (field === 'studentId') {
      if (!studentId.trim()) return;
      updated.studentId = studentId.trim().toUpperCase();
    } else if (field === 'email') {
      if (!email.trim()) return;
      updated.email = email.trim();
    } else if (field === 'degreeProgram') {
      if (!degreeProgram.trim()) return;
      updated.degreeProgram = degreeProgram.trim();
    } else if (field === 'academicYear') {
      if (!academicYear.trim()) return;
      updated.academicYear = academicYear.trim();
    }

    onUpdateUser(updated);
    setEditingField(null);
  };

  const handleCancelField = (field: string) => {
    if (field === 'fullName') setFullName(user.fullName);
    if (field === 'studentId') setStudentId(user.studentId);
    if (field === 'email') setEmail(user.email);
    if (field === 'degreeProgram') setDegreeProgram(user.degreeProgram);
    if (field === 'academicYear') setAcademicYear(user.academicYear);
    setEditingField(null);
  };

  const handleConfirmDelete = () => {
    setIsDeleteModalOpen(false);
    onDeleteAccount();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* Profile Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white font-bold text-2xl flex items-center justify-center shadow-sm shrink-0">
            {user.avatarInitials}
          </div>

          <div className="text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{user.fullName}</h1>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{user.studentId}</p>
              </div>

              {/* Sign Out Button in Profile Header */}
              <button
                type="button"
                onClick={onLogout}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-600">
              <span className="bg-indigo-50 text-indigo-700 border border-indigo-100/80 px-2.5 py-1 rounded-md font-medium">
                {user.degreeProgram}
              </span>
              <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium">
                {user.academicYear}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* User Information: Individual Editable Fields */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">Personal & Academic Details</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View and manage your student profile information. You can edit each field individually.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          
          {/* Field 1: Full Name */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="sm:w-1/3">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Full Name
              </span>
            </div>

            <div className="sm:w-2/3 flex items-center justify-between gap-3">
              {editingField === 'fullName' ? (
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-indigo-600 font-medium"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveField('fullName')}
                    className="p-1.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
                    title="Save"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleCancelField('fullName')}
                    className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-xs font-semibold text-slate-800">{user.fullName}</span>
                  <button
                    onClick={() => {
                      setFullName(user.fullName);
                      setEditingField('fullName');
                    }}
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Field 2: Student ID */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="sm:w-1/3">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                Student ID
              </span>
            </div>

            <div className="sm:w-2/3 flex items-center justify-between gap-3">
              {editingField === 'studentId' ? (
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-indigo-600 font-mono"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveField('studentId')}
                    className="p-1.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
                    title="Save"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleCancelField('studentId')}
                    className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-xs font-mono font-semibold text-slate-800">{user.studentId}</span>
                  <button
                    onClick={() => {
                      setStudentId(user.studentId);
                      setEditingField('studentId');
                    }}
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Field 3: Email */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="sm:w-1/3">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Institutional Email
              </span>
            </div>

            <div className="sm:w-2/3 flex items-center justify-between gap-3">
              {editingField === 'email' ? (
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-indigo-600"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveField('email')}
                    className="p-1.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
                    title="Save"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleCancelField('email')}
                    className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-xs font-semibold text-slate-800">{user.email}</span>
                  <button
                    onClick={() => {
                      setEmail(user.email);
                      setEditingField('email');
                    }}
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Field 4: Degree Program */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="sm:w-1/3">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                Degree Program
              </span>
            </div>

            <div className="sm:w-2/3 flex items-center justify-between gap-3">
              {editingField === 'degreeProgram' ? (
                <div className="flex items-center gap-2 w-full">
                  <select
                    value={degreeProgram}
                    onChange={(e) => setDegreeProgram(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-indigo-600 cursor-pointer"
                  >
                    <option value="BS Information Technology">BS Information Technology</option>
                    <option value="BS Computer Science">BS Computer Science</option>
                    <option value="BS Computer Engineering">BS Computer Engineering</option>
                    <option value="BS Information Systems">BS Information Systems</option>
                  </select>
                  <button
                    onClick={() => handleSaveField('degreeProgram')}
                    className="p-1.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
                    title="Save"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleCancelField('degreeProgram')}
                    className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-xs font-semibold text-slate-800">{user.degreeProgram}</span>
                  <button
                    onClick={() => {
                      setDegreeProgram(user.degreeProgram);
                      setEditingField('degreeProgram');
                    }}
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Field 5: Academic Year */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="sm:w-1/3">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Academic Year Level
              </span>
            </div>

            <div className="sm:w-2/3 flex items-center justify-between gap-3">
              {editingField === 'academicYear' ? (
                <div className="flex items-center gap-2 w-full">
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:border-indigo-600 cursor-pointer"
                  >
                    <option value="1st Year - Freshman">1st Year - Freshman</option>
                    <option value="2nd Year - Sophomore">2nd Year - Sophomore</option>
                    <option value="3rd Year - Junior">3rd Year - Junior</option>
                    <option value="4th Year - Senior">4th Year - Senior</option>
                  </select>
                  <button
                    onClick={() => handleSaveField('academicYear')}
                    className="p-1.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
                    title="Save"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleCancelField('academicYear')}
                    className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-xs font-semibold text-slate-800">{user.academicYear}</span>
                  <button
                    onClick={() => {
                      setAcademicYear(user.academicYear);
                      setEditingField('academicYear');
                    }}
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Storage Quota (View-only) */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="sm:w-1/3">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                Allocated Vault Storage
              </span>
            </div>

            <div className="sm:w-2/3 flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-slate-800">
                {formatBytes(totalUsedBytes)} used of {formatBytes(user.storageQuotaBytes)} (Academic Tier)
              </span>
              <span className="text-[11px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                Active
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Danger Zone: Delete Account */}
      <div className="bg-white border border-rose-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Delete Student Account
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Permanently delete your student profile, all associated documents, and AES-256 encrypted records. This action cannot be reversed.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              setConfirmInput('');
              setIsDeleteModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete My Account</span>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Are you sure you want to delete your account?</h3>
                <p className="text-xs text-slate-500">
                  This will permanently delete the vault for <strong className="text-slate-800">{user.fullName}</strong> (<span className="font-mono">{user.studentId}</span>). All your stored transcripts, certificates, and academic documents will be removed.
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
                <p className="font-semibold text-slate-800">Please confirm by typing your Student ID:</p>
                <div className="font-mono text-slate-900 bg-white p-2 rounded border border-slate-200 text-center font-bold">
                  {user.studentId}
                </div>
                <input
                  type="text"
                  placeholder="Type your student ID to confirm"
                  value={confirmInput}
                  onChange={(e) => setConfirmInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-rose-600 font-mono text-center uppercase"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={confirmInput.trim().toUpperCase() !== user.studentId.trim().toUpperCase()}
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors cursor-pointer"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
