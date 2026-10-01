import React from 'react';
import { 
  HardDrive, 
  FileSpreadsheet, 
  Award, 
  FileText, 
  CreditCard, 
  CheckCircle2, 
  Trash2
} from 'lucide-react';
import { VaultDocument, DocumentCategory } from '../types';
import { formatBytes } from '../utils/formatters';

interface StorageGaugeProps {
  documents: VaultDocument[];
  totalQuotaBytes: number;
  onUploadClick?: () => void;
  onViewDocument: (doc: VaultDocument) => void;
  onDeleteDocument: (doc: VaultDocument) => void;
}

export const StorageGauge: React.FC<StorageGaugeProps> = ({
  documents,
  totalQuotaBytes,
  onUploadClick,
  onViewDocument,
  onDeleteDocument,
}) => {
  const usedBytes = documents.reduce((sum, doc) => sum + doc.fileSizeBytes, 0);
  const percentage = Math.min(100, Math.round((usedBytes / totalQuotaBytes) * 100 * 10) / 10);
  const freeBytes = Math.max(0, totalQuotaBytes - usedBytes);

  // Group by category
  const categories: {
    category: DocumentCategory;
    bytes: number;
    color: string;
    bg: string;
    icon: React.ReactNode;
  }[] = [
    { 
      category: 'Transcripts', 
      bytes: 0, 
      color: 'bg-indigo-600', 
      bg: 'text-indigo-600',
      icon: <FileSpreadsheet className="w-4 h-4" /> 
    },
    { 
      category: 'Certificates', 
      bytes: 0, 
      color: 'bg-sky-500', 
      bg: 'text-sky-600',
      icon: <Award className="w-4 h-4" /> 
    },
    { 
      category: 'Resumes', 
      bytes: 0, 
      color: 'bg-amber-500', 
      bg: 'text-amber-600',
      icon: <FileText className="w-4 h-4" /> 
    },
    { 
      category: 'Identification Cards', 
      bytes: 0, 
      color: 'bg-emerald-500', 
      bg: 'text-emerald-600',
      icon: <CreditCard className="w-4 h-4" /> 
    },
    { 
      category: 'Clearances', 
      bytes: 0, 
      color: 'bg-purple-500', 
      bg: 'text-purple-600',
      icon: <CheckCircle2 className="w-4 h-4" /> 
    },
  ];

  documents.forEach((doc) => {
    const found = categories.find((c) => c.category === doc.category);
    if (found) {
      found.bytes += doc.fileSizeBytes;
    }
  });

  // Largest files
  const largestFiles = [...documents]
    .sort((a, b) => b.fileSizeBytes - a.fileSizeBytes)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      
      {/* Storage Overview Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">
                Vault Storage Allocation
              </h2>
              <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full">
                Phase 1 Student Plan
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Encrypted document storage allocated for your academic credentials.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors self-start sm:self-auto shadow-xs"
          >
            <HardDrive className="w-4 h-4" />
            <span>Get More Storage</span>
          </button>
        </div>

        {/* Big numbers & Multi-color storage bar */}
        <div className="mt-6 space-y-3">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                {formatBytes(usedBytes)}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                used of {formatBytes(totalQuotaBytes)}
              </span>
            </div>
            <span className="text-xs font-mono font-medium text-slate-500">
              {percentage}% used · {formatBytes(freeBytes)} free
            </span>
          </div>

          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
            {categories.map((cat) => {
              if (cat.bytes === 0) return null;
              const width = Math.max(1, (cat.bytes / totalQuotaBytes) * 100);
              return (
                <div
                  key={cat.category}
                  className={`${cat.color} transition-all duration-300`}
                  style={{ width: `${width}%` }}
                  title={`${cat.category}: ${formatBytes(cat.bytes)}`}
                />
              );
            })}
          </div>
        </div>

        {/* Category breakdown pills */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 pt-6 border-t border-slate-100 text-xs">
          {categories.map((cat) => (
            <div key={cat.category} className="p-3 bg-slate-50/70 border border-slate-200/70 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-slate-600">
                <span className={`w-2.5 h-2.5 rounded-full ${cat.color} shrink-0`} />
                <span className="font-medium truncate">{cat.category}</span>
              </div>
              <div className="font-mono text-slate-900 font-bold text-sm">
                {formatBytes(cat.bytes)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Largest Files Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Largest Vault Documents
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Files occupying the most storage in your account.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-y border-slate-200 text-slate-500 font-semibold">
              <tr>
                <th className="py-2.5 px-4">Document</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">File Size</th>
                <th className="py-2.5 px-4">Quota Share</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {largestFiles.map((doc) => {
                const share = ((doc.fileSizeBytes / usedBytes) * 100).toFixed(1);
                return (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onViewDocument(doc)}
                        className="font-medium text-slate-900 hover:text-indigo-600 text-left line-clamp-1"
                      >
                        {doc.title}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {doc.category}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800 tabular-nums whitespace-nowrap">
                      {formatBytes(doc.fileSizeBytes)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500 tabular-nums whitespace-nowrap">
                      {share}% of used
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onViewDocument(doc)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => onDeleteDocument(doc)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
