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
import {
  getLibrary,
  createPlaylist,
  deletePlaylist,
  toggleLibraryPlaylist,
  togglePinPlaylist,
  updatePlaylist
} from '../../services/libraryService';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { usePlayerStore } from '../../store/playerStore';
import LikeButton from '../ui/LikeButton';
import { toggleLikeSong } from '../../services/libraryService';
import Dropdown from '../ui/Dropdown';
import ContextMenu from '../ui/ContextMenu';

const Sidebar = ({ onNavigate, currentPage }) => {
  const [playlists, setPlaylists] = useState([]);
  const [artists, setArtists] = useState([]);
  const [pinnedPlaylists, setPinnedPlaylists] = useState([]);
  const [pinnedArtists, setPinnedArtists] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('recent'); // 'recent', 'alphabetical', 'most-played'
  const [activeMenu, setActiveMenu] = useState(null);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const { user, isSubscribed } = useAuthStore();
  const { showToast, showConfirm } = useUIStore();
  const menuRef = React.useRef(null);
  const sortMenuRef = React.useRef(null);

  // Player state for info island
  const { currentTrack, isPlaying, toggleFullscreen } = usePlayerStore();
  const { updateUser, isAuthenticated } = useAuthStore();

  const fetchLibrary = async () => {
    try {
      const data = await getLibrary();
      setPlaylists(data.playlists);
      setArtists(data.artists || []);
      setPinnedPlaylists(data.pinnedPlaylists || []);
      setPinnedArtists(data.pinnedArtists || []);
      setLikedSongs(data.likedSongs);
      setRecentlyPlayed(data.recentlyPlayed || []);
    } catch (err) {
      console.error('Sidebar failed to load playlists');
    }
  };

  useEffect(() => {
    fetchLibrary();
    const handleUpdate = () => fetchLibrary();
    window.addEventListener('vibaura-library-updated', handleUpdate);

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
      window.removeEventListener('vibaura-library-updated', handleUpdate);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCreatePlaylist = async (title, description) => {
    try {
      setIsCreating(true);
      await createPlaylist(title, description);
      window.dispatchEvent(new Event('vibaura-library-updated'));
      setIsModalOpen(false);
      showToast('Playlist created successfully!', 'success');
    } catch (err) {
      showToast('Failed to create playlist', 'error');
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
          try {
            await deletePlaylist(playlist.id);
            window.dispatchEvent(new Event('vibaura-library-updated'));
            showToast('Playlist deleted', 'success');
          } catch (err) {
            showToast('Failed to delete playlist', 'error');
          }
        }
      );
    } else {
      showConfirm(
        'Remove from Library',
        `Remove "${playlist.title}" from your library?`,
        async () => {
          try {
            await toggleLibraryPlaylist(playlist.id);
            window.dispatchEvent(new Event('vibaura-library-updated'));
            showToast('Playlist removed', 'success');
          } catch (err) {
            showToast('Failed to remove playlist', 'error');
          }
        }
      );
    }
    setActiveMenu(null);
  };

  const handleTogglePin = async (e, playlistId) => {
    e.stopPropagation();
    try {
      await togglePinPlaylist(playlistId);
      window.dispatchEvent(new Event('vibaura-library-updated'));
    } catch (err) {
      showToast('Failed to pin playlist', 'error');
    }
    setActiveMenu(null);
  };

  const handleUpdatePlaylist = async (title, description) => {
    try {
      setIsCreating(true);
      await updatePlaylist(editingPlaylist.id, { title, description });
      window.dispatchEvent(new Event('vibaura-library-updated'));
      setEditingPlaylist(null);
      showToast('Playlist updated', 'success');
    } catch (err) {
      showToast('Failed to update playlist', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const isLiked = currentTrack && user?.likedSongs?.includes(currentTrack.id);

  const handleLikeClick = async (e) => {
    if (e) e.stopPropagation();
    if (!isAuthenticated || !currentTrack) return;

    try {
      const res = await toggleLikeSong(currentTrack.id);

      const newLikedSongs = res.liked
        ? [...(user.likedSongs || []), currentTrack.id]
        : (user.likedSongs || []).filter(id => id !== currentTrack.id);

      updateUser({ ...user, likedSongs: newLikedSongs });
      window.dispatchEvent(new Event('vibaura-library-updated'));
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
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
    <aside className="w-[360px] flex flex-col h-full bg-vibaura-surface p-6 transition-all duration-300">



      <div className="bg-white/90 backdrop-blur-md rounded-[32px] p-4 flex-1 flex flex-col min-h-0 border border-black/5">
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-3 text-[#999]">
            <FontAwesomeIcon icon={faBookOpen} size="sm" />
            <h3 className="font-black text-[11px] uppercase tracking-[0.2em]">Your Library</h3>
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
        <div className="flex items-center gap-2 mb-6 px-2">
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
              onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
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
              <p className="text-[9px] font-black text-[#CCC] uppercase tracking-tighter px-3 py-2">Sort by</p>
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
        </div>

        {/* Playlist List (Scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 no-scrollbar">
          {/* Liked Songs synthetic playlist */}
          <div
            onClick={() => onNavigate('playlist', { id: 'liked-songs', title: 'Liked Songs', songs: likedSongs })}
            className="group flex items-center justify-between px-4 py-3 rounded-[24px] hover:bg-black/5 transition-all cursor-pointer mb-2"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center text-vibaura-primary">
                <FontAwesomeIcon icon={faHeart} size="lg" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[#1A1A1A] group-hover:text-vibaura-primary transition-colors text-[13px] tracking-tight">
                  Liked Songs
                </span>
                <span className="text-[10px] text-[#777] font-bold">
                  Playlist • {likedSongs.length} songs
                </span>
              </div>
            </div>
          </div>
          
          {/* Vibrance (Monthly Report) */}
          <div
            onClick={() => {
              if (!isSubscribed) {
                onNavigate('payment');
                return;
              }
              onNavigate('vibrance');
            }}
            className="group flex items-center justify-between px-4 py-3 rounded-[24px] hover:bg-black/5 transition-all cursor-pointer mb-2"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 flex items-center justify-center ${!isSubscribed ? 'text-gray-300' : 'text-vibaura-primary'}`}>
                <FontAwesomeIcon icon={faWaveSquare} size="lg" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className={`font-bold transition-colors text-[13px] tracking-tight ${!isSubscribed ? 'text-gray-400' : 'text-[#1A1A1A] group-hover:text-vibaura-primary'}`}>
                    Vibrance
                  </span>
                  {!isSubscribed && (
                    <div className="px-1.5 py-0.5 rounded-md bg-vibaura-primary/10 text-vibaura-primary text-[8px] font-black uppercase tracking-tighter">Pro</div>
                  )}
                </div>
                <span className="text-[10px] text-[#777] font-bold">
                  Monthly Report
                </span>
              </div>
            </div>
            {!isSubscribed && (
              <div className="text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
            )}
          </div>

          {/* Recently Played synthetic playlist */}
          {recentlyPlayed.length > 0 && (
            <div
              onClick={() => onNavigate('playlist', { id: 'recently-played', title: 'Recently Played', songs: recentlyPlayed })}
              className="group flex items-center justify-between px-4 py-3 rounded-[24px] hover:bg-black/5 transition-all cursor-pointer mb-2"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center text-vibaura-primary">
                  <FontAwesomeIcon icon={faHistory} size="lg" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[#1A1A1A] group-hover:text-vibaura-primary transition-colors text-[13px] tracking-tight">
                    Recently Played
                  </span>
                  <span className="text-[10px] text-[#777] font-bold">
                    History • {recentlyPlayed.length} songs
                  </span>
                </div>
              </div>
            </div>
          )}

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

    </aside>
  );
};


const LibraryItem = ({ item, type, onNavigate, isPinned, onTogglePin, onEdit, onDelete, activeMenu, setActiveMenu, menuRef, user }) => (
  <div
    onClick={() => onNavigate(type, item)}
    className="group relative flex items-center justify-between px-4 py-3 rounded-[24px] hover:bg-black/5 transition-all cursor-pointer"
  >
    <div className="flex items-center gap-4 min-w-0 flex-1">
      <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center text-vibaura-primary">
        <FontAwesomeIcon icon={type === 'artist' ? faMicrophoneLines : faFolder} size="lg" />
      </div>
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
    </div>

    <div className="flex items-center gap-3">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setActiveMenu(activeMenu === item.id ? null : item.id);
        }}
        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-100 rounded-full transition-all text-[#CCC]"
      >
        <FontAwesomeIcon icon={faEllipsisV} size="xs" />
      </button>
    </div>

    <ContextMenu
      isOpen={activeMenu === item.id}
      onClose={() => setActiveMenu(null)}
      item={item}
      type={type}
      isPinned={isPinned}
      isInLibrary={true}
      onEdit={onEdit}
      positionClass="right-2 top-10"
    />
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
