'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/auth';
import { mockUser } from '@/lib/mockData';
// Comment out API imports
// import { loginUser, registerUser, logoutUser } from '@/services/user';
import { LoginCredentials, RegisterData, User } from '@/types';

export default function useAuth() {
  const router = useRouter();
  const { isAuthenticated, user, login, logout, setIsLoading, setError, error } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      setIsSubmitting(true);
      setIsLoading(true);
      setError(null);

      // Mock the login response
      // const response = await loginUser(credentials);
      const response = { user: mockUser };
      
      login(response.user as User);

      setIsSubmitting(false);
      setIsLoading(false);
      router.push('/dashboard');
      return response;
    } catch (err: any) {
      setIsSubmitting(false);
      setIsLoading(false);
      setError(err.response?.data?.msg || 'Login failed. Please try again.');
      throw err;
    }
  };

  const handleRegister = async (data: RegisterData) => {
    try {
      setIsSubmitting(true);
      setIsLoading(true);
      setError(null);

      // Mock the register response
      // const response = await registerUser(data);
      const response = { msg: 'Registration successful' };
      
      setIsSubmitting(false);
      setIsLoading(false);
      router.push('/login');
      return response;
    } catch (err: any) {
      setIsSubmitting(false);
      setIsLoading(false);
      setError(err.response?.data?.msg || 'Registration failed. Please try again.');
      throw err;
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Mock the logout response
      // await logoutUser();
      
      logout();

      setIsLoading(false);
      router.push('/login');
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.msg || 'Logout failed. Please try again.');
    }
  };

  return {
    isAuthenticated: true, // Force authentication to be true
    user: mockUser, // Use mock user
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    isSubmitting,
    error
  };
} 