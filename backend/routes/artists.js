const express = require("express");
const router = express.Router();
const Artist = require("../../models/artist");
const Song = require("../../models/song");
const { error } = require("../utils/logger");

// GET /api/artists/featured - Fetch featured artists
router.get("/featured", async (req, res) => {
  try {
    const featuredArtists = await Artist.find({ isFeatured: true }).lean();
    res.json(featuredArtists);
  } catch (err) {
    error("Error fetching featured artists:", err);
    res.status(500).json({ message: "Error fetching featured artists" });
  }
});

// GET /api/artists - Fetch all artists
router.get("/", async (req, res) => {
  try {
    const artists = await Artist.find().lean();
    res.json(artists);
  } catch (err) {
    error("Error fetching artists:", err);
    res.status(500).json({ message: "Error fetching artists" });
  }
});

// GET /api/artists/:id - Fetch artist details and their songs
router.get("/:id", async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id).lean();
    if (!artist) return res.status(404).json({ message: "Artist not found" });
    
    // Populate artists field in songs to match playlist API behavior
    const songs = await Song.find({ artists: artist._id })
      .populate({ path: 'artists', model: 'Artist' })
      .lean();
    res.json({ artist, songs });
  } catch (err) {
    error("Error fetching artist details:", err);
    res.status(500).json({ message: "Error fetching artist details" });
  }
});

module.exports = router;
