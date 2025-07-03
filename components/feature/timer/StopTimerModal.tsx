"use client"
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Button from '../../ui/Button';
import Modal from '../../ui/Modal';
import { getCombinedProjectsOfUser } from '../../../services/project';
import { getUserTasks } from '../../../services/task';
import { getUserAssignedTasks } from '../../../services/taskMembers';
import { Project, Task } from '../../../types';
import { AlertCircle, ChartNoAxesGantt, CirclePause, ClipboardList, FolderOpenDot } from 'lucide-react';
import { StopIcon } from '@heroicons/react/24/outline';
import useAuth from '../../../lib/hooks/useAuth';

interface StopTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  stopTimer: (args: { projectId: number; taskId: number; description?: string }) => void;
  timerIsLoading: boolean;
}

export const StopTimerModal: React.FC<StopTimerModalProps> = ({
  isOpen,
  onClose,
  stopTimer,
  timerIsLoading,
}) => {
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [description, setDescription] = useState('');

  // Fetch projects for selection in modal
  const {
    data: projectsData,
    isLoading: projectsLoading,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: getCombinedProjectsOfUser,
    enabled: isOpen,
  });

  // Fetch tasks when a project is selected
  const {
    data: userTasksData,
    isLoading: userTasksLoading,
  } = useQuery({
    queryKey: ['userTasks', selectedProject],
    queryFn: getUserTasks,
    enabled: isOpen,
  });

  // Fetch tasks assigned to the user
  const {
    data: assignedTasksData,
    isLoading: assignedTasksLoading,
  } = useQuery({
    queryKey: ['assignedTasks', selectedProject],
    queryFn: () => user ? getUserAssignedTasks(user.id) : Promise.resolve({ tasks: [] }),
    enabled: !!user && isOpen,
  });

  const projects = projectsData?.projects || [];

  // Get user created tasks
  const userTasks = userTasksData?.tasks || [];

  // Extract assigned tasks based on API response structure
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

  // Combine user tasks and assigned tasks
  const allTasks = [...userTasks, ...assignedTasks];

  // Filter out duplicates (tasks that user both created and is assigned to)
  const uniqueTasks = allTasks.filter((task, index, self) =>
    index === self.findIndex((t) => t.id === task.id)
  );

  // Filter tasks by selected project
  const filteredTasks = selectedProject
    ? uniqueTasks.filter((task: Task) => task.projectId === selectedProject && task.status !== 'Done')
    : [];

  const tasksLoading = userTasksLoading || assignedTasksLoading;

  // Filter out completed projects
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const activeProjects = projects.filter((project: any) =>
    project.status !== 'Completed' && project.status !== 'Done'
  );

  const handleStopTimer = () => {
    // Require both project and task to stop timer
    if (!selectedProject || !selectedTask) return;
    stopTimer({
      projectId: selectedProject,
      taskId: selectedTask,
      description: description.trim() || undefined
    });
    onClose();
    setSelectedProject(null);
    setSelectedTask(null);
    setDescription('');
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedProject(null);
      setSelectedTask(null);
      setDescription('');
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stop Timer"
      footer={
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={onClose}
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
          <label htmlFor="project" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            <FolderOpenDot className='w-4 h-4' />
            Project <span className="text-red-500">*</span>
          </label>
          <select
            id="project"
            className="w-full rounded-lg border border-gray-200 shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 transition-all duration-200"
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
          <label htmlFor="task" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            <ClipboardList className="w-4 h-4" />
            Task <span className="text-red-500">*</span>
          </label>
          <select
            id="task"
            className="w-full rounded-lg border border-gray-200 shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 transition-all duration-200"
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
          <label htmlFor="description" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            <ChartNoAxesGantt className="w-4 h-4" />
            Description <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            id="description"
            rows={3}
            className="w-full rounded-lg border border-gray-200 shadow-sm py-3 px-4 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-200"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What did you work on? (e.g., Fixed bug in user authentication, Reviewed design mockups...)"
          />
        </div>
      </div>
    </Modal>
  );
};
