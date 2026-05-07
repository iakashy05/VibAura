import { create } from 'zustand';
import { logPlayHistory, logHeartbeat } from '../services/libraryService';

export const usePlayerStore = create((set, get) => ({
  // --- State ---
  currentTrack: null,
  isPlaying: false,
  volume: 0.7,
  queue: [],
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
  
  // Set a single track and start playing
  setTrack: (track, newQueue = [], playlistId = null) => {
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
      queue: newQueue.length > 0 ? newQueue : [track],
      originalQueue: newQueue.length > 0 ? newQueue : [track],
      currentIndex: newQueue.length > 0 
        ? newQueue.findIndex(t => t.id === track.id) 
        : 0,
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

    if (firstTrack?.id) {
      logPlayHistory(firstTrack.id, playlistId).catch(() => {});
    }

    set({
      currentTrack: firstTrack,
      queue: shuffled,
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
    set((state) => ({ isPlaying: !state.isPlaying }));
  },

  // Skip to Next Track
  nextTrack: () => {
    const { queue, currentIndex, currentPlaylistId } = get();
    if (queue.length === 0 || currentIndex === -1) return;
    
    const nextIndex = (currentIndex + 1) % queue.length;
    const nextItem = queue[nextIndex];

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
  stop: () => set({ currentTrack: null, isPlaying: false, queue: [], currentIndex: -1 })
}));
