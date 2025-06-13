/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiGet } from './api-client';
import axios from 'axios';

export interface ProjectSummary {
  totalProjects: number;
  completedProjects: number;
  inProgressProjects: number;
  pendingProjects: number;
  completionRate: number;
  projects?: ProjectSummaryItem[];
}

export interface ProjectSummaryItem {
  id: number;
  name: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  completionPercentage: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  approachingDeadlines: number;
  teamMembers: number;
  isOwner: boolean;
}

export interface TaskStatusSummary {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  tasksByStatus?: TaskStatusCount[];
}

export interface TaskStatusCount {
  status: string;
  count: number;
  percentage?: number;
}

export interface TaskStatusResponse {
  msg: string;
  data: TaskStatusCount[];
}

export interface TeamWorkloadData {
  userId: number;
  userName: string;
  email: string;
  role: string;
  taskCount: number;
  completedCount: number;
}

export interface RiskAssessment {
  id: string;
  name: string;
  riskLevel: 'low' | 'medium' | 'high';
  impact: string;
  mitigation: string;
}

export interface TaskCompletionTrend {
  date: string;
  completed: number;
  created: number;
}

// API response interfaces
export interface AllProjectsSummaryResponse {
  msg: string;
  data: {
    summary: {
      totalProjects: number;
      completedProjects: number;
      projectCompletionRate: number;
      totalTasks: number;
      completedTasks: number;
      taskCompletionRate: number;
      overdueTasks: number;
      approachingDeadlines: number;
    };
    projects: ProjectSummaryItem[];
  };
}

// Get project summary metrics
export const getProjectSummary = async (projectId?: string): Promise<ProjectSummary> => {
  let endpoint;
  
  if (!projectId || projectId === 'all') {
    endpoint = '/reports/project/summary/all';
  } else {
    endpoint = `/reports/project/${projectId}/summary`;
  }
  
  try {
    if (!projectId || projectId === 'all') {
      const response = await apiGet<AllProjectsSummaryResponse>(endpoint);
      const { data } = response;
      return {
        totalProjects: data.summary.totalProjects,
        completedProjects: data.summary.completedProjects,
        inProgressProjects: data.projects.filter(p => p.status === 'In-Progress').length,
        pendingProjects: data.projects.filter(p => p.status === 'Pending').length,
        completionRate: data.summary.projectCompletionRate,
        projects: data.projects
      };
    } else {
      return await apiGet<ProjectSummary>(endpoint);
    }
  } catch (error) {
    console.error('Error fetching project summary:', error);
    throw error;
  }
};

// Get task status overview
export const getTaskStatusOverview = async (projectId?: string): Promise<TaskStatusSummary> => {
  try {
    const endpoint = `/reports/tasks/status${projectId ? `?projectId=${projectId}` : ''}`;
    const response = await apiGet<any>(endpoint);
    console.log("🚀 ~ getTaskStatusOverview ~ response:", response);
    
    // Process the response to match our expected format
    const { data } = response;
    
    if (!data) {
      console.error("API returned invalid data format for task status:", response);
      return {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        completionRate: 0,
        tasksByStatus: []
      };
    }
    
    // Map the new response structure to our expected format
    const tasksByStatus = data.distribution || [];
    const totalTasks = data.totalTasks || 0;
    const completedTasks = data.completedTasks || 0;
    const overdueTasks = data.overdueCount || 0;
    const completionRate = data.completionRate || 0;
    
    // Find in-progress and pending tasks from distribution
    const inProgressTasks = tasksByStatus.find((item: { status: string; count: number; }) => item.status === "In-Progress")?.count || 0;
    const pendingTasks = tasksByStatus.find((item: { status: string; count: number; }) => item.status === "Pending")?.count || 0;
    
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      overdueTasks,
      completionRate,
      tasksByStatus
    };
  } catch (error) {
    console.error("Error fetching task status overview:", error);
    return {
      totalTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      pendingTasks: 0,
      overdueTasks: 0,
      completionRate: 0,
      tasksByStatus: []
    };
  }
};

// Get project tasks breakdown
export const getProjectTasks = async (projectId: string) => {
  return apiGet(`/reports/project/${projectId}/tasks`);
};

