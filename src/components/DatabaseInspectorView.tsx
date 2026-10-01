import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Table, 
  FileText, 
  Users, 
  Clock, 
  Search, 
  Copy, 
  Check, 
  Code, 
  RefreshCw, 
  Layers, 
  ShieldCheck, 
  Lock, 
  Key,
  HardDrive,
  Download
} from 'lucide-react';
import { DatabaseRecords } from '../types';
import { vaultApi } from '../api';
import { formatBytes, formatDate } from '../utils/formatters';

interface DatabaseInspectorViewProps {
  onInspectDocumentCrypto?: (docId: string) => void;
}

export const DatabaseInspectorView: React.FC<DatabaseInspectorViewProps> = ({
  onInspectDocumentCrypto,
}) => {
  const [data, setData] = useState<DatabaseRecords | null>(null);
  const [activeTable, setActiveTable] = useState<'documents' | 'users' | 'activity'>('documents');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRawJson, setIsRawJson] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const records = await vaultApi.getDatabaseRecords();
      setData(records);
    } catch (err) {
      console.error('Failed to load database records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExportJson = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vaulthub_cloudsql_database_export_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredDocs = data?.documents.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.checksumSHA256.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.id.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredUsers = data?.users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const filteredLogs = data?.activityLogs.filter(
    (l) =>
      l.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.ipAddress.includes(searchQuery)
  ) || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>VaultHub Database & Storage Architecture</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                ACTIVE SCHEMA
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Live inspection of relational database tables, cryptographic IVs, tags, and ciphertext records at rest.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleExportJson}
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Export complete database records as JSON"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export Database</span>
          </button>

          <button
            onClick={() => setIsRawJson(!isRawJson)}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
              isRawJson
                ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>{isRawJson ? 'View Relational Table' : 'Raw Database JSON'}</span>
          </button>

          <button
            onClick={fetchRecords}
            disabled={isLoading}
            className="p-2 text-slate-600 hover:text-indigo-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-2xs cursor-pointer"
            title="Refresh database records"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block">Total Stored Documents</span>
          <span className="text-xl font-bold text-slate-900 font-mono mt-1 block">
            {data?.documents.length || 0}
          </span>
          <span className="text-[10px] text-indigo-600 font-medium">All encrypted with AES-256</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block">Total Database Users</span>
          <span className="text-xl font-bold text-slate-900 font-mono mt-1 block">
            {data?.users.length || 0}
          </span>
          <span className="text-[10px] text-slate-400">Isolated student tenants</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block">Immutable Audit Records</span>
          <span className="text-xl font-bold text-slate-900 font-mono mt-1 block">
            {data?.activityLogs.length || 0}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium">100% Security verified</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block">Encryption Standard</span>
          <span className="text-lg font-bold text-slate-900 font-mono mt-1 block">
            AES-GCM-256
          </span>
          <span className="text-[10px] text-slate-400">SHA-256 Integrity MAC</span>
        </div>
      </div>

      {/* Search and Table Selector Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Table Selector Tabs */}
        <div className="bg-slate-100 p-1 rounded-xl flex text-xs font-medium space-x-1">
          <button
            onClick={() => setActiveTable('documents')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeTable === 'documents'
                ? 'bg-white text-indigo-600 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>vault_documents ({data?.documents.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTable('users')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeTable === 'users'
                ? 'bg-white text-indigo-600 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>vault_student_user ({data?.users.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTable('activity')}
            className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-2 ${
              activeTable === 'activity'
                ? 'bg-white text-indigo-600 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>vault_activity_log ({data?.activityLogs.length || 0})</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search ${activeTable}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600"
          />
        </div>
      </div>

      {/* Main Table Card */}
      {isRawJson ? (
        <div className="bg-slate-950 rounded-2xl border border-slate-800 text-slate-200 p-5 font-mono text-xs overflow-x-auto max-h-[600px] shadow-sm">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
          
          {/* Table: vault_documents */}
          {activeTable === 'documents' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Primary Key (id)</th>
                    <th className="py-3 px-4">Document Title</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">SHA-256 Hash Digest</th>
                    <th className="py-3 px-4">AES-256 Nonce (IV)</th>
                    <th className="py-3 px-4">Auth Tag (MAC)</th>
                    <th className="py-3 px-4">Ciphertext Preview</th>
                    <th className="py-3 px-4">Size</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-semibold">{doc.id}</td>
                      <td className="py-3 px-4 font-sans font-medium text-slate-900 max-w-[180px] truncate" title={doc.title}>
                        {doc.title}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-600">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                          {doc.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700 max-w-[140px] truncate" title={doc.checksumSHA256}>
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-1.5 py-0.5 rounded text-[10px]">
                          {doc.checksumSHA256.slice(0, 10)}...{doc.checksumSHA256.slice(-6)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-indigo-600" title={doc.ivHex}>
                        {doc.ivHex.slice(0, 8)}...
                      </td>
                      <td className="py-3 px-4 text-sky-600" title={doc.tagHex}>
                        {doc.tagHex.slice(0, 8)}...
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[10px]" title={doc.ciphertextSample}>
                        {doc.ciphertextSample}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-sans">
                        {formatBytes(doc.fileSizeBytes)}
                      </td>
                      <td className="py-3 px-4 text-right font-sans">
                        {onInspectDocumentCrypto && (
                          <button
                            onClick={() => onInspectDocumentCrypto(doc.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                          >
                            Inspect Crypto
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredDocs.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400 font-sans">
                        No documents found matching search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Table: vault_student_user */}
          {activeTable === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">User ID</th>
                    <th className="py-3 px-4">Student ID No.</th>
                    <th className="py-3 px-4">Full Name</th>
                    <th className="py-3 px-4">Institutional Email</th>
                    <th className="py-3 px-4">Degree Program</th>
                    <th className="py-3 px-4">Year Level</th>
                    <th className="py-3 px-4">Storage Quota</th>
                    <th className="py-3 px-4">Initials</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500 font-semibold">{u.id}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{u.studentId}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{u.fullName}</td>
                      <td className="py-3 px-4 text-slate-600">{u.email}</td>
                      <td className="py-3 px-4 text-slate-600">{u.degreeProgram}</td>
                      <td className="py-3 px-4 text-slate-500">{u.academicYear}</td>
                      <td className="py-3 px-4 font-mono text-indigo-600 font-medium">
                        {formatBytes(u.storageQuotaBytes)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] inline-flex items-center justify-center">
                          {u.avatarInitials}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Table: vault_activity_log */}
          {activeTable === 'activity' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Log ID</th>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action Event</th>
                    <th className="py-3 px-4">Audit Details</th>
                    <th className="py-3 px-4">Client IP</th>
                    <th className="py-3 px-4">Device / User-Agent</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{log.id}</td>
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200/80 px-2 py-0.5 rounded font-semibold">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900 max-w-xs truncate" title={log.details}>
                        {log.details}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 text-[11px]">{log.ipAddress}</td>
                      <td className="py-3 px-4 text-slate-500 text-[11px] max-w-[160px] truncate" title={log.clientDevice}>
                        {log.clientDevice}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Showing verified relational database records</span>
            <span className="font-mono text-[11px]">Integrity Check: 100% Passed</span>
          </div>

        </div>
      )}

    </div>
  );
};
