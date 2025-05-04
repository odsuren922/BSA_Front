import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    
    // Set up request interceptor
    this.api.interceptors.request.use(
      async (config) => {
        // Add auth token if available
        const token = this.getToken();
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
      },
      (error) => Promise.reject(error)
    );
    
    // Set up response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          // Try to refresh the token
          const refreshSuccess = await this.refreshToken().catch(() => false);
          
          if (refreshSuccess) {
            // Retry the original request with new token
            const token = this.getToken();
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return this.api(originalRequest);
          } else {
            // Clear auth state and notify app
            this.clearAuth();
            this.notifyAuthFailure();
          }
        }
        
        return Promise.reject(error);
      }
    );
    
    // Bind event listeners for multi-tab support
    this.setupEventListeners();
  }
  
  /**
   * Set up event listeners for multi-tab support
   */
  setupEventListeners() {
    // Listen for storage events (for multi-tab support)
    window.addEventListener('storage', (e) => {
      if (e.key === 'auth_state' && !e.newValue) {
        // Auth state was cleared in another tab
        this.notifyAuthFailure();
      }
    });
  }
  
  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.getAuthState();
  }
  
  /**
   * Get current auth state
   * @returns {Object|null}
   */
  getAuthState() {
    try {
      const authState = localStorage.getItem('auth_state');
      return authState ? JSON.parse(authState) : null;
    } catch (e) {
      console.error('Failed to parse auth state:', e);
      return null;
    }
  }
  
  /**
   * Get access token
   * @returns {string|null}
   */
  getToken() {
    const authState = this.getAuthState();
    return authState?.token || null;
  }
  
  /**
   * Get user data
   * @returns {Object|null}
   */
  getUser() {
    const authState = this.getAuthState();
    return authState?.user || null;
  }
  
  /**
   * Set auth state
   * @param {Object} authState
   */
  setAuthState(authState) {
    localStorage.setItem('auth_state', JSON.stringify(authState));
    
    // Dispatch event for any listeners
    window.dispatchEvent(new CustomEvent('auth:changed', { detail: authState }));
  }
  
  /**
   * Clear auth state
   */
  clearAuth() {
    localStorage.removeItem('auth_state');
    
    // Dispatch event for any listeners
    window.dispatchEvent(new CustomEvent('auth:changed', { detail: null }));
  }
  
  /**
   * Notify app about auth failure
   */
  notifyAuthFailure() {
    window.dispatchEvent(new CustomEvent('auth:failure', {
      detail: { message: 'Your session has expired. Please log in again.' }
    }));
  }
  
  /**
   * Exchange authorization code for token
   * @param {string} code
   * @param {string|null} state
   * @param {string|null} redirectUri
   * @returns {Promise<Object>}
   */
  async exchangeCodeForToken(code, state = null, redirectUri = null) {
    try {
      const response = await this.api.post('/api/oauth/exchange-token', {
        code,
        state,
        redirect_uri: redirectUri
      });
      
      if (!response.data?.access_token) {
        throw new Error('Invalid token response');
      }
      
      // Store auth state
      this.setAuthState({
        token: response.data.access_token,
        refreshToken: response.data.refresh_token,
        tokenExpiry: Date.now() + (response.data.expires_in * 1000),
        user: response.data.user
      });
      
      return response.data;
    } catch (error) {
      console.error('Failed to exchange code for token:', error);
      throw error;
    }
  }
  
  /**
   * Refresh the token
   * @returns {Promise<boolean>}
   */
  async refreshToken() {
    try {
      const authState = this.getAuthState();
      if (!authState?.refreshToken) {
        return false;
      }
      
      const response = await axios.post(`${API_URL}/api/oauth/refresh-token`, {
        refresh_token: authState.refreshToken
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      if (!response.data?.access_token) {
        return false;
      }
      
      // Update auth state
      this.setAuthState({
        ...authState,
        token: response.data.access_token,
        refreshToken: response.data.refresh_token || authState.refreshToken,
        tokenExpiry: Date.now() + (response.data.expires_in * 1000)
      });
      
      return true;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return false;
    }
  }
  
  /**
   * Refresh token if it's about to expire
   * @param {number} bufferMs Time in ms before expiry to refresh (default: 5 minutes)
   * @returns {Promise<boolean>}
   */
  async refreshTokenIfNeeded(bufferMs = 5 * 60 * 1000) {
    const authState = this.getAuthState();
    if (!authState) {
      return false;
    }
    
    const timeToExpiry = authState.tokenExpiry - Date.now();
    
    if (timeToExpiry < bufferMs) {
      return await this.refreshToken();
    }
    
    return true;
  }
  
  /**
   * Fetch user data
   * @returns {Promise<Object>}
   */
  async fetchUserData() {
    try {
      const response = await this.api.get('/api/user');
      
      // Update auth state with user data
      const authState = this.getAuthState();
      if (authState) {
        this.setAuthState({
          ...authState,
          user: response.data
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      throw error;
    }
  }
  
  /**
   * Login with redirect to OAuth provider
   */
  async login() {
    try {
      // Get CSRF cookie
      await axios.get(`${API_URL}/sanctum/csrf-cookie`, {
        withCredentials: true,
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      // Redirect to OAuth login
      window.location.href = `${API_URL}/oauth/redirect`;
    } catch (error) {
      console.error('Failed to initiate login:', error);
      throw error;
    }
  }
  
  /**
   * Logout user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await this.api.post('/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      this.clearAuth();
    }
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;