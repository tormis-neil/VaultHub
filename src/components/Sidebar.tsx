import React from 'react';
import { 
  FolderLock, 
  FileText, 
  Award, 
  FileSpreadsheet, 
  CreditCard, 
  CheckCircle2, 
  Star, 
  Clock, 
  HardDrive, 
  ShieldCheck, 
  Plus, 
  Layers,
  Database
} from 'lucide-react';
import { DocumentCategory, StudentUser, VaultDocument } from '../types';
import { formatBytes } from '../utils/formatters';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  selectedCategory: DocumentCategory | 'ALL';
  onSelectCategory: (category: DocumentCategory | 'ALL') => void;
  documents: VaultDocument[];
  user: StudentUser | null;
  onOpenUpload: () => void;
  onOpenSecurity: () => void;
  onOpenAuth?: () => void;
  onLogout?: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  selectedCategory,
  onSelectCategory,
  documents,
  user,
  onOpenUpload,
  onOpenSecurity,
  isMobileOpen,
  onCloseMobile,
}) => {
  const totalUsedBytes = documents.reduce((acc, doc) => acc + doc.fileSizeBytes, 0);
  const totalQuota = user?.storageQuotaBytes || 500 * 1024 * 1024;
  const storagePercent = Math.min(100, Math.round((totalUsedBytes / totalQuota) * 100));

  const starredCount = documents.filter((d) => d.isStarred).length;

  const categories: { label: DocumentCategory; icon: React.ReactNode; color: string }[] = [
    { label: 'Transcripts', icon: <FileSpreadsheet className="w-4 h-4" />, color: 'text-indigo-600' },
    { label: 'Certificates', icon: <Award className="w-4 h-4" />, color: 'text-sky-600' },
    { label: 'Resumes', icon: <FileText className="w-4 h-4" />, color: 'text-amber-600' },
    { label: 'Identification Cards', icon: <CreditCard className="w-4 h-4" />, color: 'text-emerald-600' },
    { label: 'Clearances', icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-purple-600' },
  ];

  const handleNavClick = (view: string, cat: DocumentCategory | 'ALL' = 'ALL') => {
    onSelectView(view);
    onSelectCategory(cat);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 z-50 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <FolderLock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-900 tracking-tight block">VaultHub</span>
              <span className="text-[11px] font-medium text-slate-400 block -mt-0.5">Student Cloud Storage</span>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="p-4">
          <button
            onClick={() => {
              onOpenUpload();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-xs transition-all hover:shadow hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>

        {/* Scrollable Navigation - Purely Folders, Categories, and Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
          
          {/* Main Navigation Views */}
          <div className="space-y-1">
            <button
              onClick={() => handleNavClick('documents', 'ALL')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                currentView === 'documents' && selectedCategory === 'ALL'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-slate-500" />
                <span>All Documents</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">{documents.length}</span>
            </button>

            <button
              onClick={() => handleNavClick('starred')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                currentView === 'starred'
                  ? 'bg-amber-50 text-amber-800 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                <span>Starred & Important</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">{starredCount}</span>
            </button>

            <button
              onClick={() => handleNavClick('activity')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                currentView === 'activity'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>Activity & History</span>
              </div>
            </button>
          </div>

          {/* Academic Categories / Folders */}
          <div>
            <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Document Folders
            </div>
            <div className="space-y-0.5">
              {categories.map((cat) => {
                const count = documents.filter((d) => d.category === cat.label).length;
                const isSelected = currentView === 'documents' && selectedCategory === cat.label;
                return (
                  <button
                    key={cat.label}
                    onClick={() => handleNavClick('documents', cat.label)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={cat.color}>{cat.icon}</span>
                      <span className="truncate">{cat.label}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Storage & Account */}
          <div>
            <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Account & Storage
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => handleNavClick('storage')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  currentView === 'storage'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <HardDrive className="w-4 h-4 text-slate-500" />
                  <span>Storage Overview</span>
                </div>
              </button>

              <button
                onClick={() => {
                  onOpenSecurity();
                  onCloseMobile();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Privacy & Security</span>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-medium px-1.5 py-0.5 rounded">AES-256</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Storage Overview Widget */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div 
            onClick={() => handleNavClick('storage')}
            className="cursor-pointer group p-2.5 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 transition-all"
            title="Click to view full storage analytics"
          >
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5 font-medium">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
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
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>{formatBytes(totalUsedBytes)} used</span>
              <span>{formatBytes(totalQuota)}</span>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
};
