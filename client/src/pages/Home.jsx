import React, { useEffect, useState, useRef } from 'react';
import Card from '../components/music/card';
import MusicSection from '../components/music/MusicSection';
import { getDiscoveryData } from '../services/discoveryService';
import { getLibrary } from '../services/libraryService';
import { usePlayerStore } from '../store/playerStore';

const Home = ({ onNavigate }) => {
  const [sections, setSections] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setTrack } = usePlayerStore();

  useEffect(() => {
    const loadHome = async (isBackground = false) => {
      try {
        if (!isBackground) setLoading(true);
        const [discoveryData, libraryData] = await Promise.all([
          getDiscoveryData(),
          getLibrary()
        ]);
        setSections(discoveryData);
        setRecentlyPlayed(libraryData.recentlyPlayed || []);
      } catch (err) {
        if (!isBackground) setError('Failed to load music selections.');
      } finally {
        setLoading(false);
      }
    };
    loadHome();

    const handleUpdate = () => loadHome(true);
    window.addEventListener('vibaura-library-updated', handleUpdate);
    return () => window.removeEventListener('vibaura-library-updated', handleUpdate);
  }, []);

  const handleCardClick = (type, item, allItems) => {
    if (type === 'song') {
      setTrack(item, allItems);
    } else {
      onNavigate(type, item);
    }
  };

  if (loading) return (
    <div className="flex h-96 items-center justify-center text-text-muted animate-pulse">
      <span className="text-xl font-medium tracking-widest uppercase">Syncing with Aura...</span>
    </div>
  );

  if (error) return (
    <div className="flex h-96 items-center justify-center text-vibaura-primary">
      <span>{error}</span>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10 pb-12">
      {recentlyPlayed.length > 0 && (
        <MusicSection 
          title="Recently Played" 
          items={recentlyPlayed} 
          type="song"
          onCardClick={(item) => handleCardClick('song', item, recentlyPlayed)}
        />
      )}
      
      {sections.map(section => (
        <MusicSection 
          key={section.id || section.title} 
          title={section.title} 
          items={section.items} 
          type={section.type}
          onCardClick={(item) => handleCardClick(section.type, item, section.items)}
        />
      ))}
    </div>
  );
};

export default Home;
