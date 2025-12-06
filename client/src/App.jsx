import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import LoadingSpinner from './components/LoadingSpinner';
import api from './services/api';

function App() {
  const { user, login, loading } = useAuth();
  const [authError, setAuthError] = useState('');
  const [settings] = useState({
    darkMode: localStorage.getItem('darkMode') === 'true',
  });

  const handleLogin = async (email, password) => {
    setAuthError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      
      console.log('Login response:', response.data); // Debug log
      
      // Extract data from server response
      const { access_token, refresh_token, username, user_id, email: userEmail } = response.data;
      
      // Verify tokens exist
      if (!access_token || !refresh_token) {
        throw new Error('Tokens not received from server');
      }
      
      // Structure user data for client
      const userData = {
        user_id,
        username,
        email: userEmail,
      };
      
      const tokens = {
        access_token,
        refresh_token,
      };
      
      console.log('Calling login with:', { userData, tokens }); // Debug log
      
      // Call login from context
      login(userData, tokens);
      
      console.log('Login successful'); // Debug log
      
    } catch (error) {
      console.error('Login error:', error); // Debug log
      
      // Handle nested error structure from server
      const errorMessage = 
        error.response?.data?.detail?.message || 
        error.response?.data?.detail || 
        error.response?.data?.message ||
        error.userMessage || 
        error.message ||
        'Login failed. Please check your credentials.';
      setAuthError(errorMessage);
    }
  };

  const handleSignup = async (formData) => {
    setAuthError('');
    try {
      const response = await api.post('/auth/signup', formData);
      console.log('Signup response:', response.data); // Debug log
      
      setAuthError('');
      alert('Account created! Please check your email to verify your account before logging in.');
    } catch (error) {
      console.error('Signup error:', error); // Debug log
      
      // Handle nested error structure
      const errorMessage = 
        error.response?.data?.detail?.message || 
        error.response?.data?.detail || 
        error.response?.data?.message ||
        'Signup failed. Please try again.';
      setAuthError(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${settings.darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <LoadingSpinner darkMode={settings.darkMode} />
      </div>
    );
  }

  return user ? (
    <Dashboard />
  ) : (
    <AuthPage
      onLogin={handleLogin}
      onSignup={handleSignup}
      settings={settings}
      error={authError}
    />
  );
}

export default App;