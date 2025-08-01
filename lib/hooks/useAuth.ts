'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/auth';
import { loginUser, registerUser, logoutUser } from '@/services/user';
import { UserLoginCredentials, UserRegistrationData, User } from '@/types';
import { AxiosError } from 'axios';
import { useToast } from '@/components/ui/use-toast';

// Define a type for the API error response
interface ApiErrorResponse {
  msg: string;
  [key: string]: unknown;
}

export default function useAuth() {
  const router = useRouter();
  const { isAuthenticated, user, login, logout, updateUser, setIsLoading, setError, error } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (credentials: UserLoginCredentials) => {
    try {
      setIsSubmitting(true);
      setIsLoading(true);
      setError(null);

      const response = await loginUser(credentials);
      console.log("🚀 ~ handleLogin ~ response:", response)

      // Handle the login response according to the API guide
      if (response && response.data) {
        login(response.data as User);
        console.log("🚀 ~ handleLogin ~ isAuthenticated:", isAuthenticated);
        
        // Add a small delay to ensure state is updated and cookie is set
        setTimeout(() => {
          console.log("Navigating to dashboard...");
          router.push('/dashboard');
          // Force a hard navigation to ensure the server component reruns
          // window.location.href = '/dashboard';
        }, 100);
      } else {
        throw new Error('Invalid response structure from login API');
      }
      
      setIsSubmitting(false);
      setIsLoading(false);
      return response;
    } catch (err: unknown) {
      console.log("🚀 ~ handleLogin ~ err:", err)
      setIsSubmitting(false);
      setIsLoading(false);
      
      // Extract error message from response if available
      let errorMsg = 'Login failed. Please try again.';
      if (err instanceof AxiosError && err.response?.data) {
        const errorData = err.response.data as ApiErrorResponse;
        errorMsg = errorData.msg || errorMsg;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }
      
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
      
      // Extract error message from response if available
      let errorMsg = 'Registration failed. Please try again.';
      if (err instanceof AxiosError && err.response?.data) {
        const errorData = err.response.data as ApiErrorResponse;
        errorMsg = errorData.msg || errorMsg;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }
      
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
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.'
      });
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