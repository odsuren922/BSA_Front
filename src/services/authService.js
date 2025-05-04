// src/services/authService.js
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';
const TOKEN_KEY = 'oauth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const EXPIRES_IN_KEY = 'expires_in';
const TOKEN_TIME_KEY = 'token_time';
const USER_DATA_KEY = 'user_data';

// Create axios instance with interceptors
const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
});

// Request interceptor
api.interceptors.request.use(async (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
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
}, (error) => Promise.reject(error));

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
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
                    storeTokenData(response.data);
                    api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
                    originalRequest.headers['Authorization'] = `Bearer ${response.data.access_token}`;
                    return api(originalRequest);
                } else {
                    throw new Error('Failed to refresh token: invalid response');
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
                clearTokenData();

                // Dispatch an event so the App component can handle the auth failure
                window.dispatchEvent(new CustomEvent('auth:failure', {
                    detail: { message: 'Your session has expired. Please log in again.' }
                }));

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Helper functions
const storeTokenData = (tokenData) => {
    localStorage.setItem(TOKEN_KEY, tokenData.access_token);

    if (tokenData.refresh_token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, tokenData.refresh_token);
    }

    localStorage.setItem(EXPIRES_IN_KEY, tokenData.expires_in.toString());
    localStorage.setItem(TOKEN_TIME_KEY, (tokenData.token_time || tokenData.created_at || Math.floor(Date.now() / 1000)).toString());

    // Store user data if available
    if (tokenData.user) {
        localStorage.setItem(USER_DATA_KEY, JSON.stringify(tokenData.user));
    }
};

const clearTokenData = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(EXPIRES_IN_KEY);
    localStorage.removeItem(TOKEN_TIME_KEY);
    localStorage.removeItem(USER_DATA_KEY);
};

const isAuthenticated = () => {
    return !!localStorage.getItem(TOKEN_KEY);
};

const isTokenExpired = () => {
    const tokenTime = parseInt(localStorage.getItem(TOKEN_TIME_KEY) || '0', 10);
    const expiresIn = parseInt(localStorage.getItem(EXPIRES_IN_KEY) || '0', 10);
    const currentTime = Math.floor(Date.now() / 1000);

    return currentTime >= (tokenTime + expiresIn);
};

const isTokenExpiring = (bufferSeconds = 300) => {
    const tokenTime = parseInt(localStorage.getItem(TOKEN_TIME_KEY) || '0', 10);
    const expiresIn = parseInt(localStorage.getItem(EXPIRES_IN_KEY) || '0', 10);
    const currentTime = Math.floor(Date.now() / 1000);

    return (tokenTime + expiresIn - currentTime) < bufferSeconds;
};

const exchangeCodeForToken = async (code, state, redirectUri) => {
    try {
        // First get CSRF cookie
        await axios.get(`${API_URL}/sanctum/csrf-cookie`, {
            withCredentials: true,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        // Make token exchange request
        const response = await axios.post(`${API_URL}/api/oauth/exchange-token`, {
            code,
            state,
            redirect_uri: redirectUri
        }, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });

        if (response.data?.access_token) {
            storeTokenData(response.data);
            return response.data;
        } else {
            throw new Error('Invalid token response');
        }
    } catch (error) {
        console.error('Failed to exchange code for token:', error);
        throw error;
    }
};

const getUserData = async () => {
    // First check if we have user data in localStorage
    const userData = localStorage.getItem(USER_DATA_KEY);
    if (userData) {
        try {
            return JSON.parse(userData);
        } catch (e) {
            console.error('Failed to parse stored user data:', e);
        }
    }

    try {
        const response = await api.get('/api/user');

        // Store user data for future use
        if (response.data) {
            localStorage.setItem(USER_DATA_KEY, JSON.stringify(response.data));
        }

        return response.data;
    } catch (error) {
        console.error('Failed to get user data:', error);
        throw error;
    }
};

const refreshTokenIfNeeded = async () => {
    if (isTokenExpired()) {
        console.log('Token is expired, refreshing...');
        return refreshToken();
    } else if (isTokenExpiring()) {
        console.log('Token is about to expire, refreshing in background...');
        refreshToken().catch(console.error);
    }
    return true;
};

const refreshToken = async () => {
    try {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

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
            storeTokenData(response.data);
            return true;
        }

        return false;
    } catch (error) {
        console.error('Failed to refresh token:', error);
        clearTokenData();
        throw error;
    }
};

const logout = async () => {
    try {
        await api.post('/logout', {}, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem(TOKEN_KEY)}`
            }
        });
    } catch (error) {
        console.error('Logout API call failed:', error);
    } finally {
        clearTokenData();
    }
};

export default {
    api,
    storeTokenData,
    clearTokenData,
    isAuthenticated,
    isTokenExpired,
    isTokenExpiring,
    exchangeCodeForToken,
    getUserData,
    refreshTokenIfNeeded,
    refreshToken,
    logout
};