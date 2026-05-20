import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faHeart, faMusic, faCrown, faBarsStaggered, faSearch } from '@fortawesome/free-solid-svg-icons';
import { useLibraryStore } from '../store/libraryStore';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import CreatePlaylistModal from '../components/library/CreatePlaylistModal';
import MusicSection from '../components/music/MusicSection';
import { usePlayerStore } from '../store/playerStore';

/**
 * Library Component
 * A full-screen premium mobile-centric Library page mapping all user playlists & Liked Songs.
 */
const Library = ({ onNavigate }) => {
  const { playlists, likedSongs, recentlyPlayed, createPlaylistOptimistic } = useLibraryStore();
  const { user, isSubscribed } = useAuthStore();
  const { showToast } = useUIStore();
  const setTrack = usePlayerStore(state => state.setTrack);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('recent'); // 'recent', 'alphabetical'

  const handleCreatePlaylist = async (title, description) => {
    try {
      setIsCreating(true);
      await createPlaylistOptimistic(title, description);
      setIsModalOpen(false);
      showToast('Playlist created successfully!', 'success');
    } catch (err) {
      showToast('Failed to create playlist.', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  // Filter & Sort playlists
  const filteredPlaylists = playlists
    .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      // 'recent' sorting (by default id/timestamp)
      return b.id.localeCompare(a.id);
    });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 pb-24 animate-page-in">
      {/* Page Header Row */}
      <div className="flex items-center justify-between px-1">
        <h1 className="text-3xl font-black text-text-primary tracking-tighter uppercase">Your Library</h1>
        <button
          onClick={() => {
            if (!isSubscribed && playlists.length >= 5) {
              onNavigate('payment');
              showToast('Playlist limit reached! Upgrade to Pro for unlimited vibes.', 'info');
              return;
            }
            setIsModalOpen(true);
          }}
          className="w-10 h-10 rounded-full bg-vibaura-primary text-white flex items-center justify-center shadow-lg active:scale-95 transition-all"
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </div>

      {/* Mobile Sorting & Search Controls */}
      <div className="flex items-center gap-3 px-1">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search playlists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#E4E4E9]/50 border border-transparent rounded-2xl px-10 py-2.5 text-xs text-[#1A1A1A] placeholder-[#888] focus:outline-none focus:bg-white transition-all font-bold"
          />
          <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999] text-xs" />
        </div>
        <button
          onClick={() => setSortOrder(sortOrder === 'recent' ? 'alphabetical' : 'recent')}
          className="h-9 px-4 flex items-center gap-2 rounded-2xl bg-[#E4E4E9]/50 border border-transparent text-[10px] font-black uppercase text-[#666] transition-all hover:bg-black/5"
        >
          <FontAwesomeIcon icon={faBarsStaggered} />
          {sortOrder === 'recent' ? 'Recent' : 'A-Z'}
        </button>
      </div>

      {/* Liked Songs synthetic playlist card (Spotlight Card) */}
      <div
        onClick={() => onNavigate('playlist', { id: 'liked-songs', title: 'Liked Songs', songs: likedSongs })}
        className="relative overflow-hidden rounded-[32px] p-6 bg-gradient-to-br from-[#7C3AED] via-vibaura-primary to-[#4F46E5] text-white shadow-xl shadow-vibaura-primary/10 active:scale-[0.99] transition-all cursor-pointer flex flex-col justify-between h-40 group"
      >
        {/* Pulsing floating heart details */}
        <div className="absolute right-6 bottom-4 text-white/10 text-9xl font-black pointer-events-none group-hover:scale-110 transition-transform duration-500 select-none">
          ♥
        </div>

        <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
          <FontAwesomeIcon icon={faHeart} className="text-white text-base animate-pulse" />
        </div>

        <div className="space-y-0.5 relative z-10">
          <h2 className="text-2xl font-black tracking-tight leading-none">Liked Songs</h2>
          <p className="text-[10px] font-medium text-white/80">{likedSongs.length} tracks love-tuned</p>
        </div>
      </div>

      {/* Recently Played Section */}
      {recentlyPlayed && recentlyPlayed.length > 0 && (
        <div className="py-2">
          <MusicSection 
            title="Recently Played" 
            items={recentlyPlayed} 
            type="song"
            onCardClick={(item) => setTrack(item, recentlyPlayed)}
          />
        </div>
      )}

      {/* Playlists Listings (Dynamic List format for easy scrolling) */}
      <div className="space-y-3 px-1">
        <h3 className="text-xs font-black uppercase text-[#999] tracking-wider mb-1">Playlists</h3>
        {filteredPlaylists.length === 0 ? (
          <div className="text-center py-10 bg-vibaura-bg-muted/10 rounded-[32px] border border-black/[0.02]">
            <p className="text-xs text-text-muted font-black tracking-widest uppercase">No playlists found</p>
          </div>
        ) : (
          filteredPlaylists.map(playlist => {
            const hasSongs = playlist.songs && playlist.songs.length > 0;
            const songCount = playlist.songs ? playlist.songs.length : 0;
            const isPlaylistOwner = playlist.creator === user?.id;

            return (
              <div
                key={playlist.id}
                onClick={() => onNavigate('playlist', playlist)}
                className="flex items-center gap-4 p-3 rounded-2xl bg-white border border-black/[0.03] active:scale-[0.99] hover:bg-black/[0.01] transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-vibaura-bg-muted flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  {playlist.image ? (
                    <img src={playlist.image} alt={playlist.title} className="w-full h-full object-cover" />
                  ) : (
                    <FontAwesomeIcon icon={faMusic} className="text-[#999] text-base" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-[#1A1A1A] truncate text-sm leading-tight">{playlist.title}</h4>
                  <p className="text-[9px] text-[#999] font-black uppercase tracking-wider mt-1 truncate">
                    {isPlaylistOwner ? 'Owned' : 'Public'} • {songCount} songs
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add CreatePlaylistModal */}
      <CreatePlaylistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreatePlaylist}
        isSubmitting={isCreating}
      />
    </div>
  );
};

export default Library;
