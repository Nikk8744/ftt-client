import { apiGet, apiPost, apiPatch, apiDelete } from './api-client';
import { TimeLog, TimeLogCreateData, TimeLogUpdateData, ApiResponse } from '@/types';

/**
 * Start a new time log
 */
export async function startTimeLog(): Promise<ApiResponse<TimeLog>> {
  return apiPost<ApiResponse<TimeLog>>('/logs/startTimeLog', {});
}

/**
 * Stop an active time log
 */
export async function stopTimeLog(
  logId: number, 
  data: { projectId: number; taskId: number; name?: string; description?: string }
): Promise<ApiResponse<TimeLog>> {
  return apiPost<ApiResponse<TimeLog>>(`/logs/stopTimeLog/${logId}`, data);
}

/**
 * Get a time log by its ID
 */
export async function getTimeLogById(logId: number): Promise<ApiResponse<TimeLog>> {
  return apiGet<ApiResponse<TimeLog>>(`/logs/getLogById/${logId}`);
}

/**
 * Get all logs for the currently authenticated user
 */
export async function getAllUserLogs(): Promise<{ logs: TimeLog[]; msg: string }> {
  // Note: The API expects a userId parameter but actually uses the authenticated user from JWT
  return apiGet<{ logs: TimeLog[]; msg: string }>(`/logs/getUserLogs/me`);
}

/**
 * Get all logs for a specific project
 */
export async function getProjectLogs(projectId: number): Promise<{ logs: TimeLog[]; msg: string }> {
  return apiGet<{ logs: TimeLog[]; msg: string }>(`/logs/getProjectLogs/${projectId}`);
}

/**
 * Get all logs for a specific task
 */
export async function getTaskLogs(taskId: number): Promise<{ logs: TimeLog[]; msg: string }> {
  return apiGet<{ logs: TimeLog[]; msg: string }>(`/logs/getTaskLogs/${taskId}`);
}

/**
 * Update a time log
 */
export async function updateTimeLog(
  logId: number, 
  updateData: TimeLogUpdateData
): Promise<ApiResponse<TimeLog>> {
  return apiPatch<ApiResponse<TimeLog>>(`/logs/updateLog/${logId}`, updateData);
}

/**
 * Delete a time log
 */
export async function deleteTimeLog(logId: number): Promise<ApiResponse<boolean>> {
  return apiDelete<ApiResponse<boolean>>(`/logs/deleteLog/${logId}`);
}

/**
 * Calculate total duration from a collection of logs
 */
export function calculateTotalDuration(logs: TimeLog[]): number {
  return logs.reduce((total, log) => total + (log.duration || 0), 0);
} 