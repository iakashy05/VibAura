import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faShareNodes, 
  faHeart, 
  faListUl
} from '@fortawesome/free-solid-svg-icons';
import { toggleLibraryPlaylist, toggleLibraryArtist } from '../../services/libraryService';
import { useUIStore } from '../../store/uiStore';

const ContextMenu = ({ isOpen, onClose, itemId, itemType }) => {
  const menuRef = useRef(null);
  const { showToast } = useUIStore();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAddToLibrary = async () => {
    if (!itemId || !itemType) return;
    
    try {
      let res;
      if (itemType === 'playlist') {
        res = await toggleLibraryPlaylist(itemId);
      } else if (itemType === 'artist') {
        res = await toggleLibraryArtist(itemId);
      }
      
      showToast(res.message || 'Updated library', 'success');
      // Trigger a global refresh for components listening to library changes
      window.dispatchEvent(new Event('vibaura-library-updated'));
      onClose();
    } catch (err) {
      showToast('Failed to update library', 'error');
    }
  };

  // Position the menu relative to the "relative" parent (.three-dot container)
  const style = {
    position: 'absolute',
    top: 'calc(100% + 12px)',
    right: '0',
    zIndex: 1000,
  };

  const menuItems = [
    { icon: faPlus, text: 'Add to Library', onClick: handleAddToLibrary },
    { icon: faListUl, text: 'Add to Queue', isComingSoon: true },
    { icon: faHeart, text: 'Like all songs', isComingSoon: true },
    { icon: faShareNodes, text: 'Share', isComingSoon: true },
  ];

  return (
    <div 
      ref={menuRef}
      style={style}
      className="bg-white border border-[#F0F0F0] rounded-[24px] shadow-[0_12px_32px_rgba(0,0,0,0.1)] overflow-hidden min-w-[180px] animate-scale-in p-1.5"
    >
      {menuItems.map((item, idx) => (
        <button
          key={idx}
          onClick={item.isComingSoon ? null : item.onClick}
          disabled={item.isComingSoon}
          className={`
            w-full px-3 py-2.5 text-left text-[10px] font-black uppercase tracking-tighter rounded-xl flex items-center justify-between transition-colors
            ${item.isComingSoon 
              ? 'opacity-30 cursor-not-allowed' 
              : 'text-[#666] hover:bg-gray-50 hover:text-[#1A1A1A] active:scale-95'}
          `}
        >
          <div className="flex items-center gap-3">
            <div className={`
              w-7 h-7 rounded-lg flex items-center justify-center transition-colors
              ${item.isComingSoon ? 'bg-gray-100 text-[#CCC]' : 'bg-[#F5F5F7] text-[#999]'}
            `}>
              <FontAwesomeIcon icon={item.icon} className="text-xs" />
            </div>
            <span>{item.text}</span>
          </div>
          
          {item.isComingSoon && (
            <span className="text-[7px] bg-gray-100 text-[#CCC] px-1.5 py-0.5 rounded-full">
              Soon
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default ContextMenu;
