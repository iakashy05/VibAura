import { create } from 'zustand';

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

  // --- Actions ---
  
  // Set a single track and start playing
  setTrack: (track, newQueue = []) => {
    set({ 
      currentTrack: track, 
      isPlaying: true, 
      progress: 0,
      currentTime: 0,
      queue: newQueue.length > 0 ? newQueue : [track],
      currentIndex: newQueue.findIndex(t => t.id === track.id) || 0
    });
  },

  // Toggle Play/Pause
  togglePlay: () => {
    if (!get().currentTrack) return;
    set((state) => ({ isPlaying: !state.isPlaying }));
  },

  // Skip to Next Track
  nextTrack: () => {
    const { queue, currentIndex } = get();
    if (queue.length === 0 || currentIndex === -1) return;
    
    const nextIndex = (currentIndex + 1) % queue.length;
    set({ 
      currentTrack: queue[nextIndex], 
      currentIndex: nextIndex,
      isPlaying: true 
    });
  },

  // Skip to Previous Track
  prevTrack: () => {
    const { queue, currentIndex } = get();
    if (queue.length === 0 || currentIndex === -1) return;
    
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    set({ 
      currentTrack: queue[prevIndex], 
      currentIndex: prevIndex,
      isPlaying: true 
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

  // Stop / Clear
  stop: () => set({ currentTrack: null, isPlaying: false, queue: [], currentIndex: -1 })
}));
