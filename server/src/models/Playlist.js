import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  cover: {
    type: String,
    default: '',
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  songs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
  }],
  category: {
    type: String, // e.g., 'Bollywood Hits', 'Party Hits'
    trim: true,
  },
  isPublic: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

playlistSchema.index({ creator: 1 });
playlistSchema.index({ isPublic: 1 });

const Playlist = mongoose.model('Playlist', playlistSchema);

export default Playlist;
