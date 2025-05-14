import { apiGet, apiPost, apiPatch, apiDelete } from './api-client';
import { Task, TaskCreateData, TaskUpdateData, ApiResponse } from '@/types';

/**
 * Create a new task within a project
 */
export async function createTask(
  projectId: number, 
  taskData: TaskCreateData
): Promise<ApiResponse<Task>> {
  return apiPost<ApiResponse<Task>>(`/tasks/createTask/${projectId}`, taskData);
}

/**
 * Get a task by ID
 */
export async function getTaskById(taskId: number): Promise<ApiResponse<Task>> {
  return apiGet<ApiResponse<Task>>(`/tasks/getTask/${taskId}`);
}

/**
 * Get all tasks for a project
 */
export async function getProjectTasks(projectId: number): Promise<{ tasks: Task[]; msg: string }> {
  return apiGet<{ tasks: Task[]; msg: string }>(`/tasks/getProjectTasks/${projectId}`);
}

/**
 * Get all tasks assigned to the authenticated user
 */
export async function getUserTasks(): Promise<{ tasks: Task[]; msg: string }> {
  return apiGet<{ tasks: Task[]; msg: string }>('/tasks/getUserTasks');
}

/**
 * Get all tasks (admin only)
 */
export async function getAllTasks(): Promise<{ tasks: Task[]; msg: string }> {
  return apiGet<{ tasks: Task[]; msg: string }>('/tasks/getAllTask');
}

/**
 * Update a task
 */
export async function updateTask(
  taskId: number, 
  updateData: TaskUpdateData
): Promise<ApiResponse<Task>> {
  return apiPatch<ApiResponse<Task>>(`/tasks/updateTask/${taskId}`, updateData);
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: number): Promise<ApiResponse<boolean>> {
  return apiDelete<ApiResponse<boolean>>(`/tasks/deleteTask/${taskId}`);
} 