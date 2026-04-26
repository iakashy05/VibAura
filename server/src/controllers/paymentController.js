import Razorpay from 'razorpay';
import asyncHandler from '../utils/asyncHandler.js';
import User from '../models/User.js';

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
    receipt: `rcpt_${req.user.id.slice(-6)}_${Date.now()}`,
    payment_capture: 1,
    notes: {
      userId: req.user.id,
      email: req.user.email,
    },
  });

  res.status(201).json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    key: process.env.RAZORPAY_KEY_ID,
  });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  // In a real app, you would verify the signature here using crypto:
  // const generated_signature = crypto.createHmac('sha256', secret).update(order_id + "|" + payment_id).digest('hex');
  
  // For the "Better Dummy" version, we simulate a delay and then succeed
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Update user subscription status
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { isSubscribed: true },
    { new: true }
  );

  res.status(200).json({
    success: true,
    message: 'Payment verified and subscription activated.',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      isSubscribed: user.isSubscribed
    }
  });
});
