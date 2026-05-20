import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome, faSearch, faBookOpen, faPodcast, faUser
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

/**
 * MobileNavbar Component
 * A premium, glassmorphic 64px bottom tab navigation bar for mobile viewports.
 */
const MobileNavbar = ({ currentPage, onNavigate }) => {
  // Maps routes to bottom tab configurations
  const tabs = [
    { id: 'home', label: 'Home', icon: faHome },
    { id: 'library', label: 'Library', icon: faBookOpen },
    { id: 'search', label: 'Search', icon: faSearch },
    { id: 'vibsync', label: 'VibSync', icon: faPodcast },
    { id: 'profile', label: 'Profile', icon: faUser },
  ];

  // Helper to determine if a tab is currently active
  const isTabActive = (tabId) => {
    if (tabId === 'library') {
      // Library remains active when reading sub playlist/artist pages
      return currentPage === 'library' || currentPage === 'playlist' || currentPage === 'artist';
    }
    return currentPage === tabId;
  };

  return (
    <nav className="h-16 fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-[#121223]/95 backdrop-blur-md border-t border-black/[0.05] dark:border-white/5 px-6 flex items-center justify-between pb-safe transition-all duration-300">
      
      {tabs.map((tab) => {
        const active = isTabActive(tab.id);
        
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className="flex flex-col items-center justify-center flex-1 py-1 h-full relative focus:outline-none group"
          >
            {/* Icon Wrapper */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 relative
              ${active 
                ? 'text-vibaura-primary bg-vibaura-primary/5 dark:bg-vibaura-primary/10 scale-110' 
                : 'text-[#999] dark:text-text-muted group-hover:text-vibaura-primary/60 hover:scale-105'}`}
            >
              <FontAwesomeIcon 
                icon={tab.icon} 
                className="text-[21px]" 
              />
            </div>

            {/* Active Pill Indicator (Moved to bottom below the icon) */}
            {active && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute bottom-1.5 w-6 h-[3px] bg-vibaura-primary rounded-full"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        );
      })}

    </nav>
  );
};

export default MobileNavbar;
