import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LockerProvider, useLocker } from './context/LockerContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MobileNav } from './components/MobileNav';
import { MobileDrawer } from './components/MobileDrawer';
import { DocumentPreviewModal } from './components/modals/DocumentPreviewModal';
import { UploadModal } from './components/modals/UploadModal';
import { SecureShareModal } from './components/modals/SecureShareModal';
import { EditDocumentModal } from './components/modals/EditDocumentModal';
import { DigitalStudentIdCard } from './components/modals/DigitalStudentIdCard';

// Views
import { LandingPage } from './views/LandingPage';
import { LoginView } from './views/LoginView';
import { RegisterView } from './views/RegisterView';
import { ForgotPasswordView } from './views/ForgotPasswordView';
import { DashboardView } from './views/DashboardView';
import { LockerView } from './views/LockerView';
import { SmartSearchView } from './views/SmartSearchView';
import { VaultAIView } from './views/VaultAIView';
import { ShareManagementView } from './views/ShareManagementView';
import { ExpiryAlertsView } from './views/ExpiryAlertsView';
import { ApplicationChecklistsView } from './views/ApplicationChecklistsView';
import { SecurityCenterView } from './views/SecurityCenterView';
import { RecycleBinView } from './views/RecycleBinView';
import { ProfileView } from './views/ProfileView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { PublicShareView } from './views/PublicShareView';
import { SettingsView } from './views/SettingsView';

function MainApp() {
  const { user, loading } = useAuth();
  const {
    previewDoc,
    setPreviewDoc,
    shareDoc,
    setShareDoc,
    editDoc,
    setEditDoc,
    deleteDocument,
    documents,
  } = useLocker();

  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [authView, setAuthView] = useState<'landing' | 'login' | 'register' | 'forgot-password'>('landing');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDigitalIdOpen, setIsDigitalIdOpen] = useState(false);

  // Check URL pathname for /share/:token route
  const [shareToken, setShareToken] = useState<string | null>(() => {
    const path = window.location.pathname;
    if (path.startsWith('/share/')) {
      return path.replace('/share/', '');
    }
    return null;
  });

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path.startsWith('/share/')) {
        setShareToken(path.replace('/share/', ''));
      } else {
        setShareToken(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // If public share URL was requested
  if (shareToken) {
    return (
      <PublicShareView
        token={shareToken}
        onGoHome={() => {
          window.history.pushState({}, '', '/');
          setShareToken(null);
        }}
      />
    );
  }

  const handleReturnToLanding = () => {
    setAuthView('landing');
  };

  // Loading state while checking token
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <div className="text-xs text-slate-400 font-medium">Initializing Privora Secure Workspace...</div>
        </div>
      </div>
    );
  }

  // Unauthenticated view flow
  if (!user) {
    if (authView === 'login') {
      return (
        <LoginView
          onGoToRegister={() => setAuthView('register')}
          onGoToForgotPassword={() => setAuthView('forgot-password')}
          onSuccess={() => setCurrentView('dashboard')}
          onClose={handleReturnToLanding}
        />
      );
    }
    if (authView === 'register') {
      return (
        <RegisterView
          onGoToLogin={() => setAuthView('login')}
          onSuccess={() => setCurrentView('dashboard')}
          onClose={handleReturnToLanding}
        />
      );
    }
    if (authView === 'forgot-password') {
      return (
        <ForgotPasswordView
          onBackToLogin={() => setAuthView('login')}
          onClose={handleReturnToLanding}
        />
      );
    }

    return (
      <LandingPage
        onLogin={() => setAuthView('login')}
        onRegister={() => setAuthView('register')}
      />
    );
  }

  // Authenticated workspace flow
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            currentView={currentView}
            setCurrentView={setCurrentView}
            onOpenUpload={() => setIsUploadOpen(true)}
          />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-24 lg:pb-8">
          {currentView === 'dashboard' && (
            <DashboardView
              setCurrentView={setCurrentView}
              onOpenUpload={() => setIsUploadOpen(true)}
            />
          )}

          {currentView === 'locker' && (
            <LockerView
              onOpenUpload={() => setIsUploadOpen(true)}
            />
          )}

          {currentView === 'search' && (
            <SmartSearchView />
          )}

          {currentView === 'vaultai' && (
            <VaultAIView
              setCurrentView={setCurrentView}
              onOpenUpload={() => setIsUploadOpen(true)}
            />
          )}

          {currentView === 'share-manage' && (
            <ShareManagementView
              onOpenCreateShare={() => {
                if (documents.length > 0) {
                  setShareDoc(documents[0]);
                } else {
                  setIsUploadOpen(true);
                }
              }}
            />
          )}

          {currentView === 'expiry-alerts' && (
            <ExpiryAlertsView
              onOpenUpload={() => setIsUploadOpen(true)}
            />
          )}

          {currentView === 'checklists' && (
            <ApplicationChecklistsView />
          )}

          {currentView === 'security' && (
            <SecurityCenterView />
          )}

          {currentView === 'recycle-bin' && (
            <RecycleBinView />
          )}

          {currentView === 'profile' && (
            <ProfileView
              onOpenDigitalId={() => setIsDigitalIdOpen(true)}
            />
          )}

          {currentView === 'admin' && (
            <AdminDashboardView />
          )}

          {currentView === 'settings' && (
            <SettingsView />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenUpload={() => setIsUploadOpen(true)}
      />

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {/* Global Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />

      <DocumentPreviewModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
        onShare={(doc) => {
          setPreviewDoc(null);
          setShareDoc(doc);
        }}
        onEdit={(doc) => {
          setPreviewDoc(null);
          setEditDoc(doc);
        }}
        onDelete={(id) => deleteDocument(id)}
      />

      <SecureShareModal
        document={shareDoc}
        onClose={() => setShareDoc(null)}
      />

      <EditDocumentModal
        document={editDoc}
        onClose={() => setEditDoc(null)}
      />

      <DigitalStudentIdCard
        isOpen={isDigitalIdOpen}
        user={user}
        onClose={() => setIsDigitalIdOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LockerProvider>
        <MainApp />
      </LockerProvider>
    </AuthProvider>
  );
}
