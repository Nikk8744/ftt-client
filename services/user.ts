import apiClient from './api-client';
import { UserLoginCredentials, UserRegistrationData, UserUpdateData } from '@/types';

export const loginUser = async (credentials: UserLoginCredentials) => {
  try {
    const response = await apiClient.post('/user/login', credentials);
    
    // The backend sets cookies automatically with HttpOnly
    // We'll also store the user data in localStorage for getCurrentUser function
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
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

export const updateUser = async (id: number, data: UserUpdateData) => {
  try {
    const response = await apiClient.patch(`/user/updateDetails/${id}`, data);
    // Update localStorage with the new user data
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
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
    // Call the backend logout endpoint to clear cookies
    const response = await apiClient.post('/user/logout');
    
    // Also clear localStorage as a precaution
    localStorage.removeItem('auth-token');
    
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if the API call fails, clear the localStorage
    localStorage.removeItem('auth-token');
    
    throw error;
  }
};

// Get current user information - This should rely on the JWT token in cookies
export const getCurrentUser = async () => {
  try {
    // Get the current user's ID from localStorage
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      return { user: null };
    }

    const { id } = JSON.parse(storedUser);
    // Use the getUserById function to fetch fresh user data
    const response = await getUserById(id);
    return response;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};