'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import { 
  BarChart2, 
  CheckCircle2, 
  Clock, 
  ListChecks, 
  AlertTriangle,
  ClipboardList,
  Download
} from 'lucide-react';
import { 
  getProjectSummary, 
  getTaskStatusOverview, 
  getTaskCompletionTrend, 
  getTeamWorkload,
  getProjectRisks,
  TeamWorkloadData,
  RiskAssessment,
  TaskCompletionTrend,
  ProjectSummary,
  TaskStatusSummary,
  getProjectReportPdf,
  getTasksReportPdf,
  getAllProjectsReportPdf
} from '@/services/reports';
import { getAllProjectsUserIsMemberOf } from '@/services/projectMember';
import { getAllProjectsOfUser } from '@/services/project';

// Import chart components
import ProjectStatusChartWrapper from '@/components/feature/reports/ProjectStatusChartWrapper';
import TaskStatusChartWrapper from '@/components/feature/reports/TaskStatusChartWrapper';
import TaskCompletionChartWrapper from '@/components/feature/reports/TaskCompletionChartWrapper';
import TeamWorkloadChartWrapper from '@/components/feature/reports/TeamWorkloadChartWrapper';
import StatCard from '@/components/feature/reports/StatCard';

// Import filter and UI components
import ProjectFilter from '@/components/feature/reports/ProjectFilter';
import RiskAssessmentTable from '@/components/feature/reports/RiskAssessmentTable';
import Button from '@/components/ui/Button';
import DateRangePicker from '@/components/feature/reports/DateRangePicker';
import ExportButton from '@/components/feature/reports/ExportButton';
import ChartCard from '@/components/feature/reports/ChartCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Loader from '@/components/ui/Loader';

// Update the interfaces to match the API structure
interface ProjectResponse {
  id: number;
  name: string;
  description?: string;
  status?: string;
}



