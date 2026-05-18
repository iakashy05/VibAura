import React, { Suspense } from 'react';

const Home = React.lazy(() => import('../../pages/Home'));
const Artist = React.lazy(() => import('../../pages/Artist'));
const Playlist = React.lazy(() => import('../../pages/Playlist'));
const Search = React.lazy(() => import('../../pages/Search'));
const AuthPage = React.lazy(() => import('../../pages/AuthPage'));
const Vibrance = React.lazy(() => import('../../pages/Vibrance'));
const Payment = React.lazy(() => import('../../pages/Payment'));

const LoadingFallback = () => (
  <div className="flex h-96 items-center justify-center text-text-muted">
    <div className="flex flex-col items-center gap-4 animate-pulse">
      <div className="w-10 h-10 border-4 border-vibaura-primary border-t-transparent rounded-full animate-spin"></div>
      <span className="text-xs font-black tracking-[0.2em] uppercase text-vibaura-primary">Syncing Aura...</span>
    </div>
  </div>
);

/**
 * ViewRenderer is the "Traffic Controller" for the main content area.
 * It reads the current page state and renders the appropriate component.
 */
const ViewRenderer = ({ currentPage, selectedData, navigateTo, searchQuery }) => {
  const renderView = () => {
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

      case 'payment':
        return <Payment navigateTo={navigateTo} />;

      default:
        return (
          <div className="flex items-center justify-center h-full text-text-muted">
            <span className="text-xl font-medium tracking-widest uppercase">Select a Vibe</span>
          </div>
        );
    }
  };

  return (
    <Suspense fallback={<LoadingFallback />}>
      {renderView()}
    </Suspense>
  );
};

export default ViewRenderer;

