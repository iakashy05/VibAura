const express = require("express");
const router = express.Router();
const Playlist = require("../../models/playlist");
const User = require("../../models/user");
const Song = require("../../models/song");
const { authenticateToken } = require("../middleware/authMiddleware");

const { error } = require("../utils/logger");

// GET /api/playlists - Fetch all playlists (Public)
router.get("/", async (req, res) => {
  try {
    const playlists = await Playlist.find().lean();
    res.json(playlists);
  } catch (err) {
    error("Error fetching playlists:", err);
    res.status(500).json({ message: "Error fetching playlists" });
  }
});

// GET /api/playlists/:id - Fetch playlist by ID (Public)
router.get("/:id", async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate({
      path: "songs",
      populate: [
        { path: "artists", model: "Artist" }
      ],
    });
    if (!playlist) return res.status(404).json({ message: "Playlist not found" });
    res.json(playlist);
  } catch (err) {
    error("Error fetching playlist:", err);
    res.status(500).json({ message: "Error fetching playlist" });
  }
});

// Routes below this require auth
router.use(authenticateToken);

// POST /api/playlists - Create new playlist
router.post("/", async (req, res) => {
    try {
        const { name, description, category } = req.body;
        if (!name) return res.status(400).json({ message: "Name is required" });

        const newPlaylist = new Playlist({
            name,
            description,
            category: category || "Personal", // Default category
            owner: req.user.userId,
            songs: []
        });

        const savedPlaylist = await newPlaylist.save();

        // Auto-add to user library
        await User.findByIdAndUpdate(req.user.userId, {
            $addToSet: { libraryPlaylists: savedPlaylist._id }
        });

        res.status(201).json(savedPlaylist);
    } catch (err) {
        console.error("Create playlist error:", err);
        res.status(500).json({ message: "Error creating playlist" });
    }
});

// PATCH /api/playlists/:playlistId - Rename (Minimal Feature)
router.patch("/:playlistId", async (req, res) => {
    try {
        const { playlistId } = req.params;
        const { name } = req.body;

        if (!name) return res.status(400).json({ message: "Name is required" });

        const playlist = await Playlist.findById(playlistId);
        if (!playlist) return res.status(404).json({ message: "Playlist not found" });

        if (String(playlist.owner) !== req.user.userId) {
            return res.status(403).json({ message: "Not authorized to modify this playlist" });
        }

        playlist.name = name;
        await playlist.save();

        res.json(playlist);
    } catch (err) {
        console.error("Rename playlist error:", err);
        res.status(500).json({ message: "Error renaming playlist" });
    }
});

// POST /api/playlists/:playlistId/songs/:songId - Add song
router.post("/:playlistId/songs/:songId", async (req, res) => {
    try {
        const { playlistId, songId } = req.params;

        const playlist = await Playlist.findById(playlistId);
        if (!playlist) return res.status(404).json({ message: "Playlist not found" });

        // Ownership check
        if (String(playlist.owner) !== req.user.userId) {
            return res.status(403).json({ message: "Not authorized to modify this playlist" });
        }

        // Prevent duplicates
        if (playlist.songs.includes(songId)) {
            return res.status(400).json({ message: "Song already in playlist" });
        }

        // Verify song exists
        const songCount = await Song.countDocuments({ _id: songId });
        if (songCount === 0) return res.status(404).json({ message: "Song not found" });

        playlist.songs.push(songId);
        await playlist.save();

        res.json(playlist);
    } catch (err) {
        console.error("Add song error:", err);
        res.status(500).json({ message: "Error adding song to playlist" });
    }
});

// DELETE /api/playlists/:playlistId/songs/:songId - Remove song
router.delete("/:playlistId/songs/:songId", async (req, res) => {
    try {
        const { playlistId, songId } = req.params;

        const playlist = await Playlist.findById(playlistId);
        if (!playlist) return res.status(404).json({ message: "Playlist not found" });

        if (String(playlist.owner) !== req.user.userId) {
            return res.status(403).json({ message: "Not authorized to modify this playlist" });
        }

        // Using filter to remove the song
        playlist.songs = playlist.songs.filter(id => String(id) !== songId);
        await playlist.save();

        res.json(playlist);
    } catch (err) {
        console.error("Remove song error:", err);
        res.status(500).json({ message: "Error removing song from playlist" });
    }
});

// DELETE /api/playlists/:playlistId - Delete playlist permanently
router.delete("/:playlistId", async (req, res) => {
    try {
        const { playlistId } = req.params;

        const playlist = await Playlist.findById(playlistId);
        if (!playlist) return res.status(404).json({ message: "Playlist not found" });

        // Ownership check
        if (String(playlist.owner) !== req.user.userId) {
            return res.status(403).json({ message: "Not authorized to delete this playlist" });
        }

        // 1. Delete the playlist document
        await Playlist.findByIdAndDelete(playlistId);

        // 2. Cleanup User Library
        await User.findByIdAndUpdate(req.user.userId, {
            $pull: { libraryPlaylists: playlistId }
        });

        res.json({ message: "Playlist deleted successfully", playlistId });
    } catch (err) {
        console.error("Delete playlist error:", err);
        res.status(500).json({ message: "Error deleting playlist" });
    }
});

module.exports = router;
