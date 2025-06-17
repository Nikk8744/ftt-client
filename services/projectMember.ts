import apiClient from './api-client';

/**
 * Add a member to a project
 */
export const addMemberToProject = async (projectId: number, userId: number) => {
  try {
    const response = await apiClient.post('/projectMember/addMember', { 
      projectId, 
      userId 
    });
    return response.data;
  } catch (error) {
    console.error('Error adding member to project:', error);
    throw error;
  }
};

/**
 * Remove a member from a project
 */
export const removeMemberFromProject = async (projectId: number, userId: number) => {
  try {
    const response = await apiClient.delete('/projectMember/removeMember', {
      data: { projectId, userId }
    });
    return response.data;
  } catch (error) {
    console.error('Error removing member from project:', error);
    throw error;
  }
};

/**
 * Get all members of a project
 */
export const getAllMembersOfProject = async (projectId: number) => {
  try {
    const response = await apiClient.get(`/projectMember/getAllMembers/${projectId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching members of project ${projectId}:`, error);
    throw error;
  }
};

/**
 * Get all projects a user is a member of
 */
export const getAllProjectsUserIsMemberOf = async () => {
  try {
    const response = await apiClient.get('/projectMember/getAllProjectsAUserIsMemberOf');
    // console.log("🚀 ~ getAllProjectsUserIsMemberOf ~ response:", response)
    return response.data;
  } catch (error) {
    console.error('Error fetching projects user is member of:', error);
    throw error;
  }
};

/**
 * Get all team members for a project
 * Alias for getAllMembersOfProject
 */
export const getTeamMembers = getAllMembersOfProject;

/**
 * Add a new team member
 * Alias for addMemberToProject
 */
export const addTeamMember = addMemberToProject;

/**
 * Remove a team member
 * Alias for removeMemberFromProject
 */
export const removeTeamMember = removeMemberFromProject; 