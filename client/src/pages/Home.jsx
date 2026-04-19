import React, { useEffect, useState, useRef } from 'react';
import Card from '../components/music/card';
import { getDiscoveryData } from '../services/discoveryService';
import { usePlayerStore } from '../store/playerStore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const Home = ({ onNavigate }) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setTrack } = usePlayerStore();

  useEffect(() => {
    const loadHome = async () => {
      try {
        const data = await getDiscoveryData();
        setSections(data);
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
    <div className="max-w-7xl mx-auto px-8 py-10 space-y-14 pb-12">
      {sections.map(section => (
        <MusicSection 
          key={section.id} 
          title={section.title} 
          items={section.items} 
          type={section.type}
          onCardClick={(item) => handleCardClick(section.type, item, section.items)}
        />
      ))}
    </div>
  );
};

// Carousel-enabled Music Section
const MusicSection = ({ title, items, type, onCardClick }) => {
  const scrollRef = useRef(null);
  const SCROLL_AMOUNT = 500; // Fixed scroll amount as requested

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const target = direction === 'left' ? scrollLeft - SCROLL_AMOUNT : scrollLeft + SCROLL_AMOUNT;
      
      scrollRef.current.scrollTo({
        left: target,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="relative group/section">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text-primary uppercase tracking-tighter">{title}</h2>
        <button className="text-vibaura-primary font-semibold hover:underline text-sm">Show all</button>
      </div>

      <div className="relative">
        {/* Navigation Buttons - Hidden by default, show on section hover */}
        <button 
          onClick={() => scroll('left')}
          className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-vibaura-surface/60 backdrop-blur-md border border-white/5 text-text-primary opacity-0 group-hover/section:opacity-100 transition-all duration-300 shadow-xl hover:bg-vibaura-surface hover:text-vibaura-primary active:scale-90"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        <button 
          onClick={() => scroll('right')}
          className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-vibaura-surface/60 backdrop-blur-md border border-white/5 text-text-primary opacity-0 group-hover/section:opacity-100 transition-all duration-300 shadow-xl hover:bg-vibaura-surface hover:text-vibaura-primary active:scale-90"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>

        {/* Scroll Container */}
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto no-scrollbar gap-5 pb-4 px-1"
        >
          {items.map(item => (
            <div key={item.id} className="flex-shrink-0 w-[200px]">
              <Card 
                {...item} 
                rounded={type === 'artist' ? "full" : "lg"} 
                onClick={() => onCardClick(item)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Home;
