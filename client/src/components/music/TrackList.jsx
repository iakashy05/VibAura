import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faClock, faEllipsisV, faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { usePlayerStore } from '../../store/playerStore';
import { useAuthStore } from '../../store/authStore';
import { toggleLikeSong } from '../../services/libraryService';
import { formatTime } from '../../utils/time';
import LikeButton from '../ui/LikeButton';
import ContextMenu from '../ui/ContextMenu';

const TrackList = ({ tracks, playlistId }) => {
  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="grid grid-cols-[32px_4fr_3fr_minmax(120px,1fr)_32px] gap-4 px-4 py-2 border-b border-[#F0F0F0] text-[#999] text-[10px] uppercase tracking-widest font-black mb-2">
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
          <TrackRow key={track.id} track={track} index={index + 1} allTracks={tracks} playlistId={playlistId} />
        ))}
      </div>
    </div>
  );
};

const TrackRow = ({ track, index, allTracks, playlistId }) => {
  const { currentTrack, isPlaying, setTrack, togglePlay } = usePlayerStore();
  const { user, updateUser, isAuthenticated } = useAuthStore();
  const isSelected = currentTrack?.id === track.id;
  
  const trackId = track?.id || track?._id;
  const isLiked = trackId && user?.likedSongs?.some(song => typeof song === 'string' ? song === trackId : (song?._id === trackId || song?.id === trackId));
  const [localLiked, setLocalLiked] = useState(isLiked);

  // Keep local state perfectly in sync with global store changes
  React.useEffect(() => {
    setLocalLiked(isLiked);
  }, [isLiked]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handlePlayClick = (e) => {
    e.stopPropagation();
    if (isSelected) {
      togglePlay();
    } else {
      setTrack(track, allTracks, playlistId);
    }
  };

  const handleLikeClick = async (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!isAuthenticated) return;
    
    try {
      setLocalLiked(!localLiked);
      const res = await toggleLikeSong(track.id);
      
      // Update global user state
      const newLikedSongs = res.liked 
        ? [...(user.likedSongs || []), track.id]
        : (user.likedSongs || []).filter(song => (typeof song === 'string' ? song : (song._id || song.id)) !== track.id);
      
      updateUser({ ...user, likedSongs: newLikedSongs });
      window.dispatchEvent(new Event('vibaura-library-updated'));
    } catch (err) {
      setLocalLiked(localLiked); // Revert on error
    }
  };

  return (
    <div 
      onClick={() => setTrack(track, allTracks, playlistId)}
      className={`group grid grid-cols-[32px_4fr_3fr_minmax(120px,1fr)_32px] gap-4 px-4 py-3 rounded-2xl transition-all items-center cursor-pointer ${isSelected ? 'bg-vibaura-primary/10 ring-1 ring-vibaura-primary/20' : 'hover:bg-black/5'}`}
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
          <span className={`font-bold truncate transition-colors text-sm ${isSelected ? 'text-vibaura-primary' : 'text-[#1A1A1A] group-hover:text-vibaura-primary'}`}>
            {track.title}
          </span>
        </div>
      </div>

      {/* Artists Column */}
      <div className="hidden md:block font-black text-[#666] tracking-tighter text-[11px] truncate">
        {Array.isArray(track.artists) 
          ? track.artists.map(a => a.name).join(', ') 
          : (track.artist || 'VibAura Artist')}
      </div>

      {/* Duration */}
      <div className="flex justify-end items-center text-[#999] text-xs pr-4 tabular-nums font-medium">
        {formatTime(track.duration)}
      </div>

      {/* Context Menu Icon */}
      <div className="flex justify-center relative">
        <button 
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(!isMenuOpen);
          }}
          className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${isMenuOpen ? 'bg-vibaura-primary text-white' : 'text-text-muted hover:text-text-primary hover:bg-gray-100'}`}
        >
          <FontAwesomeIcon icon={faEllipsisV} size="sm" />
        </button>

        <ContextMenu 
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          item={track}
          type="track"
          isLiked={localLiked}
          onLikeToggle={handleLikeClick}
        />
      </div>
    </div>
  );
};

export default TrackList;
