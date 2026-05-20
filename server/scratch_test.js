import mongoose from 'mongoose';
import dotenv from 'dotenv';
import discoveryService from './src/services/discoveryService.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.DB_URI);
  console.log('✅ Connected to DB');
  
  try {
    const payload = await discoveryService.getHomepagePayload(null);
    console.log(`\n📊 Returned ${payload.length} sections:`);
    payload.forEach((section, idx) => {
      console.log(`  ${idx + 1}. [${section.type}] "${section.title}" (ID: ${section.id}) - ${section.items?.length || 0} items`);
    });
  } catch (err) {
    console.error('❌ Failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

run();
