import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlay,
  faPause,
  faStepForward,
  faStepBackward,
  faShuffle,
  faRepeat,
  faChevronDown,
  faListUl,
  faInfinity
} from '@fortawesome/free-solid-svg-icons';
import { usePlayerStore } from '../../store/playerStore';
import { useAuthStore } from '../../store/authStore';
import { toggleLikeSong } from '../../services/libraryService';
import LikeButton from '../ui/LikeButton';
import QueuePanel from './QueuePanel';

const MobileFullscreenPlayer = () => {
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
    isFullscreen,
    toggleFullscreen,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    userQueue,
    queue,
    currentIndex,
    removeFromQueue,
    playFromUserQueue,
    playFromContextQueue
  } = usePlayerStore();

  const { user, updateUser, isAuthenticated } = useAuthStore();
  const trackId = currentTrack?.id || currentTrack?._id;
  const isLiked = trackId && user?.likedSongs?.some(song => typeof song === 'string' ? song === trackId : (song?._id === trackId || song?.id === trackId));

  const [showQueue, setShowQueue] = useState(false);

  // Swipe Gesture tracking
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

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
      const targetId = currentTrack.id || currentTrack._id;
      const res = await toggleLikeSong(targetId);
      const newLikedSongs = res.liked
        ? [...(user.likedSongs || []), targetId]
        : (user.likedSongs || []).filter(song => (typeof song === 'string' ? song : (song._id || song.id)) !== targetId);
      updateUser({ ...user, likedSongs: newLikedSongs });
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleSeek = (e) => {
    const val = parseFloat(e.target.value);
    setProgress(val);
    const audioEl = document.getElementById('vibaura-audio-player');
    if (audioEl && duration) {
      const seekTime = (val / 100) * duration;
      audioEl.currentTime = seekTime;
    }
  };

  // --- Touch Gesture Handlers (Swipe Down to Close Only) ---
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    const deltaY = touchEndY.current - touchStartY.current;

    // Swipe down gesture to minimize player
    if (deltaY > 100) {
      if (showQueue) {
        setShowQueue(false);
      } else {
        toggleFullscreen();
      }
    }

    // Reset coordinates
    touchStartY.current = 0;
    touchEndY.current = 0;
  };

  const nextFromContext = queue.slice(currentIndex + 1);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="block md:hidden fixed inset-0 z-[100] bg-[#F8F9FD] text-[#1A1A1A] overflow-hidden font-jost transition-all duration-500 selection:bg-transparent select-none overscroll-behavior-none"
    >
      {/* 1. Immersive Full-Bleed Aura Glow Background (Light theme matching FullscreenPlayer.jsx) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[#F8F9FD]">
        <img
          src={currentTrack.albumArt || currentTrack.image}
          alt=""
          className="absolute inset-[-20%] w-[140%] h-[140%] object-cover blur-[130px] opacity-45 saturate-[250%] animate-pulse-slow"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F8F9FD] via-[#F8F9FD]/70 to-[#F8F9FD]/30" />
      </div>

      {/* 2. Main Player Frame */}
      <div className="relative z-10 h-full flex flex-col justify-between px-6 pt-5 pb-8 overflow-hidden">
        
        {/* HEADER BAR (Always visible) */}
        <div className="flex items-center justify-between transition-all">
          <button
            onClick={toggleFullscreen}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-black/5 text-black/60 active:scale-90 transition-transform"
          >
            <FontAwesomeIcon icon={faChevronDown} />
          </button>
          
          <div className="text-center flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-black/40">Now Playing</span>
          </div>

          <button
            onClick={() => setShowQueue(true)}
            className={`w-10 h-10 flex items-center justify-center rounded-full active:scale-90 transition-transform ${showQueue ? 'bg-vibaura-primary text-white shadow-md' : 'bg-white shadow-sm border border-black/5 text-black/60'}`}
          >
            <FontAwesomeIcon icon={faListUl} />
          </button>
        </div>

        {/* ARTWORK AREA (Removed swipes to prevent false skipping clicks) */}
        <div className="flex-1 flex items-center justify-center my-6 min-h-0">
          <div className="relative w-full aspect-square max-h-[42vh] rounded-[32px] overflow-hidden shadow-[0_20px_45px_rgba(0,0,0,0.08)] border-2 border-white active:scale-[0.99] transition-transform duration-300">
            <img
              src={currentTrack.albumArt || currentTrack.image}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
              draggable="false"
            />
          </div>
        </div>

        {/* METADATA ROW */}
        <div className="w-full flex items-center justify-between mb-4 px-1">
          <div className="flex-1 min-w-0 pr-4">
            <h1 className="text-2xl font-black tracking-tight truncate leading-tight text-black/90">
              {currentTrack.title}
            </h1>
            <p className="text-sm font-semibold text-vibaura-primary mt-1 truncate">
              {Array.isArray(currentTrack.artists)
                ? currentTrack.artists.map(a => a.name).join(', ')
                : (currentTrack.artist || 'VibAura Artist')}
            </p>
          </div>
          
          {/* Reusing standard LikeButton component with particle animations */}
          <LikeButton
            isLiked={isLiked}
            onClick={handleLikeClick}
            className="w-12 h-12 rounded-full bg-white shadow-sm border border-black/5 flex items-center justify-center"
          />
        </div>

        {/* PROGRESS SEEK BAR */}
        <div className="w-full space-y-2 mb-6 px-1">
          <div className="relative flex items-center h-4 w-full group">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              onChange={handleSeek}
              className="absolute inset-0 w-full opacity-0 cursor-pointer z-20"
            />
            {/* Custom Track */}
            <div className="w-full h-1 bg-black/5 rounded-full relative overflow-hidden">
              <div
                className="h-full bg-vibaura-primary rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            {/* Dynamic Thumb */}
            <div
              className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-md border-2 border-vibaura-primary pointer-events-none scale-100"
              style={{ left: `calc(${progress}% - 7px)` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold text-black/40 tracking-wider tabular-nums px-0.5">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* CONTROLS BLOCK (Matching desktop PlayerBar color scheme) */}
        <div className="bg-white/85 backdrop-blur-2xl border border-white rounded-[32px] px-6 py-5 shadow-[0_15px_35px_rgba(0,0,0,0.06)] w-full">
          <div className="flex items-center justify-between px-2">
            
            {/* Shuffle */}
            <button
              onClick={toggleShuffle}
              className={`w-10 h-10 flex items-center justify-center rounded-full active:scale-95 transition-all ${isShuffle ? 'text-vibaura-primary font-black scale-105' : 'text-black/25'}`}
            >
              <FontAwesomeIcon icon={faShuffle} className="text-base" />
            </button>

            {/* Prev */}
            <button
              onClick={prevTrack}
              className="w-12 h-12 flex items-center justify-center rounded-full text-black/60 hover:text-black active:scale-90 transition-transform"
            >
              <FontAwesomeIcon icon={faStepBackward} className="text-xl" />
            </button>

            {/* Play/Pause (Clean button, no background colorful glow) */}
            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-vibaura-primary text-white shadow-md flex items-center justify-center text-2xl active:scale-90 transition-transform"
            >
              <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className={!isPlaying ? "ml-1" : ""} />
            </button>

            {/* Next */}
            <button
              onClick={nextTrack}
              className="w-12 h-12 flex items-center justify-center rounded-full text-black/60 hover:text-black active:scale-90 transition-transform"
            >
              <FontAwesomeIcon icon={faStepForward} className="text-xl" />
            </button>

            {/* Repeat */}
            <button
              onClick={toggleRepeat}
              className={`w-10 h-10 flex items-center justify-center rounded-full relative active:scale-95 transition-all ${repeatMode !== 'off' ? 'text-vibaura-primary font-black scale-105' : 'text-black/25'}`}
            >
              <FontAwesomeIcon icon={repeatMode === 'all' ? faInfinity : faRepeat} className={repeatMode === 'all' ? "text-lg" : "text-base"} />
              {repeatMode === 'once' && (
                <span className="absolute top-1.5 right-1.5 bg-vibaura-primary text-white text-[8px] font-black w-3.5 h-3.5 flex items-center justify-center rounded-full leading-none border border-white">
                  1
                </span>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* 3. PREMIUM SLIDE-UP QUEUE SHEET OVERLAY (Light theme matching aesthetic) */}
      <QueuePanel
        isOpen={showQueue}
        onClose={() => setShowQueue(false)}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 10s ease-in-out infinite;
          will-change: transform, opacity;
        }
      ` }} />
    </div>
  );
};

export default MobileFullscreenPlayer;
