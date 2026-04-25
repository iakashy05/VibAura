import Song from '../models/Song.js';
import Artist from '../models/Artist.js'; // Ensure Artist is registered for population

/**
 * Service to handle business logic for songs.
 * This separates database queries from the controller layer.
 */
class SongService {
  /**
   * Fetch featured songs with populated artist data.
   */
  async getFeaturedSongs(limit = 10) {
    return await Song.find({ isFeatured: true })
      .populate('artists')
      .limit(limit)
      .lean();
  }

  /**
   * Fetch all songs with populated artist data.
   */
  async getAllSongs() {
    return await Song.find()
      .populate('artists')
      .lean();
  }

  /**
   * Fetch a single song by ID with populated artist data.
   */
  async getSongById(id) {
    return await Song.findById(id)
      .populate('artists')
      .lean();
  }
}

export default new SongService();
