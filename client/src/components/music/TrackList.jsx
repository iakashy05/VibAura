import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faClock, faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { usePlayerStore } from '../../store/playerStore';
import { formatTime } from '../../utils/time';

const TrackList = ({ tracks }) => {
  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="grid grid-cols-[32px_4fr_3fr_minmax(120px,1fr)_32px] gap-4 px-4 py-2 border-b border-white/5 text-text-muted text-xs uppercase tracking-widest font-semibold mb-2">
        <div className="flex justify-center">#</div>
        <div>Title</div>
        <div className="hidden md:block">Artists</div>
        <div className="flex justify-end pr-4">
          <FontAwesomeIcon icon={faClock} size="sm" />
        </div>
        <div className="w-8" /> {/* Spacer for context menu */}
      </div>

      {/* Track Rows */}
      <div className="space-y-0.5">
        {tracks.map((track, index) => (
          <TrackRow key={track.id} track={track} index={index + 1} allTracks={tracks} />
        ))}
      </div>
    </div>
  );
};

const TrackRow = ({ track, index, allTracks }) => {
  const { currentTrack, isPlaying, setTrack, togglePlay } = usePlayerStore();
  const isSelected = currentTrack?.id === track.id;

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (isSelected) {
      togglePlay();
    } else {
      setTrack(track, allTracks);
    }
  };

  return (
    <div 
      onClick={() => setTrack(track, allTracks)}
      className={`group grid grid-cols-[32px_4fr_3fr_minmax(120px,1fr)_32px] gap-4 px-4 py-3 rounded-lg transition-all items-center cursor-pointer ${isSelected ? 'bg-vibaura-primary/10' : 'hover:bg-white/10'}`}
    >
      {/* Index / Play / Playing Animation */}
      <div className="flex justify-center items-center text-text-muted text-sm relative">
        {!isSelected && <span className="group-hover:opacity-0 transition-opacity underline-offset-4">{index}</span>}
        
        {isSelected && isPlaying && (
          <div className="flex gap-0.5 items-end h-3 mb-0.5">
            <div className="w-0.5 bg-vibaura-primary animate-[music-bar_0.8s_ease-in-out_infinite] h-full" />
            <div className="w-0.5 bg-vibaura-primary animate-[music-bar_1.2s_ease-in-out_infinite] h-2" />
            <div className="w-0.5 bg-vibaura-primary animate-[music-bar_0.5s_ease-in-out_infinite] h-3" />
          </div>
        )}
        
        {isSelected && !isPlaying && (
           <FontAwesomeIcon icon={faPlay} className="text-vibaura-primary text-xs" />
        )}

        <button 
          onClick={handlePlayClick}
          className={`absolute opacity-0 group-hover:opacity-100 transition-opacity p-2 ${isSelected ? 'block' : ''}`}
        >
          <FontAwesomeIcon 
            icon={isSelected && isPlaying ? faPause : faPlay} 
            className={`${isSelected ? 'text-vibaura-primary' : 'text-text-primary'} text-xs`} 
          />
        </button>
      </div>

      {/* Info (Title & Image) */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-md bg-vibaura-bg-muted overflow-hidden flex-shrink-0 shadow-sm">
          <img src={track.image} alt={track.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col truncate">
          <span className={`font-semibold truncate transition-colors ${isSelected ? 'text-vibaura-primary' : 'text-text-primary group-hover:text-vibaura-primary'}`}>
            {track.title}
          </span>
        </div>
      </div>

      {/* Artists Column */}
      <div className="hidden md:block text-text-muted text-sm truncate">
        {Array.isArray(track.artists) 
          ? track.artists.map(a => a.name).join(', ') 
          : (track.artist || 'VibAura Artist')}
      </div>

      {/* Duration */}
      <div className="flex justify-end items-center text-text-muted text-sm pr-4 tabular-nums">
        {formatTime(track.duration)}
      </div>

      {/* Context Menu Icon */}
      <div className="flex justify-center text-text-muted hover:text-text-primary transition-colors py-2">
        <FontAwesomeIcon icon={faEllipsisV} size="sm" />
      </div>
    </div>
  );
};

export default TrackList;
