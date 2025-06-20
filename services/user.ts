import apiClient from './api-client';
import { UserLoginCredentials, UserRegistrationData, UserUpdateData } from '@/types';

export const loginUser = async (credentials: UserLoginCredentials) => {
  try {
    const response = await apiClient.post('/user/login', credentials);
    
    // The backend sets cookies automatically with HttpOnly
    // We'll store the user data in auth-storage for consistent access
    if (response.data.user) {
      // Create or update auth-storage with the correct structure
      const authData = {
        state: {
          isAuthenticated: true,
          user: response.data.user
        },
        version: 0
      };
      localStorage.setItem('auth-storage', JSON.stringify(authData));
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
    // Update auth-storage with the new user data
    if (response.data.user) {
      // Get existing auth-storage data
      const storedAuth = localStorage.getItem('auth-storage');
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        // Update only the user data while preserving the structure
        authData.state.user = response.data.user;
        localStorage.setItem('auth-storage', JSON.stringify(authData));
      }
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
    
    // Clear auth-storage from localStorage
    localStorage.removeItem('auth-storage');
    
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if the API call fails, clear the localStorage
    localStorage.removeItem('auth-storage');
    
    throw error;
  }
};

// Get current user information - This should rely on the JWT token in cookies
export const getCurrentUser = async () => {
  try {
    // Get the current user's ID from auth-storage in localStorage
    const storedAuth = localStorage.getItem('auth-storage');
    if (!storedAuth) {
      return { user: null };
    }

    // Parse the auth-storage JSON structure
    const authData = JSON.parse(storedAuth);
    
    // Extract user from the nested state structure
    const user = authData?.state?.user;
    
    if (!user || !user.id) {
      return { user: null };
    }

    // Use the getUserById function to fetch fresh user data
    const response = await getUserById(user.id);
    return response;
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};