import apiClient from './api-client';

export const addMemberToProject = async (projectId: number, userId: number) => {
  const response = await apiClient.post(`/projectMember/addMemberToProject/${projectId}`, { userId });
  return response.data;
};

export const removeMemberFromProject = async (projectId: number, userId: number) => {
  const response = await apiClient.delete(`/projectMember/removeMemberFromProject/${projectId}/${userId}`);
  return response.data;
};

export const getAllMembersOfProject = async (projectId: number) => {
  const response = await apiClient.get(`/projectMember/getAllMembersOfAProject/${projectId}`);
  return response.data;
};

export const getAllProjectsUserIsMemberOf = async () => {
  const response = await apiClient.get('/projectMember/getAllProjectsAUserIsMemberOf');
  return response.data;
}; 