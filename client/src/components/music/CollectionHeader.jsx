import React from 'react';

/**
 * CollectionHeader Component
 * A flexible header for Artist, Playlist, or Album pages.
 */
const CollectionHeader = ({ 
  title, 
  subtitle, 
  image, 
  type = 'playlist', // 'artist' or 'playlist'
  meta = [], // Array of strings/elements to show in the footer row
  description 
}) => {
  const isArtist = type === 'artist';

  return (
    <div className={`flex flex-col md:flex-row items-center md:items-end gap-8 md:gap-10 px-8 py-10 bg-gradient-to-b from-vibaura-tint/50 to-transparent`}>
      
      {/* Cover Image */}
      <div className={`flex-shrink-0 shadow-2xl bg-vibaura-surface flex items-center justify-center overflow-hidden
        ${isArtist ? 'w-32 h-32 md:w-44 md:h-44 rounded-full border-[6px] border-white' : 'w-48 h-48 md:w-60 md:h-60 rounded-xl'}
      `}>
        <img 
          src={image || "https://placehold.co/400x400/eeeeee/888888?text=Collection"} 
          alt={title} 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info Section */}
      <div className={`flex flex-col text-center md:text-left ${!isArtist ? 'mb-2' : 'md:mb-4'}`}>
        {!isArtist && (
          <span className="text-xs uppercase tracking-widest font-bold text-text-muted mb-2">
            Public Playlist
          </span>
        )}
        
        <h1 className={`font-black text-text-primary tracking-tight leading-tight mb-2
          ${isArtist ? 'text-4xl md:text-6xl' : 'text-4xl md:text-7xl'}
        `}>
          {title}
        </h1>

        {description && (
          <p className="text-text-secondary text-sm md:text-base max-w-2xl mb-4 italic">
            {description}
          </p>
        )}

        <div className="flex items-center justify-center md:justify-start flex-wrap gap-2 text-text-secondary font-medium text-sm md:text-base">
          {meta.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="w-1 h-1 rounded-full bg-text-muted/40 mx-1" />}
              <span className={idx === 0 && !isArtist ? "text-text-primary font-bold" : ""}>
                {item}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollectionHeader;
