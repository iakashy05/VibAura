import api from './api';

/**
 * Service to handle authentication API calls.
 */
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Login failed' };
  }
};

export const signup = async (name, email, password) => {
  try {
    const response = await api.post('/auth/signup', { name, email, password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Signup failed' };
  }
};

export const getMe = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch user data' };
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to send OTP' };
  }
};

export const verifyOTP = async (email, otp) => {
  try {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Invalid OTP' };
  }
};

export const resetPassword = async (email, otp, newPassword) => {
  try {
    const response = await api.post('/auth/reset-password', { email, otp, newPassword });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to reset password' };
  }
};
