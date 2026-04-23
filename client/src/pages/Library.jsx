import React, { useEffect, useState } from 'react';
import MusicSection from '../components/music/MusicSection';
import TrackList from '../components/music/TrackList';
import { getLibrary } from '../services/libraryService';
import { usePlayerStore } from '../store/playerStore';

const Library = ({ onNavigate }) => {
  const [libraryData, setLibraryData] = useState({ playlists: [], likedSongs: [] });
  const [loading, setLoading] = useState(true);
  const { setTrack } = usePlayerStore();

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const data = await getLibrary();
        setLibraryData(data);
      } catch (err) {
        console.error('Failed to load library:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLibrary();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-text-muted animate-pulse">
        <span className="text-xl font-medium tracking-widest uppercase text-vibaura-primary">Syncing Library...</span>
      </div>
    );
  }

  const hasContent = libraryData.playlists.length > 0 || libraryData.likedSongs.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-8 py-10 space-y-16 pb-12">
      <header className="mb-10">
        <h1 className="text-5xl font-black text-text-primary tracking-tighter mb-2">Your Library</h1>
        <p className="text-text-secondary font-medium uppercase tracking-widest text-xs opacity-60">Everything you love, in one place.</p>
      </header>

      {libraryData.likedSongs.length > 0 && (
        <section className="space-y-8">
          <div className="flex items-center justify-between px-1">
             <h2 className="text-2xl font-bold text-text-primary uppercase tracking-tighter">Liked Songs</h2>
             <span className="text-xs font-bold text-text-muted bg-vibaura-bg-muted px-3 py-1 rounded-full uppercase tracking-widest">{libraryData.likedSongs.length} Songs</span>
          </div>
          <TrackList tracks={libraryData.likedSongs} />
        </section>
      )}

      {libraryData.playlists.length > 0 && (
        <MusicSection 
          title="Saved Playlists"
          items={libraryData.playlists}
          type="playlist"
          onCardClick={(item) => onNavigate('playlist', item)}
        />
      )}

      {!hasContent && (
        <div className="flex h-96 flex-col items-center justify-center text-text-muted space-y-6">
           <div className="w-20 h-20 rounded-full bg-vibaura-bg-muted flex items-center justify-center text-vibaura-primary/40 border border-vibaura-border/30">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
           </div>
           <span className="text-lg opacity-40 italic">You haven't liked anything yet.</span>
           <button 
             onClick={() => onNavigate('home')}
             className="px-8 py-3 bg-vibaura-primary text-white rounded-full font-bold shadow-lg hover:scale-105 transition-all"
           >
             Explore Music
           </button>
        </div>
      )}
    </div>
  );
};

export default Library;
