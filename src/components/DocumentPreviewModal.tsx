import React, { useState } from 'react';
import { 
  X, 
  Download, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  Copy, 
  Check, 
  Award, 
  FileSpreadsheet, 
  CreditCard,
  Building2,
  Calendar,
  Lock,
  Share2,
  HardDrive,
  Star
} from 'lucide-react';
import { VaultDocument } from '../types';
import { formatBytes, formatDate, truncateHash } from '../utils/formatters';

interface DocumentPreviewModalProps {
  document: VaultDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (doc: VaultDocument) => void;
  onToggleStar: (docId: string) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document: doc,
  isOpen,
  onClose,
  onDownload,
  onToggleStar,
}) => {
  const [copiedHash, setCopiedHash] = useState(false);
  const [showSecurityDetails, setShowSecurityDetails] = useState(false);

  if (!isOpen || !doc) return null;

  const handleCopyHash = () => {
    navigator.clipboard.writeText(doc.checksumSHA256);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              {doc.category === 'Transcripts' && <FileSpreadsheet className="w-5 h-5" />}
              {doc.category === 'Certificates' && <Award className="w-5 h-5" />}
              {doc.category === 'Resumes' && <FileText className="w-5 h-5" />}
              {doc.category === 'Identification Cards' && <CreditCard className="w-5 h-5" />}
              {doc.category === 'Clearances' && <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate-900 truncate">
                {doc.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>{doc.category}</span>
                <span>·</span>
                <span className="font-mono">{formatBytes(doc.fileSizeBytes)}</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>Encrypted</span>
                </span>
                {doc.isStarred && (
                  <>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 rounded text-[11px] font-semibold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      <span>Important</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mark as Starred & Important Button */}
            <button
              type="button"
              onClick={() => onToggleStar(doc.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                doc.isStarred
                  ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs'
              }`}
              title={doc.isStarred ? 'Remove from Starred & Important' : 'Mark as Starred & Important'}
            >
              <Star className={`w-3.5 h-3.5 transition-colors ${doc.isStarred ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">{doc.isStarred ? 'Starred & Important' : 'Star & Important'}</span>
            </button>

            <button
              onClick={() => onDownload(doc)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/70 space-y-6">
          
          {/* Main Document Render */}
          <div className="max-w-2xl mx-auto">
            {doc.category === 'Transcripts' ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
                <div className="text-center pb-5 border-b border-slate-100">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Office of the University Registrar</div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">OFFICIAL TRANSCRIPT OF RECORDS</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Bachelor of Science in Information Technology</p>
                </div>

                <div className="my-5 grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                  <div><span className="text-slate-400">Student:</span> <strong className="text-slate-900">Neil Mayo Tormis</strong></div>
                  <div><span className="text-slate-400">Student ID:</span> <span className="font-mono text-slate-900 font-semibold">2023-01894-MN</span></div>
                  <div><span className="text-slate-400">Academic Standing:</span> <span className="text-emerald-700 font-semibold">Dean's List / Good Standing</span></div>
                  <div><span className="text-slate-400">General Weighted Average:</span> <span className="font-mono font-bold text-slate-900">1.22</span></div>
                </div>

                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 text-slate-600 font-semibold">
                    <tr>
                      <th className="py-2 px-1">Course Code</th>
                      <th className="py-2 px-1">Title</th>
                      <th className="py-2 px-1 text-right">Units</th>
                      <th className="py-2 px-1 text-right">Grade</th>
                      <th className="py-2 px-1 text-right">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    <tr>
                      <td className="py-2.5 px-1 font-semibold text-slate-900">IT 401</td>
                      <td className="py-2.5 px-1 font-sans text-slate-700">Information Assurance & Security 2</td>
                      <td className="py-2.5 px-1 text-right">3.0</td>
                      <td className="py-2.5 px-1 text-right font-bold text-indigo-600">1.25</td>
                      <td className="py-2.5 px-1 text-right text-emerald-600 font-semibold">PASSED</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-1 font-semibold text-slate-900">IT 402</td>
                      <td className="py-2.5 px-1 font-sans text-slate-700">Capstone Project & Research 1</td>
                      <td className="py-2.5 px-1 text-right">3.0</td>
                      <td className="py-2.5 px-1 text-right font-bold text-indigo-600">1.00</td>
                      <td className="py-2.5 px-1 text-right text-emerald-600 font-semibold">PASSED</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-1 font-semibold text-slate-900">IT 403</td>
                      <td className="py-2.5 px-1 font-sans text-slate-700">Systems Administration & Maintenance</td>
                      <td className="py-2.5 px-1 text-right">3.0</td>
                      <td className="py-2.5 px-1 text-right font-bold text-indigo-600">1.25</td>
                      <td className="py-2.5 px-1 text-right text-emerald-600 font-semibold">PASSED</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-1 font-semibold text-slate-900">IT 404</td>
                      <td className="py-2.5 px-1 font-sans text-slate-700">Mobile Application Engineering</td>
                      <td className="py-2.5 px-1 text-right">3.0</td>
                      <td className="py-2.5 px-1 text-right font-bold text-indigo-600">1.50</td>
                      <td className="py-2.5 px-1 text-right text-emerald-600 font-semibold">PASSED</td>
                    </tr>
                  </tbody>
                </table>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Official Registrar Digital Seal Verified</span>
                  </div>
                  <span className="font-mono">A.Y. 2025-2026</span>
                </div>
              </div>
            ) : doc.category === 'Certificates' ? (
              <div className="bg-white border-8 border-amber-100 rounded-2xl p-8 sm:p-12 shadow-sm text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-0 opacity-50" />
                <div className="relative z-10 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                    <Award className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-amber-800">
                    {doc.issuingAuthority}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
                    {doc.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    {doc.description || 'Awarded in recognition of distinguished academic standing, scholastic dedication, and sustained collegiate excellence.'}
                  </p>

                  <div className="pt-8 mt-6 border-t border-slate-100 flex items-center justify-around text-xs text-slate-600">
                    <div>
                      <div className="w-24 border-b border-slate-400 mx-auto mb-1" />
                      <span className="font-medium text-slate-800">Collegiate Dean</span>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-800 font-bold text-[9px]">
                      SEAL
                    </div>
                    <div>
                      <div className="w-24 border-b border-slate-400 mx-auto mb-1" />
                      <span className="font-medium text-slate-800">Registrar</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : doc.category === 'Identification Cards' ? (
              <div className="max-w-md mx-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-700 relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-white tracking-wider">UNIVERSITY STUDENT IDENTIFICATION</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                    ACTIVE
                  </span>
                </div>

                <div className="mt-5 flex items-center gap-4">
                  <div className="w-24 h-32 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-center text-slate-400 text-xs font-medium shrink-0">
                    PHOTO
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="text-base font-bold text-white">Neil Mayo Tormis</div>
                    <div className="text-slate-400 font-mono text-xs">ID No: 2023-01894-MN</div>
                    <div className="text-slate-300 text-xs">BS Information Technology</div>
                    <div className="text-[11px] text-indigo-300">College of Computer Sciences</div>
                    <div className="text-[10px] font-mono text-slate-400 pt-1">Valid: A.Y. 2023 - 2027</div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-700/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>BARCODE: ||| |||| | ||||| || ||</span>
                  <span>RFID ENCRYPTED</span>
                </div>
              </div>
            ) : (
              /* Resumes & Clearances */
              <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm font-sans text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                {doc.textContent || `Document content for ${doc.fileName} verified and rendered.`}
              </div>
            )}
          </div>

          {/* Document Properties Card */}
          <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Document Properties & Metadata
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Issuing Authority</span>
                <span className="font-semibold text-slate-800 mt-0.5 block truncate">{doc.issuingAuthority}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Academic Period</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">{doc.academicYear || 'General Archive'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">File Size</span>
                <span className="font-mono text-slate-800 mt-0.5 block tabular-nums">{formatBytes(doc.fileSizeBytes)}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Upload Date</span>
                <span className="font-mono text-slate-800 mt-0.5 block">{formatDate(doc.uploadDate)}</span>
              </div>
            </div>

            {/* Collapsible Security Info */}
            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowSecurityDetails(!showSecurityDetails)}
                className="text-xs font-medium text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>{showSecurityDetails ? 'Hide Security & Verification Details' : 'View Security & Verification Details'}</span>
              </button>

              {showSecurityDetails && (
                <div className="mt-3 p-3 bg-slate-50 border border-slate-200/80 rounded-lg space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Encryption Standard:</span>
                    <span className="font-mono text-slate-800 font-medium">AES-256-GCM (Protected at rest)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Integrity Checksum:</span>
                    <div className="flex items-center gap-1.5 font-mono text-slate-700">
                      <span>{truncateHash(doc.checksumSHA256, 12, 8)}</span>
                      <button
                        onClick={handleCopyHash}
                        className="text-indigo-600 hover:text-indigo-800 p-0.5"
                        title="Copy SHA-256"
                      >
                        {copiedHash ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Access Permission:</span>
                    <span className="text-emerald-700 font-semibold">Private to authenticated student</span>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex items-center justify-between shrink-0 text-xs">
          <span className="text-slate-400 font-mono text-[11px]">
            {doc.fileName}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
