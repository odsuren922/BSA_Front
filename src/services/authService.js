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
                console.debug('Preparing request:', config.url);

                // Add auth token if available
                const token = this.getToken();
                if (token) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                }

                // Get CSRF token for non-GET requests
                if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
                    try {
                        console.debug('Getting CSRF cookie for non-GET request');
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
            (error) => {
                console.error('Request preparation error:', error);
                return Promise.reject(error);
            }
        );

        // Set up response interceptor
        this.api.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                console.debug('Response error:', error.message, 'Status:', error.response?.status);

                if (error.response?.status === 401 && !originalRequest._retry) {
                    console.debug('Attempting to refresh token after 401 response');
                    originalRequest._retry = true;

                    // Try to refresh the token
                    try {
                        const refreshSuccess = await this.refreshToken();

                        if (refreshSuccess) {
                            console.debug('Token refresh successful, retrying original request');

                            // Retry the original request with new token
                            const token = this.getToken();
                            originalRequest.headers['Authorization'] = `Bearer ${token}`;
                            return this.api(originalRequest);
                        } else {
                            console.debug('Token refresh failed, clearing auth state');

                            // Clear auth state and notify app
                            this.clearAuth();
                            this.notifyAuthFailure();
                        }
                    } catch (refreshError) {
                        console.error('Token refresh error:', refreshError);

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

        console.debug('AuthService initialized');
    }

    /**
     * Set up event listeners for multi-tab support
     */
    setupEventListeners() {
        // Listen for storage events (for multi-tab support)
        window.addEventListener('storage', (e) => {
            if (e.key === 'auth_state' && !e.newValue) {
                console.debug('Auth state cleared in another tab');
                this.notifyAuthFailure();
            }
        });
    }

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        const authState = this.getAuthState();
        const isAuth = !!authState;

        console.debug('Authentication check:', isAuth);

        return isAuth;
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
        console.debug('Setting auth state:', { ...authState, token: '***REDACTED***' });

        localStorage.setItem('auth_state', JSON.stringify(authState));

        // Dispatch event for any listeners
        window.dispatchEvent(new CustomEvent('auth:changed', { detail: authState }));
    }

    /**
     * Clear auth state
     */
    clearAuth() {
        console.debug('Clearing auth state');

        localStorage.removeItem('auth_state');

        // Dispatch event for any listeners
        window.dispatchEvent(new CustomEvent('auth:changed', { detail: null }));
    }

    /**
     * Notify app about auth failure
     */
    notifyAuthFailure() {
        console.debug('Notifying about auth failure');

        window.dispatchEvent(new CustomEvent('auth:failure', {
            detail: { message: 'Your session has expired. Please log in again.' }
        }));
    }

    /**
     * Exchange authorization code for token
     * @param {string} code
     * @param {string|null} state
     * @param {string|null} redirectUri
     * @param {string|null} requestId For log correlation
     * @returns {Promise<Object>}
     */
    async exchangeCodeForToken(code, state = null, redirectUri = null, requestId = null) {
        const logId = requestId || Math.random().toString(36).substring(2, 10);
        console.debug(`[Auth-${logId}] Exchanging code for token`);

        try {
            const response = await axios.post(`${API_URL}/api/oauth/exchange-token`, {
                code,
                state,
                redirect_uri: redirectUri,
                request_id: logId, // Send to backend for correlation
                timestamp: new Date().toISOString()
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-Request-ID': logId
                }
            });
    
            console.debug(`[Auth-${logId}] Token exchange response received`, {
                status: response.status,
                hasAccessToken: !!response.data?.access_token,
                hasUserData: !!response.data?.user
            });

            if (!response.data?.access_token) {
                throw new Error('Invalid token response: missing access_token');
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
            // Error handling with improved logging
            console.error(`[Auth-${logId}] Failed to exchange code for token:`, error);
            
            // Enhance error logging
            const errorDetails = {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                timestamp: new Date().toISOString(),
                requestId: logId
            };

            console.error(`[Auth-${logId}] Token exchange error details:`, errorDetails);
            throw error;
        }
    }

    /**
     * Refresh the token
     * @returns {Promise<boolean>}
     */
    async refreshToken() {
        console.debug('Attempting to refresh token');

        try {
            const authState = this.getAuthState();
            if (!authState?.refreshToken) {
                console.debug('No refresh token available');
                return false;
            }

            console.debug('Sending refresh token request');

            const response = await axios.post(`${API_URL}/api/oauth/refresh-token`, {
                refresh_token: authState.refreshToken,
                timestamp: new Date().toISOString() // Add timestamp to help debug timing issues
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            console.debug('Refresh token response received', {
                status: response.status,
                hasAccessToken: !!response.data?.access_token
            });

            if (!response.data?.access_token) {
                console.error('Invalid refresh token response', response.data);
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

            // Provide more context in errors
            const errorDetails = {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                timestamp: new Date().toISOString()
            };

            console.error('Token refresh error details:', errorDetails);

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
        console.debug(`Token expiry check: ${timeToExpiry}ms remaining (buffer: ${bufferMs}ms)`);

        if (timeToExpiry < bufferMs) {
            console.debug('Token is about to expire, refreshing');
            return await this.refreshToken();
        }

        return true;
    }

    /**
     * Fetch user data
     * @returns {Promise<Object>}
     */
    async fetchUserData() {
        console.debug('Fetching user data');

        try {
            // Check if token needs refresh first
            await this.refreshTokenIfNeeded();

            const response = await this.api.get('/api/user', {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'If-None-Match': '', // Prevent 304 responses
                    'X-Timestamp': new Date().toISOString() // Help debug timing issues
                }
            });

            console.debug('User data received', {
                hasData: !!response.data,
                status: response.status
            });

            // Update auth state with user data
            const authState = this.getAuthState();
            if (authState && response.data) {
                this.setAuthState({
                    ...authState,
                    user: response.data
                });
            }

            return response.data;
        } catch (error) {
            console.error('Failed to fetch user data:', error);

            // Provide more context in errors
            const errorDetails = {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                timestamp: new Date().toISOString()
            };

            console.error('User data fetch error details:', errorDetails);

            throw error;
        }
    }

    /**
     * Login with redirect to OAuth provider
     */
    async login() {
        console.debug('Initiating login process');

        try {
            // Get CSRF cookie
            await axios.get(`${API_URL}/sanctum/csrf-cookie`, {
                withCredentials: true,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            console.debug('CSRF cookie obtained, redirecting to OAuth provider');

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
        console.debug('Logging out user');

        try {
            await this.api.post('/logout', {
                timestamp: new Date().toISOString() // Help debug timing issues
            });
            console.debug('Logout API call successful');
        } catch (error) {
            console.error('Logout API call failed:', error);
            // Continue with client-side logout even if API call fails
        } finally {
            this.clearAuth();
            console.debug('Auth state cleared');
        }
    }
}

// Create singleton instance
const authService = new AuthService();

export default authService;