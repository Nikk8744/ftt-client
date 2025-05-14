import apiClient from './api-client';
import { LoginCredentials, RegisterData, User } from '@/types';

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

export const updateUser = async (id: number, data: Partial<User>) => {
  const response = await apiClient.patch(`/user/updateDetails/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: number) => {
  const response = await apiClient.delete(`/user/deleteUser/${id}`);
  return response.data;
};

export const logoutUser = async () => {
  const response = await apiClient.post('/user/logout');
  return response.data;
}; 