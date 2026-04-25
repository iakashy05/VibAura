import express from 'express';
import searchController from '../controllers/searchController.js';

const router = express.Router();

/**
 * Route: GET /api/v1/search?q=<query>
 * Description: Search for songs, artists, and playlists
 */
router.get('/', searchController.search);

export default router;
