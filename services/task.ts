import { TaskCreateData, TaskUpdateData } from '@/types';
import apiClient from './api-client';

/**
 * Create a new task within a project
 */
export const createTask = async (projectId: number, data: TaskCreateData) => {
  console.log("🚀 ~ createTask ~ data:", data)
  try {
    const response = await apiClient.post(`/tasks/createTask/${projectId}`, data);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

/**
 * Get all tasks for the current user
 */
export const getUserTasks = async () => {
  try {
    const response = await apiClient.get('/tasks/getUserTasks');
    console.log("🚀 ~ getUserTasks ~ response:", response)
    return {
      tasks: response.data.Users_tasks || []
    };
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    throw error;
  }
};

/**
 * Get a specific task by ID
 */
export const getTaskById = async (id: number) => {
  try {
    const response = await apiClient.get(`/tasks/getTask/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching task ${id}:`, error);
    throw error;
  }
};

/**
 * Get tasks for a specific project
 */
export const getTasksByProject = async (projectId: number) => {
  try {
    const response = await apiClient.get(`/tasks/getProjectTasks/${projectId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching tasks for project ${projectId}:`, error);
    throw error;
  }
};

/**
 * Update a task
 */
export const updateTask = async (id: number, data: TaskUpdateData) => {
  try {
    const response = await apiClient.patch(`/tasks/updateTask/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating task ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (id: number) => {
  try {
    const response = await apiClient.delete(`/tasks/deleteTask/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting task ${id}:`, error);
    throw error;
  }
}; 