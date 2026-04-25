import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    default: '',
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    select: false, // Ensure password isn't leaked by accident in queries
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  libraryPlaylists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Playlist',
  }],
  libraryArtists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
  }],
  pinnedPlaylists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Playlist',
  }],
  pinnedArtists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
  }],
  likedSongs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
  }],
  recentlyPlayed: [{
    song: { type: mongoose.Schema.Types.ObjectId, ref: 'Song' },
    playedAt: { type: Date, default: Date.now }
  }],
  // --- Password Reset OTP ---
  resetOTP: {
    type: String,
    select: false
  },
  resetOTPExpires: {
    type: Date,
    select: false
  },
  resetOTPAttempts: {
    type: Number,
    default: 0,
    select: false
  }
}, {
  timestamps: true
});

// --- Optimizations ---

// 1. Automatic Password Hashing
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// 2. Built-in Password Comparison
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
