import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlay, 
  faPause,
  faStepForward, 
  faStepBackward, 
  faShuffle, 
  faRepeat,
  faVolumeUp,
  faVolumeDown,
  faVolumeMute,
  faChevronDown,
  faHeart as faHeartSolid
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { usePlayerStore } from '../../store/playerStore';
import { useAuthStore } from '../../store/authStore';
import { toggleLikeSong } from '../../services/libraryService';

const FullscreenPlayer = () => {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    nextTrack, 
    prevTrack, 
    progress,
    currentTime,
    duration,
    setProgress,
    setCurrentTime,
    isFullscreen,
    toggleFullscreen,
    isShuffle,
    toggleShuffle,
    isRepeat,
    toggleRepeat,
    volume,
    setVolume
  } = usePlayerStore();

  const { user, updateUser, isAuthenticated } = useAuthStore();
  const isLiked = currentTrack && user?.likedSongs?.includes(currentTrack.id);

  if (!isFullscreen || !currentTrack) return null;

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleLikeClick = async (e) => {
    if (e) e.stopPropagation();
    if (!isAuthenticated || !currentTrack) return;
    
    try {
      const res = await toggleLikeSong(currentTrack.id);
      const newLikedSongs = res.liked 
        ? [...(user.likedSongs || []), currentTrack.id]
        : (user.likedSongs || []).filter(id => id !== currentTrack.id);
      updateUser({ ...user, likedSongs: newLikedSongs });
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#050505] text-white overflow-hidden animate-in fade-in zoom-in duration-500">
      
      {/* 1. Dynamic Immersive Background - Solid Dark */}
      <div className="absolute inset-0 bg-[#0A0A0B]">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
      </div>

      {/* 2. Content Layout */}
      <div className="relative z-10 h-full flex flex-col items-center justify-between py-12 px-8 max-w-7xl mx-auto">
        
        {/* Top Header: Navigation / Minimize */}
        <div className="w-full flex items-center justify-between">
          <button 
            onClick={toggleFullscreen}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all group"
          >
            <FontAwesomeIcon icon={faChevronDown} className="text-white group-hover:translate-y-0.5 transition-transform" />
          </button>
          
          <div className="flex flex-col items-center">
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Now Playing</span>
             <span className="text-sm font-bold tracking-tight text-white/80">{currentTrack.album || 'VibAura Player'}</span>
          </div>

          <div className="w-12" /> {/* Spacer */}
        </div>

        {/* Main Section: Artwork & Song Info */}
        <div className="flex flex-col items-center gap-12 w-full">
           {/* Artwork Island */}
           <div className="relative group/art">
             
             <div className="relative w-[320px] h-[320px] md:w-[420px] md:h-[420px] rounded-[40px] overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.6)] border border-white/10 transition-transform duration-700 group-hover:scale-[1.02]">
                <img 
                  src={currentTrack.albumArt} 
                  alt={currentTrack.title} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
             </div>
           </div>

           {/* Metadata Section */}
           <div className="text-center space-y-3">
             <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight animate-in slide-in-from-bottom-4 duration-700">
               {currentTrack.title}
             </h1>
             <div className="flex items-center justify-center gap-4">
                <p className="text-lg md:text-2xl font-bold text-white/60 tracking-tight">
                  {currentTrack.artist}
                </p>
                <button 
                  onClick={handleLikeClick}
                  className={`text-xl transition-all hover:scale-125 active:scale-90 ${isLiked ? 'text-vibaura-primary' : 'text-white/40 hover:text-white'}`}
                >
                  <FontAwesomeIcon icon={isLiked ? faHeartSolid : faHeartRegular} />
                </button>
             </div>
           </div>
        </div>

        {/* Bottom Section: Controls & Progress */}
        <div className="w-full max-w-4xl space-y-10">
          
          {/* Progress Bar Island */}
          <div className="space-y-4 px-2">
            <div className="flex items-center gap-6 group/progress">
               <span className="text-xs font-black text-white/40 tabular-nums w-12 text-left">{formatTime(currentTime)}</span>
               
               <div className="flex-1 relative flex items-center h-6">
                 <input 
                   type="range"
                   min="0"
                   max="100"
                   value={progress}
                   onChange={(e) => {
                     const val = parseFloat(e.target.value);
                     setProgress(val);
                     // Logic to seek would be handled by the parent audio element or store sync
                   }}
                   className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
                 />
                 {/* Track Design */}
                 <div className="w-full h-1.5 bg-white/10 rounded-full relative overflow-hidden group-hover/progress:h-2.5 transition-all duration-300">
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-100 shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                      style={{ width: `${progress}%` }}
                    />
                 </div>
                 {/* Thumb */}
                 <div 
                   className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-2xl opacity-0 group-hover/progress:opacity-100 transition-all scale-0 group-hover/progress:scale-100 border-4 border-black/20"
                   style={{ left: `calc(${progress}% - 10px)` }}
                 />
               </div>

               <span className="text-xs font-black text-white/40 tabular-nums w-12 text-right">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls Hub */}
          <div className="flex items-center justify-between px-8">
            
            {/* Shuffle Toggle */}
            <button 
              onClick={toggleShuffle}
              className={`text-lg transition-all hover:scale-110 active:scale-90 ${isShuffle ? 'text-vibaura-primary drop-shadow-[0_0_12px_rgba(99,103,255,0.6)]' : 'text-white/40 hover:text-white'}`}
            >
              <FontAwesomeIcon icon={faShuffle} />
            </button>

            {/* Main Playback Controls */}
            <div className="flex items-center gap-12">
               <button 
                 onClick={prevTrack}
                 className="text-3xl text-white/80 hover:text-white transition-all hover:scale-110 active:scale-75"
               >
                 <FontAwesomeIcon icon={faStepBackward} />
               </button>

               <button 
                 onClick={togglePlay}
                 className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center text-3xl shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-90 transition-all duration-300"
               >
                 <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className={!isPlaying ? "ml-1" : ""} />
               </button>

               <button 
                 onClick={nextTrack}
                 className="text-3xl text-white/80 hover:text-white transition-all hover:scale-110 active:scale-75"
               >
                 <FontAwesomeIcon icon={faStepForward} />
               </button>
            </div>

            {/* Repeat Toggle */}
            <button 
              onClick={toggleRepeat}
              className={`text-lg transition-all hover:scale-110 active:scale-90 ${isRepeat ? 'text-vibaura-primary drop-shadow-[0_0_12px_rgba(99,103,255,0.6)]' : 'text-white/40 hover:text-white'}`}
            >
              <FontAwesomeIcon icon={faRepeat} />
            </button>

          </div>

          {/* Volume Control - Minimalist */}
          <div className="flex justify-center items-center gap-4 group/vol-full pt-4 opacity-40 hover:opacity-100 transition-opacity duration-300">
             <FontAwesomeIcon icon={volume === 0 ? faVolumeMute : faVolumeDown} className="text-white/60" />
             <div className="w-32 h-1 bg-white/10 rounded-full relative overflow-hidden group-hover/vol-full:h-1.5 transition-all">
                <input 
                  type="range" min="0" max="1" step="0.01" value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
                />
                <div className="h-full bg-white/80 rounded-full" style={{ width: `${volume * 100}%` }} />
             </div>
             <FontAwesomeIcon icon={faVolumeUp} className="text-white/60" />
          </div>

        </div>

      </div>

    </div>
  );
};

export default FullscreenPlayer;
