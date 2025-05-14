'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/auth';
import { loginUser, registerUser, logoutUser } from '@/services/user';
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

      const response = await loginUser(credentials);
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

      const response = await registerUser(data);
      
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

      await logoutUser();
      logout();

      setIsLoading(false);
      router.push('/login');
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.msg || 'Logout failed. Please try again.');
    }
  };

  return {
    isAuthenticated,
    user,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    isSubmitting,
    error
  };
} 