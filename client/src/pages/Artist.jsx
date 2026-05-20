import React, { useEffect, useState } from 'react';
import CollectionHeader from '../components/music/CollectionHeader';
import ActionBar from '../components/music/ActionBar';
import TrackList from '../components/music/TrackList';
import { calculateTotalDuration } from '../utils/time';
import { usePlayerStore } from '../store/playerStore';
import { useLibraryStore } from '../store/libraryStore';
import { getArtistDetails } from '../services/discoveryService';
import MusicLoader from '../components/ui/MusicLoader';

const Artist = ({ artist }) => {
  const setTrack = usePlayerStore(state => state.setTrack);
  const shufflePlay = usePlayerStore(state => state.shufflePlay);
  const storeArtists = useLibraryStore(state => state.artists);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadArtist = async () => {
      if (!artist?.id) return;
      try {
        setLoading(true);
        const result = await getArtistDetails(artist.id);
        setData(result);
      } catch (err) {
        setError('Failed to load artist details');
      } finally {
        setLoading(false);
      }
    };
    loadArtist();
  }, [artist?.id]);

  if (loading) return <MusicLoader text="Tuning Artist..." />;

  if (error || !data) return (
    <div className="flex h-96 items-center justify-center text-vibaura-primary">
      <span>{error || 'Artist not found'}</span>
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
    <div className="flex flex-col relative w-full animate-page-in">
      <CollectionHeader 
        title={data.title}
        image={data.image}
        type="artist"
        isInLibrary={storeArtists.some(a => (a.id || a._id) === artist?.id || (a.id || a._id) === data?.id)}
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
        itemType="artist"
        item={data}
      />

      <div className="px-1 md:px-8 py-4 md:py-8 pb-40 md:pb-32">
        <section>
          <h2 className="text-2xl font-bold text-text-primary uppercase tracking-tighter mb-6">All Songs</h2>
          <TrackList tracks={data.songs || []} />
        </section>
      </div>
    </div>
  );
};

export default Artist;