export default function ReportsPage() {
  const [projectSummary, setProjectSummary] = useState<ProjectSummary>({
    totalProjects: 0,
    completedProjects: 0,
    inProgressProjects: 0,
    pendingProjects: 0,
    completionRate: 0,
    projects: []
  });
  const [taskSummary, setTaskSummary] = useState<TaskStatusSummary>({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    completionRate: 0,
    tasksByStatus: []
  });
  const [userProjects, setUserProjects] = useState<ProjectResponse[]>([]);
  
  // Separate filter states for each tab
  const [tasksProjectId, setTasksProjectId] = useState('all');
  const [teamProjectId, setTeamProjectId] = useState('all');
  const [risksProjectId, setRisksProjectId] = useState('all');
  
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [taskCompletionData, setTaskCompletionData] = useState<TaskCompletionTrend[]>([]);
  const [teamWorkloadData, setTeamWorkloadData] = useState<TeamWorkloadData[]>([]);
  const [riskAssessmentData, setRiskAssessmentData] = useState<RiskAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Handle project filter changes based on active tab
  const handleProjectFilterChange = (projectId: string) => {
    switch (activeTab) {
      case 'tasks':
        setTasksProjectId(projectId);
        break;
      case 'team':
        setTeamProjectId(projectId);
        break;
      case 'risks':
        setRisksProjectId(projectId);
        break;
      default:
        break;
    }
  };

  // Get the current project ID based on active tab
  const getCurrentProjectId = () => {
    switch (activeTab) {
      case 'tasks':
        return tasksProjectId;
      case 'team':
        return teamProjectId;
      case 'risks':
        return risksProjectId;
      default:
        return 'all';
    }
  };

  // Fetch all projects the user is a member of and has created
  useEffect(() => {
    const fetchUserProjects = async () => {
      try {
        // Fetch projects user is member of
        const memberProjects = await getAllProjectsUserIsMemberOf();
        
        // Fetch projects user has created
        const ownedProjects = await getAllProjectsOfUser();
        
        // Extract project data
        const memberProjectsData = memberProjects.data || [];
        const ownedProjectsData = ownedProjects.projects || [];
        
        // Combine projects and remove duplicates
        const combinedProjects = [...memberProjectsData, ...ownedProjectsData];
        
        // Create a map to track unique projects by ID
        const uniqueProjectsMap = new Map();
        combinedProjects.forEach(project => {
          uniqueProjectsMap.set(project.id, project);
        });
        
        // Convert map back to array
        const uniqueProjects = Array.from(uniqueProjectsMap.values());
        
        setUserProjects(uniqueProjects);
      } catch (error) {
        console.error('Error fetching user projects:', error);
      }
    };

    fetchUserProjects();
  }, []);

  // Fetch overview data (no filters needed)
  useEffect(() => {
    const fetchOverviewData = async () => {
      setIsLoading(true);
      try {
        // Get project summary (all projects)
        const projectData = await getProjectSummary();
        setProjectSummary(projectData);
        
        // Get task status overview (all tasks)
        const taskData = await getTaskStatusOverview();
        setTaskSummary(taskData);
        
        // Get task completion trend (all tasks, last 30 days)
        const completionTrendData = await getTaskCompletionTrend(undefined, 30);
        setTaskCompletionData(Array.isArray(completionTrendData) ? completionTrendData : []);
      } catch (error) {
        console.error('Error fetching overview data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch overview data when on the overview tab
    if (activeTab === 'overview') {
      fetchOverviewData();
    }
  // Remove taskCompletionData from the dependency array as it causes an infinite loop
  }, [activeTab]);

  // Fetch project-specific data when on projects tab
  useEffect(() => {
    const fetchProjectData = async () => {
      if (activeTab !== 'projects') return;
      
      setIsLoading(true);
      try {
        // Get project summary with no filters for projects tab
        const projectData = await getProjectSummary();
        setProjectSummary(projectData);
      } catch (error) {
        console.error('Error fetching project data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [activeTab]);

  // Fetch task-specific data when on tasks tab
  useEffect(() => {
    const fetchTaskData = async () => {
      if (activeTab !== 'tasks') return;
      
      setIsLoading(true);
      try {
        // Get task status overview with filters
        const taskData = await getTaskStatusOverview(
          tasksProjectId !== 'all' ? tasksProjectId : undefined
        );
        setTaskSummary(taskData);
        
        // Get task completion trend with project filter
        const completionTrendData = await getTaskCompletionTrend(
          tasksProjectId !== 'all' ? tasksProjectId : undefined,
          30
        );
        setTaskCompletionData(Array.isArray(completionTrendData) ? completionTrendData : []);
      } catch (error) {
        console.error('Error fetching task data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaskData();
  }, [activeTab, tasksProjectId, dateRange]);

  // Fetch team-specific data when on team tab
  useEffect(() => {
    const fetchTeamData = async () => {
      if (activeTab !== 'team' || teamProjectId === 'all') return;
      
      setIsLoading(true);
      try {
        // Get team workload data for specific project
        const workloadData = await getTeamWorkload(teamProjectId);
        setTeamWorkloadData(Array.isArray(workloadData) ? workloadData : []);
      } catch (error) {
        console.error('Error fetching team data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamData();
  }, [activeTab, teamProjectId]);

  // Fetch risk-specific data when on risks tab
  useEffect(() => {
    const fetchRiskData = async () => {
      if (activeTab !== 'risks' || risksProjectId === 'all') return;
      
      setIsLoading(true);
      try {
        // Get risk assessment data for specific project
        const riskData = await getProjectRisks(risksProjectId);
        setRiskAssessmentData(Array.isArray(riskData) ? riskData : []);
      } catch (error) {
        console.error('Error fetching risk data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRiskData();
  }, [activeTab, risksProjectId]);

  const handleExport = () => {
    // Determine which report to export based on active tab
    switch (activeTab) {
      case 'overview':
        // For overview tab, export all projects summary report
        getAllProjectsReportPdf();
        break;  
      case 'projects':
        // For projects tab, export all projects summary report
        getAllProjectsReportPdf();
        break;
      case 'tasks':
        // For tasks tab, export tasks report with project filter if selected
        getTasksReportPdf(tasksProjectId !== 'all' ? tasksProjectId : undefined);
        break;
      case 'team':
        // For team tab, export project report for the selected project
        if (teamProjectId !== 'all') {
          getProjectReportPdf(teamProjectId);
        } else {
          // If no project selected, show message
          console.log('Please select a project to export team report');
        }
        break;
      case 'risks':
        // For risks tab, export project report for the selected project
        if (risksProjectId !== 'all') {
          getProjectReportPdf(risksProjectId);
        } else {
          // If no project selected, show message
          console.log('Please select a project to export risks report');
        }
        break;
      default:
        break;
    }
  };

  // Map API data structure to component expected structure for TeamWorkloadChart
  const mappedTeamWorkloadData = teamWorkloadData.map(item => ({
    name: item.userName || '',
    taskCount: item.taskCount || 0,
    completedTaskCount: item.completedCount || 0
  }));

  // Show filters based on active tab
  const showProjectFilter = activeTab === 'tasks' || activeTab === 'team' || activeTab === 'risks';
  const showDateFilter = activeTab === 'tasks';

  return (
    <div className="p-6 space-y-6 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Reports Dashboard</h1>
        
        {/* Show filters only when needed */}
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          {showProjectFilter && (
            <div className="w-full md:w-64">
              <ProjectFilter 
                onChange={handleProjectFilterChange} 
                defaultValue={getCurrentProjectId()}
              />
            </div>
          )}
          {showDateFilter && (
            <div className="w-full md:w-72">
              <DateRangePicker onChange={setDateRange} />
            </div>
          )}
          <ExportButton 
            onExport={handleExport} 
            disabled={isLoading || (activeTab === 'team' && teamProjectId === 'all') || (activeTab === 'risks' && risksProjectId === 'all')}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {isLoading ? (
            <Loader centered text="Loading report data..." />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                  title="Total Projects" 
                  value={projectSummary.totalProjects || userProjects.length} 
                  icon={<ClipboardList />} 
                  iconBgColor="bg-blue-100"
                  iconColor="text-blue-500"
                />
                <StatCard 
                  title="Project Completion Rate" 
                  value={`${projectSummary.completionRate || 0}%`} 
                  icon={<BarChart2 />} 
                  iconBgColor="bg-green-100"
                  iconColor="text-green-500"
                />
                <StatCard 
                  title="Total Tasks" 
                  value={taskSummary.totalTasks || 0} 
                  icon={<ListChecks />} 
                  iconBgColor="bg-indigo-100"
                  iconColor="text-indigo-500"
                />
                <StatCard 
                  title="Task Completion Rate" 
                  value={`${taskSummary.completionRate || 0}%`} 
                  icon={<CheckCircle2 />} 
                  iconBgColor="bg-green-100"
                  iconColor="text-green-500"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard 
                  title="Project Status Distribution" 
                  description="Overview of project statuses across your organization"
                  actions={
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => getAllProjectsReportPdf()}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export PDF
                    </Button>
                  }
                >
                  <div className="h-64">
                    {projectSummary && <ProjectStatusChartWrapper data={projectSummary} />}
                  </div>
                </ChartCard>
                
                <ChartCard 
                  title="Task Status Distribution" 
                  description="Overview of task statuses"
                  actions={
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => getTasksReportPdf()}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export PDF
                    </Button>
                  }
                >
                  <TaskStatusChartWrapper data={taskSummary} />
                </ChartCard>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <ChartCard 
                  title="Task Completion Trend" 
                  description="Trend of tasks completed over time"
                  actions={
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleExport()}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export PDF
                    </Button>
                  }
                >
                  <TaskCompletionChartWrapper data={taskCompletionData} />
                </ChartCard>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <Card className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">Latest Activity Summary</h3>
                  {userProjects.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900 rounded-md">
                        <Clock className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">You have access to {userProjects.length} project(s)</p>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900 rounded-md">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">{taskSummary.overdueTasks || 0} tasks are overdue across your projects</p>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900 rounded-md">
                        <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
                        <p className="text-sm text-gray-700 dark:text-gray-300">{taskSummary.completedTasks || 0} tasks completed in the last 30 days</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900 rounded-md">
                      <Clock className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                      <p className="text-sm text-gray-700 dark:text-gray-300">You don&apos;t have any projects yet</p>
                    </div>
                  )}
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          {isLoading ? (
            <Loader centered text="Loading project reports..." />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard 
                  title="Total Projects" 
                  value={projectSummary.totalProjects || userProjects.length} 
                  icon={<ClipboardList />} 
                  iconBgColor="bg-blue-100"
                  iconColor="text-blue-500"
                />
                <StatCard 
                  title="Completed Projects" 
                  value={projectSummary.completedProjects || 0} 
                  icon={<CheckCircle2 />} 
                  iconBgColor="bg-green-100"
                  iconColor="text-green-500"
                />
                <StatCard 
                  title="In Progress Projects" 
                  value={projectSummary.inProgressProjects || 0} 
                  icon={<Clock />} 
                  iconBgColor="bg-yellow-100"
                  iconColor="text-yellow-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-6">
                <ChartCard 
                  title="Project Status Distribution" 
                  description="Overview of project statuses across your organization"
                  actions={
                    <Button variant="ghost" size="sm" onClick={() => handleExport()}>
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  }
                >
                  <div className="h-64">
                    {projectSummary && <ProjectStatusChartWrapper data={projectSummary} />}
                  </div>
                </ChartCard>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          {isLoading ? (
            <Loader centered text="Loading task reports..." />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                  title="Total Tasks" 
                  value={taskSummary.totalTasks || 0} 
                  icon={<ListChecks />} 
                  iconBgColor="bg-blue-100"
                  iconColor="text-blue-500"
                />
                <StatCard 
                  title="Completed Tasks" 
                  value={taskSummary.completedTasks || 0} 
                  icon={<CheckCircle2 />} 
                  iconBgColor="bg-green-100"
                  iconColor="text-green-500"
                />
                <StatCard 
                  title="In Progress Tasks" 
                  value={taskSummary.inProgressTasks || 0} 
                  icon={<Clock />} 
                  iconBgColor="bg-yellow-100"
                  iconColor="text-yellow-500"
                />
                <StatCard 
                  title="Overdue Tasks" 
                  value={taskSummary.overdueTasks || 0} 
                  icon={<AlertTriangle />} 
                  iconBgColor="bg-red-100"
                  iconColor="text-red-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-6">
                <ChartCard 
                  title="Task Status Distribution" 
                  description="Overview of task statuses"
                  actions={
                    <Button variant="ghost" size="sm" onClick={() => handleExport()}>
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  }
                >
                  <TaskStatusChartWrapper data={taskSummary} />
                </ChartCard>

                <ChartCard 
                  title="Task Completion Trend" 
                  description="Trend of tasks completed over time"
                  actions={
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleExport()}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export PDF
                    </Button>
                  }
                >
                  <TaskCompletionChartWrapper data={taskCompletionData} />
                </ChartCard>
              </div>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="team" className="space-y-6">
          {isLoading ? (
            <Loader centered text="Loading team reports..." />
          ) : teamProjectId === 'all' ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Select a project to view team workload</h3>
                <p className="text-gray-500">Team workload data is only available for specific projects</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6">
                <ChartCard 
                  title="Team Workload" 
                  description="Task distribution and completion by team member"
                  actions={
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => teamProjectId !== 'all' ? getProjectReportPdf(teamProjectId) : null}
                      disabled={teamProjectId === 'all'}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export PDF
                    </Button>
                  }
                >
                  {mappedTeamWorkloadData.length > 0 ? (
                    <TeamWorkloadChartWrapper data={mappedTeamWorkloadData} />
                  ) : (
                    <div className="flex justify-center items-center h-64">
                      <p className="text-gray-500">No team workload data available for this project</p>
                    </div>
                  )}
                </ChartCard>
              </div>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="risks" className="space-y-6">
          {isLoading ? (
            <Loader centered text="Loading risk reports..." />
          ) : risksProjectId === 'all' ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Select a project to view risk assessment</h3>
                <p className="text-gray-500">Risk assessment data is only available for specific projects</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6">
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Project Risk Assessment</h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => risksProjectId !== 'all' ? getProjectReportPdf(risksProjectId) : null}
                      disabled={risksProjectId === 'all'}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export PDF
                    </Button>
                  </div>
                  {riskAssessmentData.length > 0 ? (
                    <RiskAssessmentTable data={riskAssessmentData} />
                  ) : (
                    <div className="flex justify-center items-center py-10">
                      <p className="text-gray-500">No risk assessment data available for this project</p>
                    </div>
                  )}
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
