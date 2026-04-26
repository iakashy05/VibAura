import express from 'express';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authenticateToken);
router.post('/order', createOrder);
router.post('/verify', verifyPayment);

export default router;
