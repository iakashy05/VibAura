import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faShareNodes, 
  faHeart as faHeartSolid,
  faListUl,
  faChevronRight,
  faCheck
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { toggleLikeSong, addSongToPlaylist, getLibrary } from '../../services/libraryService';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';

const TrackContextMenu = ({ isOpen, onClose, track, isLiked, onLikeToggle }) => {
  const menuRef = useRef(null);
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const { showToast } = useUIStore();
  const { user } = useAuthStore();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Fetch playlists when menu opens to ensure fresh data
      fetchPlaylists();
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      setShowPlaylists(false);
    };
  }, [isOpen, onClose]);

  const fetchPlaylists = async () => {
    try {
      const data = await getLibrary();
      // Only show playlists created by the user
      setPlaylists(data.playlists.filter(p => p.creator === user?.id));
    } catch (err) {
      console.error('Failed to fetch playlists', err);
    }
  };

  if (!isOpen) return null;

  const handleLikeClick = async (e) => {
    if (e) e.stopPropagation();
    try {
      await onLikeToggle();
      onClose();
    } catch (err) {
      showToast('Failed to update liked songs', 'error');
    }
  };

  const handleAddToPlaylistClick = (e) => {
    if (e) e.stopPropagation();
    setShowPlaylists(true);
  };

  const handlePlaylistSelect = async (e, playlistId, playlistTitle) => {
    if (e) e.stopPropagation();
    try {
      await addSongToPlaylist(playlistId, track.id);
      showToast(`Added to ${playlistTitle}`, 'success');
      window.dispatchEvent(new Event('vibaura-library-updated'));
      onClose();
    } catch (err) {
      showToast('Failed to add to playlist', 'error');
    }
  };

  const handleBackToMain = (e) => {
    if (e) e.stopPropagation();
    setShowPlaylists(false);
  };

  // Position: Track rows are usually thin, so we might want it to pop up or down
  const style = {
    position: 'absolute',
    top: '100%',
    right: '0',
    zIndex: 1000,
    marginTop: '8px'
  };

  return (
    <div 
      ref={menuRef}
      style={style}
      className="bg-white border border-[#F0F0F0] rounded-[24px] shadow-[0_12px_32px_rgba(0,0,0,0.1)] overflow-hidden min-w-[200px] animate-scale-in p-1.5"
    >
      {!showPlaylists ? (
        <>
          <button
            type="button"
            onClick={handleLikeClick}
            className="w-full px-3 py-2.5 text-left text-[10px] font-black uppercase tracking-tighter rounded-xl flex items-center gap-3 text-[#666] hover:bg-gray-50 hover:text-[#1A1A1A] transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-[#F5F5F7] flex items-center justify-center text-[#999]">
              <FontAwesomeIcon icon={isLiked ? faHeartSolid : faHeartRegular} className={isLiked ? 'text-vibaura-primary' : ''} />
            </div>
            <span>{isLiked ? 'Remove from Liked' : 'Like Song'}</span>
          </button>

          <button
            type="button"
            onClick={handleAddToPlaylistClick}
            className="w-full px-3 py-2.5 text-left text-[10px] font-black uppercase tracking-tighter rounded-xl flex items-center justify-between text-[#666] hover:bg-gray-50 hover:text-[#1A1A1A] transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#F5F5F7] flex items-center justify-center text-[#999]">
                <FontAwesomeIcon icon={faPlus} />
              </div>
              <span>Add to Playlist</span>
            </div>
            <FontAwesomeIcon icon={faChevronRight} className="text-[8px] opacity-30 group-hover:opacity-100 transition-opacity" />
          </button>

          <div className="h-[1px] bg-[#F0F0F0] my-1.5 mx-2" />

          <button
            type="button"
            disabled
            className="w-full px-3 py-2.5 text-left text-[10px] font-black uppercase tracking-tighter rounded-xl flex items-center justify-between opacity-30 cursor-not-allowed text-[#666]"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faListUl} />
              </div>
              <span>Add to Queue</span>
            </div>
            <span className="text-[7px] bg-gray-100 px-1.5 py-0.5 rounded-full">Soon</span>
          </button>

          <button
            type="button"
            disabled
            className="w-full px-3 py-2.5 text-left text-[10px] font-black uppercase tracking-tighter rounded-xl flex items-center justify-between opacity-30 cursor-not-allowed text-[#666]"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faShareNodes} />
              </div>
              <span>Share</span>
            </div>
            <span className="text-[7px] bg-gray-100 px-1.5 py-0.5 rounded-full">Soon</span>
          </button>
        </>
      ) : (
        <div className="animate-slide-in-right">
          <div className="px-3 py-2 border-b border-[#F0F0F0] mb-1 flex items-center gap-2">
             <button 
              type="button"
              onClick={handleBackToMain} 
              className="text-[#999] hover:text-[#1A1A1A] transition-colors"
             >
                <FontAwesomeIcon icon={faChevronRight} className="rotate-180 text-[10px]" />
             </button>
             <span className="text-[9px] font-black text-[#CCC] uppercase tracking-tighter">Choose Playlist</span>
          </div>
          <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
            {playlists.length > 0 ? (
              playlists.map(playlist => (
                <button
                  key={playlist.id}
                  type="button"
                  onClick={(e) => handlePlaylistSelect(e, playlist.id, playlist.title)}
                  className="w-full px-3 py-2 text-left text-[10px] font-bold uppercase tracking-tight text-[#666] hover:bg-vibaura-primary/5 hover:text-vibaura-primary rounded-lg transition-colors flex items-center justify-between"
                >
                  <span className="truncate">{playlist.title}</span>
                  {playlist.songs?.some(s => s.id === track.id) && (
                    <FontAwesomeIcon icon={faCheck} className="text-[8px]" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center">
                <p className="text-[9px] text-[#AAA] font-bold italic">No custom playlists found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackContextMenu;
