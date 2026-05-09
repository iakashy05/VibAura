import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay,
  faShuffle,
  faEllipsisH
} from '@fortawesome/free-solid-svg-icons';
import { usePlayerStore } from '../../store/playerStore';
import { useUIStore } from '../../store/uiStore';
import ContextMenu from '../ui/ContextMenu';

/**
 * ActionBar Component
 * A reusable sticky bar for music collection pages (Artist, Playlist, etc.)
 * Features exactly three options: Play Now, Shuffle, and Options (Three Dots)
 */
const ActionBar = ({ onPlay, onShuffle, itemId, itemType, item, onEdit, onNavigate }) => {
  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef(null);
  const menuBtnRef = useRef(null);
  
  const { activeMenuId, setActiveMenuId } = useUIStore();
  const menuKey = `action-bar-${itemType}-${itemId}`;
  const isMenuOpen = activeMenuId === menuKey;
  const setIsMenuOpen = (open) => setActiveMenuId(open ? menuKey : null);

  const { isShuffle } = usePlayerStore();

  useEffect(() => {
    const scrollArea = document.querySelector('.page-scroll-area');
    
    const handleScroll = () => {
      if (sentinelRef.current) {
        const rect = sentinelRef.current.getBoundingClientRect();
        // Use a small buffer (5px) for more reliable detection
        setIsSticky(rect.top <= 5);
      }
    };

    if (scrollArea) {
      scrollArea.addEventListener('scroll', handleScroll, { passive: true });
    } else {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    handleScroll();

    return () => {
      if (scrollArea) scrollArea.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <div ref={sentinelRef} className="h-px w-full pointer-events-none" />

      <div className={`
        sticky top-0 z-40 px-8 transition-all duration-300
        ${isSticky
          ? 'bg-white/90 backdrop-blur-md border-b border-black/5 shadow-[0_4px_30px_rgba(0,0,0,0.03)]'
          : 'bg-transparent border-b border-transparent'}
        flex items-center gap-6 py-6
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
            onMouseDown={(e) => e.stopPropagation()}
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
            item={item || { id: itemId }}
            type={itemType}
            onEdit={onEdit}
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </>
  );
};

export default ActionBar;
