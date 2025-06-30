import apiClient from './api-client';
import { Project, ProjectCreateData, ProjectUpdateData } from '@/types';
import axios from 'axios';
import { getUserById } from './user';

/**
 * Create a new project
 */
export const createProject = async (data: ProjectCreateData) => {
  try {
    const response = await apiClient.post('/project/createProject', data);
    return response.data;
  } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
      const errorMessage = error.response.data?.message || 'Error creating project';
      console.error('Error creating project:', error);
      throw new Error(errorMessage);
    }
    console.error('Error creating project:', error);
    throw error;
  }
};

/**
 * Get a project by ID
 */
export const getProjectById = async (id: number) => {
  try {
    const response = await apiClient.get(`/project/getProject/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching project ${id}:`, error);
    throw error;
  }
};


export const getProjectOwner = getUserById;

/**
 * Get all projects owned by the authenticated user
 */
export const getAllProjectsOfUser = async () => {
  try {
    const response = await apiClient.get('/project/getAllProjectsOfUser');
    return {
      projects: response.data.data || []
    };
  } catch (error) {
    console.error('Error fetching user projects:', error);
    throw error;
  }
};

/**
 * Get all projects (owned and member of) for a user
 */
export const getCombinedProjectsOfUser = async () => {
  try {
    // Get owned projects
    const ownedProjectsResponse = await apiClient.get('/project/getAllProjectsOfUser');
    const ownedProjects = ownedProjectsResponse.data.data || [];

    // Get projects where user is a member
    const memberProjectsResponse = await apiClient.get('/projectMember/getAllProjectsAUserIsMemberOf');
    const memberProjects = memberProjectsResponse.data.data || [];

    // Combine and remove duplicates
    const allProjects = [...ownedProjects];
    memberProjects.forEach((memberProject: Project) => {
      if (!allProjects.some(project => project.id === memberProject.id)) {
        allProjects.push(memberProject);
      }
    });

    return { projects: allProjects };
  } catch (error) {
    console.error('Error fetching combined projects:', error);
    throw error;
  }
};

/**
 * Update a project
 */
export const updateProject = async (id: number, data: ProjectUpdateData) => {
  try {
    // Create a clean object with only defined values
    const formattedData: ProjectUpdateData = { ...data };
    
    // Remove empty strings but keep valid values including zeros
    Object.keys(formattedData).forEach(key => {
      const keyName = key as keyof ProjectUpdateData;
      
      // Only delete empty strings, keep all other values (including zeros, booleans, etc.)
      if (formattedData[keyName] === '') {
        delete formattedData[keyName];
      }
    });
    
    // Handle date fields separately to ensure proper ISO format
    if (formattedData.startDate) {
      // If already a Date object
      if (Object.prototype.toString.call(formattedData.startDate) === '[object Date]') {
        formattedData.startDate = (formattedData.startDate as unknown as Date).toISOString();
      } 
      // If string but not ISO format, try to convert to Date first
      else if (typeof formattedData.startDate === 'string' && !formattedData.startDate.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/)) {
        try {
          const date = new Date(formattedData.startDate);
          formattedData.startDate = date.toISOString();
        } catch {
          delete formattedData.startDate; // Remove if invalid
        }
      }
    }
    
    if (formattedData.endDate) {
      // If already a Date object
      if (Object.prototype.toString.call(formattedData.endDate) === '[object Date]') {
        formattedData.endDate = (formattedData.endDate as unknown as Date).toISOString();
      }
      // If string but not ISO format, try to convert to Date first
      else if (typeof formattedData.endDate === 'string' && !formattedData.endDate.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/)) {
        try {
          const date = new Date(formattedData.endDate);
          formattedData.endDate = date.toISOString();
        } catch {
          delete formattedData.endDate; // Remove if invalid
        }
      }
    }
    
    console.log('Sending update for project', id, 'with data:', JSON.stringify(formattedData, null, 2));
    
    const response = await apiClient.patch(`/project/updateProject/${id}`, formattedData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error(`Error updating project ${id}:`, error.message);
      console.error('Response data:', error.response.data);
      console.error('Status code:', error.response.status);
    } else {
      console.error(`Error updating project ${id}:`, error);
    }
    throw error;
  }
};

/**
 * Delete a project
 */
export const deleteProject = async (id: number) => {
  try {
    const response = await apiClient.delete(`/project/deleteProject/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting project ${id}:`, error);
    throw error;
  }
}; 