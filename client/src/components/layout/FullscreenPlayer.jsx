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
    <div className={`hidden md:block fixed inset-0 z-[100] bg-[#F8F9FD] text-[#1A1A1A] overflow-hidden no-scrollbar font-jost transition-all duration-700 ${!showControls ? 'cursor-none' : ''}`}>

      {/* 1. Immersive Aura Glow Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[#F8F9FD]">
        <img
          src={currentTrack.albumArt || currentTrack.image}
          alt=""
          className="absolute inset-[-10%] w-[120%] h-[120%] object-cover blur-[140px] opacity-50 saturate-[300%] animate-pulse-slow"
        />
        <div className="absolute inset-0 opacity-40 mix-blend-soft-light">
          <div className="absolute top-[20%] left-[20%] w-[60%] h-[60%] bg-vibaura-primary/20 blur-[120px] rounded-full animate-pulse-slow" style={{ animationDelay: '-5s' }} />
          <div className="absolute bottom-[20%] right-[20%] w-[50%] h-[50%] bg-vibaura-primary/15 blur-[100px] rounded-full animate-pulse-slow" style={{ animationDelay: '-2s' }} />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(248,249,253,0.6)_100%)]" />
      </div>

      {/* 2. Content Layout */}
      <div className="relative z-10 h-full flex flex-col px-16 py-8 max-w-[1500px] mx-auto overflow-hidden justify-between">

        {/* TOP HEADER */}
        <div className={`flex items-center justify-between w-full mb-8 transition-all duration-700 ${!showControls ? 'opacity-0 -translate-y-4' : 'opacity-100'}`}>
          <button
            onClick={toggleFullscreen}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md transition-all active:scale-95 group"
          >
            <FontAwesomeIcon icon={faChevronDown} className="text-black/60 group-hover:text-black transition-colors" />
          </button>
          <div className="w-12" />
        </div>

        {/* MIDDLE SECTION: Asymmetric Desktop Layout */}
        <div className="flex-1 flex flex-row items-center w-full min-h-0 gap-12 px-4 justify-between">

          {/* Left Side: Title & Artist Details */}
          <div className="w-[35%] flex flex-col justify-center text-left space-y-6 pl-4 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="space-y-4">
              <h1 className="text-6xl font-black tracking-tight leading-tight text-black/90 truncate max-w-full pb-1">
                {currentTrack.title}
              </h1>
              <p className="text-2xl font-bold text-black/60 normal-case tracking-normal truncate">
                {Array.isArray(currentTrack.artists)
                  ? currentTrack.artists.map(a => a.name).join(', ')
                  : (currentTrack.artist || 'VibAura Artist')}
              </p>
            </div>
          </div>

          {/* Right Side: Artwork + Spinning Vinyl Record */}
          <div className="flex-1 flex items-center justify-center relative min-h-0 pr-20">
            <div className="relative w-full h-full flex items-center justify-center max-h-[55vh] aspect-square">

              {/* Spinning Vinyl Record */}
              <div className={`absolute left-1/2 -translate-x-1/2 w-[94%] aspect-square rounded-full transition-all duration-[1500ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0 overflow-hidden
                  ${isPlaying ? 'translate-x-[18%] rotate-[360deg]' : 'translate-x-0 rotate-0'}
                `}
                style={{
                  background: `
                    radial-gradient(circle at center, transparent 35%, #050505 35%),
                    repeating-radial-gradient(circle at center, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 4px),
                    #121212
                  `,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                }}>
                <div className="absolute inset-0 rounded-full border-[2px] border-white/10 opacity-30 scale-[0.95]" />
                <div className="absolute inset-0 rounded-full border-[1px] border-white/5 opacity-20 scale-[0.88]" />
                <div className="absolute inset-0 rounded-full border-[1px] border-white/5 opacity-20 scale-[0.82]" />
                <div className="absolute inset-0 rounded-full border-[1px] border-white/5 opacity-20 scale-[0.76]" />
                <div className="absolute inset-0 rounded-full border-[1px] border-white/5 opacity-20 scale-[0.70]" />
                <div className="absolute inset-0 rounded-full border-[1px] border-white/5 opacity-20 scale-[0.64]" />
                <div className="absolute inset-0 rounded-full border-[1px] border-white/5 opacity-20 scale-[0.58]" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-60" />
                <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-white/5 to-transparent opacity-40" />

                <div className="absolute inset-0 m-auto w-[36%] h-[36%] rounded-full overflow-hidden border-[6px] border-[#0a0a0a] z-10 shadow-lg">
                  <img
                    src={currentTrack.albumArt || currentTrack.image}
                    alt=""
                    className={`w-full h-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`}
                  />
                </div>
              </div>

              {/* Cover Artwork */}
              <div className="relative z-10 w-full h-full aspect-square rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.12)] border-4 border-white">
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
          <div className="flex bg-white/80 backdrop-blur-2xl border border-white rounded-[40px] px-8 py-5 shadow-[0_20px_50px_rgba(0,0,0,0.05)] items-center gap-10">

            {/* 1. Left: Controls */}
            <div className="flex items-center gap-6">
              <button onClick={toggleShuffle} className={`text-sm transition-all active:scale-95 active:opacity-70 ${isShuffle ? 'text-vibaura-primary' : 'text-black/20 hover:text-black/40'}`}>
                <FontAwesomeIcon icon={faShuffle} />
              </button>
              <button onClick={prevTrack} className="text-xl text-black/60 hover:text-black transition-all active:scale-95 active:opacity-70">
                <FontAwesomeIcon icon={faStepBackward} />
              </button>
              <button
                onClick={togglePlay}
                className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center text-vibaura-primary text-lg hover:scale-105 active:scale-95 transition-all"
              >
                <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className={!isPlaying ? "ml-0.5" : ""} />
              </button>
              <button onClick={nextTrack} className="text-xl text-black/60 hover:text-black transition-all active:scale-95 active:opacity-70">
                <FontAwesomeIcon icon={faStepForward} />
              </button>
              <button onClick={toggleRepeat} className={`text-sm relative transition-all active:scale-95 active:opacity-70 ${repeatMode !== 'off' ? 'text-vibaura-primary' : 'text-black/20 hover:text-black/40'}`}>
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
              <span className="text-[9px] text-[#777] font-black uppercase tracking-widest w-10 text-center tabular-nums">
                {formatTime(currentTime)}
              </span>
              <div className="flex-1 relative flex items-center h-4">
                <input
                  type="range" min="0" max="100" value={progress}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-full h-1.5 bg-black/5 rounded-full relative overflow-hidden transition-all duration-300 group-hover/progress:h-2">
                  <div className="h-full bg-vibaura-primary rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
                </div>
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-vibaura-primary rounded-full opacity-0 group-hover/progress:opacity-100 transition-all shadow-lg pointer-events-none scale-0 group-hover/progress:scale-100"
                  style={{ left: `calc(${progress}% - 8px)` }}
                />
              </div>
              <span className="text-[9px] text-[#777] font-black uppercase tracking-widest w-10 text-center tabular-nums">
                {formatTime(duration)}
              </span>
            </div>

            {/* 3. Right: Volume & Extra */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 w-32 group/vol relative">
                <button
                  onClick={toggleMute}
                  className="w-5 flex justify-center text-black/30 hover:text-black/50 transition-all active:scale-95 active:opacity-70"
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
                  <div className="w-full h-1.5 bg-black/5 rounded-full relative overflow-hidden transition-all duration-300 group-hover/vol:h-2">
                    <div
                      className="h-full bg-vibaura-primary rounded-full transition-all duration-200"
                      style={{ width: `${volume * 100}%` }}
                    />
                  </div>
                  {/* Volume Thumb */}
                  <div
                     className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-vibaura-primary rounded-full opacity-0 group-hover/vol:opacity-100 transition-all duration-300 shadow-lg pointer-events-none scale-0 group-hover/vol:scale-100"
                    style={{ left: `calc(${volume * 100}% - 8px)` }}
                  />
                </div>
              </div>
              <button onClick={toggleFullscreen} className="text-black/20 hover:text-black/40 transition-all active:scale-95 active:opacity-70">
                <FontAwesomeIcon icon={faExpand} className="text-sm" />
              </button>
            </div>
          </div>

        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
          will-change: transform;
          transform: translate3d(0, 0, 0);
        }
      ` }} />
    </div>
  );
};

export default FullscreenPlayer;
