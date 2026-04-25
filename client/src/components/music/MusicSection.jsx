import React, { useRef } from 'react';
import Card from './card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

/**
 * A reusable, carousel-enabled section for displaying music items (Songs, Artists, Playlists).
 */
const MusicSection = ({ title, items, type, onCardClick, onItemContextClick }) => {
  const scrollRef = useRef(null);
  const SCROLL_AMOUNT = 500; // Consistent with VibAura standard

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      const target = direction === 'left' ? scrollLeft - SCROLL_AMOUNT : scrollLeft + SCROLL_AMOUNT;
      
      scrollRef.current.scrollTo({
        left: target,
        behavior: 'smooth'
      });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="relative group/section">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-xl font-bold text-text-primary uppercase tracking-tighter">{title}</h2>
      </div>

      <div className="relative -mx-6">
        {/* Navigation Buttons - Centered on the image part (145px height) */}
        <button 
          onClick={() => scroll('left')}
          className="absolute left-2 top-[72.5px] -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-vibaura-surface/60 backdrop-blur-md border border-white/5 text-text-primary opacity-0 group-hover/section:opacity-100 transition-all duration-300 shadow-xl hover:bg-vibaura-surface hover:text-vibaura-primary active:scale-90"
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        <button 
          onClick={() => scroll('right')}
          className="absolute right-2 top-[72.5px] -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-vibaura-surface/60 backdrop-blur-md border border-white/5 text-text-primary opacity-0 group-hover/section:opacity-100 transition-all duration-300 shadow-xl hover:bg-vibaura-surface hover:text-vibaura-primary active:scale-90"
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>

        {/* Scroll Container */}
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto no-scrollbar gap-5 pb-4 px-6"
        >
          {items.map(item => (
            <div key={item.id} className="flex-shrink-0 w-[145px]">
              <Card 
                {...item} 
                rounded={type === 'artist' ? "full" : "lg"} 
                onClick={() => onCardClick(item)}
                onOptionsClick={onItemContextClick ? (e) => onItemContextClick(e, item) : undefined}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MusicSection;
