import { TimeLog, TimeLogCreateData, TimeLogUpdateData } from '@/types';
import apiClient from './api-client';

/**
 * Start a new time log
 */
export async function startTimeLog() {
  try {
    const response = await apiClient.post('/logs/startTimeLog', {});
    return response.data;
  } catch (error) {
    console.error('Error starting time log:', error);
    throw error;
  }
}

/**
 * Stop an active time log
 */
export async function stopTimeLog(
  logId: number, 
  data: { projectId: number; taskId: number; name?: string; description?: string }
) {
  try {
    const response = await apiClient.post(`/logs/stopTimeLog/${logId}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error stopping time log ${logId}:`, error);
    throw error;
  }
}

/**
 * Get a time log by its ID
 */
export async function getTimeLogById(logId: number) {
  try {
    const response = await apiClient.get(`/logs/getLogById/${logId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching time log ${logId}:`, error);
    throw error;
  }
}

/**
 * Get all logs for the currently authenticated user
 */
export const getUserLogs = async (userId: number) => {
  try {
    //! Note: The API endpoint expects a userId parameter in the path, but the controller 
    // ignores it and uses the authenticated user ID from the request
    const userIdParam = userId || 1; // This is just a placeholder since the backend ignores it
    const response = await apiClient.get(`/logs/getUserLogs/${userIdParam}`);
    return {
      logs: response.data.data || []
    };
  } catch (error) {
    console.error('Error fetching user logs:', error);
    throw error;
  }
};

/**
 * Get all logs for a specific project
 */
export async function getProjectLogs(projectId: number) {
  try {
    const response = await apiClient.get(`/logs/getProjectLogs/${projectId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching logs for project ${projectId}:`, error);
    throw error;
  }
}

/**
 * Get all logs for a specific task
 */
export async function getTaskLogs(taskId: number) {
  try {
    const response = await apiClient.get(`/logs/getTaskLogs/${taskId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching logs for task ${taskId}:`, error);
    throw error;
  }
}

/**
 * Update a time log
 */
export async function updateTimeLog(
  logId: number, 
  updateData: TimeLogUpdateData
) {
  try {
    const response = await apiClient.patch(`/logs/updateLog/${logId}`, updateData);
    return response.data;
  } catch (error) {
    console.error(`Error updating time log ${logId}:`, error);
    throw error;
  }
}

/**
 * Delete a time log
 */
export async function deleteTimeLog(logId: number) {
  try {
    const response = await apiClient.delete(`/logs/deleteLog/${logId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting time log ${logId}:`, error);
    throw error;
  }
}

/**
 * Calculate total duration from a collection of logs
 */
export function calculateTotalDuration(logs: TimeLog[]): number {
  return logs.reduce((total, log) => total + (log.timeSpent || 0), 0);
}

/**
 * Create a new time log manually 
 */
export const createTimeLog = async (data: TimeLogCreateData) => {
  try {
    const response = await apiClient.post('/logs/createLog', data);
    return response.data;
  } catch (error) {
    console.error('Error creating time log:', error);
    throw error;
  }
};

/**
 * Get total time logged today for the current user
 */
export const getTotalTimeToday = async () => {
  try {
    const response = await apiClient.get('/logs/totalTimeToday');
    return response.data;
  } catch (error) {
    console.error('Error fetching total time today:', error);
    throw error;
  }
}; 