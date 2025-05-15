import axios from 'axios';

// Backend API URLs
const API_URL = 'http://127.0.0.1:8000';
const OAUTH_REDIRECT_URL = `${API_URL}/oauth/redirect`;
const OAUTH_TOKEN_URL = `${API_URL}/api/oauth/exchange-token`;
const OAUTH_REFRESH_URL = `${API_URL}/api/oauth/refresh-token`;
const USER_DATA_URL = `${API_URL}/api/user`;

// Configure axios instance with CSRF handling
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for CSRF cookie
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

// Request interceptor
api.interceptors.request.use(async (config) => {
  // Add token to Authorization header if available
  const token = localStorage.getItem('oauth_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Get CSRF token for non-GET requests
  if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
    try {
      await axios.get(`${API_URL}/sanctum/csrf-cookie`, { 
        withCredentials: true,
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
    } catch (error) {
      console.error('Failed to get CSRF token:', error);
    }
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Avoid infinite retry loops
    if (originalRequest._retry) {
      return Promise.reject(error);
    }
    
    // If unauthorized and we have a refresh token, try to refresh
    if (error.response?.status === 401 && localStorage.getItem('refresh_token')) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        
        // Use direct axios instead of api instance to avoid potential circular dependencies
        const response = await axios.post(`${API_URL}/api/oauth/refresh-token`, 
          { refresh_token: refreshToken },
          { 
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'X-Requested-With': 'XMLHttpRequest'
            },
            withCredentials: true 
          }
        );
        
        if (response.data?.access_token) {
          // Update stored tokens
          localStorage.setItem('oauth_token', response.data.access_token);
          
          if (response.data.refresh_token) {
            localStorage.setItem('refresh_token', response.data.refresh_token);
          }
          
          localStorage.setItem('expires_in', response.data.expires_in.toString());
          localStorage.setItem('token_time', response.data.token_time.toString());
          
          // Update Authorization header and retry the request
          originalRequest.headers['Authorization'] = `Bearer ${response.data.access_token}`;
          return axios(originalRequest);
        } else {
          throw new Error('Invalid token response');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Clear tokens on refresh failure
        localStorage.removeItem('oauth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('expires_in');
        localStorage.removeItem('token_time');
        
        // Redirect to login
        window.location.href = '/login?error=session_expired';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * Redirect the user to OAuth login page
 */
export const redirectToOAuthLogin = () => {
  // Redirect user to backend's OAuth redirect endpoint
  window.location.href = OAUTH_REDIRECT_URL;
};

/**
 * Fetch user data with the current access token
 * @returns {Promise<Object>} - User data
 */
export const fetchUserData = async () => {
  try {
    const token = localStorage.getItem('oauth_token');
    console.log("userfetch data");
    if (!token) {
      throw new Error('No access token available');
    }
    
    // Use direct axios request with explicit headers
    const response = await axios.get(USER_DATA_URL, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      withCredentials: true
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    throw error;
  }
};

/**
 * Refresh the access token
 * @returns {Promise<boolean>} - Success state
 */
export const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      return false;
    }
    
    // Use direct axios request with explicit headers
    const response = await axios.post(OAUTH_REFRESH_URL, 
      { refresh_token: refreshToken },
      { 
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        withCredentials: true 
      }
    );
    
    if (response.data && response.data.access_token) {
      // Update tokens in localStorage
      localStorage.setItem('oauth_token', response.data.access_token);
      
      if (response.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token);
      }
      
      localStorage.setItem('expires_in', response.data.expires_in.toString());
      localStorage.setItem('token_time', response.data.token_time.toString());
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return false;
  }
};

/**
 * Check if the current token is expired
 * @returns {boolean} - Is token expired
 */
export const isTokenExpired = () => {
  const tokenTime = parseInt(localStorage.getItem('token_time') || '0', 10);
  const expiresIn = parseInt(localStorage.getItem('expires_in') || '3600', 10);
  const currentTime = Math.floor(Date.now() / 1000);
  
  // Token is expired if the current time is past the expiration time
  return currentTime >= (tokenTime + expiresIn);
};

/**
 * Check if token is about to expire (within 5 minutes)
 * @returns {boolean} - Is token about to expire
 */
export const isTokenExpiring = () => {
  const tokenTime = parseInt(localStorage.getItem('token_time') || '0', 10);
  const expiresIn = parseInt(localStorage.getItem('expires_in') || '3600', 10);
  const currentTime = Math.floor(Date.now() / 1000);
  
  // Token is expiring if less than 5 minutes remain
  return (tokenTime + expiresIn - currentTime) < 300;
};

/**
 * Check current OAuth status and refresh token if needed
 * @returns {Promise<Object|null>} - User data or null if not authenticated
 */
export const checkOAuthStatus = async () => {
  try {
    // Check if we have a token
    const token = localStorage.getItem('oauth_token');
    
    if (!token) {
      console.log('No token found in localStorage');
      return null;
    }
    
    // If token is expired, try to refresh it
    if (isTokenExpired()) {
      console.log('Token is expired, attempting to refresh');
      const refreshSuccess = await refreshAccessToken();
      
      if (!refreshSuccess) {
        // Clear invalid tokens
        console.log('Token refresh failed, clearing tokens');
        localStorage.removeItem('oauth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('expires_in');
        localStorage.removeItem('token_time');
        return null;
      }
    }
    // If token is about to expire, refresh in background
    else if (isTokenExpiring()) {
      console.log('Token is about to expire, refreshing in background');
      refreshAccessToken().catch(console.error);
    }
    
    // Fetch and return user data
    console.log('Fetching user data with token');
    return await fetchUserData();
  } catch (error) {
    console.error('OAuth status check failed:', error);
    return null;
  }
};

/**
 * Logout - Clear tokens and invalidate session
 * @returns {Promise<boolean>} - Success state
 */
export const logoutOAuth = async () => {
  try {
    // Call logout API endpoint if available
    await axios.post(`${API_URL}/logout`, {}, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('oauth_token')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      withCredentials: true
    });
  } catch (error) {
    console.error('Logout API call failed:', error);
    // Continue with client-side logout even if API call fails
  }
  
  // Clear tokens regardless of API call success
  localStorage.removeItem('oauth_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('expires_in');
  localStorage.removeItem('token_time');
  
  return true;
};

export default api;