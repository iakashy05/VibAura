import mongoose from 'mongoose';

const artistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  spotifyArtistId: {
    type: String,
    unique: true,
    sparse: true,
  },
  artworkUrl: {
    type: String,
    required: false,
    default: '',
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  category: {
    type: String,
    required: false,
    default: "General",
    trim: true,
  }
}, {
  timestamps: true, // Automatically handle createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

const Artist = mongoose.model('Artist', artistSchema);

export default Artist;
