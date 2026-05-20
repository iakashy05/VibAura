import React, { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Home = React.lazy(() => import('../../pages/Home'));
const Artist = React.lazy(() => import('../../pages/Artist'));
const Playlist = React.lazy(() => import('../../pages/Playlist'));
const Search = React.lazy(() => import('../../pages/Search'));
const AuthPage = React.lazy(() => import('../../pages/AuthPage'));
const Vibrance = React.lazy(() => import('../../pages/Vibrance'));
const Payment = React.lazy(() => import('../../pages/Payment'));
const VibSync = React.lazy(() => import('../../pages/VibSync'));
const Library = React.lazy(() => import('../../pages/Library'));
const Profile = React.lazy(() => import('../../pages/Profile'));
import MusicLoader from '../ui/MusicLoader';

// Centered sound wave animation for transitions and lazy loads
const LoadingFallback = () => (
  <MusicLoader text="Tuning Vibes..." />
);

/**
 * ViewRenderer is the "Traffic Controller" for the main content area.
 * It reads the current page state and renders the appropriate component.
 */
const ViewRenderer = ({ currentPage, selectedData, navigateTo, searchQuery, setSearchQuery }) => {
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
        return <Search query={searchQuery} setSearchQuery={setSearchQuery} onNavigate={navigateTo} />;

      case 'library':
        return <Library onNavigate={navigateTo} />;

      case 'vibrance':
        return <Vibrance />;

      case 'payment':
        return <Payment navigateTo={navigateTo} />;

      case 'vibsync':
        return <VibSync />;

      case 'profile':
        return <Profile onNavigate={navigateTo} />;

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
      <AnimatePresence>
        <motion.div
          key={currentPage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="h-full w-full"
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </Suspense>
  );
};

export default ViewRenderer;

