import React, { useEffect, useState, useRef } from 'react';
import Card from '../components/music/card';
import MusicSection from '../components/music/MusicSection';
import { getDiscoveryData } from '../services/discoveryService';
import { usePlayerStore } from '../store/playerStore';

const Home = ({ onNavigate }) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setTrack } = usePlayerStore();

  useEffect(() => {
    const loadHome = async () => {
      try {
        const discoveryData = await getDiscoveryData();
        setSections(discoveryData);
      } catch (err) {
        setError('Failed to load music selections.');
      } finally {
        setLoading(false);
      }
    };
    loadHome();
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
