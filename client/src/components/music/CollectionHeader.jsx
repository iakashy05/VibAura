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
  isRecentlyPlayed,
  isInLibrary = false,
  onNavigate
}) => {
  const isArtist = type === 'artist';

  const renderSpecialIcon = () => {
    if (isLikedPlaylist) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-purple-500 via-vibaura-primary to-[#4F46E5] flex items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="w-14 h-14 md:w-20 md:h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center shadow-2xl border border-white/20">
               <svg className="w-7 h-7 md:w-10 md:h-10 text-white fill-current drop-shadow-lg" viewBox="0 0 24 24">
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
             <div className="w-14 h-14 md:w-20 md:h-20 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center shadow-2xl border border-white/20">
               <svg className="w-7 h-7 md:w-10 md:h-10 text-white fill-current drop-shadow-lg" viewBox="0 0 24 24">
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
    <div className="flex flex-col md:flex-row items-start md:items-end gap-5 md:gap-10 px-4 md:px-8 py-5 pt-12 md:py-8 bg-gradient-to-b from-vibaura-tint/30 to-transparent border-b border-black/[0.02] relative">
      
      {/* Mobile Back Button */}
      {onNavigate && (
        <button 
          onClick={() => onNavigate('home')}
          className="md:hidden absolute top-4 left-4 w-10 h-10 flex items-center justify-center bg-white/70 backdrop-blur-xl rounded-full text-text-primary shadow-sm border border-black/5 active:scale-90 transition-transform z-20"
        >
          <svg className="w-5 h-5 pr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
      )}
      {/* Cover Image Wrapper to center on mobile */}
      <div className="flex justify-center w-full md:w-auto">
        <div className={`flex-shrink-0 bg-vibaura-surface flex items-center justify-center overflow-hidden relative transition-all duration-300
          shadow-[0_12px_36px_rgba(0,0,0,0.14)] border border-white/20
          ${isArtist ? 'w-[160px] h-[160px] md:w-44 md:h-44 rounded-full border-[3px] md:border-[6px] border-white' : 'w-[160px] h-[160px] md:w-60 md:h-60 rounded-2xl md:rounded-[40px]'}
        `}>
          {isLikedPlaylist || isRecentlyPlayed ? renderSpecialIcon() : (
            <img 
              src={image || "https://placehold.co/400x400/eeeeee/888888?text=Collection"} 
              alt={title} 
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </div>
 
      {/* Info Section */}
      <div className="flex flex-col text-left w-full flex-1 min-w-0 md:mb-2 mt-4 md:mt-0">
        {!isArtist && (
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[8px] uppercase tracking-[0.2em] font-extrabold text-vibaura-primary leading-none">
              {isUserPlaylist ? 'User Playlist' : 'Public Playlist'}
            </span>
            {isInLibrary && (
              <span className="text-[8px] uppercase tracking-[0.15em] font-black bg-emerald-50 text-emerald-600 border border-emerald-200/50 px-2 py-0.5 rounded-full leading-none">
                In Library
              </span>
            )}
          </div>
        )}
        {isArtist && isInLibrary && (
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-[8px] uppercase tracking-[0.15em] font-black bg-emerald-50 text-emerald-600 border border-emerald-200/50 px-2 py-0.5 rounded-full leading-none">
              Following
            </span>
          </div>
        )}
        
        <h1 className={`font-black text-text-primary tracking-tight leading-none mb-1.5 truncate
          ${isArtist ? 'text-lg md:text-6xl' : 'text-xl md:text-7xl'}
        `}>
          {title}
        </h1>

        {description && (
          <p className="text-[#666] text-[10px] md:text-lg max-w-3xl mb-2 md:mb-6 font-medium leading-relaxed tracking-tight line-clamp-2 md:line-clamp-none">
            {description}
          </p>
        )}

        <div className="flex items-center justify-start flex-wrap gap-1.5 text-[#888] font-bold text-[9px] md:text-base leading-none">
          {meta.map((item, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="w-1 h-1 rounded-full bg-text-muted/40 mx-1 shrink-0" />}
              <span className={idx === 0 && !isArtist ? "text-text-primary font-black" : ""}>
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
