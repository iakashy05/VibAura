import User from '../models/User.js';
import Song from '../models/Song.js';
import Playlist from '../models/Playlist.js';
import PlayLog from '../models/PlayLog.js';
import Artist from '../models/Artist.js';
import asyncHandler from '../utils/asyncHandler.js';
import mongoose from 'mongoose';

class LibraryController {
  /**
   * Get all library content for the user.
   */
  getLibrary = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)
      .populate('libraryPlaylists')
      .populate('pinnedPlaylists')
      .populate('pinnedArtists')
      .populate({
        path: 'likedSongs',
        populate: { path: 'artists', model: 'Artist' }
      })
      .populate({
        path: 'recentlyPlayed.song',
        populate: { path: 'artists', model: 'Artist' }
      })
      .populate('libraryArtists');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      playlists: user.libraryPlaylists,
      pinnedPlaylists: user.pinnedPlaylists,
      pinnedArtists: user.pinnedArtists,
      likedSongs: user.likedSongs,
      artists: user.libraryArtists,
      recentlyPlayed: user.recentlyPlayed
        .sort((a, b) => b.playedAt - a.playedAt)
        .map(entry => entry.song)
        .filter(song => song != null) // filter out nulls if song was deleted
    });
  });

  /**
   * Toggle a song in the user's liked songs.
   */
  toggleLikeSong = asyncHandler(async (req, res) => {
    const { songId } = req.params;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const index = user.likedSongs.indexOf(songId);
    let liked = false;

    if (index === -1) {
      user.likedSongs.push(songId);
      liked = true;
    } else {
      user.likedSongs.splice(index, 1);
      liked = false;
    }

    await user.save();
    res.json({ liked, message: liked ? 'Added to Liked Songs' : 'Removed from Liked Songs' });
  });

  /**
   * Toggle a playlist in the user's library.
   */
  toggleLibraryPlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const index = user.libraryPlaylists.indexOf(playlistId);
    let added = false;

    if (index === -1) {
      user.libraryPlaylists.push(playlistId);
      added = true;
    } else {
      user.libraryPlaylists.splice(index, 1);
      added = false;
    }

    await user.save();
    res.json({ added, message: added ? 'Added to Library' : 'Removed from Library' });
  });

  /**
   * Toggle an artist in the user's library.
   */
  toggleLibraryArtist = asyncHandler(async (req, res) => {
    const { artistId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const index = user.libraryArtists.indexOf(artistId);
    let added = false;

    if (index === -1) {
      user.libraryArtists.push(artistId);
      added = true;
    } else {
      user.libraryArtists.splice(index, 1);
      added = false;
    }

    await user.save();
    res.json({ added, message: added ? 'Artist Added to Library' : 'Artist Removed from Library' });
  });

  /**
   * Log a song to recently played history.
   */
  logPlayHistory = asyncHandler(async (req, res) => {
    const { songId, playlistId } = req.body;
    if (!songId) return res.status(400).json({ message: 'songId is required' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 1. Update Recently Played (Legacy/Quick Access)
    // Remove song if it already exists to avoid duplicates, then unshift to start
    user.recentlyPlayed = user.recentlyPlayed.filter(entry => entry.song.toString() !== songId);
    user.recentlyPlayed.unshift({ song: songId, playedAt: Date.now() });

    // Limit history to 50
    if (user.recentlyPlayed.length > 50) {
      user.recentlyPlayed = user.recentlyPlayed.slice(0, 50);
    }

    await user.save();

    // 2. Create detailed PlayLog for Analytics
    await PlayLog.create({
      user: req.user.id,
      song: songId,
      playlist: playlistId || null,
      playedAt: Date.now()
    });

    res.json({ message: 'History updated' });
  });

  /**
   * Get Monthly Vibrance (Monthly Report) analytics.
   */
  getVibrance = asyncHandler(async (req, res) => {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // 1. Aggregation for Top Songs
    const topSongs = await PlayLog.aggregate([
      { $match: { user: userId, playedAt: { $gte: startOfMonth } } },
      { $group: { _id: '$song', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'songs',
          localField: '_id',
          foreignField: '_id',
          as: 'songDetails'
        }
      },
      { $unwind: '$songDetails' },
      {
        $lookup: {
          from: 'artists',
          localField: 'songDetails.artists',
          foreignField: '_id',
          as: 'artistDetails'
        }
      }
    ]);

    // 2. Aggregation for Top Artists
    const topArtistsRaw = await PlayLog.aggregate([
      { $match: { user: userId, playedAt: { $gte: startOfMonth } } },
      {
        $lookup: {
          from: 'songs',
          localField: 'song',
          foreignField: '_id',
          as: 'song'
        }
      },
      { $unwind: '$song' },
      { $unwind: '$song.artists' },
      { $group: { _id: '$song.artists', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'artists',
          localField: '_id',
          foreignField: '_id',
          as: 'artistDetails'
        }
      },
      { $unwind: '$artistDetails' }
    ]);

    // 3. Aggregation for Top Playlists
    const topPlaylists = await PlayLog.aggregate([
      { $match: { user: userId, playedAt: { $gte: startOfMonth }, playlist: { $ne: null } } },
      { $group: { _id: '$playlist', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 },
      {
        $lookup: {
          from: 'playlists',
          localField: '_id',
          foreignField: '_id',
          as: 'playlistDetails'
        }
      },
      { $unwind: '$playlistDetails' }
    ]);

    // 4. Total Listen Time (Rough estimate based on song duration)
    // First get all unique songs played this month and their counts
    const songCounts = await PlayLog.aggregate([
      { $match: { user: userId, playedAt: { $gte: startOfMonth } } },
      { $group: { _id: '$song', count: { $sum: 1 } } }
    ]);

    let totalDuration = 0;
    for (const item of songCounts) {
      const logs = await PlayLog.find({ 
        user: userId, 
        song: item._id, 
        playedAt: { $gte: startOfMonth } 
      });
      
      // Calculate actual time spent based on heartbeat updates
      for (const log of logs) {
        if (log.listenedSeconds) {
          totalDuration += log.listenedSeconds;
        } else {
          // Fallback for logs without heartbeats (legacy or 1-click)
          // We'll give them 10 seconds as a baseline if they just clicked
          totalDuration += 10; 
        }
      }
    }

    res.json({
      month: startOfMonth.toLocaleString('default', { month: 'long' }),
      totalMinutes: Math.round(totalDuration / 60),
      topSongs: topSongs.map(s => ({
        ...s.songDetails,
        playCount: s.count,
        artists: s.artistDetails
      })),
      topArtists: topArtistsRaw.map(a => ({
        ...a.artistDetails,
        playCount: a.count
      })),
      topPlaylists: topPlaylists.map(p => ({
        ...p.playlistDetails,
        playCount: p.count
      })),
      totalMinutes: Math.round(totalDuration / 60)
    });
  });

  /**
   * Toggle a playlist in the user's pinned playlists.
   */
  togglePinPlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPinned = user.pinnedPlaylists.some(id => id.toString() === playlistId);
    let pinned = false;

    if (!isPinned) {
      user.pinnedPlaylists.push(playlistId);
      pinned = true;
    } else {
      user.pinnedPlaylists = user.pinnedPlaylists.filter(id => id.toString() !== playlistId);
      pinned = false;
    }

    await user.save();
    res.json({ pinned, message: pinned ? 'Playlist pinned' : 'Playlist unpinned' });
  });

  /**
   * Toggle an artist in the user's pinned artists.
   */
  togglePinArtist = asyncHandler(async (req, res) => {
    const { artistId } = req.params;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPinned = user.pinnedArtists.some(id => id.toString() === artistId);
    let pinned = false;

    if (!isPinned) {
      user.pinnedArtists.push(artistId);
      pinned = true;
    } else {
      user.pinnedArtists = user.pinnedArtists.filter(id => id.toString() !== artistId);
      pinned = false;
    }

    await user.save();
    res.json({ pinned, message: pinned ? 'Artist pinned' : 'Artist unpinned' });
  });

  /**
   * Record a heartbeat (10s of listening) for the current song.
   */
  logHeartbeat = asyncHandler(async (req, res) => {
    const { songId } = req.body;
    if (!songId) return res.status(400).json({ message: 'songId is required' });

    // Find the most recent play log for this user and song within the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const log = await PlayLog.findOne({
      user: req.user.id,
      song: songId,
      playedAt: { $gte: oneHourAgo }
    }).sort({ playedAt: -1 });

    if (log) {
      log.listenedSeconds = (log.listenedSeconds || 0) + 10;
      await log.save();
    }

    res.json({ message: 'Heartbeat recorded' });
  });
}

export default new LibraryController();
