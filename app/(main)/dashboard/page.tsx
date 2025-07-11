'use client';

import { useQuery } from '@tanstack/react-query';
import { getAllProjectsOfUser } from '@/services/project';
import { getUserTasks } from '@/services/task';
import { getUserLogs, getTotalTimeToday } from '@/services/log';
import { formatDuration } from '@/lib/utils';
import useAuth from '@/lib/hooks/useAuth';
import Link from 'next/link';
import { Project, Task } from '@/types';
import { getAllProjectsUserIsMemberOf } from '@/services/projectMember';
import { getUserAssignedTasks } from '@/services/taskMembers';
import { useEffect, useState } from 'react';
import { Clock, FolderOpenDot, ClipboardCheck } from 'lucide-react';
import StatCard from '@/components/feature/reports/StatCard';
import Loader from '@/components/ui/Loader';
import { ThisWeekBarGraph } from '@/components/feature/dashboard/ThisWeekBarGraph';
import { RecentlyTrackedTasks } from '@/components/feature/dashboard/RecentlyTrackedTasks';
import RecentTasks from '@/components/feature/dashboard/RecentTasks';
import { RecentLogs } from '@/components/feature/dashboard/RecentLogs';
import RecentProjects from '@/components/feature/dashboard/RecentProjects';
// import Loader from '@/components/ui/Loader';

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
    queryFn: () => getUserLogs(user?.id || 1),
  });

  const { data: totalTimeTodayData, isLoading: totalTimeTodayLoading } = useQuery({
    queryKey: ['totalTimeToday'],
    queryFn: getTotalTimeToday,
  });

  // Combine owned projects and projects user is a member of
  const ownedProjects = projectsData?.projects || [];
  const memberProjects = memberProjectsData?.data || [];
  
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
  
  // Get recent tasks that are not done - make sure it includes BOTH created and assigned tasks
  const recentTasks = allTasks
    .filter((task: Task) => task.status !== 'Done')
    .slice(0, 3);
    
  // Loading state for all project-related data
  const projectsDataLoading = projectsLoading || memberProjectsLoading;
  
  // Loading state for all task-related data
  const tasksDataLoading = tasksLoading || assignedTasksLoading;

  if(tasksDataLoading || projectsDataLoading || memberProjectsLoading || logsLoading || totalTimeTodayLoading) {
    return <Loader centered text="Loading details..." />
  }
  
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* <div>
        <div className="px-6 pt-4 pb-2 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              Welcome, {user?.name || 'User'}
            </h1>
            <p className="mt-1 text-sm text-gray-500 max-w-4xl">
              Track your time and manage your projects
            </p>
          </div>
        </div>
      </div> */}
      
      <div className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* Debug section (press Alt+D to toggle) */}
        {debugMode && (
          <div className="bg-gray-100 dark:bg-gray-800 p-4 mb-4 rounded-md border border-gray-300 dark:border-gray-700">
            <h3 className="text-md font-bold mb-2 text-gray-900 dark:text-gray-100">Debug Information</h3>
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
            <StatCard
              title="Total Projects"
              value={projectsDataLoading ? '...' : allProjects.length}
              icon={<FolderOpenDot size={24} />}
              iconBgColor="bg-indigo-50 dark:bg-indigo-900/50"
              iconColor="text-indigo-600 dark:text-indigo-400"
              tooltip="Projects you own or are a member of"
              subtitle={
                !projectsDataLoading && (
                  <>
                    <span className="text-primary-600">{ownedProjects.length}</span> owned, 
                    <span className="text-indigo-500 ml-1">{memberProjectsFiltered.length}</span> member
                  </>
                )
              }
            />  

            <StatCard
              title="Active Tasks"
              value={tasksDataLoading ? '...' : allTasks.filter((task: Task) => task.status !== 'Done').length}
              icon={<ClipboardCheck size={24} />}
              iconBgColor="bg-blue-50 dark:bg-blue-900/50"
              iconColor="text-blue-600 dark:text-blue-400"
              tooltip="Tasks that are not yet completed"
              subtitle={
                !tasksDataLoading && (
                  <>
                    <span className="text-primary-600">
                      {createdTasks.filter((task: Task) => task.status !== 'Done').length}
                    </span> created, 
                    <span className="text-indigo-500 ml-1">
                      {assignedTasksFiltered.filter((task: Task) => task.status !== 'Done').length}
                    </span> assigned
                  </>
                )
              }
            />

            <StatCard
              title="Time Today"
              value={totalTimeTodayLoading ? '...' : formatDuration(totalTimeToday)}
              icon={<Clock size={24} />}
              iconBgColor="bg-green-50 dark:bg-green-900/50"
              iconColor="text-green-600 dark:text-green-400"
              tooltip="Total time tracked today"
            />
          </div>

          {/* New: This Week Bar Graph and Recently Tracked Tasks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <ThisWeekBarGraph />
            <RecentlyTrackedTasks logs={logs} />
          </div>

          {/* My Tasks Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">My Tasks</h2>
              <Link href="/tasks" className="text-sm text-brand hover:text-brand-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                View all
              </Link>
            </div>
            <RecentTasks tasks={recentTasks} projects={allProjects} createdTasks={createdTasks} />
          </div>

          {/* Recent Logs Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Recent Time Logs</h2>
              <Link href="/logs" className="text-sm text-brand hover:text-brand-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                View all
              </Link>
            </div>
            <RecentLogs 
              logs={logs} 
              projects={allProjects} 
              tasks={allTasks} 
              isLoading={logsLoading} 
            />
          </div>

          {/* Projects Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Your Projects</h2>
              <Link href="/projects" className="text-sm text-brand hover:text-brand-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                View all
              </Link>
            </div>
            <RecentProjects projects={allProjects} tasks={allTasks} ownedProjects={ownedProjects} />
          </div>
        </div>
      </div>
    </div>
  );
}
