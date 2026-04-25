import express from 'express';
import libraryController from '../controllers/libraryController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All library routes require authentication
router.use(authenticateToken);

router.get('/', libraryController.getLibrary);
router.post('/songs/:songId/toggle', libraryController.toggleLikeSong);
router.post('/playlists/:playlistId/toggle', libraryController.toggleLibraryPlaylist);
router.post('/artists/:artistId/toggle', libraryController.toggleLibraryArtist);
router.post('/playlists/:playlistId/pin', libraryController.togglePinPlaylist);
router.post('/artists/:artistId/pin', libraryController.togglePinArtist);
router.get('/vibrance', libraryController.getVibrance);
router.post('/history', libraryController.logPlayHistory);
router.post('/history/heartbeat', libraryController.logHeartbeat);

export default router;
