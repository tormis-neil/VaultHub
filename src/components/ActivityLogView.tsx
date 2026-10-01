import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Search, 
  Download, 
  ShieldCheck, 
  LogIn, 
  LogOut, 
  Upload, 
  FileDown, 
  Unlock, 
  Trash2,
  FileSpreadsheet,
  CheckCircle2,
  Globe,
  Monitor
} from 'lucide-react';
import { ActivityLog, ActivityAction } from '../types';
import { formatDateTime } from '../utils/formatters';

interface ActivityLogViewProps {
  logs: ActivityLog[];
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({ logs }) => {
  const [selectedAction, setSelectedAction] = useState<ActivityAction | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (selectedAction !== 'ALL' && log.action !== selectedAction) return false;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        log.details.toLowerCase().includes(q) ||
        (log.documentTitle && log.documentTitle.toLowerCase().includes(q)) ||
        log.ipAddress.includes(q) ||
        log.clientDevice.toLowerCase().includes(q)
      );
    });
  }, [logs, selectedAction, searchQuery]);

  const handleExportCSV = () => {
    const headers = ['Event ID', 'Date & Time', 'Action', 'Target Document', 'Details', 'IP Address', 'Device Client'];
    const rows = logs.map((l) => [
      l.id,
      l.timestamp,
      l.action,
      `"${(l.documentTitle || 'Account').replace(/"/g, '""')}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      l.ipAddress,
      `"${l.clientDevice.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.href = encoded;
    link.download = `vaulthub_activity_report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const getActionDetails = (action: ActivityAction) => {
    switch (action) {
      case 'USER_LOGIN':
        return {
          icon: <LogIn className="w-4 h-4 text-indigo-600" />,
          label: 'Account Sign In',
          bg: 'bg-indigo-50 border-indigo-100',
        };
      case 'USER_LOGOUT':
        return {
          icon: <LogOut className="w-4 h-4 text-slate-500" />,
          label: 'Account Sign Out',
          bg: 'bg-slate-50 border-slate-200',
        };
      case 'DOCUMENT_UPLOAD':
        return {
          icon: <Upload className="w-4 h-4 text-emerald-600" />,
          label: 'Document Uploaded',
          bg: 'bg-emerald-50 border-emerald-100',
        };
      case 'DOCUMENT_DOWNLOAD':
        return {
          icon: <FileDown className="w-4 h-4 text-sky-600" />,
          label: 'Document Downloaded',
          bg: 'bg-sky-50 border-sky-100',
        };
      case 'DOCUMENT_DECRYPT':
        return {
          icon: <Unlock className="w-4 h-4 text-amber-600" />,
          label: 'Document Viewed',
          bg: 'bg-amber-50 border-amber-100',
        };
      case 'DOCUMENT_DELETE':
        return {
          icon: <Trash2 className="w-4 h-4 text-rose-600" />,
          label: 'Document Removed',
          bg: 'bg-rose-50 border-rose-100',
        };
      default:
        return {
          icon: <Clock className="w-4 h-4 text-slate-600" />,
          label: action,
          bg: 'bg-slate-50 border-slate-200',
        };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Account Activity & History
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time audit log of access events, document uploads, downloads, and security actions.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors self-start sm:self-auto shadow-xs"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
          <span>Export Activity Log</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {(
            [
              { label: 'All Activity', value: 'ALL' },
              { label: 'Uploads', value: 'DOCUMENT_UPLOAD' },
              { label: 'Downloads & Views', value: 'DOCUMENT_DOWNLOAD' },
              { label: 'Sign Ins', value: 'USER_LOGIN' },
              { label: 'Deletions', value: 'DOCUMENT_DELETE' },
            ] as const
          ).map((tab) => {
            const isActive = selectedAction === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setSelectedAction(tab.value as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-xl whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search activity records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No activity records matching your search.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => {
              const details = getActionDetails(log.action);
              return (
                <div key={log.id} className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex items-start gap-3.5">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${details.bg}`}>
                    {details.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="text-xs font-semibold text-slate-900">
                        {details.label}
                        {log.documentTitle && (
                          <span className="font-normal text-slate-600">
                            {' '}— <span className="font-medium text-slate-900">"{log.documentTitle}"</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 whitespace-nowrap">
                        {formatDateTime(log.timestamp)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {log.details}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-slate-400" />
                        <span>{log.ipAddress}</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 font-sans">
                        <Monitor className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-xs">{log.clientDevice}</span>
                      </span>
                      <span>·</span>
                      <span className="text-emerald-700 font-medium font-sans flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Verified</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
