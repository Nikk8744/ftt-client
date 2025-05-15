import { Task, TaskCreateData, TaskUpdateData } from '@/types';
import {
  getMockTasks,
  getMockTaskById,
  getMockTasksByProject,
  addMockTask,
  updateMockTask,
  deleteMockTask
} from '@/lib/mockData';

// Comment out the original API client import
// import apiClient from './api-client';

/**
 * Create a new task within a project
 */
export const createTask = async (data: TaskCreateData) => {
  // Comment out the API call and replace with mock data
  // const response = await apiClient.post('/task/createTask', data);
  // return response.data;
  
  const task = addMockTask({
    ...data,
    userId: 1, // Mock user ID
  });
  return { task };
};

/**
 * Get a task by ID
 */
export const getTaskById = async (id: number) => {
  // Comment out the API call and replace with mock data
  // const response = await apiClient.get(`/task/getSingleTask/${id}`);
  // return response.data;
  
  const task = getMockTaskById(id);
  if (!task) {
    throw new Error('Task not found');
  }
  return { task };
};

/**
 * Get all tasks for a project
 */
export const getTasksByProject = async (projectId: number) => {
  // Comment out the API call and replace with mock data
  // const response = await apiClient.get(`/task/getTasksByProject/${projectId}`);
  // return response.data;
  
  const tasks = getMockTasksByProject(projectId);
  return { tasks };
};

/**
 * Get all tasks assigned to the authenticated user
 */
export const getUserTasks = async () => {
  // Comment out the API call and replace with mock data
  // const response = await apiClient.get('/task/getUserTasks');
  // return response.data;
  
  const tasks = getMockTasks();
  return { tasks };
};

/**
 * Get all tasks (admin only)
 */
export const getAllTasks = async () => {
  // Comment out the API call and replace with mock data
  // const response = await apiClient.get('/task/getAllTask');
  // return response.data;
  
  const tasks = getMockTasks();
  return { tasks };
};

/**
 * Update a task
 */
export const updateTask = async (id: number, data: TaskUpdateData) => {
  // Comment out the API call and replace with mock data
  // const response = await apiClient.patch(`/task/updateTask/${id}`, data);
  // return response.data;
  
  const task = updateMockTask(id, data);
  if (!task) {
    throw new Error('Task not found');
  }
  return { task };
};

/**
 * Delete a task
 */
export const deleteTask = async (id: number) => {
  // Comment out the API call and replace with mock data
  // const response = await apiClient.delete(`/task/deleteTask/${id}`);
  // return response.data;
  
  const success = deleteMockTask(id);
  if (!success) {
    throw new Error('Task not found');
  }
  return { msg: 'Task deleted successfully' };
}; 