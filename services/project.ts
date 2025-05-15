import { Project, ProjectCreateData, ProjectUpdateData } from '@/types';
import {
  getMockProjects,
  getMockProjectById,
  addMockProject,
  updateMockProject,
  deleteMockProject
} from '@/lib/mockData';

// Comment out the original API client import
// import apiClient from './api-client';

/**
 * Create a new project
 */
export const createProject = async (data: ProjectCreateData) => {
  // Comment out the API call and replace with mock data
  // const response = await apiClient.post('/project/createProject', data);
  // return response.data;
  
  const project = addMockProject({
    ...data,
    userId: 1, // Mock user ID
  });
  return { project };
};

/**
 * Get a project by ID
 */
export const getProjectById = async (id: number) => {
  // Comment out the API call and replace with mock data
  // const response = await apiClient.get(`/project/getSingleProject/${id}`);
  // return response.data;
  
  const project = getMockProjectById(id);
  if (!project) {
    throw new Error('Project not found');
  }
  return { project };
};

/**
 * Get all projects owned by the authenticated user
 */
export const getAllProjectsOfUser = async () => {
  // Comment out the API call and replace with mock data
  // const response = await apiClient.get('/project/getAllUserProjects');
  // return response.data;
  
  const projects = getMockProjects();
  return { projects };
};

/**
 * Update a project
 */
export const updateProject = async (id: number, data: ProjectUpdateData) => {
  // Comment out the API call and replace with mock data
  // const response = await apiClient.patch(`/project/updateProject/${id}`, data);
  // return response.data;
  
  const project = updateMockProject(id, data);
  if (!project) {
    throw new Error('Project not found');
  }
  return { project };
};

/**
 * Delete a project
 */
export const deleteProject = async (id: number) => {
  // Comment out the API call and replace with mock data
  // const response = await apiClient.delete(`/project/deleteProject/${id}`);
  // return response.data;
  
  const success = deleteMockProject(id);
  if (!success) {
    throw new Error('Project not found');
  }
  return { msg: 'Project deleted successfully' };
}; 