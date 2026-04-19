import Playlist from '../models/Playlist.js';
import { error } from '../utils/logger.js';

/**
 * Service to handle playlist data and song population.
 */
class PlaylistService {
  /**
   * Fetches a playlist by ID with all songs and their respective artists populated.
   */
  async getPlaylistWithSongs(id) {
    try {
      const playlist = await Playlist.findById(id)
        .populate({
          path: 'songs',
          populate: {
            path: 'artists',
            model: 'Artist'
          }
        })
        .lean();

      return playlist;
    } catch (err) {
      error(`PlaylistService.getPlaylistWithSongs failed: ${err.message}`);
      throw err;
    }
  }
}

export default new PlaylistService();
