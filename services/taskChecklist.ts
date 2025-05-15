import apiClient from './api-client';
import { ChecklistItemCreateData, ChecklistItemUpdateData, TaskChecklistItemCreateData, TaskChecklistItemUpdateData } from '@/types';
import { 
  getMockChecklistItems, 
  addMockChecklistItem, 
  updateMockChecklistItem, 
  deleteMockChecklistItem 
} from '@/lib/mockData';

export const getTaskChecklist = async (taskId: number) => {
  // Comment out the API call and replace with mock data
  // const response = await apiClient.get(`/item/getAllItemsOfATask/${taskId}`);
  // return response.data;
  
  return getMockChecklistItems(taskId);
};

export const addChecklistItem = async (data: TaskChecklistItemCreateData) => {
  // Comment out the API call and replace with mock data
  // const response = await apiClient.post('/item/createItem', data);
  // return response.data;
  
  return addMockChecklistItem(data);
};

export const updateChecklistItem = async (id: number, data: TaskChecklistItemUpdateData) => {
  // Comment out the API call and replace with mock data
  // const response = await apiClient.patch(`/item/updateItem/${id}`, data);
  // return response.data;
  
  return updateMockChecklistItem(id, data);
};

export const removeChecklistItem = async (id: number) => {
  // Comment out the API call and replace with mock data
  // const response = await apiClient.delete(`/item/deleteItem/${id}`);
  // return response.data;
  
  return deleteMockChecklistItem(id);
}; 