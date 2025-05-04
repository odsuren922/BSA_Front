// src/auth/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { notification, Spin } from 'antd';
import axios from 'axios';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  useEffect(() => {
    // Check if we're already authenticated
    const checkExistingAuth = async () => {
      try {
        const token = localStorage.getItem('oauth_token');
        const userData = localStorage.getItem('user_data');
        
        if (token && userData) {
          // Validate token by making a request to the API
          try {
            const response = await axios.get('http://127.0.0.1:8000/api/user', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              withCredentials: true
            });
            
            if (response.status === 200) {
              // We're already authenticated, redirect to home
              navigate('/');
              return;
            }
          } catch (err) {
            // Token is invalid, clear it
            localStorage.removeItem('oauth_token');
            localStorage.removeItem('user_data');
            console.error('Invalid token:', err);
          }
        }
      } catch (err) {
        console.error('Error checking auth:', err);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkExistingAuth();
  }, [navigate]);
  
  useEffect(() => {
    // Check for error messages in the URL query params
    const params = new URLSearchParams(location.search);
    const errorMessage = params.get('error');
    const successMessage = params.get('success');
    
    if (errorMessage) {
      let displayMessage;
      switch (errorMessage) {
        case 'session_expired':
          displayMessage = 'Session-ий хугацаа дууссан. Дахин нэвтэрнэ үү.';
          break;
        case 'token_failure':
          displayMessage = 'Баталгаажуулалт амжилтгүй боллоо. Дахин оролдоно уу.';
          break;
        case 'unauthorized':
          displayMessage = 'Танд энэ нөөцөд хандах эрх байхгүй.';
          break;
        default:
          displayMessage = errorMessage;
      }
      setError(displayMessage);
      
      notification.error({
        message: 'Нэвтрэх алдаа',
        description: displayMessage,
        duration: 5
      });
    }
    
    if (successMessage) {
      notification.success({
        message: 'Амжилттай',
        description: successMessage === 'logged_out' ? 'Та системээс амжилттай гарлаа.' : successMessage,
        duration: 3
      });
    }
    
    // Check if we're being redirected from a failed authentication attempt
    if (location.state && location.state.error) {
      setError(location.state.error);
      
      notification.error({
        message: 'Нэвтрэх алдаа',
        description: location.state.error,
        duration: 5
      });
    }
  }, [location]);

  const handleLogin = async () => {
    setLoading(true);
    
    try {
      // First, make a request to get CSRF cookie
      await axios.get('http://127.0.0.1:8000/sanctum/csrf-cookie', {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      // Then redirect to the OAuth login flow
      window.location.href = 'http://127.0.0.1:8000/oauth/redirect';
    } catch (err) {
      setLoading(false);
      setError('Нэвтрэх үйлчилгээтэй холбогдоход алдаа гарлаа. Дахин оролдоно уу.');
      
      notification.error({
        message: 'Системийн алдаа',
        description: 'Нэвтрэх үйлчилгээтэй холбогдоход алдаа гарлаа. Дахин оролдоно уу.',
        duration: 5
      });
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4">Хэрэглэгчийн нэвтрэлтийг шалгаж байна...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-screen">
      <div className="w-full flex items-center justify-center lg:w-1/2">
        <div className='w-11/12 max-w-[700px] px-10 py-20 rounded-3xl bg-white border-2 border-gray-100'>
          <h1 className='text-5xl font-semibold'>Тавтай морил</h1>
          <p className='text-base mt-4 text-gray-600'>
            Дипломын ажлын удирдах системд тавтай морил
          </p>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <div className='mt-8 flex flex-col gap-y-4'>
            <button 
              onClick={handleLogin}
              disabled={loading}
              className={`
                active:scale-[.98] active:duration-75 transition-all hover:scale-[1.01] 
                ease-in-out transform py-4 bg-violet-500 rounded-xl text-white font-bold text-lg
                ${loading ? 'opacity-70 cursor-not-allowed' : ''}
              `}>
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
                  МУИС-ийн хаягаар нэвтрэх
                </div>
              ) : 'МУИС-ийн хаягаар нэвтрэх'}
            </button>
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            Хэрэв танд МУИС-ийн цахим шуудан байхгүй бол, эсвэл системд хандах эрх байхгүй бол хөгжүүлэгчтэй холбогдоно уу.
          </div>
        </div>
      </div>
      <div className="hidden relative w-1/2 h-full lg:flex items-center justify-center bg-gray-200">
        <div className="w-60 h-60 rounded-full bg-gradient-to-tr from-violet-500 to-pink-500 animate-spin"/> 
        <div className="w-full h-1/2 absolute bottom-0 bg-white/10 backdrop-blur-lg" />
      </div>
    </div>
  );
}

export default Login;