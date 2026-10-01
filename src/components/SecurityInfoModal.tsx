import React from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  FileCheck, 
  EyeOff, 
  CheckCircle2,
  Server
} from 'lucide-react';

interface SecurityInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityInfoModal: React.FC<SecurityInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Privacy & Security Safeguards</h2>
              <p className="text-xs text-slate-500">How VaultHub keeps your academic records secure</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600">
          
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Encrypted at Rest with AES-256</span>
            </div>
            <p className="leading-relaxed text-slate-600">
              Every document you upload—such as your official transcript, certificates, and student ID—is automatically scrambled into unreadable ciphertext using industry-standard <strong>AES-256</strong> before being stored. Only you can view and decrypt your files.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <KeyRound className="w-4 h-4 text-indigo-600" />
              <span>High-Grade Credential Protection (Argon2)</span>
            </div>
            <p className="leading-relaxed text-slate-600">
              Student passwords are protected using the <strong>Argon2id</strong> algorithm, designed specifically to safeguard credentials against unauthorized brute-force and dictionary attacks.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <FileCheck className="w-4 h-4 text-sky-600" />
              <span>Cryptographic Integrity & Tamper Detection</span>
            </div>
            <p className="leading-relaxed text-slate-600">
              Each document has a unique SHA-256 fingerprint generated upon upload. This ensures your academic transcripts and certificates cannot be modified or altered without detection.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <EyeOff className="w-4 h-4 text-amber-600" />
              <span>Transparent Audit Trail</span>
            </div>
            <p className="leading-relaxed text-slate-600">
              VaultHub records an activity history every time you log in, upload, view, or download a document so you always know who accessed your vault and when.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs"
          >
            Got it, thanks
          </button>
        </div>

      </div>
    </div>
  );
};
