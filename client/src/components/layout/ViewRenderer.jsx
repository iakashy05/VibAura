import React from 'react';
import Home from '../../pages/Home';
import Artist from '../../pages/Artist';
import Playlist from '../../pages/Playlist';
import Search from '../../pages/Search';
import AuthPage from '../../pages/AuthPage';
import Vibrance from '../../pages/Vibrance';

/**
 * ViewRenderer is the "Traffic Controller" for the main content area.
 * It reads the current page state and renders the appropriate component.
 */
const ViewRenderer = ({ currentPage, selectedData, navigateTo, searchQuery }) => {
  switch (currentPage) {
    case 'login':
      return <AuthPage />;

    case 'home':
      return <Home onNavigate={navigateTo} />;
    
    case 'artist':
      return <Artist artist={selectedData} />;
    
    case 'playlist':
      return <Playlist playlist={selectedData} onNavigate={navigateTo} />;

    case 'search':
      return <Search query={searchQuery} onNavigate={navigateTo} />;

    case 'vibrance':
      return <Vibrance />;


    default:
      return (
        <div className="flex items-center justify-center h-full text-text-muted">
          <span className="text-xl font-medium tracking-widest uppercase">Select a Vibe</span>
        </div>
      );
  }
};

export default ViewRenderer;

