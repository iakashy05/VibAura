import mongoose from 'mongoose';

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  // Multi-Artist Confirmation: Stored as an array of ObjectIDs
  artists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    required: true,
  }],
  duration: {
    type: Number, // Stored in seconds
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  artworkUrl: {
    type: String,
    required: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  album: {
    type: String,
    trim: true,
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Middleware/Virtual to help the frontend:
// This can be populated to provide a single string like "Artist A, Artist B"
songSchema.virtual('artistNameString').get(function() {
  if (this.artists && this.artists.length > 0 && typeof this.artists[0] !== 'string' && this.artists[0].name) {
    return this.artists.map(a => a.name).join(', ');
  }
  return '';
});

const Song = mongoose.model('Song', songSchema);

export default Song;
