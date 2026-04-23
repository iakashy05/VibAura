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
      .populate({
        path: 'libraryPlaylists',
        populate: { path: 'artists', model: 'Artist' }
      })
      .populate({
        path: 'likedSongs',
        populate: { path: 'artists', model: 'Artist' }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      playlists: user.libraryPlaylists,
      likedSongs: user.likedSongs
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
}

export default new LibraryController();
