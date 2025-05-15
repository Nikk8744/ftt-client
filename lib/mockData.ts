// Mock data for development without a backend
import { User, Project, Task, TimeLog } from '@/types';

// Mock User
export const mockUser: User = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock Projects
export const mockProjects: Project[] = [
  {
    id: 1,
    name: 'Website Redesign',
    description: 'Complete redesign of company website with modern UI/UX',
    userId: 1,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Mobile App Development',
    description: 'Creating a new mobile app for client XYZ',
    userId: 1,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Marketing Campaign',
    description: 'Social media marketing campaign for new product launch',
    userId: 1,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock Tasks
export const mockTasks: Task[] = [
  {
    id: 1,
    name: 'Design Homepage Mockup',
    description: 'Create mockup for the homepage using Figma',
    projectId: 1,
    userId: 1,
    status: 'In Progress',
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Implement Frontend',
    description: 'Develop frontend components with React',
    projectId: 1,
    userId: 1,
    status: 'Todo',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'API Integration',
    description: 'Connect frontend to backend APIs',
    projectId: 1,
    userId: 1,
    status: 'Todo',
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    name: 'App Architecture Design',
    description: 'Design app architecture and component structure',
    projectId: 2,
    userId: 1,
    status: 'Done',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 5,
    name: 'UI Implementation',
    description: 'Implement UI components based on design',
    projectId: 2,
    userId: 1,
    status: 'In Progress',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 6,
    name: 'Content Strategy',
    description: 'Develop content strategy for social media',
    projectId: 3,
    userId: 1,
    status: 'In Progress',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Mock Time Logs
export const mockTimeLogs: TimeLog[] = [
  {
    id: 1,
    description: 'Working on homepage design',
    startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 3 * 60 * 60, // 3 hours in seconds
    userId: 1,
    projectId: 1,
    taskId: 1,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    description: 'App architecture planning',
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 1 * 60 * 60 * 1000).toISOString(),
    duration: 3 * 60 * 60, // 3 hours in seconds
    userId: 1,
    projectId: 2,
    taskId: 4,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    description: 'Content research',
    startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 2 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 2 * 60 * 60, // 2 hours in seconds
    userId: 1,
    projectId: 3,
    taskId: 6,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    description: 'UI implementation',
    startTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    duration: 3 * 60 * 60, // 3 hours in seconds
    userId: 1,
    projectId: 2,
    taskId: 5,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    description: 'Adding frontend components',
    startTime: new Date().toISOString(),
    endTime: null,
    duration: null,
    userId: 1,
    projectId: 1,
    taskId: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Helper functions for managing mock data state
let projects = [...mockProjects];
let tasks = [...mockTasks];
let logs = [...mockTimeLogs];
let nextProjectId = projects.length + 1;
let nextTaskId = tasks.length + 1;
let nextLogId = logs.length + 1;

// Project helper functions
export const getMockProjects = () => projects;
export const getMockProjectById = (id: number) => projects.find(p => p.id === id);
export const addMockProject = (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
  const newProject = {
    ...project,
    id: nextProjectId++,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  projects.push(newProject);
  return newProject;
};
export const updateMockProject = (id: number, updates: Partial<Project>) => {
  const index = projects.findIndex(p => p.id === id);
  if (index === -1) return null;
  
  projects[index] = {
    ...projects[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  return projects[index];
};
export const deleteMockProject = (id: number) => {
  const index = projects.findIndex(p => p.id === id);
  if (index === -1) return false;
  
  projects.splice(index, 1);
  return true;
};

// Task helper functions
export const getMockTasks = () => tasks;
export const getMockTaskById = (id: number) => tasks.find(t => t.id === id);
export const getMockTasksByProject = (projectId: number) => tasks.filter(t => t.projectId === projectId);
export const addMockTask = (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
  const newTask = {
    ...task,
    id: nextTaskId++,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  return newTask;
};
export const updateMockTask = (id: number, updates: Partial<Task>) => {
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return null;
  
  tasks[index] = {
    ...tasks[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  return tasks[index];
};
export const deleteMockTask = (id: number) => {
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return false;
  
  tasks.splice(index, 1);
  return true;
};

// Log helper functions
export const getMockLogs = () => logs;
export const getMockLogById = (id: number) => logs.find(l => l.id === id);
export const addMockLog = (log: Omit<TimeLog, 'id' | 'createdAt' | 'updatedAt'>) => {
  const newLog = {
    ...log,
    id: nextLogId++,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  logs.push(newLog);
  return newLog;
};
export const updateMockLog = (id: number, updates: Partial<TimeLog>) => {
  const index = logs.findIndex(l => l.id === id);
  if (index === -1) return null;
  
  logs[index] = {
    ...logs[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  return logs[index];
};
export const deleteMockLog = (id: number) => {
  const index = logs.findIndex(l => l.id === id);
  if (index === -1) return false;
  
  logs.splice(index, 1);
  return true;
}; 