import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  },
  withCredentials: true // Required for CSRF cookie and session support
});

// Get CSRF cookie - important for working with Sanctum
const getCSRFToken = async () => {
  try {
    await api.get('/sanctum/csrf-cookie');
    return true;
  } catch (error) {
    console.error('Error getting CSRF token:', error);
    return false;
  }
};

// Request interceptor
api.interceptors.request.use(
  async config => {
    // Get token from localStorage
    const token = localStorage.getItem('oauth_token');
    
    // If token exists, add it to Authorization header
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // For mutation requests (non-GET), ensure we have CSRF token
    if (['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
      await getCSRFToken();
    }

    return config;
  },
  error => {
    console.error('API request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor with token refresh logic
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Prevent infinite loops - don't retry already-retried requests
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // Check if error is due to an expired token (401 Unauthorized)
    if (error.response && error.response.status === 401) {
      originalRequest._retry = true;

      try {
        // Get the refresh token
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Try to refresh the token
        const response = await axios.post('http://127.0.0.1:8000/api/oauth/refresh-token', {
          refresh_token: refreshToken
        }, {
          withCredentials: true
        });

        // If refresh successful, update stored tokens
        if (response.data?.access_token) {
          localStorage.setItem('oauth_token', response.data.access_token);
          
          if (response.data.refresh_token) {
            localStorage.setItem('refresh_token', response.data.refresh_token);
          }
          
          localStorage.setItem('expires_in', response.data.expires_in.toString());
          localStorage.setItem('token_time', response.data.token_time.toString());

          // Update auth headers and retry the original request
          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
          originalRequest.headers['Authorization'] = `Bearer ${response.data.access_token}`;

          return api(originalRequest);
        } else {
          throw new Error('Failed to refresh token: invalid response');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Clean up invalid tokens
        localStorage.removeItem('oauth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('expires_in');
        localStorage.removeItem('token_time');

        // Trigger event for auth failure
        window.dispatchEvent(new CustomEvent('auth:failed'));

        // Try to redirect to login
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

// Register a custom auth failure handler
api.setAuthFailureHandler = (callback) => {
  api.onAuthFailure = callback;
};

// Log API errors for debugging
const logError = (method, url, error) => {
  console.error(`API ${method} request to ${url} failed:`, 
    error.response ? {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers
    } : error.message);
};

// Simplified API methods with error logging
const enhancedApi = {
  get: async (url, config = {}) => {
    try {
      return await api.get(url, config);
    } catch (error) {
      logError('GET', url, error);
      throw error;
    }
  },
  
  post: async (url, data = {}, config = {}) => {
    try {
      return await api.post(url, data, config);
    } catch (error) {
      logError('POST', url, error);
      throw error;
    }
  },
  
  put: async (url, data = {}, config = {}) => {
    try {
      return await api.put(url, data, config);
    } catch (error) {
      logError('PUT', url, error);
      throw error;
    }
  },
  
  delete: async (url, config = {}) => {
    try {
      return await api.delete(url, config);
    } catch (error) {
      logError('DELETE', url, error);
      throw error;
    }
  },

  // Expose the base instance and auth handler setter
  instance: api,
  setAuthFailureHandler: api.setAuthFailureHandler
};

export default enhancedApi;