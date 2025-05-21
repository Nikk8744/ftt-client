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
    ? tasks.filter(task => task.projectId === selectedProject)
    : [];

  const handleStopTimer = () => {
    if (!selectedTask) return; // Require task selection
    stopTimer({
      projectId: selectedProject || undefined,
      taskId: selectedTask,
      description: description.trim() || undefined
    });
    setIsStopTimerModalOpen(false);
    setSelectedProject(null);
    setSelectedTask(null);
    setDescription('');
  };

  return (
    <header className="bg-white backdrop-blur-sm bg-opacity-80 border-b border-indigo-100 fixed w-full z-10 shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-indigo-700 hover:to-purple-700 transition-all duration-300">
              TimeTracker
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* Timer Display & Controls */}
            <div className="hidden md:flex items-center space-x-2 mr-4">
              <div className="text-lg font-mono font-medium bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-1.5 rounded-md shadow-inner border border-indigo-100">
                {formattedTime}
              </div>
              
              {isRunning ? (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setIsStopTimerModalOpen(true)}
                  isLoading={timerIsLoading}
                  className="font-medium shadow-sm hover:shadow transition-all duration-200"
                >
                  Stop
                </Button>
              ) : (
                <Button
                  variant="success"
                  size="sm"
                  onClick={startTimer}
                  isLoading={timerIsLoading}
                  className="font-medium shadow-sm hover:shadow transition-all duration-200"
                >
                  Start
                </Button>
              )}
            </div>

            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600 focus:outline-none transition-all duration-200">
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-medium shadow-md">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="font-medium">{user?.name}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block border border-indigo-100 transform transition-all duration-200">
                <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600">
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-600"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stop Timer Modal */}
      <Modal
        isOpen={isStopTimerModalOpen}
        onClose={() => setIsStopTimerModalOpen(false)}
        title="Stop Timer"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsStopTimerModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleStopTimer}
              isLoading={timerIsLoading}
              disabled={timerIsLoading || !selectedTask}
            >
              Stop Timer
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">
              Project (optional)
            </label>
            <select
              id="project"
              className="w-full rounded-md border border-indigo-200 shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gradient-to-r from-white to-indigo-50"
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(e.target.value ? Number(e.target.value) : null)}
              disabled={projectsLoading}
            >
              <option value="">Select Project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="task" className="block text-sm font-medium text-gray-700 mb-1">
              Task <span className="text-red-500">*</span>
            </label>
            <select
              id="task"
              className="w-full rounded-md border border-indigo-200 shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gradient-to-r from-white to-indigo-50"
              value={selectedTask || ''}
              onChange={(e) => setSelectedTask(e.target.value ? Number(e.target.value) : null)}
              disabled={!selectedProject || tasksLoading}
              required
            >
              <option value="">Select Task</option>
              {filteredTasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.name || task.subject}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              rows={3}
              className="w-full rounded-md border border-indigo-200 shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you working on?"
            />
          </div>
        </div>
      </Modal>
    </header>
  );
};

export default Header; 