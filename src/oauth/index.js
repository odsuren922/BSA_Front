import api from '../api/axios';

/**
 * Redirect user to the OAuth login page
 */
export const redirectToOAuthLogin = () => {
  const redirectUri = encodeURIComponent(`${window.location.origin}/auth`);
  const state = generateRandomState();
  
  // Store state in localStorage to validate on return
  localStorage.setItem('oauth_state', state);
  
  // Build OAuth URL
  const authUrl = `https://auth.num.edu.mn/oauth2/oauth/authorize?client_id=${process.env.REACT_APP_OAUTH_CLIENT_ID}&response_type=code&redirect_uri=${redirectUri}&state=${state}`;
  
  // Redirect to OAuth provider
  window.location.href = authUrl;
};

/**
 * Generate a random state for CSRF protection
 */
const generateRandomState = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * Exchange authorization code for tokens
 * @param {string} code - The authorization code
 * @param {string} state - The state parameter for validation
 * @returns {Promise<Object>} - Token data
 */
export const exchangeCodeForToken = async (code, state) => {
  // Verify state matches what we stored
  const storedState = localStorage.getItem('oauth_state');
  
  if (!storedState || storedState !== state) {
    throw new Error('Invalid state parameter');
  }
  
  // Clear stored state
  localStorage.removeItem('oauth_state');
  
  try {
    // Exchange code for token
    const response = await api.post('/api/oauth/token', {
      code,
      redirect_uri: `${window.location.origin}/auth`
    });
    
    if (!response.data || !response.data.access_token) {
      throw new Error('Invalid response from server');
    }
    
    // Store tokens and user data
    localStorage.setItem('oauth_token', response.data.access_token);
    
    if (response.data.refresh_token) {
      localStorage.setItem('refresh_token', response.data.refresh_token);
    }
    
    localStorage.setItem('expires_in', response.data.expires_in?.toString() || '3600');
    localStorage.setItem('token_time', response.data.token_time?.toString() || Date.now().toString());
    
    return response.data;
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
};

/**
 * Fetch user data using the current token
 * @returns {Promise<Object>} - User data
 */
export const fetchUserData = async () => {
  try {
    const response = await api.get('/api/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw error;
  }
};

/**
 * Get the user's role information
 * @returns {Promise<Object>} - Role information
 */
export const fetchUserRole = async () => {
  try {
    const response = await api.get('/api/user/role');
    return response.data?.data || {};
  } catch (error) {
    console.error('Error fetching user role:', error);
    throw error;
  }
};

/**
 * Refresh the access token using refresh token
 * @returns {Promise<Object>} - New token data
 */
export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }
  
  try {
    const response = await api.post('/api/oauth/refresh-token', {
      refresh_token: refreshToken
    });
    
    if (!response.data || !response.data.access_token) {
      throw new Error('Invalid response from token refresh');
    }
    
    // Update stored tokens
    localStorage.setItem('oauth_token', response.data.access_token);
    
    if (response.data.refresh_token) {
      localStorage.setItem('refresh_token', response.data.refresh_token);
    }
    
    localStorage.setItem('expires_in', response.data.expires_in?.toString() || '3600');
    localStorage.setItem('token_time', response.data.token_time?.toString() || Date.now().toString());
    
    return response.data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

/**
 * Logout the user
 * @returns {Promise<boolean>} - Success status
 */
export const logout = async () => {
  try {
    // Clear all auth-related storage
    localStorage.removeItem('oauth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('expires_in');
    localStorage.removeItem('token_time');
    
    // Redirect to login
    window.location.href = '/login';
    return true;
  } catch (error) {
    console.error('Error during logout:', error);
    return false;
  }
};

/**
 * Check if token is expired or about to expire
 * @returns {boolean} - Whether token needs refresh
 */
export const isTokenExpired = () => {
  const tokenTime = localStorage.getItem('token_time');
  const expiresIn = localStorage.getItem('expires_in');
  
  if (!tokenTime || !expiresIn) {
    return true;
  }
  
  const expirationTime = parseInt(tokenTime, 10) + parseInt(expiresIn, 10) * 1000;
  const currentTime = Date.now();
  
  // Consider token expired if it's within 5 minutes of expiration
  return currentTime >= (expirationTime - 5 * 60 * 1000);
};

export default {
  redirectToOAuthLogin,
  exchangeCodeForToken,
  fetchUserData,
  fetchUserRole,
  refreshAccessToken,
  logout,
  isTokenExpired
};