import { User } from '@/types';
import { mockUser } from '@/lib/mockData';
// import apiClient from './api-client';

// Mock task followers data structure
const taskFollowers = new Map<number, number[]>();
// Default all tasks to be followed by the current user
const defaultFollowerId = mockUser.id;

// Mock assignees data structure (tasks already have assignedUserId in the model)
const taskAssignees = new Map<number, number>();

/**
 * Get followers for a specific task
 */
export const getTaskFollowers = async (taskId: number): Promise<{ users: User[] }> => {
  // In a real app, this would call the API
  // const response = await apiClient.get(`/tasks/${taskId}/followers`);
  // return response.data;
  
  // Using mock data for development
  if (!taskFollowers.has(taskId)) {
    // Default to the current user as follower
    taskFollowers.set(taskId, [defaultFollowerId]);
  }
  
  // Return current mockUser for each follower ID
  // In a real system, you'd fetch the real user data for each ID
  const followerIds = taskFollowers.get(taskId) || [];
  return { 
    users: followerIds.map(id => ({
      ...mockUser,
      id
    }))
  };
};

/**
 * Add a follower to a task
 */
export const addTaskFollower = async (taskId: number, userId: number): Promise<{ success: boolean }> => {
  // In a real app, this would call the API
  // const response = await apiClient.post(`/tasks/${taskId}/followers`, { userId });
  // return response.data;
  
  // Using mock data for development
  if (!taskFollowers.has(taskId)) {
    taskFollowers.set(taskId, [defaultFollowerId]);
  }
  
  const followers = taskFollowers.get(taskId) || [];
  if (!followers.includes(userId)) {
    followers.push(userId);
    taskFollowers.set(taskId, followers);
  }
  
  return { success: true };
};

/**
 * Remove a follower from a task
 */
export const removeTaskFollower = async (taskId: number, userId: number): Promise<{ success: boolean }> => {
  // In a real app, this would call the API
  // const response = await apiClient.delete(`/tasks/${taskId}/followers/${userId}`);
  // return response.data;
  
  // Using mock data for development
  if (taskFollowers.has(taskId)) {
    const followers = taskFollowers.get(taskId) || [];
    const updatedFollowers = followers.filter(id => id !== userId);
    taskFollowers.set(taskId, updatedFollowers);
  }
  
  return { success: true };
};

/**
 * Get the assignee of a task
 */
export const getTaskAssignee = async (taskId: number): Promise<{ user: User | null }> => {
  // In a real app, this would call the API
  // const response = await apiClient.get(`/tasks/${taskId}/assignee`);
  // return response.data;
  
  // Using mock data for development
  const assigneeId = taskAssignees.get(taskId) || defaultFollowerId;
  return { 
    user: { ...mockUser, id: assigneeId }
  };
};

/**
 * Assign a task to a user
 */
export const assignTask = async (taskId: number, userId: number): Promise<{ success: boolean }> => {
  // In a real app, this would call the API
  // const response = await apiClient.post(`/tasks/${taskId}/assignee`, { userId });
  // return response.data;
  
  // Using mock data for development
  taskAssignees.set(taskId, userId);
  return { success: true };
};

/**
 * Remove assignee from a task
 */
export const unassignTask = async (taskId: number): Promise<{ success: boolean }> => {
  // In a real app, this would call the API
  // const response = await apiClient.delete(`/tasks/${taskId}/assignee`);
  // return response.data;
  
  // Using mock data for development
  taskAssignees.delete(taskId);
  return { success: true };
}; 