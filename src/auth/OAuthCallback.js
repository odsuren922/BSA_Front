import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useUser();
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
        
        console.log('Authorization callback received with code:', code ? 'present' : 'missing');
        
        if (!code) {
          setError('URL дээр зөвшөөрлийн код олдсонгүй');
          setStatus('Зөвшөөрөл амжилтгүй боллоо. Нэвтрэх хуудас руу дахин чиглүүлж байна...');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }
        
        // Exchange authorization code for tokens DIRECTLY with backend
        setStatus('Токеноор код солилцож байна...');
        
        // First get CSRF cookie if needed
        await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie', { withCredentials: true });
        
        // Make a single token exchange request
        const response = await axios.post('http://127.0.0.1:8000/oauth/exchange-token', {
          code,
          state,
          redirect_uri: window.location.origin + '/auth'
        }, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        const tokenData = response.data;
        
        if (!tokenData || !tokenData.access_token) {
          throw new Error('Failed to obtain access token');
        }
        
        // Store tokens in localStorage
        localStorage.setItem('oauth_token', tokenData.access_token);
        
        if (tokenData.refresh_token) {
          localStorage.setItem('refresh_token', tokenData.refresh_token);
        }
        
        localStorage.setItem('expires_in', tokenData.expires_in.toString());
        localStorage.setItem('token_time', tokenData.token_time.toString());
        
        // Store user data directly from response
        if (tokenData.user) {
          setUser(tokenData.user);
          
          // Success, redirect to home
          setStatus('Баталгаажуулалт амжилттай боллоо! Дахин чиглүүлж байна...');
          setTimeout(() => navigate('/'), 1000);
        } else {
          // If no user data in response, try to fetch it
          setStatus('Хэрэглэгчийн мэдээллийг татаж байна...');
          
          // Wait a moment to ensure token is properly stored
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const userResponse = await axios.get('http://127.0.0.1:8000/api/user', {
            headers: {
              'Authorization': `Bearer ${tokenData.access_token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            withCredentials: true
          });
          
          setUser(userResponse.data);
          
          // Success, redirect to home
          setStatus('Баталгаажуулалт амжилттай боллоо! Дахин чиглүүлж байна...');
          setTimeout(() => navigate('/'), 1000);
        }
      } catch (error) {
        console.error('Error in OAuth callback:', error);
        setError(`Баталгаажуулалтын алдаа: ${error.message}`);
        setStatus('Баталгаажуулалт амжилтгүй боллоо. Нэвтрэх хуудас руу дахин чиглүүлж байна...');
        setTimeout(() => navigate('/login'), 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    processCallback();
  }, [navigate, location, setUser, isProcessing]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Баталгаажуулалт</h2>
        
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