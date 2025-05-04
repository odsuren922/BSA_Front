import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { notification } from 'antd';
import authService from '../services/authService';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('Processing authentication...');
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const processCallback = async () => {
      // Prevent double processing
      if (isProcessing) return;
      setIsProcessing(true);
      
      try {
        // Get the authorization code and state from URL
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const state = params.get('state');
        const redirectPath = params.get('redirect') || '/';
        
        if (!code) {
          setError('Authorization code not found in URL');
          setStatus('Authentication failed. Redirecting to login page...');
          
          notification.error({
            message: 'Authentication Error',
            description: 'Missing authorization code. Please try logging in again.',
            duration: 5
          });
          
          setTimeout(() => navigate('/login', { 
            state: { error: 'Missing authorization code' }
          }), 3000);
          return;
        }
        
        // Exchange authorization code for tokens
        setStatus('Exchanging code for token...');
        
        const tokenData = await authService.exchangeCodeForToken(
          code, 
          state, 
          window.location.origin + '/auth'
        );
        
        // Success path - get user data if not included in token response
        if (tokenData.user) {
          setStatus('Authentication successful! Redirecting...');
          
          notification.success({
            message: 'Authentication Successful',
            description: 'You have been successfully authenticated',
            duration: 3
          });
          
          // Get intended URL from localStorage or params, or default to home
          let intendedUrl = localStorage.getItem('intended_url') || redirectPath || '/';
          localStorage.removeItem('intended_url'); // Clear intended URL
          
          // Redirect to intended URL
          setTimeout(() => navigate(intendedUrl), 1000);
        } else {
          setStatus('Fetching user information...');
          // Try to get user data
          try {
            await authService.fetchUserData();
            
            notification.success({
              message: 'Authentication Successful',
              description: 'You have been successfully authenticated',
              duration: 3
            });
            
            // Get intended URL from localStorage or params, or default to home
            let intendedUrl = localStorage.getItem('intended_url') || redirectPath || '/';
            localStorage.removeItem('intended_url'); // Clear intended URL
            
            setStatus('Authentication successful! Redirecting...');
            setTimeout(() => navigate(intendedUrl), 1000);
          } catch (userDataError) {
            console.error('Error fetching user data:', userDataError);
            
            // Try one more time after a short delay
            setTimeout(async () => {
              try {
                await authService.fetchUserData();
                
                let intendedUrl = localStorage.getItem('intended_url') || redirectPath || '/';
                localStorage.removeItem('intended_url');
                
                setStatus('Authentication successful! Redirecting...');
                setTimeout(() => navigate(intendedUrl), 1000);
              } catch (retryError) {
                setError(`Failed to fetch user data: ${retryError.message}`);
                setStatus('Authentication failed. Redirecting to login page...');
                setTimeout(() => navigate('/login', { 
                  state: { error: 'Failed to fetch user data' }
                }), 3000);
              }
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Error in OAuth callback:', error);
        setError(`Authentication error: ${error.message}`);
        setStatus('Authentication failed. Redirecting to login page...');
        
        notification.error({
          message: 'Authentication Error',
          description: `An error occurred during authentication: ${error.message}`,
          duration: 5
        });
        
        setTimeout(() => navigate('/login', { 
          state: { error: error.message }
        }), 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [navigate, location, isProcessing]);

  // Store intended URL when component mounts
  useEffect(() => {
    // Check for redirect parameter in query
    const params = new URLSearchParams(location.search);
    const redirectPath = params.get('redirect');
    
    if (redirectPath) {
      localStorage.setItem('intended_url', redirectPath);
    }
  }, [location]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Authentication</h2>
        
        <div className="mb-4">
          <p className="text-gray-700">{status}</p>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
        </div>
        
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500"></div>
        </div>
      </div>
    </div>
  );
};

export default OAuthCallback;