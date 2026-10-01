import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { VaultDocument } from '../types';
import { formatBytes } from '../utils/formatters';

interface DeleteConfirmModalProps {
  document: VaultDocument | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (doc: VaultDocument) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  document: doc,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !doc) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Delete this document?
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-800">"{doc.title}"</strong> ({formatBytes(doc.fileSizeBytes)}) from your vault?
            </p>
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-400">Category:</span>
            <span className="font-medium text-slate-800">{doc.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Storage Freed:</span>
            <span className="font-mono text-emerald-700 font-semibold">+{formatBytes(doc.fileSizeBytes)}</span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Keep File
          </button>
          <button
            onClick={() => {
              onConfirm(doc);
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs"
          >
            Delete Document
          </button>
        </div>
      </div>
    </div>
  );
};
