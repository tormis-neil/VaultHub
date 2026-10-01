import React from 'react';
import { ShieldCheck, LogOut, User, Lock, HardDrive, FileText, Activity } from 'lucide-react';
import { StudentUser } from '../types';

interface NavbarProps {
  user: StudentUser | null;
  activeTab: 'documents' | 'activity' | 'storage';
  onSelectTab: (tab: 'documents' | 'activity' | 'storage') => void;
  onOpenSecurityModal: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onUploadClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  onSelectTab,
  onOpenSecurityModal,
  onOpenAuthModal,
  onLogout,
  onUploadClick,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Zone 1: Brand Wordmark (Single text element) */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('documents')}
              className="flex items-center gap-2.5 text-left text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-semibold text-base shadow-sm">
                V
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                VaultHub
              </span>
            </button>
          </div>

          {/* Zone 2: 4 Clean Text Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <button
              onClick={() => onSelectTab('documents')}
              className={`flex items-center gap-1.5 transition-colors py-1 ${
                activeTab === 'documents'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Academic Documents</span>
            </button>

            <button
              onClick={() => onSelectTab('activity')}
              className={`flex items-center gap-1.5 transition-colors py-1 ${
                activeTab === 'activity'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Activity & Audit Trail</span>
            </button>

            <button
              onClick={() => onSelectTab('storage')}
              className={`flex items-center gap-1.5 transition-colors py-1 ${
                activeTab === 'storage'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HardDrive className="w-4 h-4" />
              <span>Storage Allocation</span>
            </button>

            <button
              onClick={onOpenSecurityModal}
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors py-1"
            >
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Security Architecture</span>
            </button>
          </nav>

          {/* Zone 3: 1-2 Primary Actions & User Identity */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button
                  onClick={onUploadClick}
                  className="hidden sm:inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors shadow-xs"
                >
                  Upload Document
                </button>

                <div className="flex items-center pl-2 border-l border-slate-200 gap-3">
                  <div className="hidden lg:flex flex-col text-right">
                    <span className="text-xs font-semibold text-slate-900 leading-tight">
                      {user.fullName}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      {user.studentId}
                    </span>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                    {user.avatarInitials}
                  </div>

                  <button
                    onClick={onLogout}
                    title="Log out of VaultHub"
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="sr-only">Log Out</span>
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Sub-Navigation bar */}
      <div className="md:hidden border-t border-slate-200 px-4 py-2 flex items-center justify-between text-xs font-medium bg-slate-50/90">
        <button
          onClick={() => onSelectTab('documents')}
          className={`py-1 ${activeTab === 'documents' ? 'text-indigo-600 font-semibold' : 'text-slate-600'}`}
        >
          Documents
        </button>
        <button
          onClick={() => onSelectTab('activity')}
          className={`py-1 ${activeTab === 'activity' ? 'text-indigo-600 font-semibold' : 'text-slate-600'}`}
        >
          Audit Logs
        </button>
        <button
          onClick={() => onSelectTab('storage')}
          className={`py-1 ${activeTab === 'storage' ? 'text-indigo-600 font-semibold' : 'text-slate-600'}`}
        >
          Storage
        </button>
        <button
          onClick={onOpenSecurityModal}
          className="text-emerald-700 py-1"
        >
          Security
        </button>
      </div>
    </header>
  );
};
