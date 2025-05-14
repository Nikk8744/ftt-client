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
    stopTimer({
      projectId: selectedProject || undefined,
      taskId: selectedTask || undefined,
      description: description.trim() || undefined
    });
    setIsStopTimerModalOpen(false);
    setSelectedProject(null);
    setSelectedTask(null);
    setDescription('');
  };

  return (
    <header className="bg-white border-b border-gray-200 fixed w-full z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="text-xl font-bold text-primary-600">
              Time Tracker
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* Timer Display & Controls */}
            <div className="hidden md:flex items-center space-x-2 mr-4">
              <div className="text-lg font-mono font-medium bg-gray-100 px-3 py-1 rounded-md">
                {formattedTime}
              </div>
              
              {isRunning ? (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setIsStopTimerModalOpen(true)}
                  isLoading={timerIsLoading}
                  className="font-medium"
                >
                  Stop
                </Button>
              ) : (
                <Button
                  variant="success"
                  size="sm"
                  onClick={startTimer}
                  isLoading={timerIsLoading}
                  className="font-medium"
                >
                  Start
                </Button>
              )}
            </div>

            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 focus:outline-none">
                <span>{user?.name}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                <Link href="/settings/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
              disabled={timerIsLoading}
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
              className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
              Task (optional)
            </label>
            <select
              id="task"
              className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={selectedTask || ''}
              onChange={(e) => setSelectedTask(e.target.value ? Number(e.target.value) : null)}
              disabled={!selectedProject || tasksLoading}
            >
              <option value="">Select Task</option>
              {filteredTasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.name}
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
              className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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