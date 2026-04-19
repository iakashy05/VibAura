import React, { useEffect } from 'react';
import Sidebar from './components/layout/sidebar';
import Header from './components/layout/header';
import PlayerBar from './components/layout/playerBar';
import ViewRenderer from './components/layout/ViewRenderer';
import { useVibauraNavigation } from './hooks/useVibauraNavigation';
import { checkServerHealth } from './services/api';

function App() {
  useEffect(() => {
    const runHealthCheck = async () => {
      const data = await checkServerHealth();
      console.log('🌐 Server Status:', data);
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

  return (
    <div className="flex flex-col h-screen w-full bg-vibaura-surface font-jost overflow-hidden">
      
      {/* 1. Header with navigation controls */}
      <Header 
        onNavigate={navigateTo} 
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        goBack={goBack}
        goForward={goForward}
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
            />

          </div>
        </main>
      </div>

      {/* 3. Global PlayerBar */}
      <PlayerBar />
    </div>
  );
}

export default App;
