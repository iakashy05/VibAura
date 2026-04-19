import express from 'express';
import discoveryController from '../controllers/discoveryController.js';

const router = express.Router();

/**
 * Route definitions for Homepage/Discovery.
 */
router.get('/', discoveryController.getHome);

export default router;
