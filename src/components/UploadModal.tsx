import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Building2, 
  Calendar,
  Star
} from 'lucide-react';
import { DocumentCategory, VaultDocument } from '../types';
import { formatBytes, generateMockSHA256 } from '../utils/formatters';

export interface UploadDocumentPayload {
  file: File;
  title: string;
  category: DocumentCategory;
  issuingAuthority: string;
  academicYear?: string;
  description?: string;
  isStarred?: boolean;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDocument: (payload: UploadDocumentPayload) => Promise<void> | void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onSaveDocument,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('Transcripts');
  const [issuingAuthority, setIssuingAuthority] = useState('');
  const [academicYear, setAcademicYear] = useState('A.Y. 2025-2026');
  const [description, setDescription] = useState('');
  const [isStarred, setIsStarred] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('File exceeds the 25 MB document limit.');
      return;
    }
    setSelectedFile(file);
    setErrorMessage(null);
    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select a document to upload.');
      return;
    }
    if (!title.trim()) {
      setErrorMessage('Please provide a document title.');
      return;
    }
    if (!issuingAuthority.trim()) {
      setErrorMessage('Please provide the issuing institution or authority.');
      return;
    }

    setErrorMessage(null);
    setIsUploading(true);
    setUploadProgress(35);

    try {
      setUploadProgress(70);
      await onSaveDocument({
        file: selectedFile,
        title: title.trim(),
        category,
        issuingAuthority: issuingAuthority.trim(),
        academicYear: academicYear.trim(),
        description: description.trim() || undefined,
        isStarred,
      });
      setUploadProgress(100);
      resetForm();
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Upload failed. Please verify the file and try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setTitle('');
    setCategory('Transcripts');
    setIssuingAuthority('');
    setDescription('');
    setIsStarred(false);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Upload to Student Vault</h2>
            <p className="text-xs text-slate-500">Safely store and categorize academic records</p>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/50'
                : selectedFile
                ? 'border-indigo-300 bg-indigo-50/20'
                : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
              disabled={isUploading}
            />

            {selectedFile ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-slate-800">{selectedFile.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {formatBytes(selectedFile.size)} · Click to change file
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700">
                  Drop your academic file here, or <span className="text-indigo-600">browse</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Supports PDF, PNG, JPG, or DOC (up to 25 MB)
                </p>
              </div>
            )}
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Document Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 3rd Year 1st Sem Official Transcript"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isUploading}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Folder Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                disabled={isUploading}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              >
                <option value="Transcripts">Transcripts</option>
                <option value="Certificates">Certificates</option>
                <option value="Resumes">Resumes</option>
                <option value="Identification Cards">Identification Cards</option>
                <option value="Clearances">Clearances</option>
              </select>
            </div>
          </div>

          {/* Issuing Authority & Academic Period */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Issuing Institution / Authority *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Office of the Registrar, AWS, University"
                value={issuingAuthority}
                onChange={(e) => setIssuingAuthority(e.target.value)}
                disabled={isUploading}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Academic Year / Term
              </label>
              <input
                type="text"
                placeholder="e.g. A.Y. 2025-2026"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                disabled={isUploading}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Mark as Starred & Important Feature */}
          <div 
            onClick={() => !isUploading && setIsStarred(!isStarred)}
            className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
              isStarred 
                ? 'bg-amber-50/70 border-amber-200 shadow-2xs' 
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isStarred ? 'bg-amber-100 text-amber-600' : 'bg-slate-200/80 text-slate-400'
              }`}>
                <Star className={`w-4 h-4 ${isStarred ? 'fill-amber-400 text-amber-500' : ''}`} />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <span>Mark as Starred & Important</span>
                  {isStarred && (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                      Important
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500">
                  Instantly pin to your Starred & Important files
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={isUploading}
              onClick={(e) => {
                e.stopPropagation();
                setIsStarred(!isStarred);
              }}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isStarred ? 'bg-amber-500' : 'bg-slate-300'
              }`}
              role="switch"
              aria-checked={isStarred}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  isStarred ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Progress bar when saving */}
          {isUploading && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  Encrypting & saving to vault...
                </span>
                <span className="font-mono">{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs disabled:opacity-50"
            >
              {isUploading ? 'Securing...' : 'Save to Vault'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
