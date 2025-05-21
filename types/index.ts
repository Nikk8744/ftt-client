// User Types
export interface User {
  id: number;
  name: string;
  userName: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface UserLoginCredentials {
  email: string;
  password: string;
}

export interface UserRegistrationData {
  name: string;
  userName: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface UserUpdateData {
  name?: string;
  userName?: string;
  email?: string;
  role?: 'user' | 'admin';
}

// Project Types
export interface Project {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'In-Progress' | 'Completed' | null;
  userId: number; // Owner ID
  totalHours: number | string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectCreateData {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status?: 'Pending' | 'In-Progress' | 'Completed';
  totalHours?: number;
}

export interface ProjectUpdateData {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: 'Pending' | 'In-Progress' | 'Completed';
  totalHours?: number;
}

// Task Types
export interface Task {
  id: number;
  name?: string;
  subject: string;
  description: string | null;
  status: 'Pending' | 'In-Progress' | 'Done' |  null;
  startDate: string;
  dueDate: string | null;
  totalTimeSpent: number | null;
  assignedUserId: number;
  projectId: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCreateData {
  subject: string;
  description?: string;
  status?: 'Pending' | 'In-Progress' | 'Done';
  dueDate?: string;
  assignedUserId?: number;
}

export interface TaskUpdateData {
  subject?: string;
  description?: string;
  status?: 'Pending' | 'In-Progress' | 'Done';
  dueDate?: string;
  assignedUserId?: number;
}

// Project Member Types
export interface ProjectMember {
  id: number;
  projectId: number;
  userId: number;
  role?: string;
  createdAt: string;
}

export interface ProjectMemberCreateData {
  projectId: number;
  userId: number;
  role?: string;
}

// Time Log Types
export interface TimeLog {
  id: number;
  name: string | null;
  description: string | null;
  startTime: string;
  endTime: string | null;
  userId: number;
  projectId: number | null;
  taskId: number | null;
  timeSpent: number | null;
  duration: number | null; // in seconds
  createdAt: string;
  updatedAt?: string;
}

export interface TimeLogCreateData {
  name?: string;
  description?: string;
  projectId?: number;
  taskId?: number;
}

export interface TimeLogUpdateData {
  name?: string | null;
  description?: string | null;
  projectId?: number | null;
  taskId?: number | null;
  startTime?: string;
  endTime?: string;
}

// Task Checklist Types
export interface TaskChecklistItem {
  id: number;
  taskId: number;
  item: string;
  isCompleted: boolean | null;
  createdAt: string;
}

export interface TaskChecklistItemCreateData {
  taskId: number;
  item: string;
}

export interface TaskChecklistItemUpdateData {
  item?: string;
  isCompleted?: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  message?: string;
  msg?: string;
  error?: string;
  data?: T;
}

// Auth related types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// Timer related types
export interface TimerState {
  isRunning: boolean;
  startTime: Date | null;
  activeLogId: number | null;
  elapsedSeconds: number;
} 