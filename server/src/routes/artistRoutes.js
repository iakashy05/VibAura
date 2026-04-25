import express from 'express';
import { getArtistDetails } from '../controllers/artistController.js';

const router = express.Router();

router.get('/:id', getArtistDetails);

export default router;
