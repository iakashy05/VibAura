import React, { useEffect, useState } from 'react';
import Sidebar from './components/layout/sidebar';
import Header from './components/layout/header';
import PlayerBar from './components/layout/playerBar';
import ViewRenderer from './components/layout/ViewRenderer';
import AuthPage from './pages/AuthPage';
import Toast from './components/ui/Toast';
import ConfirmModal from './components/ui/ConfirmModal';
import { useVibauraNavigation } from './hooks/useVibauraNavigation';
import { useAuthStore } from './store/authStore';
import { checkServerHealth } from './services/api';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, logout } = useAuthStore();

  // Listen for 401 unauthorized events from api.js
  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener('vibaura-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('vibaura-unauthorized', handleUnauthorized);
  }, [logout]);

  useEffect(() => {
    const runHealthCheck = async () => {
      const data = await checkServerHealth();
      if (data?.status !== 'ok') {
        console.warn('⚠️ Server may be offline:', data);
      }
    };
    runHealthCheck();
  }, []);
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

  // If we are on the login page, render it full screen without layout
  if (currentPage === 'login') {
    return <AuthPage />;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-vibaura-surface font-jost overflow-hidden">
      
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
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onNavigate={navigateTo} currentPage={currentPage} />

        {/* The Rounded "Pod" (Main Content area) */}
        <main className="flex-1 bg-vibaura-view-bg rounded-tl-[40px] rounded-bl-[40px] overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto custom-scrollbar page-scroll-area relative">
            
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
      <PlayerBar />

      {/* Global Notifications */}
      <Toast />
      <ConfirmModal />
    </div>
  );
}

export default App;
