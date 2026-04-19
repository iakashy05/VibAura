import songService from '../services/songService.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Controller to handle API requests for songs.
 */
class SongController {
  /**
   * GET /api/v1/songs/featured
   */
  getFeatured = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const songs = await songService.getFeaturedSongs(limit);
    res.json(songs);
  });

  /**
   * GET /api/v1/songs
   */
  getAll = asyncHandler(async (req, res) => {
    const songs = await songService.getAllSongs();
    res.json(songs);
  });

  /**
   * GET /api/v1/songs/:id
   */
  getById = asyncHandler(async (req, res) => {
    const song = await songService.getSongById(req.params.id);
    if (!song) {
      const err = new Error('Song not found');
      err.statusCode = 404;
      throw err;
    }
    res.json(song);
  });
}

export default new SongController();
