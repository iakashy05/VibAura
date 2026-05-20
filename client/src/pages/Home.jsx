import React, { useEffect, useState, useRef } from 'react';
import Card from '../components/music/card';
import MusicSection from '../components/music/MusicSection';
import { getDiscoveryData } from '../services/discoveryService';
import MusicLoader from '../components/ui/MusicLoader';
import { usePlayerStore } from '../store/playerStore';

const Home = ({ onNavigate }) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadHome = async (isBackground = false) => {
      try {
        if (!isBackground) setLoading(true);
        const discoveryData = await getDiscoveryData();
        setSections(discoveryData);
      } catch (err) {
        if (!isBackground) setError('Failed to load music selections.');
      } finally {
        setLoading(false);
      }
    };
    loadHome();
  }, []);

  const setTrack = usePlayerStore(state => state.setTrack);

  const handleCardClick = (type, item, allItems) => {
    if (type === 'artist' || type === 'playlist') {
      onNavigate(type, item);
    } else {
      setTrack(item, allItems);
    }
  };

  if (loading) return <MusicLoader text="Tuning Home..." />;

  if (error) return (
    <div className="flex h-96 items-center justify-center text-vibaura-primary">
      <span>{error}</span>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-10 space-y-6 md:space-y-10 pb-12 animate-page-in">
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
