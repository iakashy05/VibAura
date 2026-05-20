import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShuffle, faStepBackward, faPlay, faPause, faStepForward, faInfinity, faRepeat } from '@fortawesome/free-solid-svg-icons';

const PlaybackControlsPod = ({
  isShuffle,
  toggleShuffle,
  prevTrack,
  togglePlay,
  isPlaying,
  nextTrack,
  toggleRepeat,
  repeatMode,
  currentTime,
  duration,
  progress,
  setIsDragging,
  handleSeek,
  handleSeekEnd,
  formatTime,
  isVibSyncActive,
  hasControl
}) => {
  return (
    <div className="pointer-events-auto flex flex-col items-center gap-0.5 bg-white/80 dark:bg-[#121223]/80 backdrop-blur-xl border border-white/50 dark:border-white/5 rounded-[34px] px-8 py-3.5 w-full max-w-[400px] lg:max-w-[500px] transition-all duration-500 shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
      <div className="flex items-center gap-8 relative z-10 mb-1">
        <button
          onClick={toggleShuffle}
          className={`transition-all active:scale-95 active:opacity-70 text-[12px] ${isShuffle ? 'text-vibaura-primary' : 'text-[#888] hover:text-[#1A1A1A] dark:text-text-muted dark:hover:text-white'} ${isVibSyncActive && !hasControl ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Shuffle"
          disabled={isVibSyncActive && !hasControl}
        >
          <FontAwesomeIcon icon={faShuffle} />
        </button>
        <button
          onClick={prevTrack}
          className={`transition-all text-[14px] active:scale-95 active:opacity-70 ${isVibSyncActive && !hasControl ? 'text-[#CCC] cursor-not-allowed' : 'text-[#1A1A1A] dark:text-text-secondary hover:text-vibaura-primary dark:hover:text-vibaura-primary'}`}
          title="Previous"
          disabled={isVibSyncActive && !hasControl}
        >
          <FontAwesomeIcon icon={faStepBackward} />
        </button>

        <button
          onClick={togglePlay}
          className={`w-12 h-12 rounded-full bg-white dark:bg-vibaura-surface text-vibaura-primary shadow-lg border border-white/5 transition-all duration-300 flex items-center justify-center text-lg ${isVibSyncActive && !hasControl ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
          disabled={isVibSyncActive && !hasControl}
        >
          <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} className={!isPlaying ? "ml-0.5" : ""} />
        </button>

        <button
          onClick={nextTrack}
          className={`transition-all text-[14px] active:scale-95 active:opacity-70 ${isVibSyncActive && !hasControl ? 'text-[#CCC] cursor-not-allowed' : 'text-[#1A1A1A] dark:text-text-secondary hover:text-vibaura-primary dark:hover:text-vibaura-primary'}`}
          title="Next"
          disabled={isVibSyncActive && !hasControl}
        >
          <FontAwesomeIcon icon={faStepForward} />
        </button>
        <button
          onClick={toggleRepeat}
          className={`transition-all active:scale-95 active:opacity-70 text-[12px] relative ${repeatMode !== 'off' ? 'text-vibaura-primary' : 'text-[#888] hover:text-[#1A1A1A] dark:text-text-muted dark:hover:text-white'}`}
          title="Repeat"
        >
          <FontAwesomeIcon icon={repeatMode === 'all' ? faInfinity : faRepeat} className={repeatMode === 'all' ? "text-[14px]" : ""} />
          {repeatMode === 'once' && (
            <span className="absolute -top-1.5 -right-1.5 bg-vibaura-primary text-white text-[8px] font-black w-3 h-3 flex items-center justify-center rounded-full leading-none shadow-sm">
              1
            </span>
          )}
        </button>
      </div>

      <div className="flex items-center gap-4 w-full group/progress">
        <span className="text-[9px] text-[#777] dark:text-text-muted font-black uppercase tracking-widest w-8 text-center tabular-nums">
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
          <div className="w-full h-1.5 bg-black/5 dark:bg-white/10 rounded-full relative overflow-hidden transition-all duration-300 group-hover/progress:h-2">
            <div
              className="h-full bg-vibaura-primary rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-vibaura-surface border-2 border-vibaura-primary rounded-full opacity-0 group-hover/progress:opacity-100 transition-all shadow-lg pointer-events-none scale-0 group-hover/progress:scale-100"
            style={{ left: `calc(${progress}% - 8px)` }}
          ></div>
        </div>
        <span className="text-[9px] text-[#777] dark:text-text-muted font-black uppercase tracking-widest w-8 text-center tabular-nums">
          {formatTime(duration)}
        </span>
      </div>
    </div>
  );
};

export default PlaybackControlsPod;
