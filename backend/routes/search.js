/**
 * ============================================================================
 * VibAura Search Route - Backend API
 * ============================================================================
 * 
 * Provides comprehensive search functionality across Songs, Artists, and Playlists.
 * 
 * Features:
 * - Multi-collection search (songs, artists, playlists)
 * - MongoDB Atlas Search support (if indexes exist)
 * - Fallback: Case-insensitive regex search
 * - Relevance and popularity sorting
 * - Categorized results (8 per category max)
 * - Graceful error handling
 * 
 * Route: GET /api/search?q=<query>
 * 
 * Response format:
 * {
 *   "songs": [{ _id, title, artist, artworkUrl, isFeatured }],
 *   "artists": [{ _id, name, artworkUrl, isFeatured }],
 *   "playlists": [{ _id, name, description, category }]
 * }
 * ============================================================================
*/

const express = require('express');
const router = express.Router();
const Song = require('../../models/song');
const Artist = require('../../models/artist');
const Playlist = require('../../models/playlist');
const { debug, info, warn, error } = require('../utils/logger');

/**
 * SEARCH CONFIGURATION
 * Define result limits and search parameters
 */
const SEARCH_CONFIG = {
  MAX_RESULTS_PER_CATEGORY: 8,
  MIN_QUERY_LENGTH: 1,
};

/**
 * GET /api/search?q=<query>
 * 
 * Main search endpoint that searches across all three collections.
 * 
 * Query Parameters:
 * - q (string, required): Search query string
 * 
 * Response:
 * - 200: Returns categorized search results
 * - 400: Missing or empty query parameter
 * - 500: Server error (check logs)
 * 
 * @async
 * @function searchHandler
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @returns {void}
 */
router.get('/', async (req, res) => {
  try {
    const { q } = req.query;

    // ========================================
    // VALIDATION
    // ========================================
    if (!q || q.trim().length === 0) {
      info('[Search] Invalid query - empty or missing');
      return res.status(400).json({
        error: 'Query parameter "q" is required and cannot be empty',
      });
    }

    const query = q.trim();

    // Log search for analytics/debugging
    info(`[Search] Starting search for: "${query}"`);

    // ========================================
    // CONCURRENT SEARCHES
    // ========================================
    // Execute all three searches in parallel for better performance
    debug('[Search] Executing parallel searches...');
    const [songs, artists, playlists] = await Promise.all([
      searchSongs(query),
      searchArtists(query),
      searchPlaylists(query),
    ]);

    info(`[Search] Found ${songs.length} songs, ${artists.length} artists, ${playlists.length} playlists`);

    // ========================================
    // RETURN RESULTS
    // ========================================
    res.json({
      songs,
      artists,
      playlists,
    });
  } catch (error) {
    error('[Search] Error:', error.message);
    debug('[Search] Stack:', error.stack);
    res.status(500).json({
      error: 'An error occurred while searching. Please try again.',
    });
  }
});

/**
 * SEARCH SONGS
 * 
 * Searches for songs by title and artist name.
 * Priority: featured songs first, then by title match quality.
 * 
 * Strategy:
 * 1. Try MongoDB Atlas Search (if indexes exist)
 * 2. Fallback to case-insensitive regex search
 * 
 * @async
 * @function searchSongs
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of song objects (max 8)
 */
async function searchSongs(query) {
  try {
    debug(`[Search] Searching songs for: "${query}"`);

    // First, try MongoDB Atlas Search (requires Atlas Search indexes)
    try {
      const searchResults = await Song.aggregate([
        {
          $search: {
            index: 'default',
            text: {
              query: query,
              path: ['title', 'artist'],
              fuzzy: {
                maxEdits: 1,
                prefixLength: 0,
              },
            },
          },
        },
        {
          $limit: SEARCH_CONFIG.MAX_RESULTS_PER_CATEGORY,
        },
      ]);

      // If Atlas Search returns results, populate artist and return
      if (searchResults.length > 0) {
        info(`[Search] Atlas Search found ${searchResults.length} songs`);
        return await Song.populate(searchResults, { path: 'artists' });
      }
    } catch (atlasError) {
      // Atlas Search not available, fall through to regex
      debug('[Search] Atlas Search not available, using regex fallback');
    }

    // ========================================
    // FALLBACK: REGEX SEARCH
    // ========================================
    // Create case-insensitive regex for title matching
    const regex = new RegExp(query, 'i');

    debug(`[Search] Using regex fallback with pattern: ${regex}`);

    // 1. Find artists matching the name (to find songs by artist)
    const matchingArtists = await Artist.find({ name: regex }).select('_id');
    const artistIds = matchingArtists.map(a => a._id);

    // 2. Search by title OR by artist ID
    const songs = await Song.find({
      $or: [
        { title: regex },
        { artists: { $in: artistIds } }
      ]
    })
      .populate('artists')
      .sort({
        isFeatured: -1, // Featured songs first
        title: 1,
      })
      .limit(SEARCH_CONFIG.MAX_RESULTS_PER_CATEGORY);

    debug(`[Search] Regex search found ${songs.length} songs`);
    return songs;
  } catch (error) {
    error('[Search] Error searching songs:', error.message);
    debug('[Search] Songs error stack:', error.stack);
    return [];
  }
}

