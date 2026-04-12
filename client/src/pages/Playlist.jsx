import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlay, 
  faShuffle, 
  faArrowsUpDown,
  faPlus,
  faEllipsisH
} from '@fortawesome/free-solid-svg-icons';
import TrackList from '../components/music/TrackList';

const Playlist = ({ playlist }) => {
  // Helper to calculate total duration
  const calculateTotalDuration = (songs) => {
    let totalSeconds = 0;
    songs.forEach(song => {
      const [min, sec] = song.duration.split(':').map(Number);
      totalSeconds += (min * 60) + sec;
    });

    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    
    if (hrs > 0) {
      return `${hrs} hr ${mins} min`;
    }
    return `${mins} min`;
  };

  // Mock data or use passed data
  const currentPlaylist = {
    title: playlist?.title || "My Awesome Playlist",
    description: "Your daily dose of the best vibes and newest releases.",
    cover: playlist?.image || "https://placehold.co/600x600/FF0080/FFFFFF?text=Playlist",
    creator: "VibAura",
    songs: playlist?.songs || [
      { id: 1, title: "Lover", artist: "Taylor Swift", album: "Lover", duration: "3:41", image: "https://placehold.co/100x100/FF0080/FFFFFF?text=L" },
    ]
  };

  const totalDuration = calculateTotalDuration(currentPlaylist.songs);

  return (
    <div className="flex flex-col relative w-full">
      
      {/* 1. Playlist Header (Horizontal with Square Image) */}
      <div className="flex flex-col md:flex-row items-end gap-8 md:gap-10 px-8 py-10 bg-gradient-to-b from-vibaura-bg-pink/50 to-transparent">
        {/* Square Cover Image */}
        <div className="w-48 h-48 md:w-60 md:h-60 flex-shrink-0 shadow-2xl rounded-xl overflow-hidden bg-vibaura-surface flex-shrink-0">
          <img 
            src={currentPlaylist.cover} 
            alt={currentPlaylist.title} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Playlist Info */}
        <div className="flex flex-col mb-2">
          <span className="text-xs uppercase tracking-widest font-bold text-text-muted mb-2">Public Playlist</span>
          <h1 className="text-4xl md:text-7xl font-black text-text-primary tracking-tight mb-4">
            {currentPlaylist.title}
          </h1>
          <div className="flex items-center flex-wrap gap-2 text-text-secondary font-medium text-sm md:text-base">
            <span className="text-text-primary font-bold hover:underline cursor-pointer">{currentPlaylist.creator}</span>
            <span className="w-1 h-1 rounded-full bg-text-muted/40" />
            <span>{currentPlaylist.songs.length} songs</span>
            <span className="text-text-muted px-1">•</span>
            <span className="text-text-muted">{totalDuration}</span>
          </div>
        </div>
      </div>

      {/* 2. Sticky Action Bar */}
      <div className="sticky top-0 z-20 px-8 py-4 bg-vibaura-bg-pink/90 backdrop-blur-md flex items-center gap-4 border-b border-white/5 shadow-sm">
        <button className="bg-vibaura-pink text-white rounded-full px-8 py-2.5 flex items-center gap-2.5 text-sm font-bold hover:bg-vibaura-pink-hover hover:scale-105 active:scale-95 transition-all shadow-lg shadow-vibaura-pink/20">
          <FontAwesomeIcon icon={faPlay} />
          Play Now
        </button>

        <button className="border-2 border-vibaura-pink/20 text-text-primary rounded-full px-8 py-2.5 flex items-center gap-2.5 text-sm font-bold hover:bg-white/40 hover:border-vibaura-pink/40 transition-all active:scale-95">
          <FontAwesomeIcon icon={faShuffle} className="text-vibaura-pink" />
          Shuffle
        </button>
        
        <button className="w-10 h-10 flex items-center justify-center text-vibaura-pink border-2 border-vibaura-pink/20 hover:bg-vibaura-pink/10 rounded-full transition-all ml-1">
          <FontAwesomeIcon icon={faPlus} />
        </button>

        <button className="w-10 h-10 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-white/20 rounded-full transition-all">
          <FontAwesomeIcon icon={faArrowsUpDown} />
        </button>
      </div>

      {/* 3. Track List Section */}
      <div className="px-8 py-8 pb-12">
        <TrackList tracks={currentPlaylist.songs} />
      </div>

    </div>
  );
};

export default Playlist;
