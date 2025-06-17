"use client"
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import useAuth from '@/lib/hooks/useAuth';
import useTimer from '@/lib/hooks/useTimer';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import {  getCombinedProjectsOfUser } from '@/services/project';
import { getUserTasks } from '@/services/task';
import { useQuery } from '@tanstack/react-query';
import { Project, Task } from '@/types';
import NotificationBell from '@/components/feature/NotificationBell';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { AlertCircle, ChartNoAxesGantt, CirclePause, ClipboardList, FolderOpenDot, LogOut, Pause, Play, Settings, User } from 'lucide-react';
import { StopIcon } from '@heroicons/react/24/outline';

interface HeaderProps {
  sidebarOpen: boolean;
  isMobile: boolean;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, isMobile }) => {
  // Initialize notifications
  useNotifications();
  
  const { user, logout } = useAuth();
  const { 
    isRunning, 
    formattedTime, 
    startTimer, 
    stopTimer, 
    isLoading: timerIsLoading 
  } = useTimer();

  const [isStopTimerModalOpen, setIsStopTimerModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch projects for selection in modal
  const { 
    data: projectsData,
    isLoading: projectsLoading,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: getCombinedProjectsOfUser,
    enabled: isStopTimerModalOpen,
  });

  // Fetch tasks when a project is selected
  const { 
    data: tasksData,
    isLoading: tasksLoading,
  } = useQuery({
    queryKey: ['tasks', selectedProject],
    queryFn: () => selectedProject ? getUserTasks() : null,
    enabled: !!selectedProject && isStopTimerModalOpen,
  });

  const projects = projectsData?.projects || [];
  const tasks = tasksData?.tasks || [];

  // Filter out completed projects
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const activeProjects = projects.filter((project: any)  => 
  project.status !== 'Completed' && project.status !== 'Done'
);

  // Filter tasks by selected project
  const filteredTasks = selectedProject 
    ? tasks.filter((task: Task) => task.projectId === selectedProject && task.status !== 'Done')
    : [];

  const handleStopTimer = () => {
    // Require both project and task to stop timer
    if (!selectedProject || !selectedTask) return;

    stopTimer({
      projectId: selectedProject,
      taskId: selectedTask,
      description: description.trim() || undefined
    });
    setIsStopTimerModalOpen(false);
    setSelectedProject(null);
    setSelectedTask(null);
    setDescription('');
  };

  return (
    <header className={`bg-white/90 backdrop-blur-md border-b border-gray-100 fixed ${sidebarOpen && !isMobile ? 'lg:left-[280px]' : 'left-0'} right-0 z-10 shadow-sm transition-all duration-300`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end h-16">
          {/* Timer Display & Controls */}
          <div className="flex items-center gap-3">
            {/* Timer Display */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 sm:px-4 sm:py-2">
              <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
              <span className="text-sm sm:text-lg font-mono font-semibold text-gray-900 min-w-[60px] sm:min-w-[80px]">
                {formattedTime}
              </span>
            </div>
            
            {/* Timer Control Button */}
            {isRunning ? (
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsStopTimerModalOpen(true)}
                isLoading={timerIsLoading}
                className="sm:px-4 sm:py-2 px-2 py-1 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1 sm:gap-2"
              >
                <Pause className="w-4 h-4" />
                <span className="hidden sm:inline">Stop</span>
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={startTimer}
                isLoading={timerIsLoading}
                className="sm:px-4 sm:py-2 px-2 py-1 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-1 sm:gap-2"
              >
                <Play className='w-4 h-4' />
                <span className="hidden sm:inline">Start</span>
              </Button>
            )}
          </div>

          {/* Notification Bell */}
          <div className="ml-3">
            <NotificationBell />
          </div>

          {/* User Menu */}
          <div className="relative ml-3" ref={userMenuRef}>
            <button 
              className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-medium text-sm shadow-sm hover:scale-110 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-all duration-200"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              aria-expanded={isUserMenuOpen}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </button>
            
            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 animate-in fade-in slide-in-from-top-5 duration-200">
                <div className="px-4 py-2 text-sm text-gray-900 border-b border-gray-100">
                  <div className="font-medium truncate">{user?.name || 'User'}</div>
                  <div className="truncate text-gray-500 text-xs">{user?.email || ''}</div>
                </div>
                <Link 
                  href="/profile" 
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <Link
                  href="/settings/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsUserMenuOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                <hr className="my-1 border-gray-100" />
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Stop Timer Modal */}
      <Modal
        isOpen={isStopTimerModalOpen}
        onClose={() => setIsStopTimerModalOpen(false)}
        title="Stop Timer"
        footer={
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => setIsStopTimerModalOpen(false)}
              className="px-4 py-2"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleStopTimer}
              isLoading={timerIsLoading}
              disabled={timerIsLoading || !selectedProject || !selectedTask}
              className="px-6 py-2 flex items-center gap-2"
            >
              {timerIsLoading ? (
                <>
                  <StopIcon className='w-4 h-4' />
                  Stopping...
                </>
              ) : (
                <>
                  <CirclePause className='w-4 h-4' />
                  Stop Timer
                </>
              )}
            </Button>
          </div>
        }
      >
        <div className="py-4 space-y-6">
          {/* Project Selection */}
          <div className="space-y-2">
            <label htmlFor="project" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <FolderOpenDot className='w-4 h-4' />
              Project <span className="text-gray-400">(optional)</span>
            </label>
            <select
              id="project"
              className="w-full rounded-lg border border-gray-200 shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white transition-all duration-200"
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(e.target.value ? Number(e.target.value) : null)}
              disabled={projectsLoading}
            >
              <option value="">Select Project</option>
              {activeProjects.map((project: Project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Task Selection */}
          <div className="space-y-2">
            <label htmlFor="task" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <ClipboardList className="w-4 h-4" />
              Task <span className="text-red-500">*</span>
            </label>
            <select
              id="task"
              className="w-full rounded-lg border border-gray-200 shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white transition-all duration-200"
              value={selectedTask || ''}
              onChange={(e) => setSelectedTask(e.target.value ? Number(e.target.value) : null)}
              disabled={!selectedProject || tasksLoading}
              required
            >
              <option value="">Select Task</option>
              {filteredTasks.map((task: Task) => (
                <option key={task.id} value={task.id}>
                  {task.name || task.subject}
                </option>
              ))}
            </select>
            {!selectedProject && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Select a project first to see available tasks
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <ChartNoAxesGantt className="w-4 h-4" />
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              id="description"
              rows={3}
              className="w-full rounded-lg border border-gray-200 shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-200"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you work on? (e.g., Fixed bug in user authentication, Reviewed design mockups...)"
            />
          </div>
        </div>
      </Modal>
    </header>
  );
};

export default Header;
