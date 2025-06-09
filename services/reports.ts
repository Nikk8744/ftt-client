import { apiGet } from './api-client';
import { TaskCompletionData } from '@/components/feature/reports/TaskCompletionChart';

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
}

export interface TaskStatusResponse {
  msg: string;
  data: TaskStatusCount[];
}

export interface TeamWorkloadData {
  memberName: string;
  tasksAssigned: number;
  tasksCompleted: number;
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
    const response = await apiGet<TaskStatusResponse>(endpoint);
    console.log("🚀 ~ getTaskStatusOverview ~ response:", response)
    
    // Process the response to match our expected format
    const { data } = response;
    
    if (!Array.isArray(data)) {
      console.error("API returned invalid data format for task status:", response);
      return await getTaskStatusOverviewMock();
    }
    
    // Calculate totals from the status array
    const completedTasks = data.find(item => item.status === "Done")?.count || 0;
    const inProgressTasks = data.find(item => item.status === "In-Progress")?.count || 0;
    const pendingTasks = data.find(item => item.status === "Pending")?.count || 0;
    const overdueTasks = data.find(item => item.status === "Overdue")?.count || 0   ;
    const totalTasks = data.reduce((sum, item) => sum + item.count, 0);
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      overdueTasks,
      completionRate,
      tasksByStatus: data
    };
  } catch (error) {
    console.error("Error fetching task status overview:", error);
    return await getTaskStatusOverviewMock();
  }
};

// Get project tasks breakdown
export const getProjectTasks = async (projectId: string) => {
  return apiGet(`/reports/project/${projectId}/tasks`);
};

// Get team allocation for a project
export const getTeamWorkload = async (projectId: string): Promise<TeamWorkloadData[]> => {
  return apiGet<TeamWorkloadData[]>(`/reports/project/${projectId}/team`);
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
    const response = await apiGet<TaskCompletionTrend[]>(endpoint);
    
    // Ensure we have an array
    if (!Array.isArray(response)) {
      console.error("API returned non-array response for task completion trend:", response);
      return await getTaskCompletionTrendMock(projectId, days);
    }
    
    return response;
  } catch (error) {
    console.error("Error fetching task completion trend:", error);
    return await getTaskCompletionTrendMock(projectId, days);
  }
};

// Get project report PDF
export const getProjectReportPdf = async (projectId: string) => {
  const endpoint = `/reports/project/${projectId}/pdf`;
  window.open(endpoint, '_blank');
};

// Get tasks report PDF
export const getTasksReportPdf = async (projectId?: string) => {
  const endpoint = `/reports/tasks/pdf${projectId ? `?projectId=${projectId}` : ''}`;
  window.open(endpoint, '_blank');
};

/**
 * Get project summary statistics
 * @param projectId Optional project ID to filter by
 * @returns Project summary statistics
 */
export async function getProjectSummaryMock(projectId?: string): Promise<ProjectSummary> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock data
  return {
    totalProjects: 12,
    completedProjects: 5,
    inProgressProjects: 4,
    pendingProjects: 3,
    completionRate: 42,
    projects: [
      {
        id: 1,
        name: "Test Project 1",
        description: "This is a test project",
        status: "Completed",
        startDate: "2025-01-20T00:00:00.000Z",
        endDate: "2025-02-20T00:00:00.000Z",
        completionPercentage: 100,
        totalTasks: 10,
        completedTasks: 10,
        overdueTasks: 0,
        approachingDeadlines: 0,
        teamMembers: 5,
        isOwner: true
      },
      {
        id: 2,
        name: "Test Project 2",
        description: "This is another test project",
        status: "In-Progress",
        startDate: "2025-02-20T00:00:00.000Z",
        endDate: "2025-03-20T00:00:00.000Z",
        completionPercentage: 50,
        totalTasks: 8,
        completedTasks: 4,
        overdueTasks: 1,
        approachingDeadlines: 2,
        teamMembers: 3,
        isOwner: true
      },
      {
        id: 3,
        name: "Test Project 3",
        description: "This is a third test project",
        status: "Pending",
        startDate: "2025-03-20T00:00:00.000Z",
        endDate: "2025-04-20T00:00:00.000Z",
        completionPercentage: 0,
        totalTasks: 5,
        completedTasks: 0,
        overdueTasks: 0,
        approachingDeadlines: 0,
        teamMembers: 2,
        isOwner: false
      }
    ]
  };
}

/**
 * Get task status overview
 * @param projectId Optional project ID to filter by
 * @returns Task status statistics
 */
export async function getTaskStatusOverviewMock(projectId?: string): Promise<TaskStatusSummary> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock data
  return {
    totalTasks: 86,
    completedTasks: 42,
    inProgressTasks: 28,
    pendingTasks: 10,
    overdueTasks: 6,
    completionRate: 49,
  };
}

/**
 * Get task completion trend data
 * @param projectId Optional project ID to filter by
 * @param days Number of days to include in the trend data
 * @returns Array of task completion data points
 */
export async function getTaskCompletionTrendMock(
  projectId?: string,
  days: number = 7
): Promise<TaskCompletionData[]> {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generate mock data for the specified number of days
  const data: TaskCompletionData[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Format date as YYYY-MM-DD
    const formattedDate = date.toISOString().split('T')[0];
    
    // Generate random data
    const completed = Math.floor(Math.random() * 10) + 1;
    const created = Math.floor(Math.random() * 10) + 1;
    
    data.push({
      date: formattedDate,
      completed,
      created,
    });
  }
  
  return data;
}

/**
 * Get team workload data
 * @param projectId Optional project ID to filter by
 * @returns Team workload data
 */
export async function getTeamWorkloadMock(projectId?: string) {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock data
  return [
    { name: 'John Doe', taskCount: 12, completedTaskCount: 8 },
    { name: 'Jane Smith', taskCount: 15, completedTaskCount: 10 },
    { name: 'Alex Johnson', taskCount: 8, completedTaskCount: 5 },
    { name: 'Sarah Williams', taskCount: 10, completedTaskCount: 9 },
    { name: 'Michael Brown', taskCount: 14, completedTaskCount: 7 },
  ];
}

/**
 * Get risk assessment data
 * @param projectId Optional project ID to filter by
 * @returns Risk assessment data
 */
export async function getRiskAssessmentMock(projectId?: string) {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock data
  return [
    { 
      projectName: 'Website Redesign', 
      riskLevel: 'High', 
      description: 'Resource constraints may delay delivery',
      mitigationPlan: 'Allocate additional resources from other projects'
    },
    { 
      projectName: 'Mobile App Development', 
      riskLevel: 'Medium', 
      description: 'Technical challenges with API integration',
      mitigationPlan: 'Schedule technical spike to explore solutions'
    },
    { 
      projectName: 'Marketing Campaign', 
      riskLevel: 'Low', 
      description: 'Budget constraints for advertising',
      mitigationPlan: 'Revise marketing strategy to focus on organic channels'
    },
  ];
} 