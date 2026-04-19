import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api/v1';

/**
 * Optimized API service for VibAura server.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const checkServerHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('❌ Server Connection Error:', error.message);
    return { status: 'offline', message: error.message };
  }
};

export default api;
