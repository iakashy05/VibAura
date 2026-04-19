import mongoose from 'mongoose';

const homePageSectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['song', 'artist', 'playlist'],
    required: true,
  },
  category: {
    type: String, // e.g., 'Featured', 'New Releases'
    trim: true,
  },
  limit: {
    type: Number,
    default: 10,
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true
});

const HomePageSection = mongoose.model('HomePageSection', homePageSectionSchema);

export default HomePageSection;
