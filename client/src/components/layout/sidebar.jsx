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
  faShareNodes
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

const Sidebar = ({ onNavigate, currentPage }) => {
  const [playlists, setPlaylists] = useState([]);
  const [artists, setArtists] = useState([]);
  const [pinnedPlaylists, setPinnedPlaylists] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('recent'); // 'recent', 'alphabetical', 'most-played'
  const [activeMenu, setActiveMenu] = useState(null); 
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const { user } = useAuthStore();
  const { showToast, showConfirm } = useUIStore();
  const menuRef = React.useRef(null);
  const sortMenuRef = React.useRef(null);

  const fetchLibrary = async () => {
    try {
      const data = await getLibrary();
      setPlaylists(data.playlists);
      setArtists(data.artists || []);
      setPinnedPlaylists(data.pinnedPlaylists || []);
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
    const aPinned = a.type === 'playlist' && pinnedPlaylists.some(p => p.id === a.id);
    const bPinned = b.type === 'playlist' && pinnedPlaylists.some(p => p.id === b.id);
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;

    // Then apply the selected sort order
    if (sortOrder === 'alphabetical') {
      return (a.title || '').localeCompare(b.title || '');
    }
    return 0; 
  });

  return (
    <aside className="w-72 flex flex-col h-full bg-vibaura-surface p-6">
      


      {/* Library Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-4 px-2">
          <div className="flex items-center gap-3 text-text-secondary">
            <FontAwesomeIcon icon={faBookOpen} />
            <h3 className="font-semibold text-sm uppercase tracking-wider">Your Library</h3>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsModalOpen(true)}
            className="w-8 h-8 hover:bg-vibaura-primary-light hover:text-vibaura-primary"
          >
            <FontAwesomeIcon icon={faPlus} size="sm" />
          </Button>
        </div>

        {/* Sort & Filter Controls */}
        <div className="flex items-center gap-2 mb-4 px-2">
          <div className="flex-1 relative">
            <input 
              type="text" 
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F5F5F7] border border-[#E9E9EB] rounded-xl px-4 py-2 text-[11px] text-[#1A1A1A] placeholder-[#AAA] focus:outline-none focus:border-vibaura-primary transition-all font-bold shadow-sm"
            />
          </div>
          
          <div className="relative" ref={sortMenuRef}>
            <button 
              onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
              className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${isSortMenuOpen ? 'bg-vibaura-primary text-white shadow-lg shadow-vibaura-primary/20' : 'bg-[#F5F5F7] text-[#999] hover:text-[#1A1A1A] hover:bg-gray-100'}`}
              title="Sort Library"
            >
              <FontAwesomeIcon icon={faBarsStaggered} className="text-xs" />
            </button>

            {isSortMenuOpen && (
              <div className="absolute right-0 top-11 z-50 bg-white border border-[#F0F0F0] rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.1)] overflow-hidden min-w-[160px] animate-scale-in p-1.5">
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
              </div>
            )}
          </div>
        </div>

        {/* Playlist List (Scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
          {/* Liked Songs synthetic playlist */}
          <div 
            onClick={() => onNavigate('playlist', { id: 'liked-songs', title: 'Liked Songs', songs: likedSongs })}
            className="group flex flex-col px-4 py-4 rounded-[24px] border border-transparent hover:bg-gray-50 transition-all cursor-pointer mb-2 bg-white shadow-sm hover:shadow-md"
          >
            <span className="font-bold text-[#1A1A1A] group-hover:text-vibaura-primary transition-colors text-sm tracking-tight">
              Liked Songs
            </span>
            <span className="text-[10px] text-[#999] uppercase font-black tracking-tighter">
              {likedSongs.length} tracks
            </span>
          </div>

          {/* Recently Played synthetic playlist */}
          {recentlyPlayed.length > 0 && (
            <div 
              onClick={() => onNavigate('playlist', { id: 'recently-played', title: 'Recently Played', songs: recentlyPlayed })}
              className="group flex flex-col px-4 py-4 rounded-[24px] border border-transparent hover:bg-gray-50 transition-all cursor-pointer mb-2 bg-white shadow-sm hover:shadow-md"
            >
              <span className="font-bold text-[#1A1A1A] group-hover:text-vibaura-secondary transition-colors text-sm tracking-tight">
                Recently Played
              </span>
              <span className="text-[10px] text-[#999] uppercase font-black tracking-tighter">
                History
              </span>
            </div>
          )}

          {unifiedLibrary.map(item => (
            <LibraryItem 
              key={`${item.type}-${item.id}`}
              item={item}
              type={item.type}
              onNavigate={onNavigate}
              isPinned={item.type === 'playlist' && pinnedPlaylists.some(p => p.id === item.id)}
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
    className="group relative flex items-center justify-between px-4 py-3 rounded-2xl border border-transparent hover:bg-gray-50 transition-all cursor-pointer"
  >
    <div className="flex flex-col min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <span className="font-bold text-[#1A1A1A] transition-colors truncate text-sm tracking-tight">
          {item.title}
        </span>
        {isPinned && (
          <FontAwesomeIcon icon={faThumbtack} className="text-[10px] text-vibaura-primary rotate-[30deg]" />
        )}
      </div>
      <span className="text-[9px] text-[#CCC] uppercase font-black tracking-tighter">
        {type === 'artist' ? 'Artist' : `${item.songs?.length || 0} tracks`}
      </span>
    </div>
    
    <button 
      onClick={(e) => {
        e.stopPropagation();
        setActiveMenu(activeMenu === item.id ? null : item.id);
      }}
      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-100 rounded-full transition-all text-text-muted"
    >
      <FontAwesomeIcon icon={faEllipsisV} size="xs" />
    </button>

    {activeMenu === item.id && (
      <div 
        ref={menuRef}
        className="absolute right-2 top-10 z-50 bg-white border border-[#F0F0F0] rounded-[24px] shadow-[0_12px_32px_rgba(0,0,0,0.1)] overflow-hidden min-w-[170px] animate-scale-in p-1.5"
      >
        {type === 'playlist' && onEdit && (
          <PlaylistMenuItem 
            icon={faPen} 
            label="Edit Details" 
            onClick={(e) => { e.stopPropagation(); onEdit(item); setActiveMenu(null); }} 
          />
        )}
        {type === 'playlist' && onTogglePin && (
          <PlaylistMenuItem 
            icon={faThumbtack} 
            label={isPinned ? "Unpin from Top" : "Pin to Top"} 
            onClick={(e) => onTogglePin(e, item.id)} 
          />
        )}
        <PlaylistMenuItem 
          icon={faShareNodes} 
          label="Share" 
          muted 
          onClick={(e) => e.stopPropagation()} 
        />
        
        <div className="h-[1px] bg-[#F0F0F0] my-1.5 mx-2" />
        
        <button 
          onClick={(e) => onDelete(e, item)}
          className="w-full px-3 py-2.5 text-left text-[10px] font-black uppercase tracking-tighter text-red-500 hover:bg-red-50 rounded-xl flex items-center gap-3 transition-colors"
        >
          <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
            <FontAwesomeIcon icon={type === 'playlist' && item.creator === user?.id ? faTrash : faMinusCircle} />
          </div>
          <span>{type === 'playlist' && item.creator === user?.id ? 'Delete' : 'Remove'}</span>
        </button>
      </div>
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
