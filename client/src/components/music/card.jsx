import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
const Card = ({ 
  id,
  type,
  title, 
  subtitle, 
  image, 
  rounded = 'lg', // 'lg' for albums, 'full' for artists
  onClick,
  onOptionsClick
}) => {
  const isArtist = rounded === 'full';

  return (
    <div 
      className="group relative flex flex-col cursor-pointer transition-[transform,opacity] duration-300 will-change-transform"
      onClick={onClick}
    >
      {/* Image Container */}
      <div className={`relative aspect-square overflow-hidden mb-2 shadow-md ${isArtist ? 'rounded-full' : 'rounded-2xl'}`}>
        <img 
          src={image || 'https://placehold.co/400x400/E5E7EB/1E1E1E?text=VibAura'} 
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover"
        />
        
        {/* Play Button Overlay - Appears on Hover */}
        {!isArtist && (
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
             <div className="w-9 h-9 bg-vibaura-primary text-white rounded-full flex items-center justify-center shadow-xl translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <FontAwesomeIcon icon={faPlay} className="text-[10px] ml-0.5" />
             </div>
          </div>
        )}
      </div>
      
      {/* Text Content */}
      <div className={`space-y-0 ${isArtist ? 'text-center' : 'text-left px-0.5'}`}>
        <h4 className="font-medium md:font-bold text-[12px] md:text-[13.5px] text-text-primary truncate leading-tight group-hover:text-vibaura-primary transition-colors">
          {title}
        </h4>
        <p className="text-[10px] md:text-[11px] font-normal text-text-muted truncate leading-snug">
          {subtitle}
        </p>
      </div>

      {/* Options Button */}
      {onOptionsClick && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onOptionsClick(e);
          }}
          className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-white bg-black/20 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-black/40 z-10"
        >
          <FontAwesomeIcon icon={faEllipsisV} className="text-[8px]" />
        </button>
      )}
    </div>
  );
};

export default Card;
