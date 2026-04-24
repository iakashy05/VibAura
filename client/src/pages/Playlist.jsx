import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import CollectionHeader from '../components/music/CollectionHeader';
import ActionBar from '../components/music/ActionBar';
import TrackList from '../components/music/TrackList';
import { calculateTotalDuration } from '../utils/time';
import { usePlayerStore } from '../store/playerStore';
import { useAuthStore } from '../store/authStore';
import { getPlaylistDetails } from '../services/discoveryService';

const Playlist = ({ playlist }) => {
  const { user } = useAuthStore();
  const { setTrack, shufflePlay } = usePlayerStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);



  useEffect(() => {
    const loadPlaylist = async () => {
      if (!playlist?.id) return;
      try {
        setLoading(true);
        if (playlist.id === 'liked-songs') {
          setData({
            id: 'liked-songs',
            title: 'Liked Songs',
            description: 'All the tracks you love, kept in one place for easy vibes.',
            image: 'https://images.unsplash.com/photo-1514525253361-bee8a187499b?w=800&auto=format&fit=crop&q=60', // Vibrant stage lights
            isLikedPlaylist: true,
            songs: playlist.songs || []
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

  if (loading) return (
    <div className="flex h-96 items-center justify-center text-text-muted animate-pulse">
      <span className="text-xl font-medium tracking-widest uppercase">Syncing with Aura...</span>
    </div>
  );

  if (error || !data) return (
    <div className="flex h-96 items-center justify-center text-vibaura-primary">
      <span>{error || 'Playlist not found'}</span>
    </div>
  );

  const totalDuration = calculateTotalDuration(data.songs || []);

  const handlePlayAll = () => {
    if (data.songs?.length > 0) {
      setTrack(data.songs[0], data.songs);
    }
  };

  const handleShuffle = () => {
    if (data.songs?.length > 0) {
      shufflePlay(data.songs);
    }
  };

  return (
    <div className="flex flex-col relative w-full">
      <CollectionHeader 
        title={data.title}
        image={data.image}
        description={data.description}
        isUserPlaylist={data.creator === user?.id}
        isLikedPlaylist={data.isLikedPlaylist}
        isRecentlyPlayed={data.isRecentlyPlayed}
        type="playlist"
        meta={[
          "VibAura",
          `${data.songs?.length || 0} songs`,
          totalDuration
        ]}
      />

      <ActionBar 
        onPlay={handlePlayAll}
        onShuffle={handleShuffle}
        itemId={data.id}
        itemType="playlist"
      />

      <div className="px-8 py-8 pb-12">
        <TrackList tracks={data.songs || []} />
      </div>
    </div>
  );
};

export default Playlist;
