import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';

/**
 * MobileHeader Component
 * A compact, 56px sticky top header built specifically for mobile screens.
 */
const MobileHeader = ({ 
  currentPage, 
  selectedData, 
  onNavigate, 
  goBack, 
  canGoBack, 
  user, 
  isSubscribed, 
  onAvatarClick,
  searchQuery,
  setSearchQuery
}) => {
  // 1. Separate subpage types for polished UX
  const isArtSubpage = currentPage === 'playlist' || currentPage === 'artist';
  const isStandardSubpage = currentPage === 'payment' || 
                            currentPage === 'vibrance' || 
                            (currentPage === 'profile' && canGoBack);
  const isSubpage = isArtSubpage || isStandardSubpage;
  
  // Decide the text to display in the header
  const getHeaderTitle = () => {
    if (currentPage === 'playlist') {
      return selectedData?.title || 'Playlist';
    }
    if (currentPage === 'artist') {
      return selectedData?.title || 'Artist';
    }
    if (currentPage === 'payment') {
      return 'Upgrade Pro';
    }
    if (currentPage === 'vibrance') {
      return 'Vibrance Report';
    }
    if (currentPage === 'profile') {
      return 'Your Account';
    }
    if (currentPage === 'library') {
      return 'Your Library';
    }
    if (currentPage === 'vibsync') {
      return 'VibSync Room';
    }
    return 'VibAura';
  };

  const displayName = user?.name || user?.email || 'Aura User';
  const avatarLetter = displayName[0].toUpperCase();

  // Premium glassmorphic solid header for all pages
  const headerClass = 'h-14 fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#121223]/95 backdrop-blur-md border-b border-black/[0.05] dark:border-white/5 select-none shadow-[0_2px_12px_rgba(0,0,0,0.02)]';

  // Beautiful consistent back button class
  const backButtonClass = 'w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 active:scale-95 border border-black/5 dark:border-white/5 bg-vibaura-view-bg dark:bg-[#151528] text-[#555] dark:text-text-secondary hover:text-vibaura-primary dark:hover:text-vibaura-primary shrink-0';

  // Title displays immediately on all pages without waiting for scroll
  const titleClass = 'font-black text-[13px] text-[#1A1A1A] dark:text-text-primary tracking-tight truncate max-w-[200px] opacity-100 translate-x-0';

  return (
    <header className={headerClass}>
      <div className="w-full h-full px-4 flex items-center justify-between">
        
        {currentPage === 'search' ? (
          <div className="flex-1 flex items-center gap-3 animate-fade-in w-full">
            {canGoBack && (
              <button
                onClick={goBack}
                className="w-9 h-9 flex items-center justify-center rounded-full border border-black/5 dark:border-white/5 bg-vibaura-view-bg dark:bg-[#151528] text-[#555] dark:text-text-secondary active:scale-95 transition-all shrink-0"
                aria-label="Go Back"
              >
                <FontAwesomeIcon icon={faChevronLeft} className="text-xs mr-0.5" />
              </button>
            )}
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                placeholder="Search songs, artists, playlists..."
                value={searchQuery || ''}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#E4E4E9]/50 dark:bg-vibaura-bg-muted/30 border border-transparent dark:border-white/5 rounded-2xl pl-10 pr-9 py-2.5 text-xs text-[#1A1A1A] dark:text-text-primary placeholder-[#888] dark:placeholder-[#64748B] focus:outline-none focus:bg-white dark:focus:bg-[#151528] focus:border-vibaura-primary/20 dark:focus:border-vibaura-primary/30 transition-all font-bold"
              />
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#1A1A1A] w-5 h-5 flex items-center justify-center rounded-full bg-black/5 active:scale-90 transition-transform"
                >
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {user && (
              <div className="relative p-[2px] transition-all duration-300 animate-fade-in shrink-0">
                {isSubscribed && (
                  <div className="absolute inset-0 rounded-[11px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500"></div>
                )}
                <button
                  onClick={onAvatarClick}
                  className={`relative w-8 h-8 rounded-[9px] bg-vibaura-primary flex items-center justify-center text-white font-black text-xs active:scale-95 transition-all z-10
                    ${isSubscribed ? 'border border-white dark:border-[#121223]' : ''}`}
                  aria-label="Open profile settings"
                >
                  {avatarLetter}
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* 1. Left Section: Back button / Branding & Page name */}
            <div className="flex items-center gap-3 min-w-0 pointer-events-auto">
              {isSubpage ? (
                <>
                  {/* Back Button */}
                  <button
                    onClick={goBack}
                    className={backButtonClass}
                    aria-label="Go Back"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} className="text-xs mr-0.5" />
                  </button>

                  {/* Dynamic Header Title */}
                  <span className={titleClass}>
                    {getHeaderTitle()}
                  </span>
                </>
              ) : currentPage === 'home' ? (
                <div 
                  onClick={() => onNavigate('home')} 
                  className="flex items-center gap-2 cursor-pointer shrink-0 animate-fade-in"
                >
                  <div className="w-8 h-8">
                    <img src="/logo.webp" alt="VibAura Logo" className="w-full h-full object-contain" />
                  </div>
                  <span className="font-black text-lg text-[#1A1A1A] dark:text-text-primary tracking-tight leading-none">
                    VibAura
                  </span>
                </div>
              ) : (
                <span className="font-black text-lg text-[#1A1A1A] dark:text-text-primary tracking-tight leading-none animate-fade-in">
                  {getHeaderTitle()}
                </span>
              )}
            </div>

            {/* 2. Right Section: Profile Avatar Trigger (Hidden completely on subpages or profile page) */}
            <div className="flex items-center gap-3 shrink-0 pointer-events-auto">
              {user && !isSubpage && currentPage !== 'profile' && (
                <div className="relative p-[2px] transition-all duration-300 animate-fade-in">
                  {isSubscribed && (
                    <div className="absolute inset-0 rounded-[11px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500"></div>
                  )}
                  <button
                    onClick={onAvatarClick}
                    className={`relative w-8 h-8 rounded-[9px] bg-vibaura-primary flex items-center justify-center text-white font-black text-xs active:scale-95 transition-all z-10
                      ${isSubscribed ? 'border border-white dark:border-[#121223]' : ''}`}
                    aria-label="Open profile settings"
                  >
                    {avatarLetter}
                  </button>
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </header>
  );
};

export default MobileHeader;
