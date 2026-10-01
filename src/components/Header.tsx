import React, { useRef, useState, useEffect } from 'react';
import { 
  Search, 
  Menu, 
  ShieldCheck, 
  X,
  ChevronDown,
  User,
  LogOut,
  HardDrive,
  Star,
  Clock
} from 'lucide-react';
import { StudentUser } from '../types';
import { formatBytes } from '../utils/formatters';

interface HeaderProps {
  user: StudentUser | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenMobileMenu: () => void;
  onNavigateProfile?: () => void;
  onNavigateStorage?: () => void;
  onNavigateActivity?: () => void;
  onNavigateStarred?: () => void;
  onOpenSecurity?: () => void;
  onOpenUpload?: () => void;
  onOpenAuth?: () => void;
  onLogout?: () => void;
  totalUsedBytes?: number;
  isEncryptedActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  searchQuery,
  onSearchChange,
  onOpenMobileMenu,
  onNavigateProfile,
  onNavigateStorage,
  onNavigateActivity,
  onNavigateStarred,
  onOpenSecurity,
  onOpenAuth,
  onLogout,
  totalUsedBytes = 0,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const totalQuota = user?.storageQuotaBytes || 500 * 1024 * 1024;
  const storagePercent = Math.min(100, Math.round((totalUsedBytes / totalQuota) * 100));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDropdownOpen]);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Mobile hamburger & Context breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-900">Academic Repository</span>
            <span className="text-slate-300">/</span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-100">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>AES-256 Vault Active</span>
            </div>
          </div>
        </div>

        {/* Center: Sleek Quick Search Bar */}
        <div className="flex-1 max-w-xl mx-auto">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search academic documents, certificates, grades, tags..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {searchQuery ? (
              <button
                onClick={() => {
                  onSearchChange('');
                  searchInputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="hidden md:inline-block absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 border border-slate-200 bg-white px-1.5 py-0.5 rounded">
                ⌘K
              </span>
            )}
          </div>
        </div>

        {/* Right: Google Drive-like Profile Avatar Dropdown */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                aria-expanded={isDropdownOpen}
                aria-haspopup="true"
                title={`${user.fullName} (${user.studentId})`}
                className={`flex items-center gap-2 p-1 sm:pl-2 sm:pr-2.5 rounded-full border transition-all cursor-pointer select-none ${
                  isDropdownOpen
                    ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shadow-xs ring-1 ring-indigo-300/40">
                  {user.avatarInitials}
                </div>
                <div className="hidden sm:flex flex-col text-left leading-tight pr-0.5">
                  <span className="text-xs font-semibold text-slate-800 truncate max-w-[120px]">
                    {user.fullName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                    {user.studentId}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-indigo-600' : ''}`} />
              </button>

              {/* Dropdown Card */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2.5 w-80 sm:w-88 bg-white rounded-3xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-800">
                  
                  {/* Top Profile Card (Google Account style) */}
                  <div className="p-5 text-center bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 flex flex-col items-center">
                    {/* Large Avatar */}
                    <div className="relative mb-3">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-800 text-white font-bold text-xl flex items-center justify-center shadow-md ring-4 ring-indigo-50">
                        {user.avatarInitials}
                      </div>
                      <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="Active Vault Session" />
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {user.fullName}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 truncate max-w-[260px]">
                      {user.email || `${user.studentId.toLowerCase()}@university.edu`}
                    </p>

                    {/* Student ID & Degree Pill */}
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200/80 rounded-full text-[11px] font-mono text-slate-600">
                      <span className="font-semibold text-indigo-600">{user.studentId}</span>
                      <span>·</span>
                      <span className="truncate max-w-[140px]">{user.degreeProgram || 'Student Vault'}</span>
                    </div>

                    {/* Manage Student Account Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onNavigateProfile?.();
                      }}
                      className="mt-3.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-white hover:bg-slate-50 border border-slate-300 hover:border-indigo-300 rounded-full transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>Manage your Student Account</span>
                    </button>
                  </div>

                  {/* Storage Mini Bar */}
                  <div className="p-4 bg-slate-50/70 border-b border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                        <span>Vault Storage</span>
                      </span>
                      <span className="font-mono text-[11px] text-slate-500 font-medium">
                        {storagePercent}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                        style={{ width: `${storagePercent}%` }}
                      />
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-mono">{formatBytes(totalUsedBytes)} of {formatBytes(totalQuota)}</span>
                      {onNavigateStorage && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onNavigateStorage();
                          }}
                          className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline cursor-pointer"
                        >
                          Storage details
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Quick Navigation Items */}
                  <div className="p-2 space-y-0.5">
                    {onNavigateStarred && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onNavigateStarred();
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                          <span>Starred & Important Documents</span>
                        </div>
                      </button>
                    )}

                    {onOpenSecurity && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onOpenSecurity();
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Vault Security & Encryption</span>
                        </div>
                        <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium border border-emerald-200/50">
                          AES-256
                        </span>
                      </button>
                    )}

                    {onNavigateActivity && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          onNavigateActivity();
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <Clock className="w-4 h-4 text-slate-500" />
                          <span>Activity & Audit History</span>
                        </div>
                      </button>
                    )}
                  </div>

                  {/* Footer: Sign Out */}
                  <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onLogout?.();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out of VaultHub</span>
                    </button>
                  </div>

                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="py-1.5 px-3.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-200 cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
