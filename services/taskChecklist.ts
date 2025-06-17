import apiClient from './api-client';
// import { ChecklistItemCreateData, ChecklistItemUpdateData } from '@/types';

/**
 * Get all checklist items for a task
 */
export const getTaskChecklist = async (taskId: number) => {
  try {
    const response = await apiClient.get(`/items/getTaskChecklist/${taskId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching checklist for task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Get a specific checklist item by ID
 */
export const getChecklistItemById = async (itemId: number) => {
  try {
    const response = await apiClient.get(`/items/getChecklistItemById/${itemId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching checklist item ${itemId}:`, error);
    throw error;
  }
};

/**
 * Add a checklist item to a task
 */
export const addChecklistItem = async (data: { taskId: number; item: string }) => {
  try {
    const response = await apiClient.post('/items/addItem', data);
      return response.data;
  } catch (error) {
    console.error('Error adding checklist item:', error);
    throw error;
  }
};

/**
 * Update a checklist item
 */
export const updateChecklistItem = async (itemId: number, data: { item?: string; isCompleted?: boolean }) => {
  try {
    const response = await apiClient.patch(`/items/updateChecklistItem/${itemId}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating checklist item ${itemId}:`, error);
    throw error;
  }
};

/**
 * Remove a checklist item
 */
export const removeChecklistItem = async (itemId: number) => {
  try {
    const response = await apiClient.delete(`/items/removeChecklistItem/${itemId}`);
    return response.data;
  } catch (error) {
    console.error(`Error removing checklist item ${itemId}:`, error);
    throw error;
  }
}; 