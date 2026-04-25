import mongoose from 'mongoose';

const playLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  song: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
    required: true,
  },
  playlist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Playlist',
    required: false,
  },
  playedAt: {
    type: Date,
    default: Date.now,
  },
  listenedSeconds: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Indexing for faster aggregation on monthly basis
playLogSchema.index({ user: 1, playedAt: -1 });

const PlayLog = mongoose.model('PlayLog', playLogSchema);

export default PlayLog;
