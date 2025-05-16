'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserTasks, updateTask, deleteTask } from '@/services/task';
import { getAllProjectsOfUser } from '@/services/project';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import PageWrapper from '@/components/layout/PageWrapper';
import { formatDate } from '@/lib/utils';
import { Project, Task } from '@/types';
import Link from 'next/link';
import TaskForm from '@/components/feature/TaskForm';
import { ConfirmModal } from '@/components/ui/Modal';
import Modal from '@/components/ui/Modal';

export default function TasksPage() {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  // Add state for modals
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [editTaskModalOpen, setEditTaskModalOpen] = useState(false);
  const [deleteTaskModalOpen, setDeleteTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const queryClient = useQueryClient();

  // Fetch tasks
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: getUserTasks,
  });

  // Fetch projects for filter
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: getAllProjectsOfUser,
  });

  const tasks = tasksData?.tasks || [];
  const projects = projectsData?.projects || [];

  // Update task status mutation
  const updateTaskMutation = useMutation({
    mutationFn: (data: { id: number; status: string }) => 
      updateTask(data.id, { status: data.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setDeleteTaskModalOpen(false);
    }
  });

  // Handle marking task as complete
  const handleMarkComplete = (task: Task) => {
    updateTaskMutation.mutate({ id: task.id, status: 'Done' });
  };

  // Filter tasks based on selected project and status
  const filteredTasks = tasks.filter((task: Task) => {
    const matchesProject = selectedProject ? task.projectId === selectedProject : true;
    const matchesStatus = statusFilter ? task.status === statusFilter : true;
    return matchesProject && matchesStatus;
  });

  // Status options for filter
  const statusOptions = ['Not Started', 'In Progress', 'Done'];

  // Get project name by ID
  const getProjectName = (projectId: number) => {
    const project = projects.find((p: Project) => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  // Status badge color
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Not Started':
        return 'secondary';
      case 'In Progress':
        return 'warning';
      case 'Done':
        return 'success';
      default:
        return 'primary';
    }
  };

  // Open edit task modal
  const openEditTaskModal = (task: Task) => {
    setSelectedTask(task);
    setEditTaskModalOpen(true);
  };

  // Open delete confirmation modal
  const openDeleteTaskModal = (task: Task) => {
    setSelectedTask(task);
    setDeleteTaskModalOpen(true);
  };

  return (
    <PageWrapper title="Tasks" description="Manage your tasks across all projects">
      <div className="p-6">
        {/* Filters Section */}
        <Card className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
          <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <label htmlFor="project-filter" className="block text-sm font-medium text-indigo-700 mb-1">
                Filter by Project
              </label>
              <select
                id="project-filter"
                className="w-full rounded-md border border-indigo-200 shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                value={selectedProject || ''}
                onChange={(e) => setSelectedProject(e.target.value ? Number(e.target.value) : null)}
                disabled={projectsLoading}
              >
                <option value="">All Projects</option>
                {projects.map((project: Project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label htmlFor="status-filter" className="block text-sm font-medium text-indigo-700 mb-1">
                Filter by Status
              </label>
              <select
                id="status-filter"
                className="w-full rounded-md border border-indigo-200 shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                value={statusFilter || ''}
                onChange={(e) => setStatusFilter(e.target.value || null)}
              >
                <option value="">All Statuses</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Button 
                variant="primary"
                className="w-full md:w-auto"
                onClick={() => {
                  setSelectedProject(null);
                  setStatusFilter(null);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Tasks List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'Task' : 'Tasks'}
            </h2>
            <Button 
              variant="primary" 
              className="bg-gradient-to-r from-indigo-600 to-purple-600"
              onClick={() => setCreateTaskModalOpen(true)}
            >
              Create New Task
            </Button>
          </div>

          {tasksLoading ? (
            <p>Loading tasks...</p>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No tasks found matching your criteria.</p>
              <Button 
                variant="outline"
                onClick={() => setCreateTaskModalOpen(true)}
              >
                Create your first task
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTasks.map((task: Task) => (
                <Card 
                  key={task.id} 
                  className="hover:shadow-md transition-all duration-200 border border-indigo-100 bg-white"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <Link href={`/tasks/${task.id}`}>
                        <h3 className="text-lg font-medium text-indigo-800 hover:text-indigo-600 cursor-pointer">{task.name || task.subject}</h3>
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      <div className="mt-3 flex items-center text-sm text-gray-500">
                        <span className="mr-3">Project: {getProjectName(task.projectId)}</span>
                        <span>Due: {task.dueDate ? formatDate(task.dueDate) : 'No deadline'}</span>
                      </div>
                    </div>
                    <Badge variant={getStatusBadgeVariant(task.status)} className="ml-2">
                      {task.status}
                    </Badge>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openEditTaskModal(task)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-indigo-600 border-indigo-200"
                      >
                        <Link href={`/tasks/${task.id}`} className="flex items-center">
                        View Details
                        </Link>
                      </Button>
                    </div>
                    {task.status !== 'Done' ? (
                      <Button 
                        variant="success" 
                        size="sm"
                        className="text-xs"
                        onClick={() => handleMarkComplete(task)}
                        isLoading={updateTaskMutation.isPending && updateTaskMutation.variables?.id === task.id}
                      >
                        Mark Complete
                      </Button>
                    ) : (
                      <Button 
                        variant="danger" 
                        size="sm"
                        className="text-xs"
                        onClick={() => openDeleteTaskModal(task)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      {createTaskModalOpen && (
        <TaskForm 
          projectId={selectedProject || 1} // Default to first project if none selected
          isOpen={createTaskModalOpen}
          onClose={() => setCreateTaskModalOpen(false)}
        />
      )}

      {/* Edit Task Modal */}
      {editTaskModalOpen && selectedTask && (
        <TaskForm 
          projectId={selectedTask.projectId}
          task={selectedTask}
          isOpen={editTaskModalOpen}
          onClose={() => setEditTaskModalOpen(false)}
        />
      )}

      {/* Delete Task Confirmation Modal */}
      {deleteTaskModalOpen && selectedTask && (
        <ConfirmModal
          isOpen={deleteTaskModalOpen}
          onClose={() => setDeleteTaskModalOpen(false)}
          onConfirm={() => deleteTaskMutation.mutate(selectedTask.id)}
          title="Delete Task"
          message={`Are you sure you want to delete "${selectedTask.name || selectedTask.subject}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          isLoading={deleteTaskMutation.isPending}
        />
      )}
    </PageWrapper>
  );
} 