import React, { useState, useMemo } from 'react';
import { 
  Grid, 
  List as ListIcon, 
  ArrowUpDown, 
  Plus, 
  FolderOpen, 
  Star, 
  Download, 
  Trash2, 
  Eye,
  Binary
} from 'lucide-react';
import { VaultDocument, DocumentCategory } from '../types';
import { formatBytes, formatDate } from '../utils/formatters';
import { DocumentCard } from './DocumentCard';

interface DocumentListProps {
  documents: VaultDocument[];
  currentCategory: DocumentCategory | 'ALL';
  onSelectCategory: (cat: DocumentCategory | 'ALL') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  showStarredOnly?: boolean;
  onViewDocument: (doc: VaultDocument) => void;
  onDownloadDocument: (doc: VaultDocument) => void;
  onDeleteDocument: (doc: VaultDocument) => void;
  onToggleStar: (docId: string) => void;
  onUploadClick: () => void;
  onInspectCrypto?: (doc: VaultDocument) => void;
}

const CATEGORIES: { label: string; value: DocumentCategory | 'ALL' }[] = [
  { label: 'All Files', value: 'ALL' },
  { label: 'Transcripts', value: 'Transcripts' },
  { label: 'Certificates', value: 'Certificates' },
  { label: 'Resumes', value: 'Resumes' },
  { label: 'IDs & Badges', value: 'Identification Cards' },
  { label: 'Clearances', value: 'Clearances' },
];

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  currentCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  showStarredOnly = false,
  onViewDocument,
  onDownloadDocument,
  onDeleteDocument,
  onToggleStar,
  onUploadClick,
  onInspectCrypto,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'size-desc' | 'title-asc'>('date-desc');

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents
      .filter((doc) => {
        if (showStarredOnly && !doc.isStarred) return false;
        if (currentCategory !== 'ALL' && doc.category !== currentCategory) return false;

        const q = searchQuery.toLowerCase().trim();
        if (!q) return true;

        return (
          doc.title.toLowerCase().includes(q) ||
          doc.issuingAuthority.toLowerCase().includes(q) ||
          doc.fileName.toLowerCase().includes(q) ||
          (doc.description && doc.description.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        if (sortBy === 'date-asc') return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
        if (sortBy === 'size-desc') return b.fileSizeBytes - a.fileSizeBytes;
        if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [documents, showStarredOnly, currentCategory, searchQuery, sortBy]);

  return (
    <div className="space-y-6">
      
      {/* Control Bar: Categories Filter & Actions */}
      <div className="space-y-3">
        {/* Category Pills */}
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1">
          <div className="flex items-center gap-1.5">
            {CATEGORIES.map((cat) => {
              const isActive = currentCategory === cat.value && !showStarredOnly;
              const count = cat.value === 'ALL'
                ? documents.length
                : documents.filter((d) => d.category === cat.value).length;

              return (
                <button
                  key={cat.value}
                  onClick={() => onSelectCategory(cat.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`text-[10px] font-mono ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View mode toggle */}
          <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="List View"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Search Results Summary & Sort Dropdown */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div>
            Showing <strong className="text-slate-800 font-mono">{filteredDocuments.length}</strong> of{' '}
            <span className="font-mono">{documents.length}</span> documents
            {searchQuery && (
              <span> matching "<strong className="text-slate-800">{searchQuery}</strong>"</span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs text-slate-700 focus:outline-none cursor-pointer font-medium"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="size-desc">Largest File</option>
              <option value="title-asc">Title (A to Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Documents Grid / List */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <FolderOpen className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">No documents found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
            {searchQuery
              ? `We couldn't find any documents matching "${searchQuery}". Try adjusting your keywords or clearing filters.`
              : showStarredOnly
              ? 'You have not starred any files yet. Click the star icon on any document to keep it easily accessible.'
              : 'Your vault is ready for your academic documents. Upload your transcripts, certificates, or IDs.'}
          </p>
          <button
            onClick={onUploadClick}
            className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDocuments.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onView={onViewDocument}
              onDownload={onDownloadDocument}
              onDelete={onDeleteDocument}
              onToggleStar={onToggleStar}
              onInspectCrypto={onInspectCrypto}
            />
          ))}
        </div>
      ) : (
        /* Clean Accessible List/Table View */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold">
                <tr>
                  <th className="py-3 px-4 w-8"></th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Issuing Institution</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Date Uploaded</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-3 px-4">
                      <button
                        onClick={() => onToggleStar(doc.id)}
                        className="text-slate-300 hover:text-amber-500 transition-colors"
                      >
                        <Star className={`w-3.5 h-3.5 ${doc.isStarred ? 'text-amber-500 fill-amber-500' : ''}`} />
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => onViewDocument(doc)}
                          className="font-medium text-slate-900 hover:text-indigo-600 text-left line-clamp-1"
                        >
                          {doc.title}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {doc.category}
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-[200px] truncate">
                      {doc.issuingAuthority}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-500 whitespace-nowrap">
                      {formatBytes(doc.fileSizeBytes)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                      {formatDate(doc.uploadDate)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onViewDocument(doc)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100 transition-colors"
                          title="View"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {onInspectCrypto && (
                          <button
                            onClick={() => onInspectCrypto(doc)}
                            className="p-1.5 text-indigo-600 hover:text-indigo-800 rounded-md hover:bg-indigo-50 transition-colors"
                            title="Inspect Ciphertext & Cryptography"
                          >
                            <Binary className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onDownloadDocument(doc)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100 transition-colors"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteDocument(doc)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
