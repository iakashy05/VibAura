import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faShareNodes, 
  faHeart as faHeartSolid,
  faListUl,
  faChevronRight,
  faCheck,
  faTrash,
  faPen,
  faThumbtack,
  faMinusCircle
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { 
  toggleLikeSong, 
  addSongToPlaylist, 
  getLibrary, 
  deletePlaylist, 
  toggleLibraryPlaylist, 
  togglePinPlaylist,
  togglePinArtist,
  toggleLibraryArtist,
  removeSongFromPlaylist
} from '../../services/libraryService';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { usePlayerStore } from '../../store/playerStore';
import { useLibraryStore } from '../../store/libraryStore';
import Dropdown from './Dropdown';

/**
 * Unified Context Menu for Songs, Playlists, and Artists across all contexts.
 */
const ContextMenu = ({ 
  isOpen, 
  onClose, 
  item, 
  type, // 'track', 'playlist', 'artist'
  isLiked, // for tracks
  onLikeToggle, // for tracks
  onEdit, // for own playlists
  isPinned, // for sidebar items
  isInLibrary = false, // new prop to distinguish actions
  playlistId = null, // ID of the playlist if we are inside one
  isPlaylistOwner = false, // if the current user owns the playlist containing the track
  positionClass = 'right-0 top-full mt-2',
  onNavigate = null
}) => {
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const { showToast, showConfirm } = useUIStore();
  const { user } = useAuthStore();
  const { addToQueue } = usePlayerStore();

  const isOwner = item?.creator === user?.id || item?.userId === user?.id;

  useEffect(() => {
    if (isOpen && type === 'track') {
      fetchPlaylists();
    }
    if (!isOpen) {
      setShowPlaylists(false);
    }
  }, [isOpen, type]);

  const fetchPlaylists = () => {
    try {
      const { playlists } = useLibraryStore.getState();
      setPlaylists(playlists.filter(p => p.creator === user?.id));
    } catch (err) {
      console.error('Failed to fetch playlists', err);
    }
  };

  const handlePlaylistSelect = async (e, playlistId, playlistTitle) => {
    if (e) e.stopPropagation();
    try {
      await addSongToPlaylist(playlistId, item.id);
      // Immediately reflect in central Zustand store
      const { addSongToPlaylistInStore } = useLibraryStore.getState();
      addSongToPlaylistInStore(playlistId, item);
      showToast(`Added to ${playlistTitle}`, 'success');
      onClose();
    } catch (err) {
      const isDuplicate = err.response?.status === 400 || 
                         err.response?.status === 409 || 
                         err.response?.data?.message?.includes('already');
      
      if (isDuplicate) {
        showToast('Song is already in this playlist', 'error');
      } else {
        showToast('Failed to add to playlist', 'error');
      }
    }
  };

  const handleLibraryToggle = async (e) => {
    if (e) e.stopPropagation();
    try {
      if (type === 'playlist') {
        const { toggleLibraryPlaylistOptimistic } = useLibraryStore.getState();
        await toggleLibraryPlaylistOptimistic(item);
      } else if (type === 'artist') {
        const { toggleLibraryArtistOptimistic } = useLibraryStore.getState();
        await toggleLibraryArtistOptimistic(item);
      }
      onClose();
    } catch (err) {
      showToast('Failed to update library', 'error');
    }
  };

  const handleDeletePlaylist = (e) => {
    e.stopPropagation();
    if (isOwner) {
      showConfirm(
        'Delete Playlist',
        `Are you sure you want to permanently delete "${item.title}"?`,
        async () => {
          try {
            const { deletePlaylistOptimistic } = useLibraryStore.getState();
            await deletePlaylistOptimistic(item.id);
            if (onNavigate) onNavigate('home');
            onClose();
          } catch (err) {
            // Error is already toasted inside the store delete action
          }
        },
        'Yes, Delete it'
      );
    } else {
      handleLibraryToggle(e);
    }
  };

  const handleTogglePin = async (e) => {
    e.stopPropagation();
    try {
      if (type === 'playlist') {
        const { togglePinPlaylistOptimistic } = useLibraryStore.getState();
        await togglePinPlaylistOptimistic(item.id);
      } else if (type === 'artist') {
        const { togglePinArtistOptimistic } = useLibraryStore.getState();
        await togglePinArtistOptimistic(item.id);
      }
      onClose();
    } catch (err) {
      showToast('Failed to pin item', 'error');
    }
  };

  return (
    <Dropdown isOpen={isOpen} onClose={onClose} positionClass={positionClass}>
      {!showPlaylists ? (
        <div className="flex flex-col">
          
          {/* 1. SONG ROW CONTEXT */}
          {type === 'track' && (
            <>
              <ContextMenuItem
                icon={faPlus}
                label="Add to Playlist"
                hasSubmenu
                onClick={(e) => { e.stopPropagation(); setShowPlaylists(true); }}
              />
              <ContextMenuItem 
                icon={faListUl} 
                label="Add to Queue" 
                onClick={(e) => {
                  e.stopPropagation();
                  addToQueue(item);
                  showToast('Added to Queue', 'success');
                  onClose();
                }} 
              />
              <ContextMenuItem icon={faShareNodes} label="Share" muted />
              {playlistId && isPlaylistOwner && (
                <>
                  <div className="h-[1px] bg-[#F0F0F0] my-1 mx-2" />
                  <ContextMenuItem 
                    icon={faTrash} 
                    label="Remove from Playlist" 
                    danger
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        await removeSongFromPlaylist(playlistId, item.id);
                        // Immediately reflect in central Zustand store
                        const { removeSongFromPlaylistInStore } = useLibraryStore.getState();
                        removeSongFromPlaylistInStore(playlistId, item.id);
                        showToast('Removed from playlist', 'success');
                        onClose();
                      } catch (err) {
                        const errorMsg = err.response?.data?.message || 'Failed to remove song';
                        showToast(errorMsg, 'error');
                      }
                    }}
                  />
                </>
              )}
            </>
          )}

          {/* 2. PLAYLIST CONTEXT (Sidebar or Page Header) */}
          {type === 'playlist' && (
            <>
              {isOwner ? (
                <>
                  <ContextMenuItem 
                    icon={faPen} 
                    label="Edit Details" 
                    onClick={(e) => { e.stopPropagation(); onEdit ? onEdit(item) : null; onClose(); }} 
                  />
                  {isInLibrary && (
                    <ContextMenuItem 
                      icon={faThumbtack} 
                      label={isPinned ? "Unpin from Top" : "Pin to Top"} 
                      iconClass={isPinned ? 'text-vibaura-primary' : ''}
                      onClick={handleTogglePin} 
                    />
                  )}
                  <ContextMenuItem icon={faShareNodes} label="Share" muted />
                  <div className="h-[1px] bg-[#F0F0F0] my-1 mx-2" />
                  <ContextMenuItem 
                    icon={faTrash} 
                    label="Delete Playlist" 
                    danger
                    onClick={handleDeletePlaylist}
                  />
                </>
              ) : (
                <>
                  {!isInLibrary ? (
                    <>
                      <ContextMenuItem 
                        icon={faPlus} 
                        label="Add to Library" 
                        onClick={handleLibraryToggle}
                      />
                      <ContextMenuItem icon={faShareNodes} label="Share" muted />
                    </>
                  ) : (
                    <>
                      {isInLibrary && (
                        <ContextMenuItem 
                          icon={faThumbtack} 
                          label={isPinned ? "Unpin from Top" : "Pin to Top"} 
                          iconClass={isPinned ? 'text-vibaura-primary' : ''}
                          onClick={handleTogglePin} 
                        />
                      )}
                      <ContextMenuItem icon={faShareNodes} label="Share" muted />
                      <div className="h-[1px] bg-[#F0F0F0] my-1 mx-2" />
                      <ContextMenuItem 
                        icon={faMinusCircle} 
                        label="Remove Playlist" 
                        danger
                        onClick={handleLibraryToggle}
                      />
                    </>
                  )}
                </>
              )}
            </>
          )}

          {/* 3. ARTIST CONTEXT (Sidebar or Page Header) */}
          {type === 'artist' && (
            <>
              {!isInLibrary ? (
                <>
                  <ContextMenuItem icon={faPlus} label="Add to Library" onClick={handleLibraryToggle} />
                  <ContextMenuItem icon={faShareNodes} label="Share" muted />
                </>
              ) : (
                <>
                  {isInLibrary && (
                    <ContextMenuItem 
                      icon={faThumbtack} 
                      label={isPinned ? "Unpin from Top" : "Pin to Top"} 
                      iconClass={isPinned ? 'text-vibaura-primary' : ''}
                      onClick={handleTogglePin} 
                    />
                  )}
                  <ContextMenuItem icon={faShareNodes} label="Share" muted />
                  <div className="h-[1px] bg-[#F0F0F0] my-1 mx-2" />
                  <ContextMenuItem 
                    icon={faMinusCircle} 
                    label="Remove Artist" 
                    danger
                    onClick={handleLibraryToggle}
                  />
                </>
              )}
            </>
          )}
        </div>
      ) : (
        /* SUBMENU: ADD TO PLAYLIST */
        <div className="animate-slide-in-right">
          <div className="px-3 py-2 border-b border-[#F0F0F0] mb-1 flex items-center gap-2">
             <button 
              onClick={(e) => { e.stopPropagation(); setShowPlaylists(false); }} 
              className="text-[#999] hover:text-[#1A1A1A] transition-colors"
             >
                <FontAwesomeIcon icon={faChevronRight} className="rotate-180 text-[10px]" />
             </button>
             <span className="text-[9px] font-black text-[#CCC] tracking-tighter">Choose Playlist</span>
          </div>
          <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
            {playlists.length > 0 ? (
              playlists.map(p => (
                <button
                  type="button"
                  key={p.id}
                  onClick={(e) => {
                    if (e) {
                      e.stopPropagation();
                      e.preventDefault();
                    }
                    handlePlaylistSelect(e, p.id, p.title);
                  }}
                  className="w-full px-3 py-2 text-left text-[10px] font-bold tracking-tight text-[#666] hover:bg-vibaura-primary/5 hover:text-vibaura-primary rounded-lg transition-colors flex items-center justify-between"
                >
                  <span className="truncate">{p.title}</span>
                  {p.songs?.some(s => s.id === item.id) && (
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
    </Dropdown>
  );
};

const ContextMenuItem = ({ icon, label, onClick, muted = false, danger = false, hasSubmenu = false, iconClass = '' }) => (
  <button 
    type="button"
    onClick={(e) => {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
      if (onClick) onClick(e);
    }}
    onMouseDown={(e) => {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
    }}
    disabled={muted}
    className={`w-full px-3 py-2.5 text-left text-[10px] font-black tracking-tighter rounded-xl flex items-center justify-between transition-colors
      ${muted ? 'opacity-30 cursor-not-allowed' : ''}
      ${danger ? 'text-red-500 hover:bg-red-50' : 'text-[#666] hover:bg-gray-50 hover:text-[#1A1A1A]'}
    `}
  >
    <div className="flex items-center gap-3">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${danger ? 'bg-red-50' : 'bg-[#F5F5F7]'} ${iconClass}`}>
        <FontAwesomeIcon icon={icon} />
      </div>
      <span>{label}</span>
    </div>
    {hasSubmenu && <FontAwesomeIcon icon={faChevronRight} className="text-[8px] opacity-30" />}
    {muted && <span className="text-[7px] bg-gray-100 px-1.5 py-0.5 rounded-full">Soon</span>}
  </button>
);

export default ContextMenu;
