import React, { useEffect, useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./auth/Login";
import Main from "./modules/Main";
import OAuthCallback from "./auth/OAuthCallback";
import { checkOAuthStatus, logoutOAuth } from "./oauth";
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
      // Check if user is authenticated via OAuth
      const userData = await checkOAuthStatus();

      if (userData) {
        // Set user data in context
        setUser(userData);
        setAuthError(null);
      } else {
        console.log("No authenticated user found");
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
      await logoutOAuth();
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
    }
  }, [setUser]);

  // Initial authentication check
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Periodic authentication check
  useEffect(() => {
    // Set up interval for periodic checks
    const authCheckInterval = setInterval(checkAuth, SESSION_CHECK_INTERVAL);
    
    // Event listener for storage changes (for multi-tab support)
    const handleStorageChange = (e) => {
      if (e.key === 'oauth_token' && !e.newValue) {
        // Token was removed in another tab
        setUser(null);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Clean up interval and event listener
    return () => {
      clearInterval(authCheckInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [checkAuth]);

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