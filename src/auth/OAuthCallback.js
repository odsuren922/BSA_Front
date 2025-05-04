import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import authService from '../services/authService';
import { notification } from 'antd';

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
        
        if (!code) {
          setError('URL дээр зөвшөөрлийн код олдсонгүй');
          setStatus('Зөвшөөрөл амжилтгүй боллоо. Нэвтрэх хуудас руу дахин чиглүүлж байна...');
          
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
        setStatus('Токеноор код солилцож байна...');
        
        const tokenData = await authService.exchangeCodeForToken(
          code, 
          state, 
          window.location.origin + '/auth'
        );
        
        // Success - get user data if not included in token response
        if (tokenData.user) {
          setUser(tokenData.user);
          setStatus('Баталгаажуулалт амжилттай боллоо! Дахин чиглүүлж байна...');
          
          notification.success({
            message: 'Authentication Successful',
            description: 'You have been successfully authenticated',
            duration: 3
          });
          
          setTimeout(() => navigate('/'), 1000);
        } else {
          setStatus('Хэрэглэгчийн мэдээллийг татаж байна...');
          
          // Try to get user data
          try {
            const userData = await authService.getUserData();
            setUser(userData);
            
            notification.success({
              message: 'Authentication Successful',
              description: 'You have been successfully authenticated',
              duration: 3
            });
            
            setStatus('Баталгаажуулалт амжилттай боллоо! Дахин чиглүүлж байна...');
            setTimeout(() => navigate('/'), 1000);
          } catch (userDataError) {
            console.error('Error fetching user data:', userDataError);
            
            // Try one more time after a short delay
            setTimeout(async () => {
              try {
                const userData = await authService.getUserData();
                setUser(userData);
                setStatus('Баталгаажуулалт амжилттай боллоо! Дахин чиглүүлж байна...');
                setTimeout(() => navigate('/'), 1000);
              } catch (retryError) {
                setError(`Хэрэглэгчийн мэдээлэл авахад алдаа гарлаа: ${retryError.message}`);
                setStatus('Баталгаажуулалт амжилтгүй боллоо. Нэвтрэх хуудас руу дахин чиглүүлж байна...');
                setTimeout(() => navigate('/login', { 
                  state: { error: 'Failed to fetch user data' }
                }), 3000);
              }
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Error in OAuth callback:', error);
        setError(`Баталгаажуулалтын алдаа: ${error.message}`);
        setStatus('Баталгаажуулалт амжилтгүй боллоо. Нэвтрэх хуудас руу дахин чиглүүлж байна...');
        
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