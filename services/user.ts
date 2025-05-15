import apiClient from './api-client';
import { LoginCredentials, RegisterData, User, UserUpdateData } from '@/types';
import { mockUser } from '@/lib/mockData';

export const loginUser = async (credentials: LoginCredentials) => {
  const response = await apiClient.post('/user/login', credentials);
  return response.data;
};

export const registerUser = async (data: RegisterData) => {
  const response = await apiClient.post('/user/register', data);
  return response.data;
};

export const getUserById = async (id: number) => {
  const response = await apiClient.get(`/user/getUser/${id}`);
  return response.data;
};

export const updateUser = async (data: UserUpdateData): Promise<{ user: User; message: string }> => {
  // In a real app, this would send to the API
  // const response = await apiClient.patch('/user/updateUser', data);
  // return response.data;
  
  // Update mock user data for development
  Object.assign(mockUser, data);
  
  return { 
    user: mockUser,
    message: 'Profile updated successfully'
  };
};

export const deleteUser = async (id: number) => {
  const response = await apiClient.delete(`/user/deleteUser/${id}`);
  return response.data;
};

export const logoutUser = async () => {
  const response = await apiClient.post('/user/logout');
  return response.data;
};

// Get current user information
export const getCurrentUser = async (): Promise<{ user: User }> => {
  // In a real app, this would fetch from the API
  // const response = await apiClient.get('/user/getUser');
  // return response.data;
  
  // Using mock data for development
  return { user: mockUser };
}; 