import { TimeLog, TimeLogCreateData, TimeLogUpdateData } from '@/types';
import {
  getMockLogs,
  getMockLogById,
  addMockLog,
  updateMockLog,
  deleteMockLog
} from '@/lib/mockData';

// Comment out the original API client import
// import apiClient from './api-client';

/**
 * Start a new time log
 */
export async function startTimeLog(): Promise<ApiResponse<TimeLog>> {
  // Comment out the API call and replace with mock data
  // const response = await apiClient.post('/logs/startTimeLog', {});
  // return response.data;
  
  const log = addMockLog({
    userId: 1, // Mock user ID
  });
  return { log };
}

/**
 * Stop an active time log
 */
export async function stopTimeLog(
  logId: number, 
  data: { projectId: number; taskId: number; name?: string; description?: string }
): Promise<ApiResponse<TimeLog>> {
  // Comment out the API call and replace with mock data
  // const response = await apiClient.post(`/logs/stopTimeLog/${logId}`, data);
  // return response.data;
  
  const log = addMockLog({
    ...data,
    userId: 1, // Mock user ID
  });
  return { log };
}

/**
 * Get a time log by its ID
 */
export async function getTimeLogById(logId: number): Promise<ApiResponse<TimeLog>> {
  // Comment out the API call and replace with mock data
  // const response = await apiClient.get(`/logs/getLogById/${logId}`);
  // return response.data;
  
  const log = getMockLogById(logId);
  if (!log) {
    throw new Error('Log not found');
  }
  return { log };
}

/**
 * Get all logs for the currently authenticated user
 */
export const getAllUserLogs = async () => {
  // Comment out the API call and replace with mock data
  // const response = await apiClient.get('/log/getAllUserLogs');
  // return response.data;
  
  const logs = getMockLogs();
  return { logs };
};

/**
 * Get all logs for a specific project
 */
export async function getProjectLogs(projectId: number): Promise<{ logs: TimeLog[]; msg: string }> {
  // Comment out the API call and replace with mock data
  // const response = await apiClient.get(`/logs/getProjectLogs/${projectId}`);
  // return response.data;
  
  const logs = getMockLogs().filter(log => log.projectId === projectId);
  return { logs, msg: 'Logs retrieved successfully' };
}

/**
 * Get all logs for a specific task
 */
export async function getTaskLogs(taskId: number): Promise<{ logs: TimeLog[]; msg: string }> {
  // Comment out the API call and replace with mock data
  // const response = await apiClient.get(`/logs/getTaskLogs/${taskId}`);
  // return response.data;
  
  const logs = getMockLogs().filter(log => log.taskId === taskId);
  return { logs, msg: 'Logs retrieved successfully' };
}

/**
 * Update a time log
 */
export async function updateTimeLog(
  logId: number, 
  updateData: TimeLogUpdateData
): Promise<ApiResponse<TimeLog>> {
  // Comment out the API call and replace with mock data
  // const response = await apiClient.patch(`/logs/updateLog/${logId}`, updateData);
  // return response.data;
  
  const log = updateMockLog(logId, updateData);
  if (!log) {
    throw new Error('Log not found');
  }
  return { log };
}

/**
 * Delete a time log
 */
export async function deleteTimeLog(logId: number): Promise<ApiResponse<boolean>> {
  // Comment out the API call and replace with mock data
  // const response = await apiClient.delete(`/logs/deleteLog/${logId}`);
  // return response.data;
  
  const success = deleteMockLog(logId);
  if (!success) {
    throw new Error('Log not found');
  }
  return { msg: 'Log deleted successfully' };
}

/**
 * Calculate total duration from a collection of logs
 */
export function calculateTotalDuration(logs: TimeLog[]): number {
  return logs.reduce((total, log) => total + (log.duration || 0), 0);
}

export const createTimeLog = async (data: TimeLogCreateData) => {
  // Comment out the API call and replace with mock data
  // const response = await apiClient.post('/log/createLog', data);
  // return response.data;
  
  const log = addMockLog({
    ...data,
    userId: 1, // Mock user ID
  });
  return { log };
}; 