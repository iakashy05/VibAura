import React, { useEffect, useState, Suspense } from 'react';
import Sidebar from './components/layout/sidebar';
import Header from './components/layout/header';
import PlayerBar from './components/layout/playerBar';
import ViewRenderer from './components/layout/ViewRenderer';
import Toast from './components/ui/Toast';
import ConfirmModal from './components/ui/ConfirmModal';
import { useVibauraNavigation } from './hooks/useVibauraNavigation';
import { useAuthStore } from './store/authStore';
import { useUIStore } from './store/uiStore';
import { useLibraryStore } from './store/libraryStore';
import FullscreenPlayer from './components/layout/FullscreenPlayer';
import { checkServerHealth } from './services/api';

const AuthPage = React.lazy(() => import('./pages/AuthPage'));

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, logout } = useAuthStore();
  const { isServerOffline, setServerOffline, setSidebarCollapsed } = useUIStore();
  const { fetchLibrary } = useLibraryStore();

  // Listen for 401 unauthorized events from api.js
  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener('vibaura-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('vibaura-unauthorized', handleUnauthorized);
  }, [logout]);

  // Seed user library when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchLibrary();
    }
  }, [isAuthenticated, fetchLibrary]);

  // Periodic health check to handle server connection issues gracefully
  useEffect(() => {
    const runHealthCheck = async () => {
      const data = await checkServerHealth();
      if (data?.status === 'ok') {
        setServerOffline(false);
      } else {
        setServerOffline(true);
      }
    };
    runHealthCheck();
    
    const interval = setInterval(runHealthCheck, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [setServerOffline]);
  const {
    currentPage,
    selectedData,
    canGoBack,
    canGoForward,
    navigateTo,
    goBack,
    goForward
  } = useVibauraNavigation();

  // Strict Authentication Gate: Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && currentPage !== 'login') {
      navigateTo('login');
    } else if (isAuthenticated && currentPage === 'login') {
      navigateTo('home');
    }
  }, [isAuthenticated, currentPage, navigateTo]);

  // Handle automatic sidebar collapse
  useEffect(() => {
    const handleResize = () => {
      setSidebarCollapsed(window.innerWidth < 1200);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarCollapsed]);

  // If we are on the login page, render it full screen without layout
  if (currentPage === 'login') {
    return (
      <Suspense fallback={
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0d0d1a]">
          <div className="w-10 h-10 border-4 border-vibaura-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <AuthPage />
      </Suspense>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-vibaura-surface font-jost overflow-hidden">
      {isServerOffline && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-center py-2 text-[10px] font-black tracking-widest uppercase animate-in slide-in-from-top duration-300 z-[999] flex items-center justify-center gap-2 shadow-md">
          <svg className="w-3.5 h-3.5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Offline: Reconnecting to VibAura Server...
        </div>
      )}

      {/* 1. Header with navigation controls */}
      <Header
        onNavigate={navigateTo}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        goBack={goBack}
        goForward={goForward}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* 2. Middle Row: Sidebar + Main Content Pod */}
      <div className="flex flex-1 overflow-hidden pb-4">
        <Sidebar onNavigate={navigateTo} currentPage={currentPage} />

        {/* The Rounded "Pod" (Main Content area) */}
        <main className="flex-1 bg-vibaura-view-bg rounded-[40px] overflow-hidden flex flex-col mr-6 ml-2 pb-6 pt-0">
          <div className="flex-1 overflow-y-auto no-scrollbar page-scroll-area relative pb-20">

            {/* Modular View Management */}
            <ViewRenderer
              currentPage={currentPage}
              selectedData={selectedData}
              navigateTo={navigateTo}
              searchQuery={searchQuery}
            />

          </div>
        </main>
      </div>

      {/* 3. Global PlayerBar */}
      <PlayerBar onNavigate={navigateTo} />

      {/* Global Notifications */}
      <Toast />
      <ConfirmModal />
      <FullscreenPlayer />
    </div>
  );
}

export default App;
