import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle2, 
  FolderLock,
  Plus
} from 'lucide-react';
import { VaultDocument, ActivityLog, StudentUser, DocumentCategory } from './types';
import { formatBytes } from './utils/formatters';
import { authApi, documentsApi, activityApi } from './api';

import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DocumentList } from './components/DocumentList';
import { StorageGauge } from './components/StorageGauge';
import { ActivityLogView } from './components/ActivityLogView';
import { UploadModal, UploadDocumentPayload } from './components/UploadModal';
import { DocumentPreviewModal } from './components/DocumentPreviewModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { SecurityInfoModal } from './components/SecurityInfoModal';
import { AuthModal } from './components/AuthModal';
import { AuthPage } from './components/AuthPage';
import { ProfileView } from './components/ProfileView';

export default function App() {
  const [user, setUser] = useState<StudentUser | null>(null);
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Navigation state
  const [currentView, setCurrentView] = useState<string>('documents');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<VaultDocument | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<VaultDocument | null>(null);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification((curr) => (curr === message ? null : curr));
    }, 3500);
  };

  // Synchronize documents and audit logs from live API
  const refreshVault = useCallback(async () => {
    try {
      const [docs, activity] = await Promise.all([
        documentsApi.getDocuments(),
        activityApi.getActivityLogs(),
      ]);
      setDocuments(docs);
      setLogs(activity);
    } catch (err) {
      console.error('Failed to refresh vault data:', err);
    }
  }, []);

  // Check active session on initial mount
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const profile = await authApi.getProfile();
        if (isMounted && profile) {
          setUser(profile);
          const [docs, activity] = await Promise.all([
            documentsApi.getDocuments(),
            activityApi.getActivityLogs(),
          ]);
          if (isMounted) {
            setDocuments(docs);
            setLogs(activity);
          }
        }
      } catch {
        // No active session, stay on AuthPage
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handlers
  const handleUploadDocument = async (payload: UploadDocumentPayload) => {
    const created = await documentsApi.uploadDocument(payload);
    await refreshVault();
    showToast(`"${created.title}" encrypted & stored in your vault.`);
  };

  const handleDownload = async (doc: VaultDocument) => {
    try {
      showToast(`Decrypting and downloading "${doc.fileName}"...`);
      await documentsApi.downloadDocument(doc.id, doc.fileName);
      await refreshVault();
      showToast(`Decrypted and downloaded "${doc.fileName}"`);
    } catch (err: any) {
      showToast(err?.message || 'Download failed. File integrity check error.');
    }
  };

  const handleView = (doc: VaultDocument) => {
    setPreviewDoc(doc);
  };

  const handleDelete = async (doc: VaultDocument) => {
    try {
      await documentsApi.deleteDocument(doc.id);
      await refreshVault();
      showToast(`Deleted "${doc.title}" from vault.`);
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete document.');
    }
  };

  const handleToggleStar = async (docId: string) => {
    const target = documents.find((d) => d.id === docId);
    if (!target) return;
    const nextState = !target.isStarred;

    // Optimistic UI update
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, isStarred: nextState } : d))
    );
    if (previewDoc && previewDoc.id === docId) {
      setPreviewDoc((prev) => prev ? { ...prev, isStarred: nextState } : null);
    }

    try {
      await documentsApi.updateDocument(docId, { isStarred: nextState });
      showToast(nextState ? `Starred "${target.title}"` : `Removed "${target.title}" from Starred`);
    } catch {
      // Rollback on error
      setDocuments((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, isStarred: !nextState } : d))
      );
      showToast('Could not update star status.');
    }
  };

  const handleLogin = async (selectedUser: StudentUser) => {
    setUser(selectedUser);
    await refreshVault();
    showToast(`Welcome back, ${selectedUser.fullName}!`);
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Logout error:', err);
    }
    setUser(null);
    setDocuments([]);
    setLogs([]);
    showToast('Signed out of VaultHub.');
  };

  const handleRegister = async (newUser: StudentUser) => {
    setUser(newUser);
    await refreshVault();
    showToast(`Welcome to VaultHub, ${newUser.fullName}!`);
  };

  const handleUpdateUser = async (updatedUser: StudentUser) => {
    try {
      const saved = await authApi.updateProfile({
        degreeProgram: updatedUser.degreeProgram,
        academicYear: updatedUser.academicYear,
      });
      setUser(saved);
      showToast('Profile updated successfully!');
    } catch (err: any) {
      showToast(err?.message || 'Failed to update profile.');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await authApi.deleteAccount();
      setUser(null);
      setDocuments([]);
      setLogs([]);
      setCurrentView('documents');
      showToast('Your account and student vault have been deleted.');
    } catch (err: any) {
      showToast(err?.message || 'Failed to delete account.');
    }
  };

  const totalQuota = user?.storageQuotaBytes || 500 * 1024 * 1024;

  // Initial loading splash screen
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <FolderLock className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">VaultHub</span>
        </div>
        <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-mono">Initializing secure vault session...</p>
      </div>
    );
  }

  // Render Auth Page if not authenticated
  if (!user) {
    return <AuthPage onLogin={handleLogin} onRegister={handleRegister} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans antialiased">
      
      {/* Modern Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onSelectView={(v) => {
          setCurrentView(v);
          setSearchQuery('');
        }}
        selectedCategory={selectedCategory}
        onSelectCategory={(c) => {
          setSelectedCategory(c);
          setSearchQuery('');
        }}
        documents={documents}
        user={user}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenSecurity={() => setIsSecurityModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header with Google Drive-like Profile Avatar Dropdown */}
        <Header
          user={user}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onNavigateProfile={() => {
            setCurrentView('profile');
            setSearchQuery('');
          }}
          onNavigateStorage={() => {
            setCurrentView('storage');
            setSearchQuery('');
          }}
          onNavigateActivity={() => {
            setCurrentView('activity');
            setSearchQuery('');
          }}
          onNavigateStarred={() => {
            setCurrentView('starred');
            setSearchQuery('');
          }}
          onOpenSecurity={() => setIsSecurityModalOpen(true)}
          onOpenUpload={() => setIsUploadOpen(true)}
          onLogout={handleLogout}
          totalUsedBytes={documents.reduce((acc, doc) => acc + doc.fileSizeBytes, 0)}
        />

        {/* Floating Notification Toast */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-800 text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Viewport Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Main Documents View */}
          {(currentView === 'documents' || currentView === 'starred') && (
            <DocumentList
              documents={documents}
              currentCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              showStarredOnly={currentView === 'starred'}
              onViewDocument={handleView}
              onDownloadDocument={handleDownload}
              onDeleteDocument={(doc) => setDeleteDoc(doc)}
              onToggleStar={handleToggleStar}
              onUploadClick={() => setIsUploadOpen(true)}
            />
          )}

          {/* Activity / Audit History View */}
          {currentView === 'activity' && (
            <ActivityLogView logs={logs} />
          )}

          {/* Storage Overview View */}
          {currentView === 'storage' && (
            <StorageGauge
              documents={documents}
              totalQuotaBytes={totalQuota}
              onUploadClick={() => setIsUploadOpen(true)}
              onViewDocument={handleView}
              onDeleteDocument={(doc) => setDeleteDoc(doc)}
            />
          )}

          {/* Student Profile View */}
          {currentView === 'profile' && user && (
            <ProfileView
              user={user}
              totalUsedBytes={documents.reduce((acc, doc) => acc + doc.fileSizeBytes, 0)}
              onUpdateUser={handleUpdateUser}
              onLogout={handleLogout}
              onDeleteAccount={handleDeleteAccount}
            />
          )}

        </main>

        {/* Clean footer */}
        <footer className="border-t border-slate-200 bg-white py-4 px-4 sm:px-8 mt-auto">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">VaultHub</span>
              <span>— Secure academic document repository for students</span>
            </div>
          </div>
        </footer>

      </div>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSaveDocument={handleUploadDocument}
      />

      <DocumentPreviewModal
        document={previewDoc}
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        onDownload={handleDownload}
        onToggleStar={handleToggleStar}
      />

      <DeleteConfirmModal
        document={deleteDoc}
        isOpen={!!deleteDoc}
        onClose={() => setDeleteDoc(null)}
        onConfirm={handleDelete}
      />

      <SecurityInfoModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

    </div>
  );
}
