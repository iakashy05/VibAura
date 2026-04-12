import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import Button from '../ui/button';

const Card = ({ 
  title, 
  subtitle, 
  image, 
  rounded = 'lg', // 'lg' for albums, 'full' for artists
  onClick 
}) => {
  const isArtist = rounded === 'full';

  return (
    <div 
      className="group bg-vibaura-bg-muted/50 hover:bg-vibaura-bg-muted p-4 rounded-2xl transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md border border-transparent hover:border-vibaura-border/50"
      onClick={onClick}
    >
      {/* Image Container */}
      <div className={`relative aspect-square overflow-hidden mb-4 shadow-lg ${isArtist ? 'rounded-full' : 'rounded-xl'}`}>
        <img 
          src={image || 'https://placehold.co/400x400/E5E7EB/1E1E1E?text=VibAura'} 
          alt={title}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110`}
        />
        
        {/* Hover Play Button Overlay - Only for Albums (non-artists) */}
        {!isArtist && (
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
             <Button 
               size="icon" 
               className="w-12 h-12 translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-2xl"
             >
               <FontAwesomeIcon icon={faPlay} />
             </Button>
          </div>
        )}
      </div>

      {/* Text Content */}
      <div className={isArtist ? 'text-center' : 'text-left'}>
        <h4 className="font-bold text-text-primary truncate">{title}</h4>
        <p className="text-sm text-text-secondary truncate">{subtitle}</p>
      </div>
    </div>
  );
};

export default Card;
