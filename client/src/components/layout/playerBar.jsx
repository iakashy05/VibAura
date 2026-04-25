import React, { useRef, useEffect, useState } from 'react';
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
  faExpand,
  faHeart as faHeartSolid
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import Button from '../ui/button';
import { usePlayerStore } from '../../store/playerStore';
import { useAuthStore } from '../../store/authStore';
import { toggleLikeSong } from '../../services/libraryService';
import LikeButton from '../ui/LikeButton';

const PlayerBar = () => {
  const audioRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const { 
    currentTrack, 
    isPlaying, 
    volume, 
    progress, 
    currentTime,
    duration,
    togglePlay, 
    nextTrack, 
    prevTrack, 
    setVolume,
    toggleMute,
    setProgress,
    setCurrentTime,
    setDuration,
    isShuffle,
    toggleShuffle,
    isRepeat,
    toggleRepeat
  } = usePlayerStore();

  // --- 1. Audio Playback Core ---
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.play().catch(err => console.log('Playback error:', err));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    if (audioRef.current && !isDragging) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setCurrentTime(current);
      if (total) {
        setProgress((current / total) * 100);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const val = parseFloat(e.target.value);
    setProgress(val);
    if (audioRef.current) {
      const seekTime = (val / 100) * audioRef.current.duration;
      setCurrentTime(seekTime);
    }
  };

  const handleSeekEnd = (e) => {
    setIsDragging(false);
    if (audioRef.current) {
      const seekTime = (e.target.value / 100) * audioRef.current.duration;
      audioRef.current.currentTime = seekTime;
    }
  };

  const handleEnded = () => {
    if (isRepeat && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      nextTrack();
    }
  };

  // --- 2. Helper: Time Formatter ---
  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Get correct volume icon
  const getVolumeIcon = () => {
    if (volume === 0) return faVolumeMute;
    if (volume < 0.5) return faVolumeDown;
    return faVolumeUp;
  };

  const { user, updateUser, isAuthenticated } = useAuthStore();
  const isLiked = currentTrack && user?.likedSongs?.includes(currentTrack.id);

  const handleLikeClick = async (e) => {
    if (e) e.stopPropagation();
    if (!isAuthenticated || !currentTrack) return;
    
    try {
      const res = await toggleLikeSong(currentTrack.id);
      
      const newLikedSongs = res.liked 
        ? [...(user.likedSongs || []), currentTrack.id]
        : (user.likedSongs || []).filter(id => id !== currentTrack.id);
      
      updateUser({ ...user, likedSongs: newLikedSongs });
      window.dispatchEvent(new Event('vibaura-library-updated'));
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  return (
    <div className="fixed bottom-6 left-0 right-0 px-8 z-50 flex items-center justify-center pointer-events-none select-none">
      <audio 
        ref={audioRef}
        src={currentTrack?.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />
      
      {/* 1. Main Playback Controls Island (Center) */}
      <div className="pointer-events-auto flex flex-col items-center gap-1.5 bg-white/60 backdrop-blur-xl border border-white rounded-[32px] px-10 py-4 w-full max-w-2xl relative overflow-hidden group/center shadow-[0_8px_40px_rgba(0,0,0,0.03)] transition-all duration-500 hover:bg-white/70 hover:border-black/5">
        {/* Subtle decorative glows */}
        <div className="absolute -left-20 -top-20 w-40 h-40 bg-vibaura-primary/5 blur-[60px] rounded-full pointer-events-none animate-pulse"></div>
        <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-vibaura-secondary/5 blur-[60px] rounded-full pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>

        <div className="flex items-center gap-10 relative z-10 mb-1">
          <button 
            onClick={toggleShuffle}
            className={`transition-all active:scale-75 text-[13px] ${isShuffle ? 'text-vibaura-primary drop-shadow-[0_0_8px_rgba(99,103,255,0.4)]' : 'text-[#888] hover:text-[#1A1A1A]'}`}
            title="Shuffle"
          >
            <FontAwesomeIcon icon={faShuffle} />
          </button>
          <button 
            onClick={prevTrack}
            className="text-[#1A1A1A] hover:text-vibaura-primary transition-all text-[15px] active:scale-75"
            title="Previous"
          >
            <FontAwesomeIcon icon={faStepBackward} />
          </button>
          
          <div className="relative group/play">
            <div className="absolute inset-0 bg-vibaura-primary/25 blur-2xl rounded-full scale-125 opacity-0 group-hover/play:opacity-100 transition-opacity duration-500"></div>
            <Button 
              onClick={togglePlay}
              size="icon" 
              className="w-12 h-12 shadow-[0_6px_20px_rgba(99,103,255,0.3)] hover:scale-110 active:scale-90 relative z-10 bg-vibaura-primary text-white border-none transition-all duration-300"
            >
              <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className={!isPlaying ? "ml-1" : ""} />
            </Button>
          </div>

          <button 
            onClick={nextTrack}
            className="text-[#1A1A1A] hover:text-vibaura-primary transition-all text-[15px] active:scale-75"
            title="Next"
          >
            <FontAwesomeIcon icon={faStepForward} />
          </button>
          <button 
            onClick={toggleRepeat}
            className={`transition-all active:scale-75 text-[13px] ${isRepeat ? 'text-vibaura-primary drop-shadow-[0_0_8px_rgba(99,103,255,0.4)]' : 'text-[#888] hover:text-[#1A1A1A]'}`}
            title="Repeat"
          >
            <FontAwesomeIcon icon={faRepeat} />
          </button>
        </div>
        
        {/* Progress Bar (Integrated) */}
        <div className="flex items-center gap-4 w-full group/progress">
          <span className="text-[9px] text-[#777] font-black uppercase tracking-widest w-8 text-center tabular-nums">
            {formatTime(currentTime)}
          </span>
          <div className="flex-1 relative flex items-center h-4">
            <input 
              type="range"
              min="0"
              max="100"
              value={progress}
              onMouseDown={() => setIsDragging(true)}
              onChange={handleSeek}
              onMouseUp={handleSeekEnd}
              className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
            />
            <div className="w-full h-1.5 bg-black/5 rounded-full relative overflow-hidden transition-all duration-300 group-hover/progress:h-2 group-hover/progress:bg-black/10">
              <div 
                className="h-full bg-vibaura-primary rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            {/* Playhead thumb handle (Visual only) */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-vibaura-primary rounded-full opacity-0 group-hover/progress:opacity-100 transition-all shadow-lg pointer-events-none scale-0 group-hover/progress:scale-100"
              style={{ left: `calc(${progress}% - 8px)` }}
            ></div>
          </div>
          <span className="text-[9px] text-[#777] font-black uppercase tracking-widest w-8 text-center tabular-nums">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* 2. Volume & Tools Island (Absolute right) */}
      <div className="absolute right-8 pointer-events-auto flex items-center gap-6 bg-white/60 backdrop-blur-xl border border-white rounded-[28px] p-3.5 px-6 min-w-[220px] justify-end shadow-[0_8px_40px_rgba(0,0,0,0.03)] transition-all duration-500 hover:bg-white/70 hover:border-black/5">
        <button className="text-[#888] hover:text-[#1A1A1A] transition-colors active:scale-75" title="Expand">
          <FontAwesomeIcon icon={faExpand} size="sm" />
        </button>
        <div className="flex items-center gap-3 w-32 group/volume relative">
          <button 
            onClick={toggleMute}
            className="w-5 flex justify-center text-[#888] hover:text-[#1A1A1A] transition-colors"
          >
            <FontAwesomeIcon icon={getVolumeIcon()} size="sm" />
          </button>
          <div className="flex-1 relative flex items-center h-4">
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
            />
            <div className="w-full h-1.5 bg-black/5 rounded-full relative overflow-hidden transition-all duration-300 group-hover/volume:h-2 group-hover/volume:bg-black/10">
              <div 
                className="h-full bg-vibaura-primary rounded-full transition-all duration-200"
                style={{ width: `${volume * 100}%` }}
              ></div>
            </div>
            
            {/* Custom Handle for Volume (Visual only) */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-vibaura-primary rounded-full opacity-0 group-hover/volume:opacity-100 transition-all duration-300 shadow-lg pointer-events-none scale-0 group-hover/volume:scale-100"
              style={{ left: `calc(${volume * 100}% - 8px)` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerBar;
