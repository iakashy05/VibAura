import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import CollectionHeader from '../components/music/CollectionHeader';
import ActionBar from '../components/music/ActionBar';
import TrackList from '../components/music/TrackList';
import { calculateTotalDuration } from '../utils/time';
import { usePlayerStore } from '../store/playerStore';
import { getPlaylistDetails } from '../services/discoveryService';

const Playlist = ({ playlist }) => {
  const { setTrack } = usePlayerStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPlaylist = async () => {
      if (!playlist?.id) return;
      try {
        setLoading(true);
        const result = await getPlaylistDetails(playlist.id);
        setData(result);
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

  return (
    <div className="flex flex-col relative w-full">
      <CollectionHeader 
        title={data.title}
        image={data.image}
        type="playlist"
        meta={[
          "VibAura",
          `${data.songs?.length || 0} songs`,
          totalDuration
        ]}
      />

      <ActionBar 
        onPlay={handlePlayAll}
        onShuffle={handlePlayAll}
      >
        <button className="w-10 h-10 flex items-center justify-center text-vibaura-primary border-2 border-vibaura-primary/20 hover:bg-vibaura-primary/10 rounded-full transition-all ml-1">
          <FontAwesomeIcon icon={faPlus} />
        </button>
      </ActionBar>

      <div className="px-8 py-8 pb-12">
        <TrackList tracks={data.songs || []} />
      </div>
    </div>
  );
};

export default Playlist;
