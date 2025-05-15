import apiClient from './api-client';
import { UserLoginCredentials, UserRegistrationData, UserUpdateData } from '@/types';

export const loginUser = async (credentials: UserLoginCredentials) => {
  try {
    const response = await apiClient.post('/user/login', credentials);
    
    // Store the JWT token if it's returned from the backend
    if (response.data.token) {
      localStorage.setItem('auth-token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const registerUser = async (data: UserRegistrationData) => {
  try {
    const response = await apiClient.post('/user/register', data);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const getUserById = async (id: number) => {
  try {
    const response = await apiClient.get(`/user/getUser/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    throw error;
  }
};

export const updateUser = async (data: UserUpdateData) => {
  try {
    const response = await apiClient.patch('/user/updateUser', data);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (id: number) => {
  try {
    const response = await apiClient.delete(`/user/deleteUser/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    // Remove JWT token from localStorage
    localStorage.removeItem('auth-token');
    
    // If your backend has a logout endpoint
    const response = await apiClient.post('/user/logout');
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if the API call fails, we should still clear the local token
    localStorage.removeItem('auth-token');
    throw error;
  }
};

// Get current user information
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/user/current');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};