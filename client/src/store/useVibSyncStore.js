import { create } from 'zustand';

const useVibSyncStore = create((set, get) => ({
  // --- Connection State ---
  socket: null,
  isConnected: false,
  connectionError: null,

  // --- Room State ---
  roomId: null,
  roomCode: null,
  participants: [],
  myRole: 'LISTENER', // 'HOST', 'CONTROLLER', 'LISTENER'
  
  // --- Playback State ---
  syncOffset: 0, // Difference between client and server time
  currentSong: null,
  currentTime: 0,
  isPlaying: false,
  scheduledStartTime: 0,

  // --- Actions ---
  setSocket: (socket) => set({ socket }),
  setConnectionStatus: (isConnected, error = null) => set({ isConnected, connectionError: error }),
  
  setRoomData: (roomData) => set({
    roomId: roomData.roomId,
    roomCode: roomData.roomId, // Assuming roomId is the code for now
    participants: roomData.participants || [],
    currentSong: roomData.currentSong,
    currentTime: roomData.currentTime,
    isPlaying: roomData.isPlaying,
    scheduledStartTime: roomData.scheduledStartTime,
  }),

  setMyRole: (role) => set({ myRole: role }),
  
  updatePlaybackState: (state) => set({
    currentSong: state.currentSong,
    currentTime: state.currentTime,
    isPlaying: state.isPlaying,
    scheduledStartTime: state.scheduledStartTime,
  }),

  updateParticipants: (participants) => set({ participants }),
  
  setSyncOffset: (offset) => set({ syncOffset: offset }),

  resetRoom: () => set({
    roomId: null,
    roomCode: null,
    participants: [],
    myRole: 'LISTENER',
    currentSong: null,
    currentTime: 0,
    isPlaying: false,
    scheduledStartTime: 0,
    connectionError: null
  }),

  getServerTime: () => Date.now() + get().syncOffset,
}));

export default useVibSyncStore;
