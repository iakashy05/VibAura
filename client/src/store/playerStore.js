import { create } from 'zustand';
import { logPlayHistory, logHeartbeat } from '../services/libraryService';
import useVibSyncStore from './useVibSyncStore';
import { useUIStore } from './uiStore';

// Helper to intercept and route playback actions if VibSync is active
const handleVibSyncIntent = (actionType, payload, get) => {
  const { roomId, myRole, socket, getServerTime } = useVibSyncStore.getState();
  
  if (!roomId) return false; // Not in a VibSync room

  if (myRole === 'LISTENER') {
    useUIStore.getState().showToast('You are a listener in this session.', 'error');
    return true; // Block local execution
  }

  // User is HOST or CONTROLLER
  const basePayload = {
    roomId,
    currentTime: 0,
    scheduledStartTime: getServerTime() + 1500
  };

  switch (actionType) {
    case 'PLAY_PAUSE':
      socket.emit('playback_action', {
        ...basePayload,
        action: payload.isPlaying ? 'PLAY' : 'PAUSE',
        currentSong: get().currentTrack,
        currentTime: payload.currentTime || 0
      });
      break;

    case 'CHANGE_SONG':
      socket.emit('playback_action', {
        ...basePayload,
        action: 'CHANGE_SONG',
        currentSong: payload.song,
        queue: payload.queue || get().queue,
        currentIndex: payload.currentIndex !== undefined ? payload.currentIndex : get().currentIndex
      });
      break;
  }

  return true; // Block local execution, wait for server authoritative broadcast
};

