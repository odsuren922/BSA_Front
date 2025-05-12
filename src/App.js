import React, { useEffect, useState, useCallback, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./auth/Login";
import Main from "./modules/Main";
import OAuthCallback from "./auth/OAuthCallback";
import authService from "./services/authService";
import { UserProvider, useUser } from "./context/UserContext";
import { notification } from "antd";

// Session check interval (5 minutes)
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000;

function AppContent() {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const authCheckInProgress = useRef(false);

  // Function to handle authentication check
  const checkAuth = useCallback(async () => {
    // Prevent concurrent auth checks
    if (authCheckInProgress.current) {
      return;
    }
    
    authCheckInProgress.current = true;
    setLoading(true);
    
    try {
      // Check if we're already authenticated
      if (authService.isAuthenticated()) {
        // Check if token needs refresh
        await authService.refreshTokenIfNeeded();
        
        // Get user data from auth service
        const userData = authService.getUser();
        
        if (userData) {
          setUser(userData);
          setAuthError(null);
        } else {
          // Try to fetch user data if not in auth state
          const fetchedUserData = await authService.fetchUserData();
          if (fetchedUserData) {
            setUser(fetchedUserData);
            setAuthError(null);
          } else {
            console.log("No user data found");
            setUser(null);
            setAuthError("Failed to load user data");
          }
        }
      } else {
        console.log("Not authenticated");
        setUser(null);
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      setAuthError(error.message);
      setUser(null);
      
      // Show error notification
      notification.error({
        message: "Authentication Error",
        description: "Your session has expired. Please log in again.",
        duration: 5
      });
    } finally {
      setLoading(false);
      authCheckInProgress.current = false;
    }
  }, [setUser]);

  // Function to handle logout
  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      
      // Show success notification
      notification.success({
        message: "Logged Out",
        description: "You have been successfully logged out.",
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
        message: "Logout Error",
        description: "There was an error logging out, but your session has been cleared.",
        duration: 5
      });
      
      // Redirect to login page anyway
      window.location.href = "/login";
    }
  }, [setUser]);

  // Initial authentication check
  useEffect(() => {
    checkAuth();
    
    // Set up auth change listener
    const handleAuthChange = (e) => {
      if (e.detail) {
        setUser(e.detail.user);
      } else {
        setUser(null);
      }
    };
    
    // Set up auth failure listener
    const handleAuthFailure = (e) => {
      console.log('Auth failure event received', e.detail);
      setUser(null);
      setAuthError(e.detail?.message || 'Authentication failed');
      
      // Save current path for redirect after login
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/auth') {
        localStorage.setItem('intended_url', currentPath);
      }
      
      notification.error({
        message: "Authentication Error",
        description: e.detail?.message || "Your session has expired. Please log in again.",
        duration: 5
      });
    };
    
    window.addEventListener('auth:changed', handleAuthChange);
    window.addEventListener('auth:failure', handleAuthFailure);
    
    return () => {
      window.removeEventListener('auth:changed', handleAuthChange);
      window.removeEventListener('auth:failure', handleAuthFailure);
    };
  }, [checkAuth, setUser]);

  // Periodic authentication check
  useEffect(() => {
    // Set up interval for periodic checks
    const authCheckInterval = setInterval(() => {
      // Only check if we're authenticated and not already checking
      if (authService.isAuthenticated() && !authCheckInProgress.current) {
        authService.refreshTokenIfNeeded().catch(console.error);
      }
    }, SESSION_CHECK_INTERVAL);
    
    return () => {
      clearInterval(authCheckInterval);
    };
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-2xl font-semibold">Loading...</p>
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