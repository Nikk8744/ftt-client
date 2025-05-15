'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllProjectsOfUser } from '@/services/project';
import { getUserTasks } from '@/services/task';
import { getAllUserLogs } from '@/services/log';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import PageWrapper from '@/components/layout/PageWrapper';
import { formatDate, formatDuration } from '@/lib/utils';
import useTimer from '@/lib/hooks/useTimer';
import useAuth from '@/lib/hooks/useAuth';
import Link from 'next/link';
import { Project, Task, TimeLog } from '@/types';
import { mockUser } from '@/lib/mockData';
import useAuthStore from '@/store/auth';

export default function DashboardPage() {
  const { user } = useAuth();
  const { isRunning, formattedTime } = useTimer();
  const { login } = useAuthStore();

  // Auto-login for development
  useEffect(() => {
    // Force login with the mock user for development
    login(mockUser);
    console.log('Auto-logged in with mock user for development');
  }, [login]);

  // Fetch data for dashboard
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: getAllProjectsOfUser,
  });

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: getUserTasks,
  });

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ['logs'],
    queryFn: getAllUserLogs,
  });

  const projects = projectsData?.projects || [];
  const tasks = tasksData?.tasks || [];
  const logs = logsData?.logs || [];

  // Filter recent logs based on time frame
  const recentLogs = logs.slice(0, 5);
  
  // Calculate total time today
  const totalTimeToday = logs
    .filter((log: TimeLog) => {
      const logDate = new Date(log.startTime);
      const today = new Date();
      return (
        logDate.getDate() === today.getDate() &&
        logDate.getMonth() === today.getMonth() &&
        logDate.getFullYear() === today.getFullYear()
      );
    })
    .reduce((total: number, log: TimeLog) => total + (log.duration || 0), 0);

  // Get recent tasks that are not done
  const recentTasks = tasks
    .filter((task: Task) => task.status !== 'Done')
    .slice(0, 3);
    
  // Status badge color
  const getStatusBadgeVariant = (status: string | null) => {
    if (status === null) return 'primary';
    
    switch (status) {
      case 'Not Started':
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
  
  return (
    <PageWrapper
      title={`Welcome, ${user?.name || 'User'}`}
      description="Track your time and manage your projects"
    >
      <div className="p-6">
        {/* Active Timer Section */}
        {isRunning && (
          <Card className="mb-6 border-l-4 border-l-green-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Active Timer</h2>
                <p className="text-sm text-gray-500">Timer currently running</p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="text-3xl font-mono font-medium text-green-600">
                  {formattedTime}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Total Projects
              </h3>
              <div className="mt-2 text-3xl font-bold text-gray-900">
                {projectsLoading ? '...' : projects.length}
              </div>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Active Tasks
              </h3>
              <div className="mt-2 text-3xl font-bold text-gray-900">
                {tasksLoading ? '...' : tasks.filter((task: Task) => task.status !== 'Done').length}
              </div>
            </div>
          </Card>

          <Card>
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Time Today
              </h3>
              <div className="mt-2 text-3xl font-bold text-gray-900">
                {logsLoading ? '...' : formatDuration(totalTimeToday)}
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

          {tasksLoading ? (
            <p>Loading tasks...</p>
          ) : recentTasks.length === 0 ? (
            <p>No active tasks found. Create a task to get started.</p>
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
                      <h3 className="text-md font-medium text-gray-900">{task.name}</h3>
                      <Badge variant={getStatusBadgeVariant(task.status)}>
                        {task.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2 flex-grow">
                      {task.description || 'No description provided'}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Project: {projects.find((p: Project) => p.id === task.projectId)?.name || 'Unknown'}
                      </span>
                      {task.dueDate && (
                        <span className="text-xs font-medium text-gray-500">
                          Due: {formatDate(task.dueDate)}
                        </span>
                      )}
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
            <p>Loading time logs...</p>
          ) : recentLogs.length === 0 ? (
            <p>No time logs found. Start tracking time to see logs here.</p>
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
                        {projects.find((p: Project) => p.id === log.projectId)?.name || 'No Project'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tasks.find((t: Task) => t.id === log.taskId)?.name || 'No Task'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.duration ? formatDuration(log.duration) : 'In Progress'}
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
          
          {projectsLoading ? (
            <p>Loading projects...</p>
          ) : projects.length === 0 ? (
            <p>No projects found. Create a project to get started.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.slice(0, 3).map((project: Project) => (
                <Link href={`/projects/${project.id}`} key={project.id}>
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <h3 className="text-md font-medium text-gray-900">{project.name}</h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{project.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <Badge variant="primary" rounded>
                        {tasks.filter((t: Task) => t.projectId === project.id).length} Tasks
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