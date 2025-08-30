import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Star, Sun} from 'lucide-react';
import authService, { RegisterData, SignInData, VerifyOTPData } from '../services/authService';
import WaveSidePanel from "./WaveSidePanel";
import bg from "../assets/your-image.jpg"; // Import your image here

declare global {
  interface Window {
    google: any;
  }
}

const AuthComponent: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  // Load Google Sign-In script
  useEffect(() => {
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
            callback: handleGoogleCredentialResponse,
          });
        }
      };
    };

    loadGoogleScript();

    // Handle auth callback from URL (for redirect-based OAuth)
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userData = urlParams.get('user');

    if (token && userData) {
      try {
        const user = JSON.parse(decodeURIComponent(userData));
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        window.location.href = '/dashboard';
      } catch (error) {
        setErrors({ general: 'Authentication callback failed' });
      }
    }
  }, []);

  const handleGoogleCredentialResponse = async (response: any) => {
    setLoading(true);
    try {
      const result = await authService.googleAuthVerify(response.credential);
      
      if (result.success && result.token && result.user) {
        localStorage.setItem('authToken', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        window.location.href = '/dashboard';
      } else {
        setErrors({ general: result.message || 'Google authentication failed' });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Google authentication failed';
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendOTP = async () => {
    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        if (password.length < 6) {
          setErrors({ password: 'Password must be at least 6 characters' });
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setErrors({ confirmPassword: 'Passwords do not match' });
          setLoading(false);
          return;
        }
        if (!name.trim()) {
          setErrors({ name: 'Name is required for sign up' });
          setLoading(false);
          return;
        }
        if (!dateOfBirth) {
          setErrors({ dateOfBirth: 'Date of Birth is required for sign up' });
          setLoading(false);
          return;
        }

        // For sign up, register first
        const registerData: RegisterData = { email, password, name, dateOfBirth };
        const response = await authService.register(registerData);
        
        if (response.success) {
          setOtpSent(true);
          setErrors({});
        } else {
          setErrors({ general: response.message || 'Registration failed' });
        }
      } else {
        // For sign in, just send OTP
        const response = await authService.sendOTP(email);
        
        if (response.success) {
          setOtpSent(true);
          setErrors({});
        } else {
          setErrors({ general: response.message || 'Failed to send OTP' });
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'An error occurred';
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const response = await authService.sendOTP(email);
      
      if (response.success) {
        setErrors({});
      } else {
        setErrors({ general: response.message || 'Failed to resend OTP' });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to resend OTP';
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

// Removed invalid isLogin block; if you need name validation, add a name state and validation logic here.

  const handleSubmit = async () => {
    const newErrors: { [key: string]: string } = {};

// If you need name validation for sign-up, add a name state and validation logic here.

    if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (isSignUp) {
      if (password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (!name.trim()) {
        newErrors.name = 'Name is required for sign up';
      }
      if (!dateOfBirth) {
        newErrors.dateOfBirth = 'Date of Birth is required for sign up';
      }
    }

    if (!otpSent) {
      newErrors.otp = 'Please request OTP first';
    } else if (!otp) {
      newErrors.otp = 'Please enter the OTP';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setLoading(true);
      try {
        const verifyData: VerifyOTPData = { email, otp };
        const response = await authService.verifyOTP(verifyData); 
        
        if (response.success) {
          if (isSignUp) {
           alert('Account created successfully!');
          }

          // Redirect to dashboard or home page
          window.location.href = '/dashboard';
        } else {
          setErrors({ general: response.message || 'Authentication failed' });
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Authentication failed';
        setErrors({ general: errorMessage });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleAuth = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    } else {
      setErrors({ general: 'Google Sign-In is not available' });
    }
  };

  const resetForm = () => {
    setIsSignUp(!isSignUp);
    setErrors({});
    setOtpSent(false);
    setOtp('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setDateOfBirth('');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-left">
            <div className="absolute top-6 left-6 flex items-center">
              <Sun className="h-6 w-6 text-blue-600 mr-2" />
              <span className="text-lg font-medium text-gray-900">HD</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isSignUp ? 'Create Account' : 'Sign in'}
            </h2>
            <p className="text-gray-600">
              {isSignUp 
                ? 'Please create your account to continue.' 
                : 'Please login to continue to your account.'
              }
            </p>
          </div>

          {/* Error Messages */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {errors.general}
            </div>
          )}

          <div className="space-y-6">
            {/* Email Input */}
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jonas.kahnwald@gmail.com"
                className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            {/* Name Input - only for Sign Up */}
{isSignUp && (
  <div>
    <input
      type="text"
      value={name}
      onChange={(e) => setName(e.target.value)}
      placeholder="Full Name"
      className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        errors.name ? 'border-red-300' : 'border-gray-300'
      }`}
      disabled={loading}
    />
    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
  </div>
)}

{/* Date of Birth Input - only for Sign Up */}
{isSignUp && (
  <div>
    <input
      type="date"
      value={dateOfBirth}
      onChange={(e) => setDateOfBirth(e.target.value)}
      className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
      }`}
      disabled={loading}
    />
    {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
  </div>
)}
            {/* Password Fields for Sign Up */}
            {isSignUp && (
              <>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className={`w-full px-3 py-3 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    className={`w-full px-3 py-3 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </>
            )}

            {/* OTP Section */}
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="OTP"
                  className={`flex-1 px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.otp ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={otpSent ? handleResendOTP : handleSendOTP}
                  disabled={loading || !email}
                  className="px-4 py-3 text-sm font-medium text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                >
                  {loading ? 'Sending...' : otpSent ? 'Resend' : 'Send OTP'}
                </button>
              </div>
              {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp}</p>}
              
              {otpSent && !errors.otp && (
                <p className="text-blue-600 text-sm mt-1">
                  OTP sent to {email}
                </p>
              )}
            </div>

            {/* Keep me logged in */}
            {!isSignUp && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="keepLoggedIn"
                  checked={keepLoggedIn}
                  onChange={(e) => setKeepLoggedIn(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="keepLoggedIn" className="ml-2 text-sm text-gray-900">
                  Keep me logged in
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign in')}
            </button>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Toggle Sign Up / Sign In */}
          <div className="text-center">
            <button
              type="button"
              onClick={resetForm}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Need an account? Create one"}
            </button>
          </div>
        </div>
      </div>

      {/* Right side - Image (hidden on mobile) */}
      <WaveSidePanel image={bg} />
    </div>
  );
};

export default AuthComponent;