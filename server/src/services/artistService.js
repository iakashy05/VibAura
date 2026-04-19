import Artist from '../models/Artist.js';
import Song from '../models/Song.js';
import { error } from '../utils/logger.js';

/**
 * Service to handle deep artist data and associated songs.
 */
class ArtistService {
  /**
   * Fetches an artist by ID and all songs they are associated with.
   */
  async getArtistWithSongs(id) {
    try {
      const artist = await Artist.findById(id).lean();
      if (!artist) return null;

      // Find all songs where this artist ID is present in the 'artists' array
      const songs = await Song.find({ artists: id })
        .populate('artists')
        .sort({ createdAt: -1 }) // Sort by newest first by default
        .lean();

      return {
        ...artist,
        songs
      };
    } catch (err) {
      error(`ArtistService.getArtistWithSongs failed: ${err.message}`);
      throw err;
    }
  }

  /**
   * Basic fetch by ID
   */
  async getById(id) {
    return await Artist.findById(id).lean();
  }
}

export default new ArtistService();
