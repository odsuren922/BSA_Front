import React, { useEffect, useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./auth/Login";
import Main from "./modules/Main";
import OAuthCallback from "./auth/OAuthCallback";
import authService from "./services/authService";
import { UserProvider, useUser } from "./context/UserContext";
import { notification } from "antd";
import "react-toastify/dist/ReactToastify.css";

// Session check interval (5 minutes)
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000;

function AppContent() {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Function to handle authentication check
  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      // First check if user data is already in localStorage
      const storedUser = localStorage.getItem('user_data');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setAuthError(null);
          setLoading(false);
          return;
        } catch (e) {
          console.error('Failed to parse stored user data:', e);
        }
      }

      // If token exists but is expired, try to refresh it
      if (authService.isAuthenticated() && authService.isTokenExpired()) {
        await authService.refreshToken();
      }
      
      // Check if user is authenticated
      if (authService.isAuthenticated()) {
        // Get user data
        const userData = await authService.getUserData();
        
        if (userData) {
          setUser(userData);
          setAuthError(null);
        } else {
          console.log("No user data found");
          setUser(null);
          setAuthError("Failed to load user data");
        }
      } else {
        console.log("No authentication token found");
        setUser(null);
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      setAuthError(error.message);
      setUser(null);
      
      // Show error notification
      notification.error({
        message: "Нэвтрэлт алдаатай",
        description: "Таны нэвтрэлт алдаатай байна. Дахин нэвтэрнэ үү.",
        duration: 5
      });
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  // Function to handle logout
  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      
      // Show success notification
      notification.success({
        message: "Амжилттай гарлаа",
        description: "Та системээс амжилттай гарлаа.",
        duration: 3
      });
      
      // Redirect to login page
      window.location.href = "/login?success=logged_out";
    } catch (error) {
      console.error("Logout failed:", error);
      
      // Still clear the user state even if API fails
      setUser(null);
      
      // Show error notification 
      notification.error({
        message: "Гарах үед алдаа гарлаа",
        description: "Тогтолцооноос гарах үед алдаа гарсан хэдий ч, та амжилттай гарсан.",
        duration: 5
      });
      
      // Redirect to login page anyway
      window.location.href = "/login";
    }
  }, [setUser]);

  // Initial authentication check
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Periodic authentication check
  useEffect(() => {
    // Set up interval for periodic checks
    const authCheckInterval = setInterval(() => {
      // Only check if we're authenticated
      if (authService.isAuthenticated()) {
        authService.refreshTokenIfNeeded().catch(console.error);
      }
    }, SESSION_CHECK_INTERVAL);
    
    // Event listener for storage changes (for multi-tab support)
    const handleStorageChange = (e) => {
      if (e.key === 'oauth_token' && !e.newValue) {
        // Token was removed in another tab
        setUser(null);
      }
    };
    
    // Event listener for auth failure
    const handleAuthFailure = (e) => {
      console.log('Auth failure event received', e.detail);
      setUser(null);
      setAuthError(e.detail?.message || 'Authentication failed');
      
      notification.error({
        message: "Нэвтрэлт алдаатай",
        description: e.detail?.message || "Таны нэвтрэлт алдаатай байна. Дахин нэвтэрнэ үү.",
        duration: 5
      });
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth:failure', handleAuthFailure);
    
    // Clean up interval and event listeners
    return () => {
      clearInterval(authCheckInterval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth:failure', handleAuthFailure);
    };
  }, [checkAuth, setUser]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-2xl font-semibold">Уншиж байна...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          !user ? (
            <Login />
          ) : (
            <Navigate to="/" replace />
          )
        } />

        {/* OAuth callback route */}
        <Route path="/auth" element={<OAuthCallback />} />

        {/* Protected routes */}
        <Route path="/*" element={
          user ? (
            <Main user={user} setUser={setUser} logoutFunction={handleLogout} />
          ) : (
            <Navigate to={`/login${authError ? `?error=${encodeURIComponent(authError)}` : ''}`} replace />
          )
        } />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;