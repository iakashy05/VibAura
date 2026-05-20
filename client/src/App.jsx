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
import MobileFullscreenPlayer from './components/layout/MobileFullscreenPlayer';
import { checkServerHealth } from './services/api';
import { useVibSyncSocketManager } from './hooks/useVibSyncSocket';

// Mobile-first Layout components
import MobileNavbar from './components/layout/MobileNavbar';
import MobileMiniplayer from './components/layout/MobileMiniplayer';
import MobileHeader from './components/layout/MobileHeader';
import MusicLoader from './components/ui/MusicLoader';

const AuthPage = React.lazy(() => import('./pages/AuthPage'));

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Persistent root-level VibSync Socket connection
  useVibSyncSocketManager();
  
  const { isAuthenticated, logout, user, isSubscribed } = useAuthStore();
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
      <Suspense fallback={<MusicLoader fullScreen={true} text="Syncing Aura..." />}>
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

      {/* A. DESKTOP HEADER LAYOUT */}
      <div className="hidden md:block">
        <Header
          onNavigate={navigateTo}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          goBack={goBack}
          goForward={goForward}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </div>

      {/* B. MOBILE HEADER LAYOUT */}
      <div className="block md:hidden">
        <MobileHeader
          currentPage={currentPage}
          selectedData={selectedData}
          onNavigate={navigateTo}
          goBack={goBack}
          canGoBack={canGoBack}
          user={user}
          isSubscribed={isSubscribed}
          onAvatarClick={() => navigateTo('profile')}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      </div>

      {/* C. CORE VIEW SHELL (Single ViewRenderer Mount for high performance) */}
      <div className="flex flex-1 overflow-hidden pb-16 md:pb-4 pt-14 md:pt-0">
        <div className="hidden md:block">
          <Sidebar onNavigate={navigateTo} currentPage={currentPage} />
        </div>

        {/* The Main Content "Pod" (Adaptive design between Desktop and Mobile) */}
        <main className="flex-1 bg-vibaura-view-bg overflow-hidden flex flex-col w-full md:rounded-[40px] md:mr-6 md:ml-2 md:pb-6 pt-0">
          <div className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar page-scroll-area mobile-scroll-area relative w-full">
            <ViewRenderer
              currentPage={currentPage}
              selectedData={selectedData}
              navigateTo={navigateTo}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
        </main>
      </div>

      {/* E. DESKTOP PLAYERBAR */}
      <div className="hidden md:block">
        <PlayerBar onNavigate={navigateTo} />
      </div>

      {/* F. MOBILE PLAYBACK CONTROLS & BOTTOM NAVBAR */}
      <div className="block md:hidden">
        <MobileMiniplayer />
        <MobileNavbar currentPage={currentPage} onNavigate={navigateTo} />
      </div>

      {/* Global Overlays & Modals */}
      <Toast />
      <ConfirmModal />
      <FullscreenPlayer />
      <MobileFullscreenPlayer />
    </div>
  );
}

export default App;
