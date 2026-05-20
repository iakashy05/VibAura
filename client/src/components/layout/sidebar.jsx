import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faBookOpen,
  faEllipsisV,
  faTrash,
  faMinusCircle,
  faBarsStaggered,
  faCheck,
  faPen,
  faThumbtack,
  faShareNodes,
  faWaveSquare,
  faHeart,
  faHistory,
  faFolder,
  faMicrophoneLines,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/button';
import CreatePlaylistModal from '../library/CreatePlaylistModal';
import { updatePlaylist } from '../../services/libraryService';
import { useLibraryStore } from '../../store/libraryStore';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { usePlayerStore } from '../../store/playerStore';
import LikeButton from '../ui/LikeButton';
import Dropdown from '../ui/Dropdown';
import ContextMenu from '../ui/ContextMenu';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ onNavigate, currentPage }) => {
  const {
    playlists,
    artists,
    pinnedPlaylists,
    pinnedArtists,
    likedSongs,
    recentlyPlayed,
    createPlaylistOptimistic,
    deletePlaylistOptimistic,
    togglePinPlaylistOptimistic,
    toggleLikeSongOptimistic
  } = useLibraryStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('recent'); // 'recent', 'alphabetical', 'most-played'
  const { user, isSubscribed, isAuthenticated, updateUser } = useAuthStore();
  const { 
    showToast, 
    showConfirm, 
    isSidebarCollapsed: isCollapsed,
    activeMenuId,
    setActiveMenuId
  } = useUIStore();
  const menuRef = React.useRef(null);
  const sortMenuRef = React.useRef(null);

  const isSortMenuOpen = activeMenuId === 'sidebar-sort';
  const setIsSortMenuOpen = (open) => setActiveMenuId(open ? 'sidebar-sort' : null);
  const activeMenu = activeMenuId?.startsWith('sidebar-item-') ? activeMenuId.replace('sidebar-item-', '') : null;
  const setActiveMenu = (id) => setActiveMenuId(id ? `sidebar-item-${id}` : null);

  // Player state for info island (optimized atomic selectors to prevent playback re-renders)
  const currentTrack = usePlayerStore(state => state.currentTrack);
  const isPlaying = usePlayerStore(state => state.isPlaying);
  const toggleFullscreen = usePlayerStore(state => state.toggleFullscreen);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenu(null);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target)) {
        setIsSortMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCreatePlaylist = async (title, description) => {
    try {
      setIsCreating(true);
      await createPlaylistOptimistic(title, description);
      setIsModalOpen(false);
    } catch (err) {
      // Errors handled by store
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteOrRemove = async (e, playlist) => {
    e.stopPropagation();
    const isOwner = playlist.creator === user?.id;

    if (isOwner) {
      showConfirm(
        'Delete Playlist',
        `Are you sure you want to permanently delete "${playlist.title}"?`,
        async () => {
          await deletePlaylistOptimistic(playlist.id);
        }
      );
    } else {
      showConfirm(
        'Remove from Library',
        `Remove "${playlist.title}" from your library?`,
        async () => {
          const { toggleLibraryPlaylistOptimistic } = useLibraryStore.getState();
          await toggleLibraryPlaylistOptimistic(playlist);
        }
      );
    }
    setActiveMenu(null);
  };

  const handleTogglePin = async (e, playlistId) => {
    e.stopPropagation();
    await togglePinPlaylistOptimistic(playlistId);
    setActiveMenu(null);
  };

  const handleUpdatePlaylist = async (title, description) => {
    try {
      setIsCreating(true);
      await updatePlaylist(editingPlaylist.id, { title, description });
      const { updatePlaylistMetadataInStore } = useLibraryStore.getState();
      updatePlaylistMetadataInStore(editingPlaylist.id, title, description);
      setEditingPlaylist(null);
      showToast('Playlist updated', 'success');
    } catch (err) {
      showToast('Failed to update playlist', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const trackId = currentTrack?.id || currentTrack?._id;
  const isLiked = trackId && likedSongs.some(song => (song.id || song._id) === trackId);

  const handleLikeClick = async (e) => {
    if (e) e.stopPropagation();
    if (!isAuthenticated || !currentTrack) return;
    toggleLikeSongOptimistic(currentTrack);
  };
  const filteredPlaylists = playlists
    .filter(p => p.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const aPinned = pinnedPlaylists.some(p => p.id === a.id);
      const bPinned = pinnedPlaylists.some(p => p.id === b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;

      if (sortOrder === 'alphabetical') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortOrder === 'most-played') {
        return (b.songs?.length || 0) - (a.songs?.length || 0);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  // Unified Library List (Merged Playlists & Artists)
  const unifiedLibrary = [
    ...filteredPlaylists.map(p => ({ ...p, type: 'playlist' })),
    ...artists.filter(a => a.title?.toLowerCase().includes(searchQuery.toLowerCase())).map(a => ({ ...a, type: 'artist' }))
  ].sort((a, b) => {
    // Priority: Pinned items first
    const aPinned = (a.type === 'playlist' && pinnedPlaylists.some(p => p.id === a.id)) ||
      (a.type === 'artist' && pinnedArtists.some(pa => pa.id === a.id));
    const bPinned = (b.type === 'playlist' && pinnedPlaylists.some(p => p.id === b.id)) ||
      (b.type === 'artist' && pinnedArtists.some(pa => pa.id === b.id));
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;

    // Then apply the selected sort order
    if (sortOrder === 'alphabetical') {
      return (a.title || '').localeCompare(b.title || '');
    }
    return 0;
  });

  return (
    <motion.aside 
      initial={false}
      animate={{ 
        width: isCollapsed ? 88 : 360,
        padding: isCollapsed ? '16px 8px' : '24px'
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 40 }}
      className="flex flex-col h-full bg-vibaura-surface z-[60] relative transition-colors duration-500"
    >
      <div className={`bg-white/90 backdrop-blur-md rounded-[32px] flex-1 flex flex-col min-h-0 border border-black/5 ${isCollapsed ? 'items-center p-2' : 'p-4'}`}>
        <div className={`flex items-center justify-between mb-6 px-2 w-full ${isCollapsed ? 'flex-col gap-4' : ''}`}>
          <div className="flex items-center gap-3 text-[#999]">
            <FontAwesomeIcon icon={faBookOpen} size="sm" />
            {!isCollapsed && (
              <motion.h3 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-black text-[11px] tracking-[0.2em]"
              >
                Your Library
              </motion.h3>
            )}
          </div>
          <button
            onClick={() => {
              if (!isSubscribed && playlists.length >= 5) {
                onNavigate('payment');
                showToast('Playlist limit reached! Upgrade to Pro for unlimited vibes.', 'info');
                return;
              }
              setIsModalOpen(true);
            }}
            className={`transition-colors ${!isSubscribed && playlists.length >= 5 ? 'text-vibaura-primary animate-pulse' : 'text-[#999] hover:text-[#1A1A1A]'}`}
            title={!isSubscribed && playlists.length >= 5 ? 'Upgrade to Pro for more playlists' : 'Create Playlist'}
          >
            <FontAwesomeIcon icon={faPlus} size="sm" />
          </button>
        </div>

        {/* Sort & Filter Controls */}
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-6 px-2 w-full"
          >
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search library..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#E4E4E9]/50 border border-transparent rounded-2xl px-4 py-2 text-[10px] text-[#1A1A1A] placeholder-[#888] focus:outline-none focus:bg-white transition-all font-bold"
              />
            </div>

            <div className="relative" ref={sortMenuRef}>
              <button
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => {
                  setIsSortMenuOpen(!isSortMenuOpen);
                }}
                className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all ${isSortMenuOpen ? 'text-vibaura-primary' : 'text-[#999] hover:text-[#1A1A1A]'}`}
                title="Sort Library"
              >
                <FontAwesomeIcon icon={faBarsStaggered} className="text-xs" />
              </button>

              <Dropdown
                isOpen={isSortMenuOpen}
                onClose={() => setIsSortMenuOpen(false)}
                positionClass="right-0 top-10"
                minWidth="160px"
              >
                <p className="text-[9px] font-black text-[#CCC] tracking-tighter px-3 py-2">Sort by</p>
                <SortOption
                  active={sortOrder === 'recent'}
                  onClick={() => { setSortOrder('recent'); setIsSortMenuOpen(false); }}
                  label="Recently Added"
                />
                <SortOption
                  active={sortOrder === 'alphabetical'}
                  onClick={() => { setSortOrder('alphabetical'); setIsSortMenuOpen(false); }}
                  label="A-Z"
                />
                <SortOption
                  active={sortOrder === 'most-played'}
                  onClick={() => { setSortOrder('most-played'); setIsSortMenuOpen(false); }}
                  label="Most Played"
                />
              </Dropdown>
            </div>
          </motion.div>
        )}

        {/* Playlist List (Scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 no-scrollbar w-full">
          {/* Liked Songs synthetic playlist */}
          <div
            onClick={() => onNavigate('playlist', { id: 'liked-songs', title: 'Liked Songs', songs: likedSongs })}
            className={`group flex items-center transition-all cursor-pointer mb-2 ${isCollapsed ? 'justify-center w-12 h-12 rounded-xl hover:bg-black/5 mx-auto' : 'justify-between px-4 py-3 rounded-[24px] hover:bg-black/5'}`}
            title="Liked Songs"
          >
            <div className={`flex items-center ${isCollapsed ? '' : 'gap-4'}`}>
              <div className="w-10 h-10 flex items-center justify-center text-vibaura-primary flex-shrink-0 bg-black/5 rounded-lg">
                <FontAwesomeIcon icon={faHeart} size="lg" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col overflow-hidden">
                  <span className="font-bold text-[#1A1A1A] group-hover:text-vibaura-primary transition-colors text-[13px] tracking-tight truncate">
                    Liked Songs
                  </span>
                  <span className="text-[10px] text-[#777] font-bold truncate">
                    Playlist • {likedSongs.length} songs
                  </span>
                </div>
              )}
            </div>
          </div>

          {unifiedLibrary.map(item => (
            <LibraryItem
              key={`${item.type}-${item.id}`}
              item={item}
              type={item.type}
              onNavigate={onNavigate}
              isPinned={(item.type === 'playlist' && pinnedPlaylists.some(p => p.id === item.id)) || (item.type === 'artist' && pinnedArtists.some(a => a.id === item.id))}
              onTogglePin={handleTogglePin}
              onEdit={setEditingPlaylist}
              onDelete={handleDeleteOrRemove}
              activeMenu={activeMenu}
              setActiveMenu={setActiveMenu}
              menuRef={menuRef}
              user={user}
              isCollapsed={isCollapsed}
              setIsSortMenuOpen={setIsSortMenuOpen}
            />
          ))}
        </div>
      </div>

      <CreatePlaylistModal
        isOpen={isModalOpen || !!editingPlaylist}
        onClose={() => { setIsModalOpen(false); setEditingPlaylist(null); }}
        onSubmit={editingPlaylist ? handleUpdatePlaylist : handleCreatePlaylist}
        isSubmitting={isCreating}
        initialData={editingPlaylist}
      />

    </motion.aside>
  );
};



const LibraryItem = ({ item, type, onNavigate, isPinned, onTogglePin, onEdit, onDelete, activeMenu, setActiveMenu, menuRef, user, isCollapsed, setIsSortMenuOpen }) => (
  <div
    onClick={() => onNavigate(type, item)}
    className={`group relative flex items-center transition-all cursor-pointer ${isCollapsed ? 'justify-center w-12 h-12 rounded-xl hover:bg-black/5 mx-auto mb-1' : 'justify-between px-4 py-3 rounded-[24px] hover:bg-black/5 mb-1'}`}
    title={item.title}
  >
    <div className={`flex items-center min-w-0 ${isCollapsed ? 'justify-center' : 'gap-4 flex-1'}`}>
      <div className={`w-10 h-10 flex-shrink-0 flex items-center justify-center overflow-hidden bg-black/5 ${type === 'artist' ? 'rounded-full' : 'rounded-lg'}`}>
        {(item.image || item.artwork || item.albumArt) ? (
          <img 
            src={item.image || item.artwork || item.albumArt} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <FontAwesomeIcon icon={type === 'artist' ? faMicrophoneLines : faFolder} className="text-vibaura-primary" size="lg" />
        )}
      </div>
      {!isCollapsed && (
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-bold text-[#1A1A1A] group-hover:text-vibaura-primary transition-colors truncate text-[13px] tracking-tight">
              {item.title}
            </span>
            {isPinned && (
              <FontAwesomeIcon icon={faThumbtack} className="text-[9px] text-vibaura-primary rotate-[30deg]" />
            )}
          </div>
          <span className="text-[10px] text-[#777] font-bold">
            {type === 'artist' ? 'Artist' : `Playlist • ${item.songs?.length || 0} songs`}
          </span>
        </div>
      )}
    </div>

    {!isCollapsed && (
      <div className="flex items-center gap-3">
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            const stringId = String(item.id);
            setActiveMenu(activeMenu === stringId ? null : stringId);
          }}
          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-100 rounded-full transition-all text-[#CCC]"
        >
          <FontAwesomeIcon icon={faEllipsisV} size="xs" />
        </button>
      </div>
    )}

    {!isCollapsed && (
      <ContextMenu
        isOpen={activeMenu === String(item.id)}
        onClose={() => setActiveMenu(null)}
        item={item}
        type={type}
        isPinned={isPinned}
        isInLibrary={true}
        onEdit={onEdit}
        positionClass="right-2 top-10"
      />
    )}
  </div>
);

const PlaylistMenuItem = ({ icon, label, onClick, muted = false }) => (
  <button
    onClick={onClick}
    disabled={muted}
    className={`w-full px-3 py-2.5 text-left text-[10px] font-black uppercase tracking-tighter rounded-xl flex items-center justify-between transition-colors
      ${muted ? 'opacity-30 cursor-not-allowed' : 'text-[#666] hover:bg-gray-50 hover:text-[#1A1A1A]'}`}
  >
    <div className="flex items-center gap-3">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${muted ? 'bg-gray-100' : 'bg-[#F5F5F7]'}`}>
        <FontAwesomeIcon icon={icon} />
      </div>
      <span>{label}</span>
    </div>
    {muted && <span className="text-[7px] bg-gray-100 px-1.5 py-0.5 rounded-full">Soon</span>}
  </button>
);

const SortOption = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`w-full px-3 py-2 text-left text-[11px] font-bold rounded-xl flex items-center justify-between transition-colors ${active ? 'bg-vibaura-primary/5 text-vibaura-primary' : 'text-[#666] hover:bg-gray-50 hover:text-[#1A1A1A]'}`}
  >
    <span>{label}</span>
    {active && <FontAwesomeIcon icon={faCheck} className="text-[8px]" />}
  </button>
);

export default Sidebar;
