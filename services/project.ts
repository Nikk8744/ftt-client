import { apiGet, apiPost, apiPatch, apiDelete } from './api-client';
import { Project, ProjectCreateData, ProjectUpdateData, ApiResponse } from '@/types';

/**
 * Create a new project
 */
export async function createProject(projectData: ProjectCreateData): Promise<ApiResponse<Project>> {
  return apiPost<ApiResponse<Project>>('/project/createProject', projectData);
}

/**
 * Get a project by ID
 */
export async function getProjectById(projectId: number): Promise<ApiResponse<Project>> {
  return apiGet<ApiResponse<Project>>(`/project/getProject/${projectId}`);
}

/**
 * Get all projects owned by the authenticated user
 */
export async function getAllProjectsOfUser(): Promise<{ projects: Project[]; msg: string }> {
  return apiGet<{ projects: Project[]; msg: string }>('/project/getAllProjectsOfUser');
}

/**
 * Update a project
 */
export async function updateProject(
  projectId: number,
  updateData: ProjectUpdateData
): Promise<ApiResponse<Project>> {
  return apiPatch<ApiResponse<Project>>(`/project/updateProject/${projectId}`, updateData);
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: number): Promise<ApiResponse<boolean>> {
  return apiDelete<ApiResponse<boolean>>(`/project/deleteProject/${projectId}`);
} 