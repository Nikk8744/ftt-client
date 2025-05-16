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
    // According to the API guide, we can use the /user/getUser/:id endpoint
    // But we need the ID of the current user
    
    // For the purpose of this app, since the JWT token in cookies contains user info,
    // we'll just make a call to any authenticated endpoint which will use the token
    // to identify the user. Then we'll use the response from login instead of 
    // making an extra API call.
    
    // Just check if the authentication is valid
    await apiClient.get('/user/logout');
    
    // Return the user from local auth state
    const user = localStorage.getItem('user');
    return user ? { user: JSON.parse(user) } : { user: null };
  } catch (error) {
    console.error('Error fetching current user:', error);
    throw error;
  }
};