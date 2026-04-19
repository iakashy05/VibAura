import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Artist from './src/models/Artist.js';
import Song from './src/models/Song.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log('🌱 Connected for seeding...');

    // 1. Clear existing data (optional, but good for clean testing)
    // await Artist.deleteMany({});
    // await Song.deleteMany({});

    // 2. Create Artists
    const artists = await Artist.insertMany([
      { name: 'Atif Aslam', isFeatured: true, artworkUrl: 'https://placehold.co/400x400?text=Atif' },
      { name: 'Arijit Singh', isFeatured: true, artworkUrl: 'https://placehold.co/400x400?text=Arijit' },
      { name: 'Shreya Ghoshal', isFeatured: true, artworkUrl: 'https://placehold.co/400x400?text=Shreya' }
    ]);

    console.log(`✅ Created ${artists.length} artists`);

    // 3. Create a Multi-Artist Song
    const duet = new Song({
      title: 'Piya O Re Piya',
      artists: [artists[0]._id, artists[2]._id], // Atif & Shreya
      duration: 290,
      fileUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      artworkUrl: 'https://placehold.co/600x600?text=Duet+Hits',
      isFeatured: true,
      album: 'Tere Naal Love Ho Gaya'
    });

    await duet.save();
    console.log('✅ Created Multi-Artist Song:', duet.title);

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedData();