// Get team allocation for a project
export const getTeamWorkload = async (projectId: string): Promise<TeamWorkloadData[]> => {
  try {
    const response = await apiGet<any>(`/reports/project/${projectId}/team`);
    
    // Check if response has the expected structure
    if (!response || !response.data || !Array.isArray(response.data)) {
      console.error("API returned invalid data format for team workload:", response);
      return [];
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching team workload for project ${projectId}:`, error);
    return [];
  }
};

// Get risk assessment for a project
export const getProjectRisks = async (projectId: string): Promise<RiskAssessment[]> => {
  return apiGet<RiskAssessment[]>(`/reports/project/${projectId}/risks`);
};

// Get overdue tasks
export const getOverdueTasks = async (projectId?: string) => {
  const endpoint = `/reports/tasks/overdue${projectId ? `?projectId=${projectId}` : ''}`;
  return apiGet(endpoint);
};

// Get task completion trend
export const getTaskCompletionTrend = async (projectId?: string, days: number = 30): Promise<TaskCompletionTrend[]> => {
  try {
    const endpoint = `/reports/tasks/completion-trend${projectId ? `?projectId=${projectId}` : ''}${projectId ? '&' : '?'}days=${days}`;
    const response = await apiGet<any>(endpoint);
    console.log("🚀 ~ getTaskCompletionTrend ~ response:", response);
    
    // Check if response has the expected structure
    if (!response || !response.data || !Array.isArray(response.data)) {
      console.error("API returned invalid data format for task completion trend:", response);
      return [];
    }
    
    // Map the API response to our expected format
    return response.data.map((item: any) => ({
      date: item.date,
      completed: item.completed || 0,
      created: item.created || 0
    }));
  } catch (error) {
    console.error("Error fetching task completion trend:", error);
    return [];
  }
};

// Get project report PDF for a specific project
export const getProjectReportPdf = async (projectId: string) => {
  try {
    // Ensure projectId is valid
    if (!projectId || projectId === 'all') {
      console.error('Invalid project ID for project report');
      return;
    }
    
    // Use the correct API path that will be properly routed through Next.js
    const endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/reports/project/${projectId}/pdf`;
    
    console.log('Downloading PDF from:', endpoint);
    
    // Use axios to make a direct request with proper blob handling
    const response = await axios.get(endpoint, {
      responseType: 'blob',
      withCredentials: true,
      headers: {
        'Accept': 'application/pdf',
      }
    });
    
    // Create a blob URL and trigger download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `project-${projectId}-report.pdf`);
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
    
    console.log(`Project report for project ${projectId} downloaded successfully`);
  } catch (error) {
    console.error('Error downloading project report:', error);
    alert('Failed to download report. Please try again later.');
  }
};

// Get tasks report PDF (can be filtered by project)
export const getTasksReportPdf = async (projectId?: string) => {
  try {
    // Use the correct API path that will be properly routed through Next.js
    const endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/reports/tasks/pdf${projectId ? `?projectId=${projectId}` : ''}`;
    
    console.log('Downloading PDF from:', endpoint);
    
    // Use axios to make a direct request with proper blob handling
    const response = await axios.get(endpoint, {
      responseType: 'blob',
      withCredentials: true,
      headers: {
        'Accept': 'application/pdf',
      }
    });
    
    // Create a blob URL and trigger download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tasks${projectId ? `-project-${projectId}` : ''}-report.pdf`);
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
    
    console.log(`Tasks report ${projectId ? `for project ${projectId}` : 'for all projects'} downloaded successfully`);
  } catch (error) {
    console.error('Error downloading tasks report:', error);
    alert('Failed to download report. Please try again later.');
  }
};

// Get all projects summary report PDF
export const getAllProjectsReportPdf = async () => {
  try {
    // Use the correct API path that will be properly routed through Next.js
    const endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/reports/project/summary/all/pdf`;
    
    console.log('Downloading PDF from:', endpoint);
    
    // Use axios to make a direct request with proper blob handling
    const response = await axios.get(endpoint, {
      responseType: 'blob',
      withCredentials: true,
      headers: {
        'Accept': 'application/pdf',
      }
    });
    console.log("🚀 ~ getAllProjectsReportPdf ~ response:", response)
    
    // Create a blob URL and trigger download
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'all-projects-report.pdf');
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
    
    console.log('All projects summary report downloaded successfully');
  } catch (error) {
    console.error('Error downloading all projects report:', error);
    alert('Failed to download report. Please try again later.');
  }
};
