import Song from '../models/Song.js';
import Artist from '../models/Artist.js';
import Playlist from '../models/Playlist.js';

/**
 * Service to handle multi-collection search queries.
 */
class SearchService {
  /**
   * Performs concurrent searches across Songs, Artists, and Playlists.
   * @param {string} query - The search term
   * @returns {Promise<object>} - Categorized results
   */
  async searchAll(query) {
    if (!query || query.trim().length === 0) {
      return { songs: [], artists: [], playlists: [], topResult: null };
    }

    const searchRegex = new RegExp(query.trim(), 'i');
    const LIMIT = 8;

    // Execute searches in parallel for performance
    const [songs, artists, playlists] = await Promise.all([
      // 1. Search Songs (By title or artist name)
      this._searchSongs(searchRegex, LIMIT),
      
      // 2. Search Artists (By name)
      Artist.find({ name: searchRegex })
        .limit(LIMIT)
        .lean(),

      // 3. Search Playlists (By title or description)
      Playlist.find({
        $or: [
          { title: searchRegex },
          { name: searchRegex },
          { description: searchRegex }
        ]
      })
        .limit(LIMIT)
        .lean()
    ]);

    // Logic to find the "Top Result"
    let topResult = null;
    const normalizedQuery = query.toLowerCase().trim();

    // Check for exact artist match first (Priority 1)
    const exactArtist = artists.find(a => a.name.toLowerCase() === normalizedQuery);
    if (exactArtist) {
      topResult = { ...exactArtist, type: 'artist' };
    } else {
      // Check for exact song match (Priority 2)
      const exactSong = songs.find(s => s.title.toLowerCase() === normalizedQuery);
      if (exactSong) {
        topResult = { ...exactSong, type: 'song' };
      } else {
        // Fallback: Pick the first available result if no exact match
        if (artists.length > 0) topResult = { ...artists[0], type: 'artist' };
        else if (songs.length > 0) topResult = { ...songs[0], type: 'song' };
        else if (playlists.length > 0) topResult = { ...playlists[0], type: 'playlist' };
      }
    }

    return { songs, artists, playlists, topResult };
  }

  /**
   * Internal helper to search songs and handle artist population.
   */
  async _searchSongs(regex, limit) {
    // We also search by artist name to make the song search more "intelligent"
    const matchingArtists = await Artist.find({ name: regex }).select('_id');
    const artistIds = matchingArtists.map(a => a._id);

    return Song.find({
      $or: [
        { title: regex },
        { artists: { $in: artistIds } }
      ]
    })
      .populate('artists')
      .limit(limit)
      .lean();
  }
}

export default new SearchService();
