import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import { error, info, warn } from '../utils/logger.js';

dotenv.config();

// Fix for DNS resolution issues with MongoDB Atlas on some ISPs/Routers/Windows
// This ensures the app can resolve SRV records regardless of local network constraints
dns.setDefaultResultOrder('ipv4first');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  warn('Could not set custom DNS servers, using system default.');
}

/**
 * Establishes a connection to the MongoDB database using Mongoose.
 * Includes optimized connection settings for production.
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.DB_URI;
    
    if (!mongoUri) {
      throw new Error('DB_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true, // Standard for dev, consider disabling for large production DBs
    });

    info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    error(`Error: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;
