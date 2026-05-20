import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faStepForward } from '@fortawesome/free-solid-svg-icons';
import { usePlayerStore } from '../../store/playerStore';

/**
 * MobileMiniplayer Component
 * A floating, glassmorphic miniplayer pill that sits above the bottom navbar.
 */
const MobileMiniplayer = () => {
  const currentTrack = usePlayerStore(state => state.currentTrack);
  const isPlaying = usePlayerStore(state => state.isPlaying);
  const togglePlay = usePlayerStore(state => state.togglePlay);
  const nextTrack = usePlayerStore(state => state.nextTrack);
  const toggleFullscreen = usePlayerStore(state => state.toggleFullscreen);

  if (!currentTrack) return null;

  const handlePlayPause = (e) => {
    e.stopPropagation(); // Prevents container click from going fullscreen
    togglePlay();
  };

  const handleNextTrack = (e) => {
    e.stopPropagation(); // Prevents container click from going fullscreen
    nextTrack();
  };

  const handleContainerClick = (e) => {
    toggleFullscreen();
  };

  return (
    <div 
      onClick={handleContainerClick}
      className="fixed bottom-16 left-4 right-4 h-16 z-40 bg-white/80 dark:bg-[#121223]/85 backdrop-blur-xl border border-white/40 dark:border-white/5 rounded-2xl flex items-center justify-between px-4 shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)] cursor-pointer select-none transition-all duration-300"
    >
      {/* 1. Track Info Section */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Album Artwork (Static to conserve GPU memory) */}
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-vibaura-bg-muted flex-shrink-0 shadow-md relative">
          <img 
            src={currentTrack.albumArt || currentTrack.image} 
            alt={currentTrack.title} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Title and Artist */}
        <div className="flex flex-col min-w-0 flex-1 pr-2">
          <span className="text-xs font-black text-[#1A1A1A] dark:text-text-primary tracking-tight truncate leading-tight">
            {currentTrack.title}
          </span>
          <span className="text-[10px] text-vibaura-primary font-medium truncate mt-0.5">
            {Array.isArray(currentTrack.artists)
              ? currentTrack.artists.map(a => a.name).join(', ')
              : (currentTrack.artist || 'VibAura Artist')}
          </span>
        </div>
      </div>

      {/* 2. Audio Control Section */}
      <div 
        className="flex items-center gap-2 shrink-0" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Play/Pause Button */}
        <button
          onClick={handlePlayPause}
          className="w-10 h-10 rounded-full bg-vibaura-primary text-white flex items-center justify-center shadow-md active:opacity-80 transition-opacity duration-75"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          <FontAwesomeIcon 
            icon={isPlaying ? faPause : faPlay} 
            className={`text-xs ${!isPlaying ? 'ml-0.5' : ''}`} 
          />
        </button>

        {/* Next Button */}
        <button
          onClick={handleNextTrack}
          className="w-9 h-9 rounded-full bg-vibaura-view-bg dark:bg-vibaura-bg-muted/30 border border-black/5 dark:border-white/5 text-[#999] dark:text-text-secondary hover:text-[#1A1A1A] dark:hover:text-white flex items-center justify-center active:opacity-80 active:bg-black/[0.05] dark:active:bg-white/[0.05] transition-all duration-75"
          aria-label="Next Track"
        >
          <FontAwesomeIcon icon={faStepForward} className="text-xs" />
        </button>
      </div>
    </div>
  );
};

export default MobileMiniplayer;
