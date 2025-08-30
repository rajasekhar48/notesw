import api from './api';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  dateOfBirth: string;
}

export interface SignInData {
  email: string;
}

export interface VerifyOTPData {
  email: string;
  otp: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    isEmailVerified: boolean;
  };
  userId?: string;
  errors?: any[];
}

class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  }

  async signIn(data: SignInData): Promise<AuthResponse> {
    const response = await api.post('/auth/signin', data);
    return response.data;
  }

  async sendOTP(email: string): Promise<AuthResponse> {
    const response = await api.post('/auth/send-otp', { email });
    return response.data;
  }

  async verifyOTP(data: VerifyOTPData): Promise<AuthResponse> {
    
    try {
  const response = await api.post('/auth/verify-otp', data);
  if (response.data.success && response.data.token) {
    localStorage.setItem('authToken', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
} catch (error) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const err = error as { response?: { data?: any }; message?: string };
    console.error('OTP verification failed:', err.response?.data || err.message);
  } else {
    console.error('OTP verification failed:', String(error));
  }
  throw error;
}

  }

  // Google OAuth using redirect method
  async googleAuth(): Promise<void> {
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/google`;
  }

  // Google OAuth using credential verification
  async googleAuthVerify(credential: string): Promise<AuthResponse> {
    const response = await api.post('/auth/google/verify', { credential });
    
    if (response.data.success && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
export default new AuthService();