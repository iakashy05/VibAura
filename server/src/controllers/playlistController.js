import playlistService from '../services/playlistService.js';
import { error } from '../utils/logger.js';

export const getPlaylistDetails = async (req, res, next) => {
  try {
    const playlist = await playlistService.getPlaylistWithSongs(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    res.json(playlist);
  } catch (err) {
    error(`playlistController.getPlaylistDetails: ${err.message}`);
    next(err);
  }
};
