'use client';

import { useQuery } from '@tanstack/react-query';
import { getAllProjectsOfUser } from '@/services/project';
import { getUserTasks } from '@/services/task';
import { getUserLogs, getTotalTimeToday } from '@/services/log';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import PageWrapper from '@/components/layout/PageWrapper';
import { formatDate, formatDuration } from '@/lib/utils';
import useAuth from '@/lib/hooks/useAuth';
import Link from 'next/link';
import { Project, Task, TimeLog } from '@/types';
import { getAllProjectsUserIsMemberOf } from '@/services/projectMember';
import { getUserAssignedTasks } from '@/services/taskMembers';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [debugMode, setDebugMode] = useState(false);

  // Turn debug mode on/off with keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'D' && e.altKey) {
        setDebugMode(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch data for dashboard
  // Own projects
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: getAllProjectsOfUser,
  });

  // Projects user is a member of
  const { data: memberProjectsData, isLoading: memberProjectsLoading } = useQuery({
    queryKey: ['memberProjects'],
    queryFn: getAllProjectsUserIsMemberOf,
  });

  // Tasks created by user
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: getUserTasks,
  });

  // Tasks assigned to user
  const { data: assignedTasksData, isLoading: assignedTasksLoading } = useQuery({
    queryKey: ['assignedTasks'],
    queryFn: () => user ? getUserAssignedTasks(user.id) : Promise.resolve({ tasks: [] }),
    enabled: !!user,
  });

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['logs'],
    queryFn: getUserLogs,
  });

  const { data: totalTimeTodayData, isLoading: totalTimeTodayLoading } = useQuery({
    queryKey: ['totalTimeToday'],
    queryFn: getTotalTimeToday,
  });

  // Combine owned projects and projects user is a member of
  const ownedProjects = projectsData?.projects || [];
  const memberProjects = memberProjectsData?.projects || [];
  
  // Filter out duplicates (projects that user both owns and is a member of)
  const memberProjectsFiltered = memberProjects.filter(
    (memberProject: Project) => !ownedProjects.some((ownedProject: Project) => ownedProject.id === memberProject.id)
  );
  
  // All unique projects
  const allProjects = [...ownedProjects, ...memberProjectsFiltered];
  
  // Tasks created by user and tasks assigned to user
  const createdTasks = tasksData?.tasks || [];
  
  // Extract assigned tasks based on API response structure
  // Handle different possible data structures from the API
  let assignedTasks: Task[] = [];
  if (assignedTasksData) {
    // Handle the specific structure we found: assignedTasksData.tasks.data
    if (assignedTasksData.tasks?.data && Array.isArray(assignedTasksData.tasks.data)) {
      assignedTasks = assignedTasksData.tasks.data;
    }
    // Handle other possible structures
    else if (Array.isArray(assignedTasksData)) {
      assignedTasks = assignedTasksData;
    }
    else if (assignedTasksData.tasks && Array.isArray(assignedTasksData.tasks)) {
      assignedTasks = assignedTasksData.tasks;
    }
    else if (typeof assignedTasksData === 'object') {
      // Try to get tasks from any property that looks like an array of tasks
      const possibleTaskArrays = Object.values(assignedTasksData)
        .filter(value => Array.isArray(value));
      
      if (possibleTaskArrays.length > 0) {
        // Use the first array property found (likely to be tasks)
        assignedTasks = possibleTaskArrays[0] as Task[];
      }
    }
  }
  
  // Filter out duplicates (tasks that user both created and is assigned to)
  const assignedTasksFiltered = Array.isArray(assignedTasks) 
    ? assignedTasks.filter(
        (assignedTask: Task) => !createdTasks.some((createdTask: Task) => createdTask.id === assignedTask.id)
      )
    : [];
  
  // All unique tasks
  const allTasks = [...createdTasks, ...assignedTasksFiltered];
  
  const logs = logsData?.logs || [];
  const totalTimeToday = totalTimeTodayData?.data.totalTimeSpent || 0;

  // Filter recent logs based on time frame
  const recentLogs = logs.slice(0, 5);
  
  // Get recent tasks that are not done - make sure it includes BOTH created and assigned tasks
  const recentTasks = allTasks
    .filter((task: Task) => task.status !== 'Done')
    .slice(0, 3);
    
  // Status badge color
  const getStatusBadgeVariant = (status: string | null) => {
    if (status === null) return 'primary';
    
    switch (status) {
      case 'Not Started':
      case 'Pending':
        return 'secondary';
      case 'In Progress':
      case 'In-Progress':
        return 'warning';
      case 'Done':
        return 'success';
      default:
        return 'primary';
    }
  };

  // Get color for task border based on status
  const getTaskBorderColor = (status: string | null) => {
    if (status === 'In Progress' || status === 'In-Progress') {
      return '#f59e0b'; // Amber/Orange for in progress
    } else if (status === 'Done') {
      return '#10b981'; // Green for completed
    } else {
      return '#6366f1'; // Indigo for not started or other
    }
  };
  
  // Loading state for all project-related data
  const projectsDataLoading = projectsLoading || memberProjectsLoading;
  
  // Loading state for all task-related data
  const tasksDataLoading = tasksLoading || assignedTasksLoading;
  
  return (
    <PageWrapper
      title={`Welcome, ${user?.name || 'User'}`}
      description="Track your time and manage your projects"
    >
      {/* Debug section (press Alt+D to toggle) */}
      {debugMode && (
        <div className="bg-gray-100 p-4 mb-4 rounded-md border border-gray-300">
          <h3 className="text-md font-bold mb-2">Debug Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold">Projects:</h4>
              <p className="text-xs">Owned: {ownedProjects.length}</p>
              <p className="text-xs">Member: {memberProjectsFiltered.length}</p>
              <p className="text-xs">Total: {allProjects.length}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold">Tasks:</h4>
              <p className="text-xs">Created: {createdTasks.length}</p>
              <p className="text-xs">Assigned: {assignedTasksFiltered.length}</p>
              <p className="text-xs">Total: {allTasks.length}</p>
            </div>
          </div>
          {assignedTasks.length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-semibold">Assigned Tasks Raw Data:</h4>
              <pre className="text-xs p-2 bg-gray-200 mt-1 max-h-40 overflow-auto">
                {JSON.stringify(assignedTasksData, null, 2)}
              </pre>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-2">Press Alt+D to hide debug info</p>
        </div>
      )}
      
      <div className="p-6">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Total Projects
              </h3>
              <div className="mt-2 text-3xl font-bold text-gray-900">
                {projectsDataLoading ? '...' : allProjects.length}
              </div>
              {!projectsDataLoading && (
                <div className="mt-1 text-xs text-gray-500">
                  <span className="text-primary-600">{ownedProjects.length}</span> owned, 
                  <span className="text-indigo-500 ml-1">{memberProjectsFiltered.length}</span> member
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Active Tasks
              </h3>
              <div className="mt-2 text-3xl font-bold text-gray-900">
                {tasksDataLoading ? '...' : allTasks.filter((task: Task) => task.status !== 'Done').length}
              </div>
              {!tasksDataLoading && (
                <div className="mt-1 text-xs text-gray-500">
                  <span className="text-primary-600">
                    {createdTasks.filter((task: Task) => task.status !== 'Done').length}
                  </span> created, 
                  <span className="text-indigo-500 ml-1">
                    {assignedTasksFiltered.filter((task: Task) => task.status !== 'Done').length}
                  </span> assigned
                </div>
              )}
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Time Today
              </h3>
              <div className="mt-2 text-3xl font-bold text-gray-900">
                {totalTimeTodayLoading ? '...' : formatDuration(totalTimeToday)}
              </div>
            </div>
          </Card>
        </div>

        {/* My Tasks Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">My Tasks</h2>
            <Link href="/tasks" className="text-sm text-primary-600 hover:text-primary-500">
              View all tasks
            </Link>
          </div>

          {tasksDataLoading ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Loading tasks...</h3>
                <div className="w-24 h-2 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </Card>
          ) : recentTasks.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No active tasks found</h3>
                <p className="text-gray-500 mb-4">Create a task to get started with your projects</p>
                <Link href="/tasks" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create a Task
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentTasks.map((task: Task) => (
                <Card 
                  key={task.id} 
                  className="hover:shadow-md transition-all duration-200 border-l-4"
                  style={{ borderLeftColor: getTaskBorderColor(task.status) }}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-start">
                      <h3 className="text-md font-medium text-gray-900">{task.subject }</h3>
                      <Badge variant={getStatusBadgeVariant(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2 flex-grow">
                      {task.description || 'No description provided'}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Project: {allProjects.find((p: Project) => p.id === task.projectId)?.name || 'Unknown'}
                      </span>
                      {task.dueDate && (
                        <span className="text-xs font-medium text-gray-500">
                          Due: {formatDate(task.dueDate)}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      {createdTasks.some((t: Task) => t.id === task.id) ? 
                        <Badge variant="default" className="text-xs">Created</Badge> : 
                        <Badge variant="secondary" className="text-xs">Assigned</Badge>
                      }
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Logs Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Recent Time Logs</h2>
            <Link href="/logs" className="text-sm text-primary-600 hover:text-primary-500">
              View all
            </Link>
          </div>
          
          {logsLoading ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Loading time logs...</h3>
                <div className="w-24 h-2 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </Card>
          ) : recentLogs.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No time logs found</h3>
                <p className="text-gray-500 mb-4">Start tracking time to see your activity history here</p>
                <Link href="/logs" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Track Time
                </Link>
              </div>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Task
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentLogs.map((log: TimeLog) => (
                    <tr key={log.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(log.startTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {allProjects.find((p: Project) => p.id === log.projectId)?.name || 'No Project'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {allTasks.find((t: Task) => t.id === log.taskId)?.subject || 'No Task'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.timeSpent ? formatDuration(log.timeSpent) : 'In Progress'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Projects Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Your Projects</h2>
            <Link href="/projects" className="text-sm text-primary-600 hover:text-primary-500">
              View all
            </Link>
          </div>
          
          {projectsDataLoading ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Loading projects...</h3>
                <div className="w-24 h-2 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </Card>
          ) : allProjects.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                <p className="text-gray-500 mb-4">Create your first project to get started</p>
                <Link href="/projects" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create a Project
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allProjects.slice(0, 3).map((project: Project) => (
                <Link href={`/projects/${project.id}`} key={project.id}>
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-md font-medium text-gray-900">{project.name}</h3>
                      {ownedProjects.some((p: Project) => p.id === project.id) ? 
                        <Badge variant="primary" className="text-xs">Owner</Badge> : 
                        <Badge variant="secondary" className="text-xs">Member</Badge>
                      }
                    </div>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{project.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <Badge variant="primary" rounded>
                        {allTasks.filter((t: Task) => t.projectId === project.id).length} Tasks
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Created {formatDate(project.createdAt)}
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
} 