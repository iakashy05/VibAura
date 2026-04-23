import express from 'express';
import libraryController from '../controllers/libraryController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All library routes require authentication
router.use(authenticateToken);

router.get('/', libraryController.getLibrary);
router.post('/songs/:songId/toggle', libraryController.toggleLikeSong);
router.post('/playlists/:playlistId/toggle', libraryController.toggleLibraryPlaylist);

export default router;
