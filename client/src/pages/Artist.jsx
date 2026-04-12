import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlay, 
  faShuffle, 
  faArrowsUpDown,
  faCheckCircle,
  faEllipsisH
} from '@fortawesome/free-solid-svg-icons';
import TrackList from '../components/music/TrackList';

const Artist = ({ artist }) => {
  // Use passed artist data or fallback to generic mock if none provided
  const currentArtist = {
    name: artist?.title || "Artist Name",
    cover: artist?.image || "https://placehold.co/400x400/eeeeee/888888?text=Artist",
    listeners: "75,432,190",
    songCount: artist?.songCount || 19,
    isVerified: true,
    songs: artist?.songs || [
      { id: 1, title: `${artist?.title || 'Artist'} - Song 1`, artist: artist?.title || "Artist", album: "The Collection", duration: "3:23", image: artist?.image || "https://placehold.co/100x100/eeeeee/888888?text=1" },
      { id: 2, title: `${artist?.title || 'Artist'} - Song 2`, artist: artist?.title || "Artist", album: "The Collection", duration: "3:03", image: artist?.image || "https://placehold.co/100x100/eeeeee/888888?text=2" },
      { id: 3, title: `${artist?.title || 'Artist'} - Song 3`, artist: artist?.title || "Artist", album: "The Collection", duration: "3:22", image: artist?.image || "https://placehold.co/100x100/eeeeee/888888?text=3" },
    ]
  };

  return (
    <div className="flex flex-col relative w-full">
      
      {/* 1. Artist Profile Header (Horizontal) */}
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10 px-8 py-8 bg-gradient-to-b from-vibaura-bg-pink/50 to-transparent">
        {/* Circular Profile Image */}
        <div className="relative w-32 h-32 md:w-44 md:h-44 flex-shrink-0">
          <div className="w-full h-full rounded-full border-[6px] border-white shadow-xl overflow-hidden bg-vibaura-surface flex items-center justify-center">
            <img 
              src={currentArtist.cover} 
              alt={currentArtist.name} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Text Info */}
        <div className="flex flex-col text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-text-muted mb-1 font-medium">
             <span className="opacity-0">Placeholder</span> 
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-text-primary tracking-tight mb-2">
            {currentArtist.name}
          </h1>
          <div className="flex items-center justify-center md:justify-start gap-2 text-text-secondary font-medium text-sm md:text-base">
            <span>VibAura Artist</span>
            <span className="w-1 h-1 rounded-full bg-text-muted/40" />
            <span>{currentArtist.songs.length} songs</span>
          </div>
        </div>
      </div>

      {/* 2. Sticky Action Bar */}
      <div className="sticky top-0 z-20 px-8 py-4 bg-vibaura-bg-pink/90 backdrop-blur-md flex items-center gap-4 border-b border-white/5 shadow-sm shadow-black/5">
        <button className="bg-vibaura-pink text-white rounded-full px-8 py-2.5 flex items-center gap-2.5 text-sm font-bold hover:bg-vibaura-pink-hover hover:scale-105 active:scale-95 transition-all shadow-lg shadow-vibaura-pink/20">
          <FontAwesomeIcon icon={faPlay} />
          Play Now
        </button>

        <button className="border-2 border-vibaura-pink/20 text-text-primary rounded-full px-8 py-2.5 flex items-center gap-2.5 text-sm font-bold hover:bg-white/40 hover:border-vibaura-pink/40 transition-all active:scale-95">
          <FontAwesomeIcon icon={faShuffle} className="text-vibaura-pink" />
          Shuffle
        </button>
        
        <button className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/20 rounded-full transition-all">
          <FontAwesomeIcon icon={faArrowsUpDown} />
        </button>
      </div>

      {/* 3. All Songs List */}
      <div className="px-8 py-8 pb-12">
        <section>
          <h2 className="text-2xl font-bold text-text-primary uppercase tracking-tighter mb-6">All Songs</h2>
          <TrackList tracks={currentArtist.songs} />
        </section>
      </div>
    </div>
  );
};

export default Artist;
