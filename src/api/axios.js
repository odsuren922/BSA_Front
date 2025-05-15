// src/api/axios.js - Modified version with improved auth handling

import axios from 'axios';
import authService from '../services/authService';

const API_URL = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest' // Required for Sanctum
  },
  withCredentials: true // Required for Sanctum cookies
});

// Request Interceptor - With improved CSRF and token handling
api.interceptors.request.use(
  async config => {
    // Add authorization token if available - use authService instead of direct localStorage
    const token = authService.getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
   
    // Get CSRF token for state-changing methods
    if (['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
      try {
        await authService.getCsrfToken();
      } catch (err) {
        console.error('Failed to fetch CSRF cookie:', err);
      }
    }

    return config;
  },
  error => {
    console.error('API request error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor - With improved token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    if (error.response && error.response.status === 401) {
      originalRequest._retry = true;

      try {
        // Use authService to refresh token
        const refreshSuccess = await authService.refreshToken();
        
        if (refreshSuccess) {
          // Get fresh token and retry request
          const token = authService.getToken();
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          originalRequest.headers['Authorization'] = `Bearer ${token}`;

          return api(originalRequest);
        } else {
          // Clear auth and notify
          authService.clearAuth();
          window.dispatchEvent(new CustomEvent('auth:failed'));
          
          if (typeof api.onAuthFailure === 'function') {
            api.onAuthFailure();
          } else {
            window.location.href = '/login?error=session_expired';
          }
          
          return Promise.reject(error);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        authService.clearAuth();
        
        window.dispatchEvent(new CustomEvent('auth:failed'));

        if (typeof api.onAuthFailure === 'function') {
          api.onAuthFailure();
        } else {
          window.location.href = '/login?error=session_expired';
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Helper methods
const enhancedApi = {
  get: async (url, config = {}) => {
    try {
      // Refresh token if needed before making request
      await authService.refreshTokenIfNeeded();
      return await api.get(url, config);
    } catch (error) {
      console.error(`API GET request to ${url} failed:`, error);
      throw error;
    }
  },
  
  
  post: async (url, data = {}, config = {}) => {
    try {
      // Get CSRF token first
      await authService.getCsrfToken();
      // Refresh token if needed
      await authService.refreshTokenIfNeeded();
      return await api.post(url, data, config);
    } catch (error) {
      console.error(`API POST request to ${url} failed:`, error);
      throw error;
    }
  },
  
  put: async (url, data = {}, config = {}) => {
    try {
      // Get CSRF token first
      await authService.getCsrfToken();
      // Refresh token if needed
      await authService.refreshTokenIfNeeded();
      return await api.put(url, data, config);
    } catch (error) {
      console.error(`API PUT request to ${url} failed:`, error);
      throw error;
    }
  },
  
  delete: async (url, config = {}) => {
    try {
      // Get CSRF token first
      await authService.getCsrfToken();
      // Refresh token if needed
      await authService.refreshTokenIfNeeded();
      return await api.delete(url, config);
    } catch (error) {
      console.error(`API DELETE request to ${url} failed:`, error);
      throw error;
    }
  },

  instance: api,
  setAuthFailureHandler: (callback) => {
    api.onAuthFailure = callback;
  }
};

export default enhancedApi;