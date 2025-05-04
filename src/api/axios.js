import axios from 'axios';

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

const getCsrfToken = async () => {
  try {
    await axios.get(`${API_URL}/sanctum/csrf-cookie`, { 
      withCredentials: true,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    return true;
  } catch (error) {
    console.error('Error getting CSRF token:', error);
    return false;
  }
};

// Request Interceptor - With improved CSRF handling
api.interceptors.request.use(
  async config => {
    // Add authorization token if available
    const token = localStorage.getItem('oauth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
   
    // Get CSRF token for state-changing methods
    if (['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
      try {
        await axios.get(`${API_URL}/sanctum/csrf-cookie`, { withCredentials: true });
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
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token available');

        const response = await axios.post(`${API_URL}/api/oauth/refresh-token`, {
          refresh_token: refreshToken
        }, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        });

        if (response.data?.access_token) {
          localStorage.setItem('oauth_token', response.data.access_token);
          if (response.data.refresh_token) {
            localStorage.setItem('refresh_token', response.data.refresh_token);
          }
          localStorage.setItem('expires_in', response.data.expires_in.toString());
          localStorage.setItem('token_time', response.data.token_time.toString());

          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
          originalRequest.headers['Authorization'] = `Bearer ${response.data.access_token}`;

          return api(originalRequest);
        } else {
          throw new Error('Failed to refresh token: invalid response');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('oauth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('expires_in');
        localStorage.removeItem('token_time');

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
      return await api.get(url, config);
    } catch (error) {
      console.error(`API GET request to ${url} failed:`, error);
      throw error;
    }
  },
  
  post: async (url, data = {}, config = {}) => {
    try {
      return await api.post(url, data, config);
    } catch (error) {
      console.error(`API POST request to ${url} failed:`, error);
      throw error;
    }
  },
  
  put: async (url, data = {}, config = {}) => {
    try {
      return await api.put(url, data, config);
    } catch (error) {
      console.error(`API PUT request to ${url} failed:`, error);
      throw error;
    }
  },
  
  delete: async (url, config = {}) => {
    try {
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