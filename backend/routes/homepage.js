const express = require("express");
const router = express.Router();
const HomepageSection = require("../../models/homePageSection");
const Song = require("../../models/song");
const Artist = require("../../models/artist");
const Playlist = require("../../models/playlist");
const { debug, error, info } = require("../utils/logger");

// GET /api/homepage - Complex logic to build homepage payload
router.get("/", async (req, res) => {
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
          .populate({ path: "artists", model: "Artist" })
          .lean();

        let section1Songs = featuredSongs;
        if (featuredSongs.length < 10) {
          const needed = 10 - featuredSongs.length;
          const regular = await Song.find({ isFeatured: { $ne: true } })
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

module.exports = router;
