import apiClient from './api-client';
import { User } from '@/types';
// import { mockUser } from '@/lib/mockData';
// import apiClient from './api-client';

// Mock task followers data structure
// const taskFollowers = new Map<number, number[]>();
// Default all tasks to be followed by the current user
// const defaultFollowerId = mockUser.id;

// Mock assignees data structure (tasks already have assignedUserId in the model)
// const taskAssignees = new Map<number, number>();

/**
 * Get followers for a specific task
 */
export const getTaskFollowers = async (taskId: number): Promise<{ users: User[] }> => {
  try {
    const response = await apiClient.get(`/taskMembers/task/${taskId}/followers`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching followers for task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Add a user as a follower to a task
 */
export const addTaskFollower = async (taskId: number, userId: number) => {
  try {
    const response = await apiClient.post(`/taskMembers/follow/${taskId}`, { userId });
    return response.data;
  } catch (error) {
    console.error(`Error adding follower to task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Remove a user as a follower from a task
 */
export const removeTaskFollower = async (taskId: number, userId: number) => {
  try {
    const response = await apiClient.delete(`/taskMembers/unfollow/${taskId}/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error removing follower from task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Get the assignee of a task
 */
// export const getTaskAssignee = async (taskId: number): Promise<{ user: User | null }> => {
//   try {
//     const response = await apiClient.get(`/taskAssignment/task/${taskId}/assignees`);
//     // Return the first assignee if there are any
//     return { 
//       user: response.data.users && response.data.users.length > 0 ? response.data.users[0] : null 
//     };
//   } catch (error) {
//     console.error(`Error fetching assignee for task ${taskId}:`, error);
//     throw error;
//   }
// };

/**
 * Get all assignees of a task
 */
export const getTaskAssignees = async (taskId: number) => {
  try {
    const response = await apiClient.get(`/taskAssignment/task/${taskId}/assignees`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching assignees for task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Assign a user to a task
 */
export const assignUserToTask = async (taskId: number, userId: number) => {
  try {
    console.log("🚀 ~ assignUserToTask ~ taskId:", taskId)
    // const response = await apiClient.post(`/taskAssignment/assign/${taskId}`, { userId });
    const response = await apiClient.post(`/taskAssignment/assign/${taskId}/${userId}`);
    console.log("🚀 ~ assignUserToTask ~ response:", response)
    return response.data;
  } catch (error) {
    console.error(`Error assigning user to task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Unassign a user from a task
 */
export const unassignUserFromTask = async (taskId: number, userId: number) => {
  try {
    const response = await apiClient.delete(`/taskAssignment/unassign/${taskId}/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Error unassigning user from task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Bulk assign users to a task
 */
export const bulkAssignUsersToTask = async (taskId: number, userIds: number[]) => {
  try {
    const response = await apiClient.post(`/taskAssignment/bulk-assign/${taskId}`, { userIds });
    return response.data;
  } catch (error) {
    console.error(`Error bulk assigning users to task ${taskId}:`, error);
    throw error;
  }
};

/**
 * Get all tasks assigned to a user
 */
export const getUserAssignedTasks = async (userId: number) => {
  try {
    const response = await apiClient.get(`/taskAssignment/user/${userId}/assigned`);
    // console.log("Assigned tasks API response:", response.data);
    
    // Make sure we return in a consistent format with { tasks: [...] }
    if (Array.isArray(response.data)) {
      return { tasks: response.data };
    }
    
    // If the API already returns { tasks: [...] }, use that
    if (response.data && response.data.tasks) {
      return response.data;
    }
    
    // Fallback for other response structures
    return { tasks: response.data || [] };
  } catch (error) {
    console.error(`Error fetching assigned tasks for user ${userId}:`, error);
    throw error;
  }
}; 