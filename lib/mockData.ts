// Mock data for development without a backend
import { User, Project, Task, TimeLog, TaskChecklistItem } from '@/types';

// Mock User
export const mockUser: User = {
  id: 1,
  name: 'Test User',
  userName: 'testuser',
  email: 'test@example.com',
  role: 'user',
  created_at: new Date().toISOString(),
};

// Mock Projects
export const mockProjects: Project[] = [
  {
    id: 1,
    name: 'Website Redesign',
    description: 'Complete redesign of company website with modern UI/UX',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'In-Progress',
    userId: 1,
    totalHours: '120',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    name: 'Mobile App Development',
    description: 'Building a mobile app for both iOS and Android',
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'In-Progress',
    userId: 1,
    totalHours: '80',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    name: 'API Integration',
    description: 'Integrating third-party payment gateway APIs',
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Pending',
    userId: 1,
    totalHours: '40',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock Tasks
export const mockTasks: Task[] = [
  {
    id: 1,
    name: 'Homepage Design',
    subject: 'Homepage Design',
    description: 'Create the design for the homepage with hero section',
    status: 'Pending',
    startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    totalTimeSpent: 12600, // 3.5 hours in seconds
    assignedUserId: 1,
    projectId: 1,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    name: 'Backend Setup',
    subject: 'Backend Setup',
    description: 'Set up the Node.js server and database',
    status: 'Pending',
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    totalTimeSpent: 28800, // 8 hours in seconds
    assignedUserId: 1,
    projectId: 1,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    name: 'User Authentication',
    subject: 'User Authentication',
    description: 'Implement user login and registration',
    status: 'In-Progress',
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    totalTimeSpent: 18000, // 5 hours in seconds
    assignedUserId: 1,
    projectId: 2,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    name: 'Mobile UI Design',
    subject: 'Mobile UI Design',
    description: 'Design UI elements for the mobile app',
    status: 'In-Progress',
    startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    totalTimeSpent: 10800, // 3 hours in seconds
    assignedUserId: 1,
    projectId: 2,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    name: 'Payment API Research',
    subject: 'Payment API Research',
    description: 'Research available payment gateways and their features',
    status: 'Done',
    startDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    totalTimeSpent: 14400, // 4 hours in seconds
    assignedUserId: 1,
    projectId: 3,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock Project Members
export const mockProjectMembers = [
  {
    id: 1,
    projectId: 1,
    userId: 1,
    role: 'owner',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    projectId: 2,
    userId: 1,
    role: 'owner',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    projectId: 3,
    userId: 1,
    role: 'owner',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock Team Members
export const mockTeamMembers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Developer',
    addedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Designer',
    addedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike@example.com',
    role: 'Project Manager',
    addedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    role: 'QA Engineer',
    addedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    name: 'David Brown',
    email: 'david@example.com',
    role: 'Backend Developer',
    addedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

// Mock Time Logs
export const mockTimeLogs: TimeLog[] = [
  {
    id: 1,
    name: 'Homepage design work',
    description: 'Working on hero section design',
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 1,
    projectId: 1,
    taskId: 1,
    duration: 10800, // 3 hours in seconds
    timeSpent: 0,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    name: 'Server setup',
    description: 'Setting up Express server',
    startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 1,
    projectId: 1,
    taskId: 2,
    timeSpent: 0,
    duration: 14400, // 4 hours in seconds
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    name: 'Login page implementation',
    description: 'Creating authentication forms',
    startTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    userId: 1,
    projectId: 2,
    taskId: 3,
    timeSpent: 0,
    duration: 7200, // 2 hours in seconds
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    name: 'Mobile app wireframes',
    description: 'Creating initial wireframes for mobile screens',
    startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 3 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 1,
    projectId: 2,
    taskId: 4,
    timeSpent: 0,
    duration: 10800, // 3 hours in seconds
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    name: 'API research',
    description: 'Researching payment gateway options',
    startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    userId: 1,
    projectId: 3,
    taskId: 5,
    timeSpent: 0,
    duration: 14400, // 4 hours in seconds
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock Checklist Items
export const mockChecklistItems: TaskChecklistItem[] = [
  {
    id: 1,
    taskId: 1,
    item: 'Research competitor features',
    isCompleted: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    taskId: 1,
    item: 'Create wireframes for new design',
    isCompleted: false,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    taskId: 1,
    item: 'Review wireframes with team',
    isCompleted: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 4,
    taskId: 2,
    item: 'Set up development environment',
    isCompleted: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 5,
    taskId: 2,
    item: 'Implement authentication',
    isCompleted: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

// Helper functions for managing mock data state
const projects = [...mockProjects];
const tasks = [...mockTasks];
const logs = [...mockTimeLogs];
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
export const getMockTaskById = (id: number) => {
  return tasks.find(task => task.id === id) || null;
};
export const getMockTasksByProject = (projectId: number) => {
  return tasks.filter(task => task.projectId === projectId);
};
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

// Get checklist items for a task
export const getMockChecklistItems = (taskId: number) => {
  return {
    checklist: mockChecklistItems.filter(item => item.taskId === taskId)
  };
};

// Add a new checklist item
export const addMockChecklistItem = (data: { taskId: number; item: string }) => {
  const newItem: TaskChecklistItem = {
    id: mockChecklistItems.length + 1,
    taskId: data.taskId,
    item: data.item,
    isCompleted: false,
    createdAt: new Date().toISOString()
  };
  
  mockChecklistItems.push(newItem);
  
  return {
    checklistItem: newItem
  };
};

// Update a checklist item
export const updateMockChecklistItem = (id: number, data: { item?: string; isCompleted?: boolean }) => {
  const itemIndex = mockChecklistItems.findIndex(item => item.id === id);
  
  if (itemIndex === -1) {
    throw new Error('Checklist item not found');
  }
  
  mockChecklistItems[itemIndex] = {
    ...mockChecklistItems[itemIndex],
    ...data
  };
  
  return {
    checklistItem: mockChecklistItems[itemIndex]
  };
};

// Remove a checklist item
export const deleteMockChecklistItem = (id: number) => {
  const itemIndex = mockChecklistItems.findIndex(item => item.id === id);
  
  if (itemIndex === -1) {
    throw new Error('Checklist item not found');
  }
  
  mockChecklistItems.splice(itemIndex, 1);
  
  return {
    message: 'Checklist item deleted successfully'
  };
}; 