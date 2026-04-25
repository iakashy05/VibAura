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
    toggleRepeat,
    toggleFullscreen
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
    <div className="fixed bottom-8 left-[360px] right-0 z-50 flex justify-center pointer-events-none select-none transition-all duration-500">
      <audio
        ref={audioRef}
        src={currentTrack?.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <div className="flex items-center justify-between w-full max-w-7xl px-8 pointer-events-none">
        {/* 1. Song Info Island (Left) */}
        <div
          onClick={toggleFullscreen}
          className="pointer-events-auto flex items-center gap-3 bg-white/80 backdrop-blur-xl border border-white/50 rounded-[28px] px-2.5 w-[240px] md:w-[280px] h-[64px] transition-all duration-500 cursor-pointer group/info shadow-[0_12px_40px_rgba(0,0,0,0.08)]"
        >
          <style>
            {`
              @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
              .animate-marquee {
                display: inline-block;
                white-space: nowrap;
                animation: marquee 10s linear 1;
                animation-fill-mode: forwards;
              }
              .group\\/info:hover .animate-marquee {
                animation-iteration-count: infinite;
              }
            `}
          </style>
          <div className="w-11 h-11 rounded-[20px] bg-vibaura-bg-muted overflow-hidden relative flex-shrink-0 border border-black/5 ml-0.5">
            <img
              src={currentTrack?.albumArt || currentTrack?.image || "https://placehold.co/100x100/6367FF/FFFFFF?text=Aura"}
              alt="Album"
              className="w-full h-full object-cover transition-transform duration-700 group-hover/info:scale-110"
            />
          </div>
          <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
            <span className="font-bold text-[#1A1A1A] truncate text-[13px] tracking-tight leading-tight mb-0.5">
              {currentTrack?.title || "Select a Song"}
            </span>
            <div className="relative overflow-hidden w-full h-4 flex items-center">
              <div className={`${(currentTrack?.artists?.length > 1 || (currentTrack?.artist?.length > 15)) ? 'animate-marquee' : 'truncate'} text-[10px] font-black text-[#666] uppercase tracking-tighter leading-none`}>
                <span className="pr-8">
                  {Array.isArray(currentTrack?.artists)
                    ? currentTrack.artists.map(a => a.name).join(', ')
                    : (currentTrack?.artist || 'VibAura Artist')}
                </span>
                {(currentTrack?.artists?.length > 1 || (currentTrack?.artist?.length > 15)) && (
                  <span className="pr-8">
                    {Array.isArray(currentTrack?.artists)
                      ? currentTrack.artists.map(a => a.name).join(', ')
                      : (currentTrack?.artist || 'VibAura Artist')}
                  </span>
                )}
              </div>
            </div>
          </div>
          <LikeButton
            isLiked={isLiked}
            onClick={handleLikeClick}
            className="scale-90 hover:scale-110 transition-transform mr-1"
          />
        </div>

        {/* 2. Main Playback Controls Island (Center) */}
        <div className="pointer-events-auto flex flex-col items-center gap-0.5 bg-white/80 backdrop-blur-xl border border-white/50 rounded-[34px] px-8 py-3.5 w-full max-w-[400px] lg:max-w-[500px] transition-all duration-500 shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-8 relative z-10 mb-1">
            <button
              onClick={toggleShuffle}
              className={`transition-all active:scale-75 text-[12px] ${isShuffle ? 'text-vibaura-primary' : 'text-[#888] hover:text-[#1A1A1A]'}`}
              title="Shuffle"
            >
              <FontAwesomeIcon icon={faShuffle} />
            </button>
            <button
              onClick={prevTrack}
              className="text-[#1A1A1A] hover:text-vibaura-primary transition-all text-[14px] active:scale-75"
              title="Previous"
            >
              <FontAwesomeIcon icon={faStepBackward} />
            </button>

            <button
              onClick={togglePlay}
              className="w-11 h-11 rounded-full bg-vibaura-primary text-white shadow-[0_6px_20px_rgba(99,103,255,0.2)] hover:scale-110 active:scale-90 transition-all duration-300 flex items-center justify-center"
            >
              <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className={!isPlaying ? "pl-1" : ""} size="sm" />
            </button>

            <button
              onClick={nextTrack}
              className="text-[#1A1A1A] hover:text-vibaura-primary transition-all text-[14px] active:scale-75"
              title="Next"
            >
              <FontAwesomeIcon icon={faStepForward} />
            </button>
            <button
              onClick={toggleRepeat}
              className={`transition-all active:scale-75 text-[12px] ${isRepeat ? 'text-vibaura-primary' : 'text-[#888] hover:text-[#1A1A1A]'}`}
              title="Repeat"
            >
              <FontAwesomeIcon icon={faRepeat} />
            </button>
          </div>

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
              <div className="w-full h-1.5 bg-black/5 rounded-full relative overflow-hidden transition-all duration-300 group-hover/progress:h-2">
                <div
                  className="h-full bg-vibaura-primary rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
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

        {/* 3. Volume & Tools Island (Right) */}
        <div className="pointer-events-auto flex items-center gap-4 bg-white/80 backdrop-blur-xl border border-white/50 rounded-[28px] px-6 w-auto min-w-[200px] h-[64px] justify-between transition-all duration-500 shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
          <button
            onClick={toggleFullscreen}
            className="text-[#888] hover:text-[#1A1A1A] transition-colors active:scale-75"
            title="Fullscreen"
          >
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
              <div className="w-full h-1.5 bg-black/5 rounded-full relative overflow-hidden transition-all duration-300 group-hover/volume:h-2">
                <div
                  className="h-full bg-vibaura-primary rounded-full transition-all duration-200"
                  style={{ width: `${volume * 100}%` }}
                ></div>
              </div>
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-vibaura-primary rounded-full opacity-0 group-hover/volume:opacity-100 transition-all duration-300 shadow-lg pointer-events-none scale-0 group-hover/volume:scale-100"
                style={{ left: `calc(${volume * 100}% - 8px)` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerBar;
