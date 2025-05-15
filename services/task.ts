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
    subject: data.subject,
    name: data.subject, // For backwards compatibility
    status: data.status || 'Pending',
    dueDate: data.dueDate || null,
    userId: 1, // Mock user ID
    projectId: 1, // Default project if not provided
  });
  
  return { task, message: 'Task created successfully' };
};

/**
 * Get all tasks for the current user
 */
export const getUserTasks = async () => {
  // const response = await apiClient.get('/task/getAllTasksOfUser');
  // return response.data;
  
  const tasks = getMockTasks();
  return { tasks };
};

/**
 * Get a specific task by ID
 */
export const getTaskById = async (id: number) => {
  // const response = await apiClient.get(`/task/getTask/${id}`);
  // return response.data;
  
  const task = getMockTaskById(id);
  return { task };
};

/**
 * Get tasks for a specific project
 */
export const getTasksByProject = async (projectId: number) => {
  // const response = await apiClient.get(`/task/getAllTasksOfProject/${projectId}`);
  // return response.data;
  
  const tasks = getMockTasksByProject(projectId);
  return { tasks };
};

/**
 * Update a task
 */
export const updateTask = async (id: number, data: TaskUpdateData) => {
  // const response = await apiClient.patch(`/task/updateTask/${id}`, data);
  // return response.data;
  
  const updatedTask = updateMockTask(id, data);
  return { task: updatedTask, message: 'Task updated successfully' };
};

/**
 * Delete a task
 */
export const deleteTask = async (id: number) => {
  // const response = await apiClient.delete(`/task/deleteTask/${id}`);
  // return response.data;
  
  const success = deleteMockTask(id);
  return { message: success ? 'Task deleted successfully' : 'Task not found' };
}; 