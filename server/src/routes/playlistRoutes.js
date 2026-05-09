import express from 'express';
import { 
  getPlaylistDetails, 
  createPlaylist, 
  deletePlaylist, 
  updatePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist 
} from '../controllers/playlistController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/:id', getPlaylistDetails);
router.post('/', authenticateToken, createPlaylist);
router.put('/:id', authenticateToken, updatePlaylist);
router.delete('/:id', authenticateToken, deletePlaylist);
router.post('/:id/songs', authenticateToken, addSongToPlaylist);
router.delete('/:id/songs/:songId', authenticateToken, removeSongFromPlaylist);

export default router;
