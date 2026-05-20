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
        <h2 className="text-base md:text-xl font-semibold md:font-bold text-text-primary tracking-tight">{title}</h2>
      </div>

      <div className="relative -mx-6">
        {/* Navigation Buttons - Hidden on Mobile */}
        <button 
          onClick={() => scroll('left')}
          className="hidden md:flex absolute left-2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center rounded-full bg-vibaura-surface/60 backdrop-blur-md border border-white/5 text-text-primary opacity-0 group-hover/section:opacity-100 transition-colors duration-300 shadow-xl hover:bg-vibaura-surface hover:text-vibaura-primary active:scale-90"
          style={{ top: 'calc(var(--card-size) / 2)' }}
        >
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        <button 
          onClick={() => scroll('right')}
          className="hidden md:flex absolute right-2 -translate-y-1/2 z-10 w-12 h-12 items-center justify-center rounded-full bg-vibaura-surface/60 backdrop-blur-md border border-white/5 text-text-primary opacity-0 group-hover/section:opacity-100 transition-colors duration-300 shadow-xl hover:bg-vibaura-surface hover:text-vibaura-primary active:scale-90"
          style={{ top: 'calc(var(--card-size) / 2)' }}
        >
          <FontAwesomeIcon icon={faChevronRight} />
        </button>

        {/* Scroll Container - Native momentum snapping on touch devices */}
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto no-scrollbar gap-5 pb-8 px-6 snap-x snap-mandatory scroll-smooth"
        >
          {items.map(item => (
            <div key={item.id} className="flex-shrink-0 w-[var(--card-size)] transition-all duration-300 snap-start scroll-ml-6">
              <Card 
                {...item} 
                type={type}
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
