require("dotenv").config();
const express = require("express");
const compression = require("compression");
const path = require("path");
const mongoose = require("mongoose");

// Routes
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

// Serve static files (Disabled 1y cache for development to prevent stale UI)
const staticCacheOptions = { maxAge: 0, etag: true };
app.use(express.static(path.join(__dirname, "../frontend/public"), staticCacheOptions));
app.use(express.static(path.join(__dirname, "../frontend"), staticCacheOptions));
app.use(express.json());

// ==================
// === API Routes ===
// ==================

const authRoutes = require("./routes/auth");
const searchRoutes = require("./routes/search");
const libraryRoutes = require("./routes/library");
const playlistRoutes = require("./routes/playlist");
const historyRoutes = require("./routes/history");
const songRoutes = require("./routes/songs");
const artistRoutes = require("./routes/artists");
const homepageRoutes = require("./routes/homepage");

app.use("/api/auth", authRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/artists", artistRoutes);
app.use("/api/homepage", homepageRoutes);

// ==================
// === Start Server ===
// ==================

async function startServer() {
  try {
    const mongoUri = process.env.DB_URI;
    if (!mongoUri) throw new Error("DB_URI is not set in environment variables");

    await mongoose.connect(mongoUri);
    info("Connected to MongoDB");

    let currentPort = Number(process.env.PORT || 3000);
    const host = "0.0.0.0";

    const server = app.listen(currentPort, host, () => {
      info(`VibAura server running at http://localhost:${currentPort}`);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        warn(`Port ${currentPort} is busy, please try another port or kill the process.`);
      } else {
        error("Server error:", err);
      }
    });

  } catch (err) {
    error("Critical: Failed to start server:", err);
    process.exit(1);
  }
}

// Process event handlers
process.on("uncaughtException", (err) => { error("Uncaught Exception:", err); process.exit(1); });
process.on("unhandledRejection", (reason) => { error("Unhandled Rejection:", reason); });
process.on("SIGINT", () => { info("Server shutting down (SIGINT)"); process.exit(0); });

startServer();