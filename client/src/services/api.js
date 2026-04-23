import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

/**
 * Optimized API service for VibAura server.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to inject JWT
api.interceptors.request.use(
  (config) => {
    // We get the token from local storage directly to ensure it's fresh
    // The Zustand store also syncs with this
    const authData = JSON.parse(localStorage.getItem('vibaura-auth'));
    const token = authData?.state?.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state if unauthorized
      localStorage.removeItem('vibaura-auth');
      // Trigger auth redirect (handled in App.jsx via store subscription)
      window.dispatchEvent(new Event('vibaura-unauthorized'));
    }
    return Promise.reject(error);
  }
);

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
