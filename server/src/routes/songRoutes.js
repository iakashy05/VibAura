import express from 'express';
import songController from '../controllers/songController.js';

const router = express.Router();

/**
 * Route definitions for Song related endpoints.
 * Version: v1
 */

router.get('/', songController.getAll);
router.get('/featured', songController.getFeatured);
router.get('/:id', songController.getById);

export default router;