/**
 * SEARCH ARTISTS
 * 
 * Searches for artists by name.
 * Priority: featured artists first, then by name relevance.
 * 
 * @async
 * @function searchArtists
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of artist objects (max 8)
 */
async function searchArtists(query) {
  try {
    debug(`[Search] Searching artists for: "${query}"`);

    // Try MongoDB Atlas Search first
    try {
      const searchResults = await Artist.aggregate([
        {
          $search: {
            index: 'default',
            text: {
              query: query,
              path: 'name',
              fuzzy: {
                maxEdits: 1,
                prefixLength: 0,
              },
            },
          },
        },
        {
          $limit: SEARCH_CONFIG.MAX_RESULTS_PER_CATEGORY,
        },
      ]);

      if (searchResults.length > 0) {
        info(`[Search] Atlas Search found ${searchResults.length} artists`);
        return searchResults;
      }
    } catch (atlasError) {
      // Atlas Search not available, fall through to regex
      debug('[Search] Atlas Search not available for artists, using regex fallback');
    }

    // ========================================
    // FALLBACK: REGEX SEARCH
    // ========================================
    const nameRegex = new RegExp(query, 'i');

    debug(`[Search] Using regex fallback for artists with pattern: ${nameRegex}`);

    const artists = await Artist.find({
      name: nameRegex,
    })
      .sort({
        isFeatured: -1, // Featured artists first
        name: 1,
      })
      .limit(SEARCH_CONFIG.MAX_RESULTS_PER_CATEGORY);

    debug(`[Search] Regex search found ${artists.length} artists`);
    return artists;
  } catch (error) {
    error('[Search] Error searching artists:', error.message);
    debug('[Search] Artists error stack:', error.stack);
    return [];
  }
}

/**
 * SEARCH PLAYLISTS
 * 
 * Searches for playlists by name and description.
 * Sorted by name relevance.
 * 
 * @async
 * @function searchPlaylists
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of playlist objects (max 8)
 */
async function searchPlaylists(query) {
  try {
    debug(`[Search] Searching playlists for: "${query}"`);

    // Try MongoDB Atlas Search first
    try {
      const searchResults = await Playlist.aggregate([
        {
          $search: {
            index: 'default',
            text: {
              query: query,
              path: ['name', 'description'],
              fuzzy: {
                maxEdits: 1,
                prefixLength: 0,
              },
            },
          },
        },
        {
          $limit: SEARCH_CONFIG.MAX_RESULTS_PER_CATEGORY,
        },
      ]);

      if (searchResults.length > 0) {
        info(`[Search] Atlas Search found ${searchResults.length} playlists`);
        return searchResults;
      }
    } catch (atlasError) {
      // Atlas Search not available, fall through to regex
      debug('[Search] Atlas Search not available for playlists, using regex fallback');
    }

    // ========================================
    // FALLBACK: REGEX SEARCH
    // ========================================
    const nameRegex = new RegExp(query, 'i');
    const descRegex = new RegExp(query, 'i');

    debug(`[Search] Using regex fallback for playlists with pattern: ${nameRegex}`);

    const playlists = await Playlist.find({
      $or: [
        { name: nameRegex },
        { description: descRegex },
      ],
    })
      .sort({ name: 1 })
      .limit(SEARCH_CONFIG.MAX_RESULTS_PER_CATEGORY);

    debug(`[Search] Regex search found ${playlists.length} playlists`);
    return playlists;
  } catch (error) {
    error('[Search] Error searching playlists:', error.message);
    debug('[Search] Playlists error stack:', error.stack);
    return [];
  }
}

module.exports = router;
