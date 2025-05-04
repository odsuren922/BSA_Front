<<<<<<< HEAD
import * as React from 'react';

import { signInWithEmailAndPassword} from 'firebase/auth';
import { auth } from '../firebase';

function Login({
    setAuthState,
    setUser
}) {

    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');


    const handleLogin = () => {
        if(email !== null && password !== null) {
            signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                setUser(email)
                setAuthState('home')
            })
            .catch((err) => alert(err));
        }
    }
=======
// src/auth/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { redirectToOAuthLogin } from '../oauth';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Check for error messages in the URL query params
    const params = new URLSearchParams(location.search);
    const errorMessage = params.get('error');
    
    if (errorMessage) {
      let displayMessage;
      switch (errorMessage) {
        case 'session_expired':
          displayMessage = 'Your session has expired. Please log in again.';
          break;
        case 'token_failure':
          displayMessage = 'Authentication failed. Please try again.';
          break;
        case 'unauthorized':
          displayMessage = 'You do not have permission to access this resource.';
          break;
        default:
          displayMessage = errorMessage;
      }
      setError(displayMessage);
    }
  }, [location]);

  const handleLogin = () => {
    // Redirect to the OAuth login flow
    redirectToOAuthLogin();
  };
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99

  return (
    <div className="flex w-full h-screen">
      <div className="w-full flex items-center justify-center lg:w-1/2">
<<<<<<< HEAD
      <div className=' w-11/12 max-w-[700px] px-10 py-20 rounded-3xl bg-white border-2 border-gray-100'>
            <h3 className='text-5xl font-semibold'>Welcome Back</h3>
            <div className='mt-8'>
                <div className='flex flex-col'>
                    <label className='text-lg font-medium'>Email</label>
                    <input 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className='w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent'
                        placeholder="Enter your email"/>
                </div>
                <div className='flex flex-col mt-4'>
                    <label className='text-lg font-medium'>Password</label>
                    <input 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className='w-full border-2 border-gray-100 rounded-xl p-4 mt-1 bg-transparent'
                        placeholder="Enter your email"
                        type={"password"}
                    />
                </div>
                <div className='mt-8 flex flex-col gap-y-4'>
                    <button 
                        onClick={handleLogin}
                        className='active:scale-[.98] active:duration-75 transition-all hover:scale-[1.01]  ease-in-out transform py-4 bg-violet-500 rounded-xl text-white font-bold text-lg'>Sign in</button>
                </div>
                <div className='mt-8 flex justify-center items-center'>
                    <p className='font-medium text-base'>Don't have an account?</p>
                    <button 
                        onClick={() => setAuthState('register')}
                        className='ml-2 font-medium text-base text-violet-500'>Sign up</button>
                </div>
            </div>
=======
        <div className='w-11/12 max-w-[700px] px-10 py-20 rounded-3xl bg-white border-2 border-gray-100'>
          <h1 className='text-5xl font-semibold'>Welcome Back</h1>
          <p className='text-base mt-4 text-gray-600'>
            Sign in to access the thesis management system
          </p>
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <div className='mt-8 flex flex-col gap-y-4'>
            <button 
              onClick={handleLogin}
              className='active:scale-[.98] active:duration-75 transition-all hover:scale-[1.01] 
              ease-in-out transform py-4 bg-violet-500 rounded-xl text-white font-bold text-lg'>
              Sign in with NUM
            </button>
          </div>
>>>>>>> 64d8a392fc33ab22c1d0b1f387c3294e72182f99
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