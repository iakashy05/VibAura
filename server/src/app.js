import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { error } from './utils/logger.js';

const app = express();

// --- 1. Global Middlewares ---
app.use(helmet()); // Security headers
app.use(cors());   // Enable Cross-Origin Resource Sharing
app.use(morgan('dev')); // Request logging
app.use(express.json()); // Body parser

// --- 2. Routes ---
import songRoutes from './routes/songRoutes.js';
import discoveryRoutes from './routes/discoveryRoutes.js';
import artistRoutes from './routes/artistRoutes.js';
import playlistRoutes from './routes/playlistRoutes.js';
import errorMiddleware from './middlewares/errorMiddleware.js';

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', message: 'VibAura Server is online' });
});

app.use('/api/v1/songs', songRoutes);
app.use('/api/v1/discovery', discoveryRoutes);
app.use('/api/v1/artists', artistRoutes);
app.use('/api/v1/playlists', playlistRoutes);

// --- 3. Error Handling ---
app.use(errorMiddleware);

export default app;
