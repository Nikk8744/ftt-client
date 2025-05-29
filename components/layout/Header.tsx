"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import useAuth from '@/lib/hooks/useAuth';
import useTimer from '@/lib/hooks/useTimer';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { getAllProjectsOfUser } from '@/services/project';
import { getUserTasks } from '@/services/task';
import { useQuery } from '@tanstack/react-query';
import { Project, Task } from '@/types';

const Header: React.FC = () => {
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

  // Fetch projects for selection in modal
  const { 
    data: projectsData,
    isLoading: projectsLoading,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: getAllProjectsOfUser,
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

  // Filter tasks by selected project
  const filteredTasks = selectedProject 
    ? tasks.filter((task: Task) => task.projectId === selectedProject)
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
    <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 fixed w-full z-10 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-1"></div>

          <div className="flex items-center gap-6">
            {/* Timer Display & Controls */}
            <div className="hidden md:flex items-center gap-3">
              {/* Timer Display */}
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2">
                <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                <span className="text-lg font-mono font-semibold text-gray-900 min-w-[80px]">
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
                  className="px-4 py-2 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                  Stop
                </Button>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={startTimer}
                  isLoading={timerIsLoading}
                  className="px-4 py-2 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Start
                </Button>
              )}
            </div>

            {/* User Menu */}
            <div className="relative group">
              <button className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-medium text-sm shadow-sm hover:scale-105 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition-all duration-200">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-100 py-1 hidden group-hover:block transform transition-all duration-200">
                <Link 
                  href="/profile" 
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </Link>
                <hr className="my-1 border-gray-100" />
                <button
                  onClick={logout}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
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
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Stopping...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
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
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
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
              {projects.map((project: Project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Task Selection */}
          <div className="space-y-2">
            <label htmlFor="task" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
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
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Select a project first to see available tasks
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
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