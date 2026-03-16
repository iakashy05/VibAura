require("dotenv").config();
const express = require("express");
const compression = require("compression");
const path = require("path");
const mongoose = require("mongoose");

// Models
// Use the HomepageSection model to drive ordering/titles from DB
const HomepageSection = require("../models/homePageSection");
const Song = require("../models/song");
const Artist = require("../models/artist");
const Playlist = require("../models/playlist");

// Routes
const searchRoutes = require("./routes/search");

const app = express();
const PORT = process.env.PORT || 3000;

// Minimal logging helpers (use centralized logger)
const { debug, info, warn, error } = require("./utils/logger");

// Middleware
// Enable Gzip/Brotli compression for all responses
app.use(compression());

// Request log (debug-level; no output unless DEBUG=true)
app.use((req, res, next) => {
  debug(`[REQ] ${req.method} ${req.path}`);
  next();
});

// Serve static files with 1-year browser cache for assets
const staticCacheOptions = { maxAge: "1y", etag: true };
app.use(express.static(path.join(__dirname, "../frontend/public"), staticCacheOptions));
app.use(express.static(path.join(__dirname, "../frontend"), staticCacheOptions));
app.use(express.json());

// ==================
// === API Routes ===
// ==================

app.get("/api/test", (req, res) => {
  res.json({ message: "Hello from the VibAura server!" });
});

// Debug endpoint to check database counts (keeps useful info)
app.get("/api/debug/songs-count", async (req, res) => {
  try {
    const total = await Song.countDocuments();
    const featured = await Song.countDocuments({ isFeatured: true });
    res.json({ total, featured });
  } catch (err) {
    error("Error in /api/debug/songs-count:", err);
    res.status(500).json({ error: err.message });
  }
});

// Mount search routes
const authRoutes = require("./routes/auth");
const libraryRoutes = require("./routes/library");
const playlistRoutes = require("./routes/playlist");
const historyRoutes = require("./routes/history");

