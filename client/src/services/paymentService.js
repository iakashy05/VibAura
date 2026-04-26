import api from './api';

/**
 * Creates a Razorpay order on the server.
 */
export const createRazorpayOrder = async () => {
  const response = await api.post('/payments/order');
  return response.data;
};

/**
 * Verifies the Razorpay payment on the server.
 */
export const verifyRazorpayPayment = async (paymentData) => {
  const response = await api.post('/payments/verify', paymentData);
  return response.data;
};
