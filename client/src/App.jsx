import React, { useState } from 'react';
import Sidebar from './components/layout/sidebar';
import Header from './components/layout/header';
import PlayerBar from './components/layout/playerBar';
import Home from './pages/Home';
import Artist from './pages/Artist';
import Playlist from './pages/Playlist';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedData, setSelectedData] = useState(null);

  // Simple navigation handler
  const navigateTo = (page, data = null) => {
    setCurrentPage(page);
    setSelectedData(data);
    
    // Reset scroll position when page changes
    setTimeout(() => {
      const scrollArea = document.querySelector('.page-scroll-area');
      if (scrollArea) scrollArea.scrollTo({ top: 0, behavior: 'instant' });
    }, 10);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-vibaura-surface font-jost overflow-hidden">
      
      {/* 1. Header is now part of the top frame */}
      <Header onNavigate={navigateTo} />

      {/* 2. Middle Row: Sidebar + Rounded Content Pod */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar onNavigate={navigateTo} currentPage={currentPage} />

        {/* The Rounded "Pod" (Home Page area) */}
        <main className="flex-1 bg-vibaura-bg-pink rounded-tl-[40px] rounded-bl-[40px] overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto custom-scrollbar page-scroll-area relative">
            
            {/* Conditional Page Rendering */}
            {currentPage === 'home' && <Home onNavigate={navigateTo} />}
            
            {currentPage === 'artist' && <Artist artist={selectedData} />}

            {currentPage === 'playlist' && <Playlist playlist={selectedData} />}

          </div>
        </main>
      </div>

      {/* 3. PlayerBar is part of the bottom frame */}
      <PlayerBar />
    </div>
  );
}

export default App;
