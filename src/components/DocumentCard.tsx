import React from 'react';
import { 
  FileSpreadsheet, 
  Award, 
  FileText, 
  CreditCard, 
  CheckCircle2, 
  Star, 
  Download, 
  Eye, 
  MoreVertical, 
  Lock,
  Trash2,
  Calendar,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { VaultDocument, DocumentCategory } from '../types';
import { formatBytes, formatDate } from '../utils/formatters';

interface DocumentCardProps {
  document: VaultDocument;
  onView: (doc: VaultDocument) => void;
  onDownload: (doc: VaultDocument) => void;
  onDelete: (doc: VaultDocument) => void;
  onToggleStar: (docId: string) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document: doc,
  onView,
  onDownload,
  onDelete,
  onToggleStar,
}) => {
  const getCategoryTheme = (category: DocumentCategory) => {
    switch (category) {
      case 'Transcripts':
        return {
          icon: <FileSpreadsheet className="w-4 h-4 text-indigo-600" />,
          accent: 'border-indigo-100 hover:border-indigo-300',
          previewBg: 'bg-indigo-50/50',
        };
      case 'Certificates':
        return {
          icon: <Award className="w-4 h-4 text-sky-600" />,
          accent: 'border-sky-100 hover:border-sky-300',
          previewBg: 'bg-sky-50/50',
        };
      case 'Resumes':
        return {
          icon: <FileText className="w-4 h-4 text-amber-600" />,
          accent: 'border-amber-100 hover:border-amber-300',
          previewBg: 'bg-amber-50/50',
        };
      case 'Identification Cards':
        return {
          icon: <CreditCard className="w-4 h-4 text-emerald-600" />,
          accent: 'border-emerald-100 hover:border-emerald-300',
          previewBg: 'bg-emerald-50/50',
        };
      case 'Clearances':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-purple-600" />,
          accent: 'border-purple-100 hover:border-purple-300',
          previewBg: 'bg-purple-50/50',
        };
    }
  };

  const theme = getCategoryTheme(doc.category);

  // Render creative visual thumbnail depending on type
  const renderVisualPreview = () => {
    if (doc.category === 'Transcripts') {
      return (
        <div className="h-32 w-full bg-white border border-slate-200/90 rounded-t-lg p-3 font-mono text-[9px] text-slate-500 overflow-hidden relative select-none">
          <div className="flex justify-between items-center pb-1.5 border-b border-slate-200">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[8px]">OFFICIAL TRANSCRIPT</span>
            <span className="text-indigo-600 font-bold bg-indigo-50 px-1 rounded">GPA: 1.22</span>
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between text-slate-700 font-medium">
              <span>IT 401 Info Assurance</span>
              <span className="text-emerald-600 font-bold">1.25</span>
            </div>
            <div className="flex justify-between text-slate-700 font-medium">
              <span>IT 402 Capstone Project</span>
              <span className="text-emerald-600 font-bold">1.00</span>
            </div>
            <div className="flex justify-between text-slate-700 font-medium">
              <span>IT 403 SysAdmin & Maint</span>
              <span className="text-emerald-600 font-bold">1.25</span>
            </div>
          </div>
          {/* Subtle dry seal watermark */}
          <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full border border-indigo-200/60 flex items-center justify-center text-[7px] text-indigo-400 rotate-12">
            REGISTRAR
          </div>
        </div>
      );
    }

    if (doc.category === 'Certificates') {
      return (
        <div className="h-32 w-full bg-amber-50/40 border border-amber-200/80 rounded-t-lg p-3 relative flex flex-col justify-between items-center text-center select-none overflow-hidden">
          <div className="text-[8px] font-bold tracking-widest text-amber-800 uppercase">
            CERTIFICATE OF EXCELLENCE
          </div>
          <div className="my-auto">
            <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 mx-auto flex items-center justify-center text-amber-700 mb-1">
              <Award className="w-4 h-4" />
            </div>
            <p className="text-[9px] font-semibold text-slate-800 line-clamp-1">{doc.title}</p>
          </div>
          <div className="w-full flex justify-between items-center text-[8px] text-slate-400 pt-1 border-t border-amber-200/60">
            <span>Dean's Honor</span>
            <span className="font-mono text-amber-700 font-semibold">VERIFIED</span>
          </div>
        </div>
      );
    }

    if (doc.category === 'Identification Cards') {
      return (
        <div className="h-32 w-full bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-t-lg p-3 relative flex flex-col justify-between select-none">
          <div className="flex justify-between items-center">
            <span className="text-[8px] font-bold text-indigo-400 tracking-wider">STUDENT ID</span>
            <span className="text-[7px] font-mono text-emerald-400">RFID ENABLED</span>
          </div>
          <div className="flex items-center gap-2.5 my-1">
            <div className="w-9 h-11 bg-slate-700 rounded border border-slate-600 flex items-center justify-center text-[8px] text-slate-400 font-medium">
              PHOTO
            </div>
            <div>
              <div className="text-[10px] font-bold text-white leading-tight">NEIL M. TORMIS</div>
              <div className="text-[8px] text-slate-400 font-mono">2023-01894-MN</div>
              <div className="text-[8px] text-slate-300">BS Info Tech</div>
            </div>
          </div>
          <div className="text-[7px] text-slate-400 font-mono flex justify-between border-t border-slate-700/60 pt-1">
            <span>BARCODE: |||| ||| ||||</span>
            <span>2023-2027</span>
          </div>
        </div>
      );
    }

    if (doc.category === 'Resumes') {
      return (
        <div className="h-32 w-full bg-white border border-slate-200/90 rounded-t-lg p-3 font-sans text-[8px] text-slate-600 overflow-hidden relative select-none">
          <div className="border-b border-slate-200 pb-1 mb-1.5">
            <div className="font-bold text-slate-900 text-[10px]">Neil Mayo Tormis</div>
            <div className="text-indigo-600 font-medium text-[8px]">Software Engineer & IT Specialist</div>
          </div>
          <div className="space-y-1 text-slate-500">
            <div className="font-semibold text-slate-700 text-[8px]">EDUCATION & SKILLS</div>
            <div className="truncate">React, TypeScript, Django REST, AES-256</div>
            <div className="font-semibold text-slate-700 text-[8px] mt-1">FEATURED WORK</div>
            <div className="truncate">VaultHub - Encrypted Student Cloud</div>
          </div>
        </div>
      );
    }

    // Default Clearance Preview
    return (
      <div className="h-32 w-full bg-purple-50/40 border border-purple-200/80 rounded-t-lg p-3 relative flex flex-col justify-between select-none">
        <div className="flex justify-between items-center text-[8px] font-bold text-purple-900">
          <span>CLEARANCE CHECKLIST</span>
          <span className="text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200 font-bold">100% CLEARED</span>
        </div>
        <div className="space-y-1 text-[8px] text-slate-700 my-auto">
          <div className="flex items-center gap-1.5"><CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Library Clearance</div>
          <div className="flex items-center gap-1.5"><CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Science Lab Clearance</div>
          <div className="flex items-center gap-1.5"><CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> Student Affairs Clearance</div>
        </div>
        <div className="text-[8px] text-slate-400 pt-1 border-t border-purple-100 flex justify-between">
          <span>Signed: Dean of Students</span>
          <span className="font-mono">VALID</span>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white border rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group ${theme.accent}`}>
      
      {/* Top Visual Area with Overlay Action Buttons */}
      <div className="relative">
        {renderVisualPreview()}

        {/* Hover / Direct Actions floating on top */}
        <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar(doc.id);
            }}
            title={doc.isStarred ? 'Remove from Starred & Important' : 'Mark as Starred & Important'}
            className={`p-1.5 rounded-full backdrop-blur-xs shadow-xs transition-all cursor-pointer ${
              doc.isStarred 
                ? 'bg-amber-50 text-amber-500 border border-amber-200 hover:bg-amber-100' 
                : 'bg-white/95 text-slate-400 hover:text-amber-500 border border-slate-200/80 hover:bg-white'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${doc.isStarred ? 'text-amber-500 fill-amber-500' : ''}`} />
          </button>
        </div>

        {/* Quiet Security Tag */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/95 backdrop-blur-xs text-slate-700 text-[10px] px-2 py-0.5 rounded-full shadow-xs border border-slate-200 font-medium">
          <Lock className="w-2.5 h-2.5 text-emerald-600" />
          <span>Encrypted</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Date */}
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-medium text-slate-600">{doc.category}</span>
            <span>{formatDate(doc.uploadDate)}</span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onView(doc)}
            className="mt-1 font-semibold text-slate-900 text-sm line-clamp-1 hover:text-indigo-600 cursor-pointer transition-colors"
            title={doc.title}
          >
            {doc.title}
          </h3>

          {/* Issuing Authority */}
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-500 truncate">
            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{doc.issuingAuthority}</span>
          </div>
        </div>

        {/* Footer with File Size & Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400 tabular-nums">
            {formatBytes(doc.fileSizeBytes)}
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onView(doc)}
              className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              Open
            </button>
            <button
              onClick={() => onDownload(doc)}
              title="Download file"
              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(doc)}
              title="Delete document"
              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
