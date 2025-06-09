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
  TaskStatusSummary
} from '@/services/reports';
import { getAllProjectsUserIsMemberOf } from '@/services/projectMember';
import { getAllProjectsOfUser } from '@/services/project';

// Import chart components
import dynamic from 'next/dynamic';

// Dynamically import chart components to avoid SSR issues with Chart.js
const ProjectStatusChartWrapper = dynamic(
  () => import('@/components/feature/reports/ProjectStatusChartWrapper'),
  { ssr: false }
);

const TaskCompletionChartWrapper = dynamic(
  () => import('@/components/feature/reports/TaskCompletionChartWrapper'),
  { ssr: false }
);

const TaskStatusChartWrapper = dynamic(
  () => import('@/components/feature/reports/TaskStatusChartWrapper'),
  { ssr: false }
);

const TeamWorkloadChart = dynamic(
  () => import('@/components/feature/reports/TeamWorkloadChart'),
  { ssr: false }
);

// Import filter and UI components
import ProjectFilter from '@/components/feature/reports/ProjectFilter';

import RiskAssessmentTable from '@/components/feature/reports/RiskAssessmentTable';
import Button from '@/components/ui/Button';
import StatusFilter from '@/components/feature/reports/StatusFilter';
import DateRangePicker from '@/components/feature/reports/DateRangePicker';
import ExportButton from '@/components/feature/reports/ExportButton';
import ChartCard from '@/components/feature/reports/ChartCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Update the interfaces to match the API structure
interface Risk {
  projectName: string;
  riskLevel: 'High' | 'Medium' | 'Low';
  description: string;
  mitigationPlan: string;
}

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
  console.log("🚀 ~ ReportsPage ~ taskSummary:", taskSummary)
  const [userProjects, setUserProjects] = useState<ProjectResponse[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [taskCompletionData, setTaskCompletionData] = useState<TaskCompletionTrend[]>([]);
  const [teamWorkloadData, setTeamWorkloadData] = useState<TeamWorkloadData[]>([]);
  const [riskAssessmentData, setRiskAssessmentData] = useState<RiskAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  


  // Fetch all projects the user is a member of and has created
  useEffect(() => {
    const fetchUserProjects = async () => {
      try {
        // Fetch projects user is member of
        const memberProjects = await getAllProjectsUserIsMemberOf();
        
        // Fetch projects user has created
        const ownedProjects = await getAllProjectsOfUser();
        
        console.log("Member projects:", memberProjects);
        console.log("Owned projects:", ownedProjects);
        
        // Extract project data
        const memberProjectsData = memberProjects.projects || [];
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

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        console.log("🚀 ~ fetchData ~ selectedProjectId:", selectedProjectId);
        
        // Get project summary
        let projectData: ProjectSummary;
        let taskData: TaskStatusSummary;
        let completionTrendData: TaskCompletionTrend[] = [];
        let workloadData: TeamWorkloadData[] = [];
        let riskData: RiskAssessment[] = [];
        
        try {
          projectData = await getProjectSummary(
            selectedProjectId !== 'all' ? selectedProjectId : undefined
          );
        } catch (error) {
          console.error("Error fetching project summary:", error);
          projectData = {
            totalProjects: 0,
            completedProjects: 0,
            inProgressProjects: 0,
            pendingProjects: 0,
            completionRate: 0,
            projects: []
          };
        }
        
        console.log("🚀 ~ fetchData ~ projectData:", projectData);
        
        // Get task status overview
        try {
          taskData = await getTaskStatusOverview(
            selectedProjectId !== 'all' ? selectedProjectId : undefined
          );
          console.log("🚀 ~ fetchData ~ taskData:", taskData)
        } catch (error) {
          console.error("Error fetching task status:", error);
          taskData = {
            totalTasks: 0,
            completedTasks: 0,
            inProgressTasks: 0,
            pendingTasks: 0,
            overdueTasks: 0,
            completionRate: 0,
            tasksByStatus: []
          };
        }
        
        // Get task completion trend data
        try {
          completionTrendData = await getTaskCompletionTrend(
            selectedProjectId !== 'all' ? selectedProjectId : undefined,
            30
          );
          
          // Ensure completionTrendData is an array
          if (!Array.isArray(completionTrendData)) {
            console.error("Task completion data is not an array");
            completionTrendData = [];
          }
        } catch (error) {
          console.error("Error fetching task completion trend:", error);
          completionTrendData = [];
        }
        
        console.log("🚀 ~ ReportsPage ~ taskSummary:", taskData);
        
        // Get team workload data and risk assessment data if a project is selected
        if (selectedProjectId !== 'all') {
          try {
            workloadData = await getTeamWorkload(selectedProjectId);
            console.log("Team workload data from API:", workloadData);
          } catch (error) {
            console.error("Error fetching team workload:", error);
            workloadData = [];
          }
          
          try {
            riskData = await getProjectRisks(selectedProjectId);
          } catch (error) {
            console.error("Error fetching risk assessment:", error);
            riskData = [];
          }
        }
        
        setProjectSummary(projectData);
        setTaskSummary(taskData);
        setTaskCompletionData(completionTrendData);
        setTeamWorkloadData(Array.isArray(workloadData) ? workloadData : []);
        setRiskAssessmentData(Array.isArray(riskData) ? riskData : []);
      } catch (error) {
        console.error('Error fetching report data:', error);
        
        // Use empty data as fallback
        setProjectSummary({
          totalProjects: 0,
          completedProjects: 0,
          inProgressProjects: 0,
          pendingProjects: 0,
          completionRate: 0,
          projects: []
        });
        
        setTaskSummary({
          totalTasks: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          pendingTasks: 0,
          overdueTasks: 0,
          completionRate: 0,
          tasksByStatus: []
        });
        
        setTaskCompletionData([]);
        setTeamWorkloadData([]);
        setRiskAssessmentData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedProjectId, selectedStatus, dateRange]);

  const handleExport = (format: 'pdf' | 'csv' | 'excel') => {
    console.log(`Exporting report as ${format}`);
    // In a real implementation, this would call an API endpoint to generate and download the report
  };

  // Map API data structure to component expected structure for TeamWorkloadChart
  const mappedTeamWorkloadData = teamWorkloadData.map(item => ({
    name: item.memberName || '',
    taskCount: item.tasksAssigned || 0,
    completedTaskCount: item.tasksCompleted || 0
  }));

  // Map API data structure to component expected structure for RiskAssessmentTable
  const mappedRiskData: Risk[] = riskAssessmentData.map(item => ({
    projectName: item.name,
    riskLevel: item.riskLevel.charAt(0).toUpperCase() + item.riskLevel.slice(1) as 'High' | 'Medium' | 'Low',
    description: item.impact,
    mitigationPlan: item.mitigation
  }));

  const StatCard = ({ title, value, icon, color }: { title: string; value: number | string; icon: React.ReactNode; color: string }) => (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className={`p-2 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </Card>
  );



  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Reports Dashboard</h1>
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <div className="w-full md:w-64">
            <ProjectFilter onChange={setSelectedProjectId} />
          </div>
          <div className="w-full md:w-64">
            <StatusFilter onChange={setSelectedStatus} />
          </div>
          <div className="w-full md:w-72">
            <DateRangePicker onChange={setDateRange} />
          </div>
          <ExportButton onExport={handleExport} />
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                  title="Total Projects" 
                  value={projectSummary.totalProjects || userProjects.length} 
                  icon={<ClipboardList className="h-6 w-6 text-blue-500" />} 
                  color="bg-blue-100" 
                />
                <StatCard 
                  title="Project Completion Rate" 
                  value={`${projectSummary.completionRate || 0}%`} 
                  icon={<BarChart2 className="h-6 w-6 text-green-500" />} 
                  color="bg-green-100" 
                />
                <StatCard 
                  title="Total Tasks" 
                  value={taskSummary.totalTasks || 0} 
                  icon={<ListChecks className="h-6 w-6 text-purple-500" />} 
                  color="bg-purple-100" 
                />
                <StatCard 
                  title="Tasks Completion Rate" 
                  value={`${taskSummary.completionRate || 0}%`} 
                  icon={<CheckCircle2 className="h-6 w-6 text-green-500" />} 
                  color="bg-green-100" 
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard 
                  title="Project Status Distribution" 
                  description="Overview of project statuses across your organization"
                  actions={
                    <Button variant="ghost" size="sm" onClick={() => handleExport('pdf')}>
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  }
                >
                  <div className="h-64">
                    {projectSummary && <ProjectStatusChartWrapper data={projectSummary} />}
                  </div>
                </ChartCard>
                
                <ChartCard 
                  title="Task Completion Trend" 
                  description="Trend of tasks completed vs created over time"
                  actions={
                    <Button variant="ghost" size="sm" onClick={() => handleExport('pdf')}>
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  }
                >
                  <TaskCompletionChartWrapper data={taskCompletionData} />
                </ChartCard>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <Card className="p-4">
                  <h3 className="text-lg font-medium mb-4">Latest Activity Summary</h3>
                  {userProjects.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-md">
                        <Clock className="h-5 w-5 text-blue-500" />
                        <p className="text-sm">You have access to {userProjects.length} project(s)</p>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-md">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        <p className="text-sm">{taskSummary.overdueTasks || 0} tasks are overdue across your projects</p>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-md">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <p className="text-sm">{taskSummary.completedTasks || 0} tasks completed in the last 30 days</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-md">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <p className="text-sm">You don&apos;t have any projects yet</p>
                    </div>
                  )}
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard 
                  title="Total Projects" 
                  value={projectSummary.totalProjects || userProjects.length} 
                  icon={<ClipboardList className="h-6 w-6 text-blue-500" />} 
                  color="bg-blue-100" 
                />
                <StatCard 
                  title="Completed Projects" 
                  value={projectSummary.completedProjects || 0} 
                  icon={<CheckCircle2 className="h-6 w-6 text-green-500" />} 
                  color="bg-green-100" 
                />
                <StatCard 
                  title="In Progress Projects" 
                  value={projectSummary.inProgressProjects || 0} 
                  icon={<Clock className="h-6 w-6 text-yellow-500" />} 
                  color="bg-yellow-100" 
                />
              </div>

              <div className="grid grid-cols-1 gap-6">
                <ChartCard 
                  title="Project Status Distribution" 
                  description="Overview of project statuses across your organization"
                  actions={
                    <Button variant="ghost" size="sm" onClick={() => handleExport('pdf')}>
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
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                  title="Total Tasks" 
                  value={taskSummary.totalTasks || 0} 
                  icon={<ListChecks className="h-6 w-6 text-blue-500" />} 
                  color="bg-blue-100" 
                />
                <StatCard 
                  title="Completed Tasks" 
                  value={taskSummary.completedTasks || 0} 
                  icon={<CheckCircle2 className="h-6 w-6 text-green-500" />} 
                  color="bg-green-100" 
                />
                <StatCard 
                  title="In Progress Tasks" 
                  value={taskSummary.inProgressTasks || 0} 
                  icon={<Clock className="h-6 w-6 text-yellow-500" />} 
                  color="bg-yellow-100" 
                />
                <StatCard 
                  title="Overdue Tasks" 
                  value={taskSummary.overdueTasks || 0} 
                  icon={<AlertTriangle className="h-6 w-6 text-red-500" />} 
                  color="bg-red-100" 
                />
              </div>

              <div className="grid grid-cols-1 gap-6">
                <ChartCard 
                  title="Task Status Distribution" 
                  description="Overview of task statuses"
                  actions={
                    <Button variant="ghost" size="sm" onClick={() => handleExport('pdf')}>
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  }
                >
                  <TaskStatusChartWrapper data={taskSummary} />
                </ChartCard>

                <ChartCard 
                  title="Task Completion Trend" 
                  description="Trend of tasks completed vs created over time"
                  actions={
                    <Button variant="ghost" size="sm" onClick={() => handleExport('pdf')}>
                      <Download className="h-4 w-4 mr-1" />
                      Export
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
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : selectedProjectId === 'all' ? (
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
                    <Button variant="ghost" size="sm" onClick={() => handleExport('pdf')}>
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  }
                >
                  {mappedTeamWorkloadData.length > 0 ? (
                    <TeamWorkloadChart data={mappedTeamWorkloadData} />
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
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : selectedProjectId === 'all' ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Select a project to view risk assessment</h3>
                <p className="text-gray-500">Risk assessment data is only available for specific projects</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6">
                <Card className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Risk Assessment</h3>
                    <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </div>
                  {mappedRiskData.length > 0 ? (
                    <RiskAssessmentTable data={mappedRiskData} />
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
