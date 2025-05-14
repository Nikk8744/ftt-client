import apiClient from './api-client';
import { ChecklistItemCreateData, ChecklistItemUpdateData } from '@/types';

export const getTaskChecklist = async (taskId: number) => {
  const response = await apiClient.get(`/item/getAllItemsOfATask/${taskId}`);
  return response.data;
};

export const addChecklistItem = async (data: ChecklistItemCreateData) => {
  const response = await apiClient.post('/item/createItem', data);
  return response.data;
};

export const updateChecklistItem = async (id: number, data: ChecklistItemUpdateData) => {
  const response = await apiClient.patch(`/item/updateItem/${id}`, data);
  return response.data;
};

export const removeChecklistItem = async (id: number) => {
  const response = await apiClient.delete(`/item/deleteItem/${id}`);
  return response.data;
}; 