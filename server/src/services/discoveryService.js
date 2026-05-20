import mongoose from 'mongoose';
import User from '../models/User.js';
import Song from '../models/Song.js';
import Artist from '../models/Artist.js';
import Playlist from '../models/Playlist.js';
import { debug, error } from '../utils/logger.js';

/**
 * Service to build the dynamic, personalized 10-section homepage layout.
 */
class DiscoveryService {
  /**
   * Fetches the 10-section homepage structure and populates sections with real data.
   * @param {Object} userContext - The decoded user payload from authenticateToken middleware (contains `id`, `email`, `role`).
   */
  async getHomepagePayload(userContext) {
    try {
      let user = null;

      // 1. Fetch user profile if userContext is available
      if (userContext && userContext.id) {
        user = await User.findById(userContext.id)
          .populate({
            path: 'recentlyPlayed.song',
            populate: { path: 'artists' }
          })
          .populate({
            path: 'libraryPlaylists',
            populate: { path: 'creator', select: 'name' }
          })
          .lean();
      }

      const payload = [];

      // ==========================================
      // SECTION 1: 🌟 Song (Featured - Dynamic & Shuffled)
      // ==========================================
      let featuredSongs = await Song.aggregate([
        { $sample: { size: 12 } }
      ]);
      await Song.populate(featuredSongs, { path: 'artists' });

      payload.push({
        id: 'featured-songs',
        title: 'Featured For You',
        type: 'song',
        items: featuredSongs
      });

      // ==========================================
      // SECTION 2: 🆕 Song (Newly Added)
      // ==========================================
      const freshSongs = await Song.find()
        .sort({ _id: -1 })
        .populate('artists')
        .limit(12)
        .lean();

      payload.push({
        id: 'newly-added-songs',
        title: 'Fresh Additions',
        type: 'song',
        items: freshSongs
      });

      // ==========================================
      // SECTION 3: 🎬 Playlist (Bollywood)
      // ==========================================
      let bollywoodPlaylists = await Playlist.find({
        isPublic: { $ne: false },
        $or: [
          { category: { $regex: 'Bollywood', $options: 'i' } },
          { name: { $regex: 'Bollywood', $options: 'i' } }
        ]
      })
      .populate('creator')
      .limit(12)
      .lean();

      // Seeding fallback if not enough specific playlists exist
      if (bollywoodPlaylists.length < 12) {
        const existingIds = bollywoodPlaylists.map(p => p._id);
        const fillPlaylists = await Playlist.find({
          _id: { $nin: existingIds },
          isPublic: { $ne: false }
        })
        .populate('creator')
        .limit(12 - bollywoodPlaylists.length)
        .lean();
        bollywoodPlaylists.push(...fillPlaylists);
      }

      payload.push({
        id: 'bollywood-playlists',
        title: 'Bollywood Hits',
        type: 'playlist',
        items: bollywoodPlaylists
      });

      // ==========================================
      // SECTION 4: 🎤 Artist (Top Artists)
      // ==========================================
      let topArtists = await Artist.find({ isFeatured: true })
        .limit(12)
        .lean();

      if (topArtists.length < 12) {
        const existingIds = topArtists.map(a => a._id);
        const fillArtists = await Artist.aggregate([
          { $match: { _id: { $nin: existingIds } } },
          { $sample: { size: 12 - topArtists.length } }
        ]);
        topArtists.push(...fillArtists);
      }

      payload.push({
        id: 'top-artists',
        title: 'Top Artists',
        type: 'artist',
        items: topArtists
      });

      // ==========================================
      // SECTION 5: 🪕 Playlist (Punjabi)
      // ==========================================
      let punjabiPlaylists = await Playlist.find({
        isPublic: { $ne: false },
        $or: [
          { category: { $regex: 'Punjabi', $options: 'i' } },
          { name: { $regex: 'Punjabi', $options: 'i' } }
        ]
      })
      .populate('creator')
      .limit(12)
      .lean();

      if (punjabiPlaylists.length < 12) {
        const existingIds = punjabiPlaylists.map(p => p._id);
        const fillPlaylists = await Playlist.find({
          _id: { $nin: existingIds },
          isPublic: { $ne: false }
        })
        .populate('creator')
        .limit(12 - punjabiPlaylists.length)
        .lean();
        punjabiPlaylists.push(...fillPlaylists);
      }

      payload.push({
        id: 'punjabi-playlists',
        title: 'Punjabi Beats',
        type: 'playlist',
        items: punjabiPlaylists
      });

      // ==========================================
      // SECTION 6: 📋 Playlist (Most Played / Trending)
      // ==========================================
      const mostPlayedPlaylists = await Playlist.find({ isPublic: { $ne: false } })
        .populate('creator')
        .sort({ createdAt: -1 })
        .limit(12)
        .lean();

      payload.push({
        id: 'trending-playlists',
        title: 'Trending Playlists',
        type: 'playlist',
        items: mostPlayedPlaylists
      });

      // ==========================================
      // SECTION 7: 🎤 Artist (Top Punjabi Artists)
      // ==========================================
      const punjabiSongs = await Song.find({ genre: /Punjabi/i }).select('artists').lean();
      const punjabiArtistIds = [...new Set(punjabiSongs.flatMap(s => s.artists.map(id => id.toString())))];

      let topPunjabiArtists = await Artist.find({
        _id: { $in: punjabiArtistIds }
      })
      .limit(12)
      .lean();

      // If not enough, search category or use featured
      if (topPunjabiArtists.length < 12) {
        const existingIds = topPunjabiArtists.map(a => a._id);
        const fillArtists = await Artist.find({
          _id: { $nin: existingIds },
          $or: [
            { category: /Punjabi/i },
            { name: /Punjabi/i }
          ]
        })
        .limit(12 - topPunjabiArtists.length)
        .lean();
        topPunjabiArtists.push(...fillArtists);
      }

      // Final fallback to make sure carousel is full
      if (topPunjabiArtists.length < 12) {
        const existingIds = topPunjabiArtists.map(a => a._id);
        const fillArtists = await Artist.aggregate([
          { $match: { _id: { $nin: existingIds } } },
          { $sample: { size: 12 - topPunjabiArtists.length } }
        ]);
        topPunjabiArtists.push(...fillArtists);
      }

      payload.push({
        id: 'punjabi-artists',
        title: 'Top Punjabi Artists',
        type: 'artist',
        items: topPunjabiArtists
      });

      // ==========================================
      // SECTION 8: ⏱️ Song (Jump Back In)
      // ==========================================
      let jumpBackItems = [];
      const seenSongIds = new Set();

      if (user && user.recentlyPlayed && user.recentlyPlayed.length > 0) {
        for (const rp of user.recentlyPlayed) {
          if (rp.song && rp.song._id && !seenSongIds.has(rp.song._id.toString())) {
            seenSongIds.add(rp.song._id.toString());
            jumpBackItems.push(rp.song);
          }
          if (jumpBackItems.length >= 12) break;
        }
      }

      // Fallback: If less than 12 items, fill with newest songs from database
      if (jumpBackItems.length < 12) {
        const excludeIds = Array.from(seenSongIds).map(id => new mongoose.Types.ObjectId(id));
        const fillSongs = await Song.find({ _id: { $nin: excludeIds } })
          .sort({ _id: -1 })
          .populate('artists')
          .limit(12 - jumpBackItems.length)
          .lean();
        jumpBackItems.push(...fillSongs);
      }

      payload.push({
        id: 'jump-back-in',
        title: 'Jump Back In',
        type: 'song',
        items: jumpBackItems
      });

      // ==========================================
      // SECTION 9: 📋 Playlist (Playlists Added in Library)
      // ==========================================
      let libraryPlaylists = [];
      const seenPlaylistIds = new Set();

      if (user && user.libraryPlaylists && user.libraryPlaylists.length > 0) {
        for (const playlist of user.libraryPlaylists) {
          if (playlist && playlist._id && !seenPlaylistIds.has(playlist._id.toString())) {
            seenPlaylistIds.add(playlist._id.toString());
            libraryPlaylists.push(playlist);
          }
        }
      }

      if (libraryPlaylists.length > 0) {
        payload.push({
          id: 'library-playlists',
          title: 'My Library Playlists',
          type: 'playlist',
          items: libraryPlaylists
        });
      }

      // ==========================================
      // SECTION 10: 🎤 Artist (Most Played / Recommended Artists)
      // ==========================================
      let mostPlayedArtists = [];
      const seenArtistIds = new Set();

      // Collect artists of recently played tracks
      if (user && user.recentlyPlayed && user.recentlyPlayed.length > 0) {
        for (const rp of user.recentlyPlayed) {
          if (rp.song && Array.isArray(rp.song.artists)) {
            for (const artist of rp.song.artists) {
              if (artist && artist._id && !seenArtistIds.has(artist._id.toString())) {
                seenArtistIds.add(artist._id.toString());
                mostPlayedArtists.push(artist);
              }
            }
          }
          if (mostPlayedArtists.length >= 12) break;
        }
      }

      // Fallback: If less than 12 items, fill with random featured artists
      if (mostPlayedArtists.length < 12) {
        const excludeArtistIds = Array.from(seenArtistIds).map(id => new mongoose.Types.ObjectId(id));
        const fillArtists = await Artist.aggregate([
          { $match: { _id: { $nin: excludeArtistIds } } },
          { $sample: { size: 12 - mostPlayedArtists.length } }
        ]);
        mostPlayedArtists.push(...fillArtists);
      }

      payload.push({
        id: 'most-played-artists',
        title: 'Most Played Artists',
        type: 'artist',
        items: mostPlayedArtists
      });

      return payload;
    } catch (err) {
      error('DiscoveryService failed:', err.message);
      throw err;
    }
  }
}

export default new DiscoveryService();
