import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlay, 
  faShuffle, 
  faEllipsisH 
} from '@fortawesome/free-solid-svg-icons';
import { usePlayerStore } from '../../store/playerStore';
import ContextMenu from '../ui/ContextMenu';

/**
 * ActionBar Component
 * A reusable sticky bar for music collection pages (Artist, Playlist, etc.)
 * Features exactly three options: Play Now, Shuffle, and Options (Three Dots)
 */
const ActionBar = ({ onPlay, onShuffle, itemId, itemType }) => {
  const [isSticky, setIsSticky] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const sentinelRef = useRef(null);
  const menuBtnRef = useRef(null);
  
  const { isShuffle } = usePlayerStore();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      { threshold: [1.0] }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <div ref={sentinelRef} className="h-px w-full pointer-events-none" />
      
      <div className={`
        sticky top-0 z-20 px-8 py-4 transition-all duration-300
        ${isSticky 
          ? 'bg-vibaura-tint/90 backdrop-blur-md border-b border-black/5 shadow-sm py-4' 
          : 'bg-transparent border-b border-transparent py-6'}
        flex items-center gap-6
      `}>
        {/* 1. Play Now Button */}
        <button 
          onClick={onPlay}
          className="bg-vibaura-primary text-white rounded-full px-10 py-3 flex items-center gap-3 text-sm font-bold hover:bg-vibaura-primary-hover hover:scale-105 active:scale-95 transition-all shadow-lg shadow-vibaura-primary/20"
        >
          <FontAwesomeIcon icon={faPlay} className="text-xs" />
          Play Now
        </button>

        {/* 2. Shuffle Button */}
        <button 
          onClick={onShuffle}
          className={`
            rounded-full px-10 py-3 flex items-center gap-3 text-sm font-bold transition-all active:scale-95 border-2
            ${isShuffle 
              ? 'bg-vibaura-primary text-white border-vibaura-primary shadow-lg shadow-vibaura-primary/20' 
              : 'border-vibaura-primary/20 text-text-primary hover:bg-white/40 hover:border-vibaura-primary/40'}
          `}
        >
          <FontAwesomeIcon icon={faShuffle} className={isShuffle ? 'text-white' : 'text-vibaura-primary'} />
          Shuffle
        </button>
        
        {/* 3. Three Dot Icon */}
        <div className="relative">
          <button 
            ref={menuBtnRef}
            onClick={handleMenuToggle}
            className={`
              w-12 h-12 flex items-center justify-center rounded-full transition-all active:scale-90
              ${isMenuOpen ? 'bg-vibaura-primary text-white shadow-lg' : 'text-text-muted hover:text-vibaura-primary hover:bg-white/40'}
            `}
          >
            <FontAwesomeIcon icon={faEllipsisH} size="lg" />
          </button>
          
          <ContextMenu 
            isOpen={isMenuOpen} 
            onClose={() => setIsMenuOpen(false)} 
            itemId={itemId}
            itemType={itemType}
          />
        </div>
      </div>
    </>
  );
};

export default ActionBar;
