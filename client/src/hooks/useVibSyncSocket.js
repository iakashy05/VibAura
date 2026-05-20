import { useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import useVibSyncStore from '../store/useVibSyncStore';
import { usePlayerStore } from '../store/playerStore';
import { useUIStore } from '../store/uiStore';

// Assuming Vite setup, might need to adjust for VibAura's specific env variables
const SERVER_URL = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:4000`; 

/**
 * useVibSyncSocketManager is mounted at the root level (App.jsx)
 * to handle the socket connection lifecycle and real-time playback updates.
 * This guarantees that navigation away from VibSync page (e.g. on mobile unmounts)
 * does NOT kill the socket connection.
 */
export const useVibSyncSocketManager = () => {
  const { token } = useAuthStore();
  const {
    setSocket,
    setConnectionStatus,
    setSyncOffset,
    updatePlaybackState,
    resetRoom,
  } = useVibSyncStore();

  const heartbeatInterval = useRef(null);

  useEffect(() => {
    if (!token) return;

    // Connect to Socket
    const newSocket = io(SERVER_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    setSocket(newSocket);

    // --- Connection Events ---
    newSocket.on('connect', () => {
      setConnectionStatus(true);
      
      // Calculate Clock Offset
      const t0 = Date.now();
      newSocket.emit('timesync_ping', t0, (response) => {
        const { clientTime, serverTime } = response;
        const t1 = Date.now();
        const rtt = t1 - clientTime;
        const latency = rtt / 2;
        const offset = (serverTime + latency) - Date.now();
        setSyncOffset(offset);
      });

      // Start Heartbeat
      heartbeatInterval.current = setInterval(() => {
        newSocket.emit('heartbeat');
      }, 10000); // Every 10 seconds
    });

    newSocket.on('disconnect', () => {
      setConnectionStatus(false);
      if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
    });

    newSocket.on('connect_error', (err) => {
      setConnectionStatus(false, err.message);
    });

    newSocket.on('participant_joined', (participant) => {
      useVibSyncStore.setState((state) => {
        const exists = state.participants.find(p => p.userId === participant.userId);
        if (exists) return state;
        
        useUIStore.getState().showToast(`${participant.name} joined the session`, 'success');
        return { participants: [...state.participants, participant] };
      });
    });

    newSocket.on('participant_left', ({ userId }) => {
      useVibSyncStore.setState((state) => {
        const participant = state.participants.find(p => p.userId === userId);
        if (participant) {
            useUIStore.getState().showToast(`${participant.name || 'A user'} left the session`, 'info');
        }
        return { participants: state.participants.filter(p => p.userId !== userId) };
      });
    });

    newSocket.on('role_updated', ({ userId, role }) => {
      useVibSyncStore.setState((state) => ({
        participants: state.participants.map(p => 
          p.userId === userId ? { ...p, role } : p
        )
      }));
      // Check if it's me
      const authUser = useAuthStore.getState().user;
      if (authUser && (authUser._id === userId || authUser.id === userId)) {
        useVibSyncStore.getState().setMyRole(role);
        
        if (role === 'CONTROLLER') {
            useUIStore.getState().showToast('You have been granted Controller permissions.', 'success');
        } else if (role === 'LISTENER') {
            useUIStore.getState().showToast('Your Controller permissions were revoked.', 'error');
        }
      }
    });

    newSocket.on('room_closed', ({ message }) => {
      useUIStore.getState().showToast(message || 'VibSync Session Ended.', 'error');
      resetRoom();
    });

    // --- Playback Events ---
    newSocket.on('room_playback_update', (state) => {
      updatePlaybackState(state);
      if (state.queue) {
        usePlayerStore.setState({ queue: state.queue, currentIndex: state.currentIndex });
      }
    });

    newSocket.on('drift_sync', (state) => {
      // Periodic authoritative state broadcast
      updatePlaybackState(state);
      if (state.queue) {
        usePlayerStore.setState({ queue: state.queue, currentIndex: state.currentIndex });
      }
    });

    // Cleanup
    return () => {
      if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
      newSocket.disconnect();
      setSocket(null);
    };
  }, [token, setSocket, setConnectionStatus, setSyncOffset, updatePlaybackState, resetRoom]);
};

/**
 * useVibSyncSocket provides functional actions for the active VibSync room,
 * bound to the globally managed socket instance.
 */
export const useVibSyncSocket = () => {
  const { socket } = useVibSyncStore();
  const { setRoomData, resetRoom } = useVibSyncStore();

  // --- Exposed Actions ---
  const createRoom = useCallback((onSuccess, onError) => {
    if (!socket) return onError?.('Socket not connected');
    socket.emit('create_room', (response) => {
      if (response.error) {
          useUIStore.getState().showToast(response.error, 'error');
          return onError?.(response.error);
      }
      setRoomData(response.room);
      useVibSyncStore.getState().setMyRole('HOST');
      useUIStore.getState().showToast('VibSync Session Started', 'success');
      onSuccess?.(response.room);
    });
  }, [socket, setRoomData]);

  const joinRoom = useCallback((roomId, onSuccess, onError) => {
    if (!socket) return onError?.('Socket not connected');
    socket.emit('join_room', { roomId }, (response) => {
      if (response.error) {
          useUIStore.getState().showToast(response.error, 'error');
          return onError?.(response.error);
      }
      
      // Determine my role
      const authUser = useAuthStore.getState().user;
      const me = response.room.participants.find(p => p.userId === (authUser.id || authUser._id));
      
      setRoomData(response.room);
      if (me) useVibSyncStore.getState().setMyRole(me.role);

      if (response.room.queue) {
          usePlayerStore.setState({ queue: response.room.queue, currentIndex: response.room.currentIndex });
      }
      
      useUIStore.getState().showToast('Joined VibSync Session!', 'success');
      onSuccess?.(response.room);
    });
  }, [socket, setRoomData]);

  const leaveRoom = useCallback(() => {
    if (socket) {
      socket.disconnect(); 
      setTimeout(() => socket.connect(), 500); // Reconnect for general usage
    }
    resetRoom();
  }, [socket, resetRoom]);
  
  const grantControl = useCallback((targetUserId, isController) => {
    if(!socket) return;
    const newRole = isController ? 'CONTROLLER' : 'LISTENER';
    socket.emit('assign_role', { roomId: useVibSyncStore.getState().roomId, targetUserId, newRole });
  }, [socket]);

  return { createRoom, joinRoom, leaveRoom, grantControl };
};
