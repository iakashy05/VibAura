import crypto from 'crypto';

class VibSyncManager {
  constructor() {
    this.rooms = new Map(); // roomId -> Room State
  }

  generateRoomCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Ensure uniqueness
    if (this.rooms.has(code)) return this.generateRoomCode();
    return code;
  }

  createRoom(hostId) {
    const roomId = this.generateRoomCode();
    const newRoom = {
      roomId,
      hostId,
      participants: [],
      currentSong: null,
      currentTime: 0,
      isPlaying: false,
      scheduledStartTime: 0,
      queue: [],
      currentIndex: -1
    };
    this.rooms.set(roomId, newRoom);
    return newRoom;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  removeRoom(roomId) {
    this.rooms.delete(roomId);
  }

  addParticipant(roomId, userId, role = 'LISTENER') {
    const room = this.getRoom(roomId);
    if (!room) return null;

    const existing = room.participants.find(p => p.userId === userId);
    if (existing) {
      existing.lastSeen = Date.now();
      return room;
    }

    room.participants.push({
      userId,
      role,
      lastSeen: Date.now()
    });
    return room;
  }

  removeParticipant(roomId, userId) {
    const room = this.getRoom(roomId);
    if (!room) return null;

    room.participants = room.participants.filter(p => p.userId !== userId);
    return room;
  }

  updateHeartbeat(roomId, userId) {
    const room = this.getRoom(roomId);
    if (!room) return false;

    const participant = room.participants.find(p => p.userId === userId);
    if (participant) {
      participant.lastSeen = Date.now();
      return true;
    }
    return false;
  }

  updateRoomState(roomId, newState) {
    const room = this.getRoom(roomId);
    if (!room) return null;

    Object.assign(room, newState);
    return room;
  }
}

export default new VibSyncManager();
