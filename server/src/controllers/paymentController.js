import Razorpay from 'razorpay';
import asyncHandler from '../utils/asyncHandler.js';

let razorpayInstance = null;

const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials are not configured in environment variables.');
    }
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
};

export const createOrder = asyncHandler(async (req, res) => {
  const razorpay = getRazorpayInstance();

  const order = await razorpay.orders.create({
    amount: 1000, // ₹10 in paise
    currency: 'INR',
    receipt: `receipt_${req.user?.id || 'guest'}_${Date.now()}`,
    payment_capture: 1,
    notes: {
      userId: req.user?.id || 'guest',
      email: req.user?.email || 'guest@example.com',
    },
  });

  res.status(201).json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    key: process.env.RAZORPAY_KEY_ID,
  });
});
