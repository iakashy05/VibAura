import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

/**
 * Creates a Razorpay order on the server.
 * Uses a separate axios instance without authentication headers since payment is public.
 */
export const createRazorpayOrder = async () => {
  const paymentApi = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const response = await paymentApi.post('/payments/order');
  return response.data;
};
