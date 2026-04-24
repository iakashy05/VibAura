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
    toggleShuffle
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
    e.stopPropagation();
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
    <footer className="h-24 bg-vibaura-surface flex items-center justify-between px-6 z-20 border-t border-black/5">
      <audio 
        ref={audioRef}
        src={currentTrack?.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={nextTrack}
      />
      
      {/* 1. Track Info Section */}
      <div className="flex items-center gap-4 w-[30%]">
        <div className="w-14 h-14 rounded-lg bg-vibaura-bg-muted overflow-hidden shadow-lg group cursor-pointer relative">
          <img 
            src={currentTrack?.image || "https://placehold.co/100x100/6367FF/FFFFFF?text=Aura"} 
            alt="Album" 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          />
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-text-primary truncate hover:text-vibaura-primary cursor-pointer transition-colors">
            {currentTrack?.title || "Select a Song"}
          </span>
          <span className="text-sm text-text-secondary truncate hover:text-vibaura-primary/80 cursor-pointer transition-colors">
            {Array.isArray(currentTrack?.artists) 
              ? currentTrack.artists.map(a => a.name).join(', ') 
              : (currentTrack?.artist || 'VibAura Artist')}
          </span>
        </div>
        {currentTrack && (
          <LikeButton 
            isLiked={isLiked}
            onClick={handleLikeClick}
            className="ml-2"
          />
        )}
      </div>

      {/* 2. Main Playback Controls Center */}
      <div className="flex flex-col items-center gap-2 max-w-xl w-full">
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleShuffle}
            className={`transition-all active:scale-90 ${isShuffle ? 'text-vibaura-primary drop-shadow-[0_0_8px_rgba(99,103,255,0.4)]' : 'text-text-muted hover:text-vibaura-primary'}`}
          >
            <FontAwesomeIcon icon={faShuffle} />
          </button>
          <button 
            onClick={prevTrack}
            className="text-text-primary hover:text-vibaura-primary transition-all text-xl active:scale-90"
          >
            <FontAwesomeIcon icon={faStepBackward} />
          </button>
          
          <Button 
            onClick={togglePlay}
            size="icon" 
            className="w-11 h-11 shadow-lg shadow-vibaura-primary/20 hover:scale-110"
          >
            <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className={!isPlaying ? "ml-0.5" : ""} />
          </Button>

          <button 
            onClick={nextTrack}
            className="text-text-primary hover:text-vibaura-primary transition-all text-xl active:scale-90"
          >
            <FontAwesomeIcon icon={faStepForward} />
          </button>
          <button className="text-text-muted hover:text-vibaura-primary transition-all active:scale-90"><FontAwesomeIcon icon={faRepeat} /></button>
        </div>
        
        {/* Progress Bar */}
        <div className="flex items-center gap-3 w-full group">
          <span className="text-[10px] text-text-muted font-mono w-8">
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
            <div className="w-full h-1 bg-vibaura-tint rounded-full relative">
              <div 
                className="h-full bg-vibaura-primary group-hover:bg-vibaura-primary/80 shadow-[0_0_12px_rgba(99,103,255,0.4)] rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
              {/* Playhead thumb handle */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-vibaura-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md pointer-events-none"
                style={{ left: `calc(${progress}% - 6px)` }}
              ></div>
            </div>
          </div>
          <span className="text-[10px] text-text-muted font-mono w-8 text-right">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* 3. Volume & Tools Section */}
      <div className="flex items-center justify-end gap-5 w-[30%] text-text-secondary">
        <button className="hover:text-vibaura-primary transition-colors active:scale-90"><FontAwesomeIcon icon={faExpand} size="sm" /></button>
        <div className="flex items-center gap-3 w-32 group relative">
          <button 
            onClick={toggleMute}
            className="w-5 flex justify-center hover:text-vibaura-primary transition-colors"
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
            <div className="w-full h-1 bg-vibaura-tint rounded-full relative">
              <div 
                className="h-full bg-vibaura-primary group-hover:bg-vibaura-primary/80 rounded-full"
                style={{ width: `${volume * 100}%` }}
              ></div>
              {/* Volume thumb handle */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-vibaura-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md pointer-events-none"
                style={{ left: `calc(${volume * 100}% - 6px)` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default PlayerBar;
