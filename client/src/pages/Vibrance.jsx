import React, { useEffect, useState } from 'react';
import { getVibrance } from '../services/libraryService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faMusic, faMicrophone, faLayerGroup, faClock } from '@fortawesome/free-solid-svg-icons';
import MusicLoader from '../components/ui/MusicLoader';

const Vibrance = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const vibranceData = await getVibrance();
        setData(vibranceData);
      } catch (err) {
        setError('Failed to load your monthly vibrance.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <MusicLoader text="Tuning Vibrance..." />;

  if (error || !data) return (
    <div className="flex h-96 items-center justify-center text-vibaura-primary">
      <span>{error || 'No stats found for this month.'}</span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-8 py-16 space-y-16 animate-page-in">
      {/* Header */}
      <header className="border-b border-black/5 pb-8">
        <h1 className="text-4xl font-black text-text-primary tracking-tighter mb-2">
          Your Monthly <span className="text-vibaura-primary">Vibrance</span>
        </h1>
        <p className="text-text-muted">
          Analytics for the month of <span className="font-bold text-text-primary">{data.month}</span>
        </p>
      </header>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Top Songs */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-vibaura-primary font-black uppercase tracking-widest text-xs">
            <FontAwesomeIcon icon={faMusic} />
            <span>Top Resonance</span>
          </div>
          <ul className="divide-y divide-black/5">
            {data.topSongs.map((song, i) => (
              <li key={song._id} className="py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="text-text-muted font-bold w-4">{i + 1}.</span>
                  <div>
                    <div className="font-bold text-text-primary">{song.title}</div>
                    <div className="text-xs text-text-muted">{song.artists[0]?.name}</div>
                  </div>
                </div>
                <div className="text-xs font-bold text-vibaura-primary">{song.playCount} plays</div>
              </li>
            ))}
          </ul>
        </div>

        {/* Top Artists */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-vibaura-primary font-black uppercase tracking-widest text-xs">
            <FontAwesomeIcon icon={faMicrophone} />
            <span>Top Artists</span>
          </div>
          <ul className="divide-y divide-black/5">
            {data.topArtists.map((artist, i) => (
              <li key={artist._id} className="py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="text-text-muted font-bold w-4">{i + 1}.</span>
                  <div className="font-bold text-text-primary">{artist.name}</div>
                </div>
                <div className="text-xs font-bold text-vibaura-primary">{artist.playCount} plays</div>
              </li>
            ))}
          </ul>
        </div>

        {/* Top Playlists */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-vibaura-primary font-black uppercase tracking-widest text-xs">
            <FontAwesomeIcon icon={faLayerGroup} />
            <span>Top Playlists</span>
          </div>
          <ul className="divide-y divide-black/5">
            {data.topPlaylists.map((playlist, i) => (
              <li key={playlist._id} className="py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="text-text-muted font-bold w-4">{i + 1}.</span>
                  <div className="font-bold text-text-primary">{playlist.title}</div>
                </div>
                <div className="text-xs font-bold text-vibaura-primary">{playlist.playCount} plays</div>
              </li>
            ))}
          </ul>
        </div>

        {/* Listen Time */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 text-vibaura-primary font-black uppercase tracking-widest text-xs">
            <FontAwesomeIcon icon={faClock} />
            <span>Listening Time</span>
          </div>
          <div className="bg-vibaura-primary/5 p-8 rounded-3xl border border-vibaura-primary/10">
            <div className="text-6xl font-black text-vibaura-primary tracking-tighter">
              {data.totalMinutes} <span className="text-2xl">min</span>
            </div>
            <p className="text-text-muted mt-2 text-sm">
              Total time spent listening this month.
            </p>
          </div>
        </div>

      </div>

      {/* Footer Info */}
      <footer className="pt-12 text-[10px] text-text-muted uppercase tracking-[0.2em] font-bold text-center">
        Generated by VibAura Analytics Engine
      </footer>
    </div>
  );
};

export default Vibrance;