app.use("/api/auth", authRoutes); // Login/Signup
app.use("/api/search", searchRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/history", historyRoutes);

// --- Songs ---
app.get("/api/songs/featured", async (req, res) => {
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

app.get("/api/songs", async (req, res) => {
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

app.get("/api/songs/:id", async (req, res) => {
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

// --- Artists ---
app.get("/api/artists/featured", async (req, res) => {
  try {
    const featuredArtists = await Artist.find({ isFeatured: true }).lean();
    res.json(featuredArtists);
  } catch (err) {
    error("Error fetching featured artists:", err);
    res.status(500).json({ message: "Error fetching featured artists" });
  }
});

app.get("/api/artists", async (req, res) => {
  try {
    const artists = await Artist.find().lean();
    res.json(artists);
  } catch (err) {
    error("Error fetching artists:", err);
    res.status(500).json({ message: "Error fetching artists" });
  }
});

app.get("/api/artists/:id", async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id).lean();
    if (!artist) return res.status(404).json({ message: "Artist not found" });
    // Populate artists field to match playlist API behavior
    const songs = await Song.find({ artists: artist._id })
      .populate({ path: 'artists', model: 'Artist' })
      .lean();
    res.json({ artist, songs });
  } catch (err) {
    error("Error fetching artist details:", err);
    res.status(500).json({ message: "Error fetching artist details" });
  }
});

// --- Playlists ---
app.get("/api/playlists", async (req, res) => {
  try {
    const playlists = await Playlist.find().lean();
    res.json(playlists);
  } catch (err) {
    error("Error fetching playlists:", err);
    res.status(500).json({ message: "Error fetching playlists" });
  }
});

app.get("/api/playlists/:id", async (req, res) => {
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

// --- Homepage sections ---
// Keep logic but reduce noise. Use debug() for optional detailed traces.
app.get("/api/homepage", async (req, res) => {
  try {
    debug("Building homepage payload");
    const payload = [];

    // Load configured homepage sections from DB (ordered)
    let sections = [];
    try {
      sections = await HomepageSection.find({ isActive: true }).sort({ order: 1 }).lean();
      debug('Homepage sections from DB:', sections.length);
    } catch (err) {
      debug('Could not load HomepageSection docs:', err.message);
      sections = [];
    }

    if (sections.length) {
      // Handlers for section types
      const handlers = {
        song: async (s) => {
          const limit = s.limit || 10;
          const cat = (s.category || '').toLowerCase();
          let query = {};
          if (!s.category || cat === 'featured' || cat === 'isfeatured') query = { isFeatured: true };
          else query = s.category ? { category: s.category } : { isFeatured: true };

          const list = await Song.find(query).limit(limit)
            .populate({ path: 'artists', model: 'Artist' })
            .lean();
          if (query.isFeatured === true && list.length < limit) {
            const needed = limit - list.length;
            const extra = await Song.find({ isFeatured: { $ne: true } }).limit(needed)
              .populate({ path: 'artists', model: 'Artist' })
              .lean();
            return extra.length ? [...list, ...extra] : list;
          }
          return list;
        },
        playlist: async (s) => {
          const limit = s.limit || 1;
          const cat = s.category || '';
          const pls = await Playlist.find(cat ? { category: cat } : {}).limit(limit).populate({
            path: 'songs', populate: [
              { path: 'artists', model: 'Artist' }
            ]
          }).lean();
          return pls;
        },
        artist: async (s) => {
          const limit = s.limit || 3;
          const cat = (s.category || '').toLowerCase();
          let query = {};
          if (!s.category || cat === 'featured' || cat === 'isfeatured') query = { isFeatured: true };
          else query = s.category ? { category: s.category } : { isFeatured: true };
          const artists = await Artist.find(query).limit(limit).lean();
          return artists;
        }
      };

      for (const s of sections) {
        const handler = handlers[s.type];
        if (!handler) {
          debug('No handler for section type', s.type);
          continue;
        }
        try {
          const data = await handler(s);
          if (data && data.length) {
            const entry = { title: s.title, type: s.type, order: s.order };
            if (s.type === 'artist') entry.items = data;
            else entry.songs = data;
            payload.push(entry);
            debug(`Loaded section from DB: ${s.title}`);
          }
        } catch (err) {
          error(`Error loading section ${s.title}:`, err.message);
        }
      }
    } else {
      // No DB-driven sections found; fall back to built-in 4-section loader
      debug('No DB sections found — using built-in loader');

      // Section 1: up to 10 featured songs, fill with regular if needed
      try {
        const featuredSongs = await Song.find({ isFeatured: true })
          .limit(10)
          .limit(10)
          .populate({ path: "artists", model: "Artist" })
          .lean();

        let section1Songs = featuredSongs;
        if (featuredSongs.length < 10) {
          const needed = 10 - featuredSongs.length;
          const regular = await Song.find({ isFeatured: { $ne: true } })
            .limit(needed)
            .limit(needed)
            .populate({ path: "artists", model: "Artist" })
            .lean();
          section1Songs = [...featuredSongs, ...regular];
        }

        if (section1Songs.length) {
          payload.push({ title: "Featured Songs", type: "song", songs: section1Songs, order: 1 });
          debug("Section 1 loaded, total:", section1Songs.length);
        }
      } catch (err) {
        error("Section 1 error:", err.message);
      }

      // Section 2 & 4: single playlists by category (Bollywood Hits, Party Hits)
      const loadPlaylistSection = async (category, title, order) => {
        try {
          const playlists = await Playlist.find({ category }).limit(1).populate({
            path: "songs",
            populate: [
              { path: "artists", model: "Artist" }
            ],
          }).lean();
          if (playlists.length) {
            payload.push({ title, type: "playlist", songs: playlists, order });
            debug(`${title} loaded, playlist songs:`, playlists[0].songs ? playlists[0].songs.length : 0);
          }
        } catch (err) {
          error(`${title} section error:`, err.message);
        }
      };

      await loadPlaylistSection("Bollywood Hits", "Bollywood Hits", 2);
      await loadPlaylistSection("Party Hits", "Party Hits", 4);

      // Section 3: featured artists (Top Artists)
      try {
        const featuredArtists = await Artist.find({ isFeatured: true, category: "Top Artists" })
          .limit(3)
          .lean();
        if (featuredArtists.length) {
          payload.push({ title: "Featured Artists", type: "artist", items: featuredArtists, order: 3 });
          debug("Section 3 loaded, count:", featuredArtists.length);
        }
      } catch (err) {
        error("Section 3 error:", err.message);
      }
    }

    // Ensure payload is ordered by `order` field (defensive)
    payload.sort((a, b) => (a.order || 0) - (b.order || 0));

    info("Homepage sections:", payload.length);
    res.json(payload);
  } catch (err) {
    error("Error building homepage payload:", err);
    res.status(500).json({ message: "Could not build homepage content" });
  }
});

// ==================
// === Start Server ===
// ==================

async function startServer() {
  try {
    const mongoUri = process.env.DB_URI;
    if (!mongoUri) throw new Error("DB_URI environment variable is not set");

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: false,
      writeConcern: { w: 1 },
    });
    info("Connected to MongoDB");

    let currentPort = Number(process.env.PORT || 3000) || 3000;
    const host = "0.0.0.0";

    while (true) {
      try {
        const server = await new Promise((resolve, reject) => {
          const s = app.listen(currentPort, host, () => resolve(s));
          s.on("error", (err) => reject(err));
        });

        info(`VibAura server is running on http://localhost:${currentPort}`);
        process.env.PORT = String(currentPort);
        break;
      } catch (err) {
        if (err && err.code === "EADDRINUSE") {
          info(`Port ${currentPort} in use, trying ${currentPort + 1}`);
          currentPort += 1;
          await new Promise((r) => setTimeout(r, 200));
          continue;
        }
        throw err;
      }
    }
  } catch (err) {
    error("Failed to start server:", err);
    process.exit(1);
  }
}

// Process event handlers (minimal)
process.on("uncaughtException", (err) => {
  error("Uncaught Exception:", err);
  process.exit(1);
});
process.on("unhandledRejection", (reason, promise) => {
  error("Unhandled Rejection at:", promise, "reason:", reason);
});
process.on("SIGINT", () => {
  info("SIGINT received - exiting");
  process.exit(0);
});
process.on("SIGTERM", () => {
  info("SIGTERM received - exiting");
  process.exit(0);
});

startServer();
info("Server startup initiated");