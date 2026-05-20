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
  faEllipsisH,
  faExpand,
  faInfinity,
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
    isFullscreen,
    toggleFullscreen,
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    volume,
    setVolume,
    toggleMute
  } = usePlayerStore();

  const { user, updateUser, isAuthenticated } = useAuthStore();
  const trackId = currentTrack?.id || currentTrack?._id;
  const isLiked = trackId && user?.likedSongs?.some(song => typeof song === 'string' ? song === trackId : (song?._id === trackId || song?.id === trackId));
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    let timeout;
    const handleActivity = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        toggleFullscreen();
      }
    };

    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('mousemove', handleActivity);
      window.addEventListener('mousedown', handleActivity);
      window.addEventListener('touchstart', handleActivity);
      window.addEventListener('keydown', handleKeyDown);
      handleActivity();
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('mousedown', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timeout);
    };
  }, [isFullscreen]);

  if (!isFullscreen || !currentTrack) return null;

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getVolumeIcon = () => {
    if (volume === 0) return faVolumeMute;
    if (volume < 0.5) return faVolumeDown;
    return faVolumeUp;
  };

  const handleLikeClick = async (e) => {
    if (e) e.stopPropagation();
    if (!isAuthenticated || !currentTrack) return;

    try {
      const res = await toggleLikeSong(currentTrack.id);
      const newLikedSongs = res.liked
        ? [...(user.likedSongs || []), currentTrack.id]
        : (user.likedSongs || []).filter(song => (typeof song === 'string' ? song : (song._id || song.id)) !== currentTrack.id);
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

  return (
    <div className={`hidden md:block fixed inset-0 z-[100] bg-[#F8F9FD] dark:bg-[#0E0E1B] text-[#1A1A1A] dark:text-text-primary overflow-hidden no-scrollbar font-jost transition-all duration-700 ${!showControls ? 'cursor-none' : ''}`}>

      {/* 1. Immersive Aura Glow Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[#F8F9FD] dark:bg-[#0E0E1B]">
        <img
          src={currentTrack.albumArt || currentTrack.image}
          alt=""
          className="absolute inset-[-10%] w-[120%] h-[120%] object-cover blur-[140px] opacity-50 dark:opacity-40 saturate-[300%] dark:saturate-[250%] animate-pulse-slow"
        />
        <div className="absolute inset-0 opacity-40 mix-blend-soft-light">
          <div className="absolute top-[20%] left-[20%] w-[60%] h-[60%] bg-vibaura-primary/20 blur-[120px] rounded-full animate-pulse-slow" style={{ animationDelay: '-5s' }} />
          <div className="absolute bottom-[20%] right-[20%] w-[50%] h-[50%] bg-vibaura-primary/15 blur-[100px] rounded-full animate-pulse-slow" style={{ animationDelay: '-2s' }} />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(248,249,253,0.6)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(14,14,27,0.75)_100%)]" />
      </div>

      {/* 2. Content Layout */}
      <div className="relative z-10 h-full flex flex-col px-16 py-8 max-w-[1500px] mx-auto overflow-hidden justify-between">

        {/* TOP HEADER */}
        <div className={`flex items-center justify-between w-full mb-8 transition-all duration-700 ${!showControls ? 'opacity-0 -translate-y-4' : 'opacity-100'}`}>
          <button
            onClick={toggleFullscreen}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-vibaura-surface shadow-sm hover:shadow-md dark:shadow-black/20 hover:brightness-110 active:scale-95 transition-all group"
          >
            <FontAwesomeIcon icon={faChevronDown} className="text-black/60 dark:text-white/60 group-hover:text-black dark:group-hover:text-white transition-colors" />
          </button>
          <div className="w-12" />
        </div>

        {/* MIDDLE SECTION: Asymmetric Desktop Layout */}
        <div className="flex-1 flex flex-row items-center w-full min-h-0 gap-12 px-4 justify-between">

          {/* Left Side: Title & Artist Details */}
          <div className="w-[35%] flex flex-col justify-center text-left space-y-6 pl-4 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="space-y-4">
              <h1 className="text-6xl font-black tracking-tight leading-tight text-black/90 dark:text-white truncate max-w-full pb-1">
                {currentTrack.title}
              </h1>
              <p className="text-2xl font-bold text-black/60 dark:text-text-secondary normal-case tracking-normal truncate">
                {Array.isArray(currentTrack.artists)
                  ? currentTrack.artists.map(a => a.name).join(', ')
                  : (currentTrack.artist || 'VibAura Artist')}
              </p>
            </div>
          </div>

          {/* Right Side: Artwork + Spinning Vinyl Record */}
          <div className="flex-1 flex items-center justify-center relative min-h-0 pr-20">
            <div className="relative w-[340px] h-[340px] xl:w-[400px] xl:h-[400px] flex items-center justify-center aspect-square">

              {/* Spinning Vinyl Record Wrapper (handles slide-out) */}
              <div className={`absolute -translate-x-1/2 w-[94%] aspect-square rounded-full transition-all duration-[1500ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0
                  ${isPlaying ? 'left-[78%]' : 'left-1/2'}
                `}
              >
                {/* Actual Vinyl Disk (handles continuous rotation) */}
                <div 
                  className="w-full h-full rounded-full overflow-hidden relative shadow-2xl animate-spin-slow"
                  style={{
                    animationPlayState: isPlaying ? 'running' : 'paused',
                    background: `
                      radial-gradient(circle at center, transparent 35%, #050505 35%),
                      #121212
                    `,
                    boxShadow: '0 12px 35px rgba(0,0,0,0.45)'
                  }}
                >
                  {/* Conical gloss / shine reflection (diagonal lines that move with the spin) */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.14] to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-white/[0.08] to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-white/[0.04]" />

                  {/* Grooves / Concentric Linings (Outer Track Group) */}
                  <div className="absolute inset-0 rounded-full border border-white/[0.08] scale-[0.96]" />
                  <div className="absolute inset-0 rounded-full border border-white/[0.05] scale-[0.92]" />
                  <div className="absolute inset-0 rounded-full border border-white/[0.08] scale-[0.88]" />
                  <div className="absolute inset-0 rounded-full border border-white/[0.05] scale-[0.84]" />

                  {/* Track Gap Separator */}
                  <div className="absolute inset-0 rounded-full border-[2px] border-white/[0.12] scale-[0.80]" />

                  {/* Grooves / Concentric Linings (Middle Track Group) */}
                  <div className="absolute inset-0 rounded-full border border-white/[0.08] scale-[0.76]" />
                  <div className="absolute inset-0 rounded-full border border-white/[0.05] scale-[0.72]" />
                  <div className="absolute inset-0 rounded-full border border-white/[0.08] scale-[0.68]" />
                  <div className="absolute inset-0 rounded-full border border-white/[0.05] scale-[0.64]" />

                  {/* Track Gap Separator */}
                  <div className="absolute inset-0 rounded-full border-[2px] border-white/[0.12] scale-[0.60]" />

                  {/* Grooves / Concentric Linings (Inner Track Group) */}
                  <div className="absolute inset-0 rounded-full border border-white/[0.08] scale-[0.56]" />
                  <div className="absolute inset-0 rounded-full border border-white/[0.05] scale-[0.52]" />
                  <div className="absolute inset-0 rounded-full border border-white/[0.08] scale-[0.48]" />
                  <div className="absolute inset-0 rounded-full border border-white/[0.05] scale-[0.44]" />

                  {/* Shiny circular metal/spindle lining immediately around the cover art */}
                  <div className="absolute inset-0 rounded-full border-[2px] border-white/[0.22] scale-[0.38] shadow-[inset_0_0_8px_rgba(255,255,255,0.2)]" />

                  {/* Center Album Art Label */}
                  <div className="absolute inset-0 m-auto w-[36%] h-[36%] rounded-full overflow-hidden border-[6px] border-[#0a0a0a] dark:border-[#0f0f1d] z-10 shadow-lg">
                    <img
                      src={currentTrack.albumArt || currentTrack.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Cover Artwork */}
              <div className="relative z-10 w-full h-full aspect-square rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.12)] border-4 border-white dark:border-vibaura-border">
                <img
                  src={currentTrack.albumArt || currentTrack.image}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM PLAYER BAR - Desktop Floating Pill Layout */}
        <div className={`w-full max-w-[1300px] mx-auto mb-4 transition-all duration-1000 ${!showControls ? 'opacity-0 translate-y-12' : 'opacity-100 translate-y-0'}`}>
          <div className="flex bg-white/80 dark:bg-[#121223]/80 backdrop-blur-2xl border border-white dark:border-white/5 rounded-[40px] px-8 py-5 shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] items-center gap-10">

            {/* 1. Left: Controls */}
            <div className="flex items-center gap-6">
              <button onClick={toggleShuffle} className={`text-sm transition-all active:scale-95 active:opacity-70 ${isShuffle ? 'text-vibaura-primary' : 'text-black/20 dark:text-text-muted hover:text-black/40 dark:hover:text-text-secondary'}`}>
                <FontAwesomeIcon icon={faShuffle} />
              </button>
              <button onClick={prevTrack} className="text-xl text-black/60 dark:text-text-secondary hover:text-black dark:hover:text-white transition-all active:scale-95 active:opacity-70">
                <FontAwesomeIcon icon={faStepBackward} />
              </button>
              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-white dark:bg-vibaura-surface shadow-lg flex items-center justify-center text-vibaura-primary text-lg hover:scale-105 hover:brightness-110 active:scale-95 transition-all border border-white/5"
              >
                <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className={!isPlaying ? "ml-0.5" : ""} />
              </button>
              <button onClick={nextTrack} className="text-xl text-black/60 dark:text-text-secondary hover:text-black dark:hover:text-white transition-all active:scale-95 active:opacity-70">
                <FontAwesomeIcon icon={faStepForward} />
              </button>
              <button onClick={toggleRepeat} className={`text-sm relative transition-all active:scale-95 active:opacity-70 ${repeatMode !== 'off' ? 'text-vibaura-primary' : 'text-black/20 dark:text-text-muted hover:text-black/40 dark:hover:text-text-secondary'}`}>
                <FontAwesomeIcon icon={repeatMode === 'all' ? faInfinity : faRepeat} className={repeatMode === 'all' ? "text-[16px]" : ""} />
                {repeatMode === 'once' && (
                  <span className="absolute -top-1.5 -right-1.5 bg-vibaura-primary text-white text-[8px] font-black w-3 h-3 flex items-center justify-center rounded-full leading-none shadow-sm">
                    1
                  </span>
                )}
              </button>
            </div>

            {/* 2. Center: Progress Bar */}
            <div className="flex-1 flex items-center gap-4 group/progress">
              <span className="text-[9px] text-[#777] dark:text-text-muted font-black uppercase tracking-widest w-10 text-center tabular-nums">
                {formatTime(currentTime)}
              </span>
              <div className="flex-1 relative flex items-center h-4">
                <input
                  type="range" min="0" max="100" value={progress}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-full h-1.5 bg-black/5 dark:bg-white/10 rounded-full relative overflow-hidden transition-all duration-300 group-hover/progress:h-2">
                  <div className="h-full bg-vibaura-primary rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
                </div>
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-vibaura-surface border-2 border-vibaura-primary rounded-full opacity-0 group-hover/progress:opacity-100 transition-all shadow-lg pointer-events-none scale-0 group-hover/progress:scale-100"
                  style={{ left: `calc(${progress}% - 8px)` }}
                />
              </div>
              <span className="text-[9px] text-[#777] dark:text-text-muted font-black uppercase tracking-widest w-10 text-center tabular-nums">
                {formatTime(duration)}
              </span>
            </div>

            {/* 3. Right: Volume & Extra */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 w-32 group/vol relative">
                <button
                  onClick={toggleMute}
                  className="w-5 flex justify-center text-black/30 dark:text-text-muted hover:text-black/50 dark:hover:text-text-secondary transition-all active:scale-95 active:opacity-70"
                >
                  <FontAwesomeIcon icon={getVolumeIcon()} className="text-sm" />
                </button>
                <div className="flex-1 relative flex items-center h-4">
                  <input
                    type="range" min="0" max="1" step="0.01" value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
                  />
                  {/* Volume Track */}
                  <div className="w-full h-1.5 bg-black/5 dark:bg-white/10 rounded-full relative overflow-hidden transition-all duration-300 group-hover/vol:h-2">
                    <div
                      className="h-full bg-vibaura-primary rounded-full transition-all duration-200"
                      style={{ width: `${volume * 100}%` }}
                    />
                  </div>
                  {/* Volume Thumb */}
                  <div
                     className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-vibaura-surface border-2 border-vibaura-primary rounded-full opacity-0 group-hover/vol:opacity-100 transition-all duration-300 shadow-lg pointer-events-none scale-0 group-hover/vol:scale-100"
                    style={{ left: `calc(${volume * 100}% - 8px)` }}
                  />
                </div>
              </div>
              <button onClick={toggleFullscreen} className="text-black/20 dark:text-text-muted hover:text-black/40 dark:hover:text-text-secondary transition-all active:scale-95 active:opacity-70">
                <FontAwesomeIcon icon={faExpand} className="text-sm" />
              </button>
            </div>
          </div>

        </div>
      </div>


    </div>
  );
};

export default FullscreenPlayer;
