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
  description,
  isUserPlaylist,
  isLikedPlaylist,
  isRecentlyPlayed
}) => {
  const isArtist = type === 'artist';

  const renderSpecialIcon = () => {
    if (isLikedPlaylist) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-purple-500 via-vibaura-primary to-[#4F46E5] flex items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center shadow-2xl border border-white/20">
               <svg className="w-10 h-10 text-white fill-current drop-shadow-lg" viewBox="0 0 24 24">
                 <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
               </svg>
             </div>
          </div>
        </div>
      );
    }
    if (isRecentlyPlayed) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-[#FF4D8D] via-[#FF6B6B] to-[#FF8E53] flex items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center shadow-2xl border border-white/20">
               <svg className="w-10 h-10 text-white fill-current drop-shadow-lg" viewBox="0 0 24 24">
                 <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
               </svg>
             </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`flex flex-col md:flex-row items-center md:items-end gap-8 md:gap-10 px-8 py-10 bg-gradient-to-b from-vibaura-tint/50 to-transparent`}>
      
      {/* Cover Image */}
      <div className={`flex-shrink-0 shadow-2xl bg-vibaura-surface flex items-center justify-center overflow-hidden relative
        ${isArtist ? 'w-32 h-32 md:w-44 md:h-44 rounded-full border-[6px] border-white' : 'w-48 h-48 md:w-60 md:h-60 rounded-[40px]'}
      `}>
        {isLikedPlaylist || isRecentlyPlayed ? renderSpecialIcon() : (
          <img 
            src={image || "https://placehold.co/400x400/eeeeee/888888?text=Collection"} 
            alt={title} 
            className="w-full h-full object-cover"
          />
        )}
      </div>
 
      {/* Info Section */}
      <div className={`flex flex-col text-center md:text-left ${!isArtist ? 'mb-2' : 'md:mb-4'}`}>
        {!isArtist && (
          <span className="text-xs uppercase tracking-widest font-bold text-[#999] mb-2">
            {isUserPlaylist ? 'User Playlist' : 'Public Playlist'}
          </span>
        )}
        
        <h1 className={`font-black text-text-primary tracking-tight leading-tight mb-2
          ${isArtist ? 'text-4xl md:text-6xl' : 'text-4xl md:text-7xl'}
        `}>
          {title}
        </h1>

        {description && (
          <p className="text-[#999] text-sm md:text-lg max-w-3xl mb-6 font-normal leading-relaxed tracking-tight">
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
