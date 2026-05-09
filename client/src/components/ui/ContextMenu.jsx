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
  toggleLibraryArtist 
} from '../../services/libraryService';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { usePlayerStore } from '../../store/playerStore';
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
  positionClass = 'right-0 top-full mt-2'
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

  const fetchPlaylists = async () => {
    try {
      const data = await getLibrary();
      setPlaylists(data.playlists.filter(p => p.creator === user?.id));
    } catch (err) {
      console.error('Failed to fetch playlists', err);
    }
  };

  const handlePlaylistSelect = async (e, playlistId, playlistTitle) => {
    if (e) e.stopPropagation();
    try {
      await addSongToPlaylist(playlistId, item.id);
      showToast(`Added to ${playlistTitle}`, 'success');
      window.dispatchEvent(new Event('vibaura-library-updated'));
      onClose();
    } catch (err) {
      showToast('Failed to add to playlist', 'error');
    }
  };

  const handleLibraryToggle = async (e) => {
    if (e) e.stopPropagation();
    try {
      let res;
      if (type === 'playlist') {
        res = await toggleLibraryPlaylist(item.id);
      } else if (type === 'artist') {
        res = await toggleLibraryArtist(item.id);
      }
      showToast(res?.message || 'Library updated', 'success');
      window.dispatchEvent(new Event('vibaura-library-updated'));
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
            await deletePlaylist(item.id);
            window.dispatchEvent(new Event('vibaura-library-updated'));
            showToast('Playlist deleted', 'success');
            onClose();
          } catch (err) {
            showToast('Failed to delete playlist', 'error');
          }
        }
      );
    } else {
      handleLibraryToggle(e);
    }
  };

  const handleTogglePin = async (e) => {
    e.stopPropagation();
    try {
      if (type === 'playlist') {
        await togglePinPlaylist(item.id);
      } else if (type === 'artist') {
        await togglePinArtist(item.id);
      }
      window.dispatchEvent(new Event('vibaura-library-updated'));
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
                icon={isLiked ? faHeartSolid : faHeartRegular}
                label={isLiked ? 'Remove from Liked' : 'Like Song'}
                iconClass={isLiked ? 'text-vibaura-primary' : ''}
                onClick={async (e) => { e.stopPropagation(); await onLikeToggle(); onClose(); }}
              />
              <ContextMenuItem
                icon={faPlus}
                label="Add to Playlist"
                hasSubmenu
                onClick={(e) => { e.stopPropagation(); setShowPlaylists(true); }}
              />
              <div className="h-[1px] bg-[#F0F0F0] my-1 mx-2" />
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
                  <ContextMenuItem 
                    icon={faThumbtack} 
                    label={isPinned ? "Unpin from Top" : "Pin to Top"} 
                    iconClass={isPinned ? 'text-vibaura-primary' : ''}
                    onClick={handleTogglePin} 
                  />
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
                      <ContextMenuItem 
                        icon={faThumbtack} 
                        label={isPinned ? "Unpin from Top" : "Pin to Top"} 
                        iconClass={isPinned ? 'text-vibaura-primary' : ''}
                        onClick={handleTogglePin} 
                      />
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
                  <ContextMenuItem 
                    icon={faThumbtack} 
                    label={isPinned ? "Unpin from Top" : "Pin to Top"} 
                    iconClass={isPinned ? 'text-vibaura-primary' : ''}
                    onClick={handleTogglePin} 
                  />
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
             <span className="text-[9px] font-black text-[#CCC] uppercase tracking-tighter">Choose Playlist</span>
          </div>
          <div className="max-h-[200px] overflow-y-auto custom-scrollbar">
            {playlists.length > 0 ? (
              playlists.map(p => (
                <button
                  key={p.id}
                  onClick={(e) => handlePlaylistSelect(e, p.id, p.title)}
                  className="w-full px-3 py-2 text-left text-[10px] font-bold uppercase tracking-tight text-[#666] hover:bg-vibaura-primary/5 hover:text-vibaura-primary rounded-lg transition-colors flex items-center justify-between"
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
    onClick={onClick}
    disabled={muted}
    className={`w-full px-3 py-2.5 text-left text-[10px] font-black uppercase tracking-tighter rounded-xl flex items-center justify-between transition-colors
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
