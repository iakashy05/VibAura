const express = require("express");
const router = express.Router();
const Song = require("../../models/song");
const { error } = require("../utils/logger");

// GET /api/songs/featured - Fetch featured songs
router.get("/featured", async (req, res) => {
  try {
    const featuredSongs = await Song.find({ isFeatured: true })
      .populate({ path: "artists", model: "Artist" })
      .lean();
    res.json(featuredSongs);
  } catch (err) {
    error("Error fetching featured songs:", err);
    res.status(500).json({ message: "Error fetching featured songs" });
  }
});

// GET /api/songs - Fetch all songs
router.get("/", async (req, res) => {
  try {
    const songs = await Song.find()
      .populate({ path: "artists", model: "Artist" })
      .lean();
    res.json(songs);
  } catch (err) {
    error("Error fetching songs:", err);
    res.status(500).json({ message: "Error fetching songs" });
  }
});

// GET /api/songs/:id - Fetch song by ID
router.get("/:id", async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate({ path: "artists", model: "Artist" })
      .lean();
    if (!song) return res.status(404).json({ message: "Song not found" });
    res.json(song);
  } catch (err) {
    error("Error fetching song:", err);
    res.status(500).json({ message: "Error fetching song" });
  }
});

module.exports = router;
