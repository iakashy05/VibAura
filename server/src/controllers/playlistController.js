import playlistService from '../services/playlistService.js';
import Playlist from '../models/Playlist.js';
import User from '../models/User.js';
import { error } from '../utils/logger.js';

export const getPlaylistDetails = async (req, res, next) => {
  try {
    const playlist = await playlistService.getPlaylistWithSongs(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    res.json(playlist);
  } catch (err) {
    error(`playlistController.getPlaylistDetails: ${err.message}`);
    next(err);
  }
};

export const createPlaylist = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Playlist title is required' });
    }

    const playlist = await Playlist.create({
      title,
      description,
      creator: req.user.id,
      isPublic: false
    });

    // Add to user's library
    await User.findByIdAndUpdate(req.user.id, {
      $push: { libraryPlaylists: playlist._id }
    });

    res.status(201).json(playlist);
  } catch (err) {
    error(`playlistController.createPlaylist: ${err.message}`);
    next(err);
  }
};

export const deletePlaylist = async (req, res, next) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    if (playlist.creator?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this playlist' });
    }

    await Playlist.findByIdAndDelete(req.params.id);

    // Remove from user's library
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { libraryPlaylists: playlist._id }
    });

    res.json({ message: 'Playlist deleted' });
  } catch (err) {
    error(`playlistController.deletePlaylist: ${err.message}`);
    next(err);
  }
};

export const updatePlaylist = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    if (playlist.creator?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this playlist' });
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true }
    );

    res.json(updatedPlaylist);
  } catch (err) {
    error(`playlistController.updatePlaylist: ${err.message}`);
    next(err);
  }
};

export const addSongToPlaylist = async (req, res, next) => {
  try {
    const { songId } = req.body;
    const { id } = req.params;

    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    if (playlist.creator?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to modify this playlist' });
    }

    // Check if song already exists in playlist to avoid duplicates
    if (playlist.songs.includes(songId)) {
      return res.status(400).json({ message: 'Song already in playlist' });
    }

    playlist.songs.push(songId);
    await playlist.save();

    res.json({ message: 'Song added to playlist', playlist });
  } catch (err) {
    error(`playlistController.addSongToPlaylist: ${err.message}`);
    next(err);
  }
};
