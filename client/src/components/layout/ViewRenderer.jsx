import React from 'react';
import Home from '../../pages/Home';
import Artist from '../../pages/Artist';
import Playlist from '../../pages/Playlist';

/**
 * ViewRenderer is the "Traffic Controller" for the main content area.
 * It reads the current page state and renders the appropriate component.
 */
const ViewRenderer = ({ currentPage, selectedData, navigateTo }) => {
  switch (currentPage) {
    case 'home':
      return <Home onNavigate={navigateTo} />;
    
    case 'artist':
      return <Artist artist={selectedData} />;
    
    case 'playlist':
      return <Playlist playlist={selectedData} />;
    
    default:
      return (
        <div className="flex items-center justify-center h-full text-text-muted">
          <span className="text-xl font-medium tracking-widest uppercase">Select a Vibe</span>
        </div>
      );
  }
};

export default ViewRenderer;