export const usePlayerStore = create((set, get) => ({
  // --- State ---
  currentTrack: null,
  isPlaying: false,
  volume: 0.7,
  queue: [],
  userQueue: [], // Explicitly queued songs by the user
  currentIndex: -1,
  progress: 0, // 0 to 100
  currentTime: 0, // in seconds
  duration: 0,  // in seconds
  isShuffle: false,
  repeatMode: 'off', // 'off' | 'once' | 'all'
  hasRepeatedOnce: false, // Tracks if current song has been repeated in 'once' mode
  originalQueue: [], // Store the original order
  currentPlaylistId: null, // Track where the music is playing from

  // --- Actions ---
  
  // Queue Management
  addToQueue: (track) => set((state) => ({ userQueue: [...state.userQueue, track] })),
  removeFromQueue: (index) => set((state) => {
    const newUserQueue = [...state.userQueue];
    newUserQueue.splice(index, 1);
    return { userQueue: newUserQueue };
  }),
  reorderQueue: (newUserQueue) => set({ userQueue: newUserQueue }),
  
  playFromUserQueue: (index) => {
    const { userQueue, currentPlaylistId } = get();
    if (index < 0 || index >= userQueue.length) return;
    
    const nextItem = userQueue[index];
    const newUserQueue = userQueue.slice(index + 1);

    if (handleVibSyncIntent('CHANGE_SONG', { song: nextItem }, get)) return;

    if (nextItem?.id) {
      logPlayHistory(nextItem.id, currentPlaylistId).catch(() => {});
    }

    set({ 
      currentTrack: nextItem, 
      userQueue: newUserQueue,
      isPlaying: true,
      hasRepeatedOnce: false
    });
  },

  playFromContextQueue: (targetIndex) => {
    const { queue, currentPlaylistId } = get();
    if (targetIndex < 0 || targetIndex >= queue.length) return;
    
    const nextItem = queue[targetIndex];

    if (handleVibSyncIntent('CHANGE_SONG', { song: nextItem, currentIndex: targetIndex }, get)) return;

    if (nextItem?.id) {
      logPlayHistory(nextItem.id, currentPlaylistId).catch(() => {});
    }

    set({ 
      currentTrack: nextItem, 
      currentIndex: targetIndex,
      isPlaying: true,
      hasRepeatedOnce: false
    });
  },

  // Set a single track and start playing
  setTrack: (track, newQueue = [], playlistId = null) => {
    const computedQueue = newQueue.length > 0 ? newQueue : [track];
    const computedIndex = newQueue.length > 0 ? newQueue.findIndex(t => t.id === track.id) : 0;
    
    if (handleVibSyncIntent('CHANGE_SONG', { 
        song: track, 
        queue: computedQueue, 
        currentIndex: computedIndex 
    }, get)) return;

    // Fire and forget history log
    if (track?.id) {
      logPlayHistory(track.id, playlistId || get().currentPlaylistId).catch(() => {});
    }

    set({ 
      currentTrack: track, 
      isPlaying: true, 
      progress: 0,
      currentTime: 0,
      hasRepeatedOnce: false,
      userQueue: [], // Reset user queue when starting a new context
      queue: computedQueue,
      originalQueue: computedQueue,
      currentIndex: computedIndex,
      currentPlaylistId: playlistId
    });

    // Reset heartbeat
    const { heartbeatInterval } = get();
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    
    const newInterval = setInterval(() => {
      const state = get();
      if (state.isPlaying && state.currentTrack) {
        logHeartbeat(state.currentTrack.id);
      }
    }, 10000); // Every 10 seconds

    set({ heartbeatInterval: newInterval });
  },

  // Toggle Shuffle
  toggleShuffle: () => {
    const { isShuffle, queue, originalQueue, currentTrack } = get();
    const newState = !isShuffle;

    if (newState) {
      // Turning ON shuffle: shuffle the current queue
      const shuffled = [...queue].sort(() => Math.random() - 0.5);
      const newIndex = shuffled.findIndex(t => t.id === currentTrack?.id);
      set({ 
        isShuffle: true, 
        queue: shuffled, 
        currentIndex: newIndex !== -1 ? newIndex : 0 
      });
    } else {
      // Turning OFF shuffle: restore the original queue order
      const newIndex = originalQueue.findIndex(t => t.id === currentTrack?.id);
      set({ 
        isShuffle: false, 
        queue: [...originalQueue], 
        currentIndex: newIndex !== -1 ? newIndex : 0 
      });
    }
  },

  // Toggle Repeat
  toggleRepeat: () => set((state) => {
    if (state.repeatMode === 'off') return { repeatMode: 'once' };
    if (state.repeatMode === 'once') return { repeatMode: 'all' };
    return { repeatMode: 'off' };
  }),

  // Shuffle and Play from a list
  shufflePlay: (newQueue, playlistId = null) => {
    if (!newQueue || newQueue.length === 0) return;
    
    const shuffled = [...newQueue].sort(() => Math.random() - 0.5);
    const firstTrack = shuffled[0];

    if (handleVibSyncIntent('CHANGE_SONG', { 
        song: firstTrack, 
        queue: shuffled, 
        currentIndex: 0 
    }, get)) return;

    if (firstTrack?.id) {
      logPlayHistory(firstTrack.id, playlistId).catch(() => {});
    }

    set({
      currentTrack: firstTrack,
      queue: shuffled,
      userQueue: [], // Reset user queue
      originalQueue: [...newQueue], // Save the actual order
      currentIndex: 0,
      isPlaying: true,
      isShuffle: true,
      hasRepeatedOnce: false,
      progress: 0,
      currentTime: 0,
      currentPlaylistId: playlistId
    });
  },

  // Toggle Play/Pause
  togglePlay: () => {
    if (!get().currentTrack) return;
    
    if (handleVibSyncIntent('PLAY_PAUSE', { 
        isPlaying: !get().isPlaying,
        currentTime: get().currentTime
    }, get)) return;

    set((state) => ({ isPlaying: !state.isPlaying }));
  },

  // Skip to Next Track
  nextTrack: () => {
    const { userQueue, queue, currentIndex, currentPlaylistId } = get();
    
    // 1. Play from User Queue first if available
    if (userQueue.length > 0) {
      const nextItem = userQueue[0];
      const newUserQueue = userQueue.slice(1);

      if (handleVibSyncIntent('CHANGE_SONG', { song: nextItem }, get)) return;

      if (nextItem?.id) {
        logPlayHistory(nextItem.id, currentPlaylistId).catch(() => {});
      }

      set({ 
        currentTrack: nextItem, 
        userQueue: newUserQueue,
        isPlaying: true,
        hasRepeatedOnce: false
      });
      return;
    }

    // 2. Fallback to normal context queue
    if (queue.length === 0 || currentIndex === -1) return;
    
    const nextIndex = (currentIndex + 1) % queue.length;
    const nextItem = queue[nextIndex];

    if (handleVibSyncIntent('CHANGE_SONG', { song: nextItem, currentIndex: nextIndex }, get)) return;

    if (nextItem?.id) {
      logPlayHistory(nextItem.id, currentPlaylistId).catch(() => {});
    }

    set({ 
      currentTrack: nextItem, 
      currentIndex: nextIndex,
      isPlaying: true,
      hasRepeatedOnce: false
    });
  },

  // Skip to Previous Track
  prevTrack: () => {
    const { queue, currentIndex, currentPlaylistId } = get();
    if (queue.length === 0 || currentIndex === -1) return;
    
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    const prevItem = queue[prevIndex];

    if (handleVibSyncIntent('CHANGE_SONG', { song: prevItem, currentIndex: prevIndex }, get)) return;

    if (prevItem?.id) {
      logPlayHistory(prevItem.id, currentPlaylistId).catch(() => {});
    }

    set({ 
      currentTrack: prevItem, 
      currentIndex: prevIndex,
      isPlaying: true,
      hasRepeatedOnce: false
    });
  },

  // Set Volume
  setVolume: (v) => set({ volume: v }),

  // Toggle Mute
  toggleMute: () => {
    const { volume, lastVolume } = get();
    if (volume > 0) {
      set({ lastVolume: volume, volume: 0 });
    } else {
      set({ volume: lastVolume || 0.7 });
    }
  },

  // Set Progress
  setProgress: (p) => set({ progress: p }),

  // Set Current Time
  setCurrentTime: (t) => set({ currentTime: t }),

  // Set Duration
  setDuration: (d) => set({ duration: d }),

  // Fullscreen
  isFullscreen: false,
  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),

  // Stop / Clear
  stop: () => set({ currentTrack: null, isPlaying: false, queue: [], userQueue: [], currentIndex: -1 })
}));
