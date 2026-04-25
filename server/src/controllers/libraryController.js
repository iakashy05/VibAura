import User from '../models/User.js';
import Song from '../models/Song.js';
import Playlist from '../models/Playlist.js';
import asyncHandler from '../utils/asyncHandler.js';

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
    const { songId } = req.body;
    if (!songId) return res.status(400).json({ message: 'songId is required' });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Remove song if it already exists to avoid duplicates, then unshift to start
    user.recentlyPlayed = user.recentlyPlayed.filter(entry => entry.song.toString() !== songId);
    user.recentlyPlayed.unshift({ song: songId, playedAt: Date.now() });

    // Limit history to 50
    if (user.recentlyPlayed.length > 50) {
      user.recentlyPlayed = user.recentlyPlayed.slice(0, 50);
    }

    await user.save();
    res.json({ message: 'History updated' });
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
}

export default new LibraryController();
