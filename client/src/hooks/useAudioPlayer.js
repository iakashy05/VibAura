import { useRef, useEffect, useState } from 'react';
import { usePlayerStore } from '../store/playerStore';
import { useAuthStore } from '../store/authStore';
import { useLibraryStore } from '../store/libraryStore';
import useVibSyncStore from '../store/useVibSyncStore';
import { useUIStore } from '../store/uiStore';
import { faVolumeMute, faVolumeDown, faVolumeUp } from '@fortawesome/free-solid-svg-icons';

export const useAudioPlayer = (onNavigate) => {
  const audioRef = useRef(null);
  const queueRef = useRef(null);
  const queueButtonRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

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
    repeatMode,
    toggleRepeat,
    toggleFullscreen
  } = usePlayerStore();

  const { isAuthenticated, isSubscribed } = useAuthStore();
  const { likedSongs, toggleLikeSongOptimistic } = useLibraryStore();
  const { isSidebarCollapsed: isCollapsed } = useUIStore();

  // --- VibSync State ---
  const { 
    roomId, 
    myRole, 
    currentSong: syncSong, 
    currentTime: syncTime, 
    isPlaying: syncIsPlaying, 
    scheduledStartTime, 
    socket, 
    getServerTime 
  } = useVibSyncStore();

  const isVibSyncActive = !!roomId;
  const hasControl = myRole === 'HOST' || myRole === 'CONTROLLER';

  const trackId = currentTrack?.id || currentTrack?._id;
  const isLiked = trackId && likedSongs.some(song => (song.id || song._id) === trackId);

  // Queue click outside logic
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        queueRef.current && !queueRef.current.contains(event.target) &&
        queueButtonRef.current && !queueButtonRef.current.contains(event.target)
      ) {
        setIsQueueOpen(false);
      }
    };

    if (isQueueOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isQueueOpen]);

  // --- 1. Audio Playback Core ---
  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch(err => {
        console.warn('Playback error (typically blocked by browser auto-play restrictions):', err);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrack]);

  // --- VibSync Sync broadcast ---
  useEffect(() => {
    if (!isVibSyncActive) return;
    
    // Song mismatch
    if (syncSong && (!currentTrack || currentTrack.id !== syncSong.id)) {
       usePlayerStore.setState({ currentTrack: syncSong });
       if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = syncSong.url || '';
            audioRef.current.load();
            audioRef.current.currentTime = syncTime || 0;
       }
    }

    if (!syncIsPlaying) {
       usePlayerStore.setState({ isPlaying: false });
       if (audioRef.current) {
          audioRef.current.pause();
          if (Math.abs(audioRef.current.currentTime - syncTime) > 0.5) {
             audioRef.current.currentTime = syncTime;
          }
       }
       return;
    }

    const timeToStart = scheduledStartTime - getServerTime();

    if (timeToStart > 0) {
       usePlayerStore.setState({ isPlaying: false });
       if (audioRef.current) audioRef.current.currentTime = syncTime || 0;
       
       const timeoutId = setTimeout(() => {
            usePlayerStore.setState({ isPlaying: true });
            if (audioRef.current) {
                const oversleep = getServerTime() - scheduledStartTime;
                if (oversleep > 0) {
                    audioRef.current.currentTime = (syncTime || 0) + (oversleep / 1000);
                } else {
                    audioRef.current.currentTime = syncTime || 0;
                }
                audioRef.current.play().catch(e => console.error('VibSync Scheduled Play Error:', e));
            }
       }, timeToStart);
       return () => clearTimeout(timeoutId);
    } else {
       const elapsed = Math.abs(timeToStart) / 1000;
       const expectedCurrentTime = (syncTime || 0) + elapsed;
       
       usePlayerStore.setState({ isPlaying: true });
       
       if (audioRef.current) {
            const drift = Math.abs(audioRef.current.currentTime - expectedCurrentTime);
            if (drift > 0.25) { 
                audioRef.current.currentTime = expectedCurrentTime;
            } else if (drift > 0.05) { 
                if (audioRef.current.currentTime < expectedCurrentTime) {
                    audioRef.current.playbackRate = 1.05; 
                } else {
                    audioRef.current.playbackRate = 0.95; 
                }
                setTimeout(() => {
                    if (audioRef.current) audioRef.current.playbackRate = 1.0;
                }, 2000);
            }
       }
    }
  }, [syncSong, syncIsPlaying, scheduledStartTime, syncTime, isVibSyncActive]);

  // volume synchronization
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
      if (isVibSyncActive) {
         if (!hasControl) return;
         socket.emit('playback_action', {
              roomId,
              action: isPlaying ? 'PLAY' : 'PAUSE',
              currentSong: currentTrack,
              currentTime: seekTime,
              scheduledStartTime: getServerTime() + 1500
         });
      } else {
         audioRef.current.currentTime = seekTime;
      }
    }
  };

  const handleEnded = () => {
    if (isVibSyncActive) {
       if (myRole === 'HOST') {
          nextTrack();
       }
       return; 
    }

    const { repeatMode: currentRepeatMode, hasRepeatedOnce, queue, currentIndex, nextTrack: storeNextTrack } = usePlayerStore.getState();
    
    if (currentRepeatMode === 'all' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      return;
    }

    if (currentRepeatMode === 'once') {
      if (!hasRepeatedOnce && audioRef.current) {
        usePlayerStore.setState({ hasRepeatedOnce: true });
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        return;
      }
    }

    usePlayerStore.setState({ hasRepeatedOnce: false });

    if (currentRepeatMode === 'off' && currentIndex === queue.length - 1) {
      usePlayerStore.setState({ isPlaying: false, progress: 0, currentTime: 0 });
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    } else {
      storeNextTrack();
      if (queue.length === 1 && audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    }
  };

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
    // Optimistic toggle!
    toggleLikeSongOptimistic(currentTrack);
  };

  const handleFullscreenClick = (e) => {
    if (e) e.stopPropagation();
    if (!isSubscribed) {
      if (onNavigate) onNavigate('payment');
      return;
    }
    toggleFullscreen();
  };

  return {
    audioRef,
    queueRef,
    queueButtonRef,
    isDragging,
    setIsDragging,
    isQueueOpen,
    setIsQueueOpen,
    isCollapsed,
    isVibSyncActive,
    hasControl,
    isSubscribed,
    trackId,
    isLiked,
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
    isShuffle,
    toggleShuffle,
    repeatMode,
    toggleRepeat,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleSeek,
    handleSeekEnd,
    handleEnded,
    formatTime,
    getVolumeIcon,
    handleLikeClick,
    handleFullscreenClick
  };
};
