import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faClock, faEllipsisV } from '@fortawesome/free-solid-svg-icons';

const TrackList = ({ tracks }) => {
  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="grid grid-cols-[16px_4fr_3fr_minmax(120px,1fr)_32px] gap-4 px-4 py-2 border-b border-white/5 text-text-muted text-xs uppercase tracking-widest font-semibold mb-2">
        <div className="flex justify-center">#</div>
        <div>Title</div>
        <div className="hidden md:block">Album</div>
        <div className="flex justify-end pr-4">
          <FontAwesomeIcon icon={faClock} size="sm" />
        </div>
        <div className="w-8" /> {/* Spacer for context menu */}
      </div>

      {/* Track Rows */}
      <div className="space-y-0.5">
        {tracks.map((track, index) => (
          <TrackRow key={track.id} track={track} index={index + 1} />
        ))}
      </div>
    </div>
  );
};

const TrackRow = ({ track, index }) => {
  return (
    <div className="group grid grid-cols-[16px_4fr_3fr_minmax(120px,1fr)_32px] gap-4 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors items-center cursor-pointer">
      {/* Index / Play Icon */}
      <div className="flex justify-center items-center text-text-muted text-sm relative">
        <span className="group-hover:opacity-0 transition-opacity underline-offset-4">{index}</span>
        <FontAwesomeIcon 
          icon={faPlay} 
          className="absolute opacity-0 group-hover:opacity-100 text-vibaura-pink text-xs transition-opacity" 
        />
      </div>

      {/* Info (Title & Image) */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-md bg-vibaura-bg-muted overflow-hidden flex-shrink-0 shadow-sm">
          <img src={track.image} alt={track.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex flex-col truncate">
          <span className="text-text-primary font-medium truncate group-hover:text-vibaura-pink transition-colors">
            {track.title}
          </span>
          <span className="text-text-muted text-xs truncate">
            {track.artist}
          </span>
        </div>
      </div>

      {/* Album Name */}
      <div className="hidden md:block text-text-muted text-sm truncate">
        {track.album}
      </div>

      {/* Duration */}
      <div className="flex justify-end items-center text-text-muted text-sm pr-4 tabular-nums">
        {track.duration}
      </div>

      {/* Context Menu Icon */}
      <div className="flex justify-center text-text-muted hover:text-text-primary transition-colors py-2">
        <FontAwesomeIcon icon={faEllipsisV} size="sm" />
      </div>
    </div>
  );
};

export default TrackList;
