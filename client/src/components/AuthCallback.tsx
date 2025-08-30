import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const AuthCallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    const userData = urlParams.get('user');
    const error = urlParams.get('error');

    if (error) {
      // Handle authentication error
      console.error('Authentication error:', error);
      navigate('/auth?error=' + encodeURIComponent(error));
      return;
    }

    if (token && userData) {
      try {
        const user = JSON.parse(decodeURIComponent(userData));
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Redirect to dashboard or intended page
        navigate('/dashboard');
      } catch (error) {
        console.error('Failed to parse user data:', error);
        navigate('/auth?error=invalid_callback_data');
      }
    } else {
      // Missing required parameters
      navigate('/auth?error=missing_auth_data');
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Processing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;