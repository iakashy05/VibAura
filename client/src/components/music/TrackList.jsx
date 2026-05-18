import React, { useState, useEffect, memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faClock, faEllipsisV, faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { usePlayerStore } from '../../store/playerStore';
import { useAuthStore } from '../../store/authStore';
import { useLibraryStore } from '../../store/libraryStore';
import { formatTime } from '../../utils/time';
import LikeButton from '../ui/LikeButton';
import ContextMenu from '../ui/ContextMenu';
import { useUIStore } from '../../store/uiStore';

const TrackList = ({ tracks, playlistId, isOwner }) => {
  return (
    <div className="w-full">
      {/* Table Header */}
      <div className="grid grid-cols-[32px_4fr_3fr_48px_minmax(80px,1fr)_32px] gap-4 px-4 py-2 border-b border-[#F0F0F0] text-[#999] text-[10px] uppercase tracking-widest font-black mb-2">
        <div className="flex justify-center">#</div>
        <div>Title</div>
        <div className="hidden md:block">Artists</div>
        <div className="flex justify-center">
          <FontAwesomeIcon icon={faHeartSolid} size="xs" />
        </div>
        <div className="flex justify-end pr-4">
          <FontAwesomeIcon icon={faClock} size="sm" />
        </div>
        <div className="w-8" /> {/* Spacer for context menu */}
      </div>

      {/* Track Rows */}
      <div className="space-y-0.5">
        {tracks.map((track, index) => (
          <TrackRow key={track.id || track._id || index} track={track} index={index + 1} allTracks={tracks} playlistId={playlistId} isPlaylistOwner={isOwner} />
        ))}
      </div>
    </div>
  );
};

const TrackRow = memo(({ track, index, allTracks, playlistId, isPlaylistOwner }) => {
  const { currentTrack, isPlaying, setTrack, togglePlay } = usePlayerStore();
  const { user, isAuthenticated } = useAuthStore();
  const isSelected = currentTrack?.id === track.id;

  const trackId = track?.id || track?._id;
  const likedSongs = useLibraryStore(state => state.likedSongs);
  const { toggleLikeSongOptimistic } = useLibraryStore();
  const isLiked = trackId && likedSongs.some(song => (song.id || song._id) === trackId);

  const { activeMenuId, setActiveMenuId, showConfirm } = useUIStore();
  const isMenuOpen = activeMenuId === `track-${track.id}`;
  const setIsMenuOpen = (open) => setActiveMenuId(open ? `track-${track.id}` : null);

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

    const isUnliking = isLiked;
    const isLikedPage = playlistId === 'liked-songs';

    const performToggle = () => {
      toggleLikeSongOptimistic(track);
    };

    if (isUnliking && isLikedPage) {
      showConfirm(
        'Remove from Liked Songs',
        `Are you sure you want to remove "${track.title}" from your liked songs?`,
        performToggle,
        'Yes, Remove it'
      );
    } else {
      performToggle();
    }
  };

  return (
    <div
      onClick={handlePlayClick}
      className="group grid grid-cols-[32px_4fr_3fr_48px_minmax(80px,1fr)_32px] gap-4 px-4 py-3 rounded-2xl transition-all items-center cursor-pointer hover:bg-black/5"
    >
      {/* Index / Play / Playing Animation */}
      <div className="flex justify-center items-center text-text-muted text-sm relative">
        {!isSelected && <span className="group-hover:opacity-0 transition-opacity underline-offset-4 font-black tracking-tighter text-[10px]">{index}</span>}

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
          type="button"
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
          <span className={`font-black truncate transition-colors text-sm tracking-tighter ${isSelected ? 'text-vibaura-primary' : 'text-[#1A1A1A] group-hover:text-vibaura-primary'}`}>
            {track.title}
          </span>
        </div>
      </div>

      {/* Artists Column */}
      <div className="hidden md:block font-black text-[#666] tracking-tighter text-[11px] truncate uppercase">
        {Array.isArray(track.artists)
          ? track.artists.map(a => a.name).join(', ')
          : (track.artist || 'VibAura Artist')}
      </div>

      {/* Like Button */}
      <div className="flex justify-center">
        <LikeButton
          isLiked={isLiked}
          onClick={handleLikeClick}
          className="scale-75 origin-center"
        />
      </div>

      {/* Duration */}
      <div className="flex justify-end items-center text-[#999] text-xs pr-4 tabular-nums font-medium">
        {formatTime(track.duration)}
      </div>

      {/* Context Menu Icon */}
      <div className="flex justify-center relative">
        <button
          type="button"
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
          isLiked={isLiked}
          onLikeToggle={handleLikeClick}
          playlistId={playlistId}
          isPlaylistOwner={isPlaylistOwner}
        />
      </div>
    </div>
  );
});

export default TrackList;
