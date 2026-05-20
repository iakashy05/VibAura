import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import CollectionHeader from '../components/music/CollectionHeader';
import ActionBar from '../components/music/ActionBar';
import TrackList from '../components/music/TrackList';
import { calculateTotalDuration } from '../utils/time';
import { usePlayerStore } from '../store/playerStore';
import { useAuthStore } from '../store/authStore';
import { useLibraryStore } from '../store/libraryStore';
import { getPlaylistDetails } from '../services/discoveryService';
import { updatePlaylist } from '../services/libraryService';
import CreatePlaylistModal from '../components/library/CreatePlaylistModal';
import { useUIStore } from '../store/uiStore';
import MusicLoader from '../components/ui/MusicLoader';

const Playlist = ({ playlist, onNavigate }) => {
  const user = useAuthStore(state => state.user);
  const setTrack = usePlayerStore(state => state.setTrack);
  const shufflePlay = usePlayerStore(state => state.shufflePlay);
  const likedSongs = useLibraryStore(state => state.likedSongs);
  const storePlaylists = useLibraryStore(state => state.playlists);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { showToast } = useUIStore();

  useEffect(() => {
    const loadPlaylist = async () => {
      if (!playlist?.id) return;
      try {
        setLoading(true);
        setError(null);
        if (playlist.id === 'liked-songs') {
          setData({
            id: 'liked-songs',
            title: 'Liked Songs',
            description: 'All the tracks you love, kept in one place for easy vibes.',
            image: 'https://images.unsplash.com/photo-1514525253361-bee8a187499b?w=800&auto=format&fit=crop&q=60',
            isLikedPlaylist: true,
            songs: useLibraryStore.getState().likedSongs || []
          });
        } else if (playlist.id === 'recently-played') {
          setData({
            id: 'recently-played',
            title: 'Recently Played',
            description: 'Your recent musical journey.',
            isRecentlyPlayed: true,
            songs: playlist.songs || []
          });
        } else {
          const result = await getPlaylistDetails(playlist.id);
          setData(result);
        }
      } catch (err) {
        setError('Failed to load playlist');
      } finally {
        setLoading(false);
      }
    };
    loadPlaylist();
  }, [playlist?.id]);

  if (loading) return <MusicLoader text="Tuning Playlist..." />;

  if (error || !data) return (
    <div className="flex h-96 items-center justify-center text-vibaura-primary">
      <span>{error || 'Playlist not found'}</span>
    </div>
  );

  // Bind display metadata and songs directly to the store for instant feedback
  const isSpecialPlaylist = playlist?.id === 'liked-songs' || playlist?.id === 'recently-played';
  const matchingStorePlaylist = !isSpecialPlaylist && storePlaylists.find(p => p.id === playlist?.id);

  // Defensive check: Only use store songs if they are fully populated song objects
  const hasStoreSongs = matchingStorePlaylist?.songs && 
                        matchingStorePlaylist.songs.length > 0 && 
                        typeof matchingStorePlaylist.songs[0] === 'object' && 
                        matchingStorePlaylist.songs[0].title;

  const displaySongs = playlist?.id === 'liked-songs'
    ? likedSongs
    : (playlist?.id === 'recently-played'
        ? (playlist?.songs || [])
        : (hasStoreSongs ? matchingStorePlaylist.songs : (data?.songs || [])));

  const displayTitle = playlist?.id === 'liked-songs'
    ? 'Liked Songs'
    : (playlist?.id === 'recently-played'
        ? 'Recently Played'
        : (matchingStorePlaylist?.title || data?.title || ''));

  const displayDesc = playlist?.id === 'liked-songs'
    ? 'All the tracks you love, kept in one place for easy vibes.'
    : (playlist?.id === 'recently-played'
        ? 'Your recent musical journey.'
        : (matchingStorePlaylist?.description || data?.description || ''));

  const totalDuration = calculateTotalDuration(displaySongs || []);

  const handlePlayAll = () => {
    if (displaySongs?.length > 0) {
      setTrack(displaySongs[0], displaySongs);
    }
  };

  const handleShuffle = () => {
    if (displaySongs?.length > 0) {
      shufflePlay(displaySongs);
    }
  };

  const handleUpdatePlaylist = async (title, description) => {
    try {
      setIsUpdating(true);
      await updatePlaylist(data.id, { title, description });
      // Update in central library store immediately
      const { updatePlaylistMetadataInStore } = useLibraryStore.getState();
      updatePlaylistMetadataInStore(data.id, title, description);
      showToast('Playlist updated', 'success');
      setEditingPlaylist(null);
    } catch (err) {
      showToast('Failed to update playlist', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const isOwner = matchingStorePlaylist?.creator === user?.id || data?.creator === user?.id;

  return (
    <div className="flex flex-col relative w-full animate-page-in">
      <CollectionHeader 
        title={displayTitle}
        image={data.image}
        description={displayDesc}
        isUserPlaylist={isOwner}
        isLikedPlaylist={data.isLikedPlaylist}
        isRecentlyPlayed={data.isRecentlyPlayed}
        isInLibrary={storePlaylists.some(p => p.id === playlist?.id || p.id === data?.id)}
        type="playlist"
        meta={[
          "VibAura",
          `${displaySongs?.length || 0} songs`,
          totalDuration
        ]}
      />

      <ActionBar 
        onPlay={handlePlayAll}
        onShuffle={handleShuffle}
        itemId={data.id}
        itemType="playlist"
        item={{ ...data, songs: displaySongs, title: displayTitle, description: displayDesc }}
        onEdit={() => setEditingPlaylist(data)}
        onNavigate={onNavigate}
      />

      <div className="px-1 md:px-8 py-4 md:py-8 pb-40 md:pb-32">
        <TrackList tracks={displaySongs || []} playlistId={data.id} isOwner={isOwner} />
      </div>

      <CreatePlaylistModal 
        isOpen={!!editingPlaylist}
        onClose={() => setEditingPlaylist(null)}
        onSubmit={handleUpdatePlaylist}
        isSubmitting={isUpdating}
        initialData={{ ...data, title: displayTitle, description: displayDesc }}
      />
    </div>
  );
};

export default Playlist;
