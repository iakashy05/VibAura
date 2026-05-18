import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import vibSyncManager from '../services/vibSyncManager.js';

export const initVibSyncSocket = (io) => {
  // Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication error: No token'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('name isSubscribed');
      if (!user) return next(new Error('User not found'));

      socket.user = {
        id: user._id.toString(),
        name: user.name,
        isSubscribed: user.isSubscribed
      };
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`VibSync: User connected ${socket.user.name}`);

    // --- 1. Clock Sync (Ping/Pong) ---
    socket.on('timesync_ping', (clientTime, callback) => {
      callback({ clientTime, serverTime: Date.now() });
    });

    // --- 2. Room Management ---
    socket.on('create_room', (callback) => {
      if (!socket.user.isSubscribed) {
        return callback({ error: 'Premium subscription required to host a session.' });
      }
      const room = vibSyncManager.createRoom(socket.user.id);
      vibSyncManager.addParticipant(room.roomId, socket.user.id, 'HOST');
      
      socket.join(room.roomId);
      socket.currentRoom = room.roomId;
      
      callback({ success: true, room });
    });

    socket.on('join_room', ({ roomId }, callback) => {
      const room = vibSyncManager.getRoom(roomId);
      if (!room) return callback({ error: 'Room not found or has been closed.' });

      // Determine role (host re-joining, or guest)
      let role = 'LISTENER';
      if (room.hostId === socket.user.id) role = 'HOST';
      
      vibSyncManager.addParticipant(roomId, socket.user.id, role);
      socket.join(roomId);
      socket.currentRoom = roomId;

      // Broadcast to others that a user joined
      socket.to(roomId).emit('participant_joined', {
        userId: socket.user.id,
        name: socket.user.name,
        role
      });

      // Send INITIAL_STATE
      callback({
        success: true,
        room: vibSyncManager.getRoom(roomId),
        serverTimestamp: Date.now()
      });
    });

    socket.on('heartbeat', () => {
      if (socket.currentRoom) {
        vibSyncManager.updateHeartbeat(socket.currentRoom, socket.user.id);
      }
    });

    // --- 3. Playback Controls ---
    socket.on('playback_action', (payload) => {
      const { roomId, action, currentSong, currentTime, scheduledStartTime, queue, currentIndex } = payload;
      const room = vibSyncManager.getRoom(roomId);
      if (!room) return;

      const participant = room.participants.find(p => p.userId === socket.user.id);
      if (!participant || participant.role === 'LISTENER') return; // Unauthorized

      // Update server state
      let isPlaying = room.isPlaying;
      if (action === 'PLAY' || action === 'CHANGE_SONG') isPlaying = true;
      if (action === 'PAUSE') isPlaying = false;

      vibSyncManager.updateRoomState(roomId, {
        currentSong: currentSong || room.currentSong,
        currentTime,
        isPlaying,
        scheduledStartTime,
        queue: queue || room.queue,
        currentIndex: currentIndex !== undefined ? currentIndex : room.currentIndex
      });

      // Broadcast to room
      io.to(roomId).emit('room_playback_update', {
        action,
        currentSong: currentSong || room.currentSong,
        currentTime,
        isPlaying,
        scheduledStartTime,
        queue: queue || room.queue,
        currentIndex: currentIndex !== undefined ? currentIndex : room.currentIndex,
        serverTimestamp: Date.now()
      });
    });
    
    // --- 4. Role Assignment (Host Only) ---
    socket.on('assign_role', ({ roomId, targetUserId, newRole }) => {
        const room = vibSyncManager.getRoom(roomId);
        if(!room || room.hostId !== socket.user.id) return; // Only host
        
        const participant = room.participants.find(p => p.userId === targetUserId);
        if(participant) {
            participant.role = newRole;
            io.to(roomId).emit('role_updated', { userId: targetUserId, role: newRole });
        }
    });

    // --- Disconnect Handling ---
    socket.on('disconnect', () => {
      console.log(`VibSync: User disconnected ${socket.user.name}`);
      const roomId = socket.currentRoom;
      if (roomId) {
        const room = vibSyncManager.getRoom(roomId);
        if (room) {
          if (room.hostId === socket.user.id) {
            // Host Disconnected - Graceful Shutdown
            io.to(roomId).emit('room_closed', { message: 'Host has left the session.' });
            io.in(roomId).socketsLeave(roomId);
            vibSyncManager.removeRoom(roomId);
          } else {
            // Guest disconnected
            vibSyncManager.removeParticipant(roomId, socket.user.id);
            socket.to(roomId).emit('participant_left', { userId: socket.user.id });
          }
        }
      }
    });
  });

  // --- Background Tasks ---
  // 1. Ghost Cleanup (every 5 seconds)
  setInterval(() => {
    const now = Date.now();
    for (const [roomId, room] of vibSyncManager.rooms.entries()) {
      room.participants.forEach(p => {
        if (now - p.lastSeen > 25000) { // 25 seconds inactive
          if (p.userId === room.hostId) {
             // Host ghosted
             io.to(roomId).emit('room_closed', { message: 'Host connection lost.' });
             io.in(roomId).socketsLeave(roomId);
             vibSyncManager.removeRoom(roomId);
          } else {
             // Guest ghosted
             vibSyncManager.removeParticipant(roomId, p.userId);
             io.to(roomId).emit('participant_left', { userId: p.userId });
          }
        }
      });
    }
  }, 5000);

  // 2. Periodic Drift Correction Broadcast (every 10 seconds)
  setInterval(() => {
     for (const [roomId, room] of vibSyncManager.rooms.entries()) {
         if (room.isPlaying) {
             // Simulate time progression on server
             const elapsed = (Date.now() - room.scheduledStartTime) / 1000;
             io.to(roomId).emit('drift_sync', {
                 currentSong: room.currentSong,
                 currentTime: room.currentTime + elapsed,
                 isPlaying: room.isPlaying,
                 serverTimestamp: Date.now(),
                 queue: room.queue,
                 currentIndex: room.currentIndex
             });
         }
     }
  }, 10000);
};
