'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/auth';
import { loginUser, registerUser, logoutUser } from '@/services/user';
import { UserLoginCredentials, UserRegistrationData, User } from '@/types';

export default function useAuth() {
  const router = useRouter();
  const { isAuthenticated, user, login, logout, updateUser, setIsLoading, setError, error } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (credentials: UserLoginCredentials) => {
    try {
      setIsSubmitting(true);
      setIsLoading(true);
      setError(null);

      const response = await loginUser(credentials);

      // Handle the login response according to the API guide
      if (response && response.user) {
        login(response.user as User);
        router.push('/dashboard');
      } else {
        throw new Error('Invalid response structure from login API');
      }
      
      setIsSubmitting(false);
      setIsLoading(false);
      return response;
    } catch (err: unknown) {
      setIsSubmitting(false);
      setIsLoading(false);
      const errorMsg = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(errorMsg);
      throw err;
    }
  };

  const handleRegister = async (data: UserRegistrationData) => {
    try {
      setIsSubmitting(true);
      setIsLoading(true);
      setError(null);

      const response = await registerUser(data);
      
      setIsSubmitting(false);
      setIsLoading(false);
      router.push('/login');
      return response;
    } catch (err: unknown) {
      setIsSubmitting(false);
      setIsLoading(false);
      const errorMsg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(errorMsg);
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
    } catch (err: unknown) {
      setIsLoading(false);
      const errorMsg = err instanceof Error ? err.message : 'Logout failed. Please try again.';
      setError(errorMsg);
    }
  };

  const updateUserInfo = (updatedUser: User) => {
    updateUser(updatedUser);
  };

  return {
    isAuthenticated,
    user,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateUserInfo,
    isSubmitting,
    error
  };
} 