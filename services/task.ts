import { TaskCreateData, TaskUpdateData } from '@/types';
import apiClient from './api-client';
import axios from 'axios';

/**
 * Create a new task within a project
 */
export const createTask = async (projectId: number, data: TaskCreateData) => {
  const requestData = {
    ...data,
    projectId
  };
  console.log("🚀 ~ createTask ~ requestData:", requestData);

  try {
    const response = await apiClient.post(`/tasks/createTask/${projectId}`, requestData);
    return response.data;
  } catch (error) {
    console.error('Error creating task:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    }
    throw error;
  }
};

/**
 * Get all tasks for the current user
 */
export const getUserTasks = async () => {
  try {
    const response = await apiClient.get('/tasks/getUserTasks');
    return {
      tasks: response.data.tasks || []
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