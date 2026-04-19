import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlay, 
  faShuffle, 
  faArrowsUpDown 
} from '@fortawesome/free-solid-svg-icons';

/**
 * ActionBar Component
 * A reusable sticky bar for music collection pages (Artist, Playlist, etc.)
 */
const ActionBar = ({ onPlay, onShuffle, onSort, children }) => {
  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the sentinel is NOT intersecting, it means it has scrolled past the top
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: [1.0] }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Scroll Sentinel */}
      <div ref={sentinelRef} className="h-px w-full pointer-events-none" />
      
      <div className={`
        sticky top-0 z-20 px-8 py-4 transition-all duration-300
        ${isSticky 
          ? 'bg-vibaura-tint/90 backdrop-blur-md border-b border-black/5 shadow-sm py-4' 
          : 'bg-transparent border-b border-transparent py-6'}
        flex items-center gap-4
      `}>
        <button 
          onClick={onPlay}
          className="bg-vibaura-primary text-white rounded-full px-8 py-2.5 flex items-center gap-2.5 text-sm font-bold hover:bg-vibaura-primary-hover hover:scale-105 active:scale-95 transition-all shadow-lg shadow-vibaura-primary/20"
        >
          <FontAwesomeIcon icon={faPlay} />
          Play Now
        </button>

        <button 
          onClick={onShuffle}
          className="border-2 border-vibaura-primary/20 text-text-primary rounded-full px-8 py-2.5 flex items-center gap-2.5 text-sm font-bold hover:bg-white/40 hover:border-vibaura-primary/40 transition-all active:scale-95"
        >
          <FontAwesomeIcon icon={faShuffle} className="text-vibaura-primary" />
          Shuffle
        </button>
        
        {/* Additional page-specific buttons */}
        {children}
        
        <button 
          onClick={onSort}
          className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/20 rounded-full transition-all ml-auto md:ml-0"
        >
          <FontAwesomeIcon icon={faArrowsUpDown} />
        </button>
      </div>
    </>
  );
};

export default ActionBar;
