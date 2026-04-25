import artistService from '../services/artistService.js';
import { error } from '../utils/logger.js';

export const getArtistDetails = async (req, res, next) => {
  try {
    const artist = await artistService.getArtistWithSongs(req.params.id);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }
    res.json(artist);
  } catch (err) {
    error(`artistController.getArtistDetails: ${err.message}`);
    next(err);
  }
};
