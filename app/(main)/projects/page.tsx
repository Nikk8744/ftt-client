'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllProjectsOfUser, createProject, deleteProject, updateProject } from '@/services/project';
import { getAllProjectsUserIsMemberOf } from '@/services/projectMember';
import { ProjectCreateData, Project } from '@/types';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { ConfirmModal } from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ProjectsTable } from '@/components/feature/ProjectsTable';
import { Plus } from 'lucide-react';
import Card from '@/components/ui/Card';

// Form validation schema
const projectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters').max(255, 'Project name cannot exceed 255 characters'),
  description: z.string().min(5, 'Project description must be at least 5 characters').max(1000, 'Project description cannot exceed 1000 characters'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  status: z.enum(['Pending', 'In-Progress', 'Completed']).optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'owned' | 'member'>('owned');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; projectId: number | null }>({
    isOpen: false,
    projectId: null,
  });

  // Fetch owned projects
  const {
    data: ownedProjectsData,
    isLoading: ownedProjectsLoading,
    error: ownedProjectsError,
  } = useQuery({
    queryKey: ['projects', 'owned'],
    queryFn: getAllProjectsOfUser,
  });

  // Fetch projects user is member of
  const {
    data: memberProjectsData,
    isLoading: memberProjectsLoading,
    error: memberProjectsError,
  } = useQuery({
    queryKey: ['projects', 'member'],
    queryFn: getAllProjectsUserIsMemberOf,
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: (data: ProjectCreateData) => createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'owned'] });
      setIsCreateModalOpen(false);
      reset();
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: (data: { id: number; project: ProjectFormData }) => 
      updateProject(data.id, data.project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'owned'] });
      setIsEditModalOpen(false);
      setSelectedProject(null);
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: (id: number) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'owned'] });
      setDeleteModalState({ isOpen: false, projectId: null });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 30 days from now
      status: 'Pending',
    },
  });

  const onSubmit = (data: ProjectFormData) => {
    createProjectMutation.mutate(data);
  };

  const openDeleteModal = (projectId: number) => {
    setDeleteModalState({ isOpen: true, projectId });
  };

  const openEditModal = (project: Project) => {
    setSelectedProject(project);
    // Set form values based on the selected project
    setValue('name', project.name);
    setValue('description', project.description);
    setValue('startDate', project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '');
    setValue('endDate', project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '');
    setValue('status', project.status || 'Pending');
    setIsEditModalOpen(true);
  };

  const handleUpdateProject = (data: ProjectFormData) => {
    if (selectedProject) {
      updateProjectMutation.mutate({
        id: selectedProject.id,
        project: data
      });
    }
  };

  const handleDeleteProject = () => {
    if (deleteModalState.projectId) {
      deleteProjectMutation.mutate(deleteModalState.projectId);
    }
  };

  const ownedProjects = ownedProjectsData?.projects || [];
  const memberProjects = memberProjectsData?.projects || [];

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="border-b border-gray-400 rounded-b-3xl">
        <div className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              Projects
            </h1>
            <p className="mt-1 text-sm text-gray-500 max-w-4xl">
              Manage your projects and collaborations
            </p>
          </div>
          <div className="flex flex-shrink-0 space-x-2">
            <Button
              variant="default"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-1 bg-gray-50">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('owned')}
              className={`px-4 py-4 text-sm font-medium ${
                activeTab === 'owned'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Your Projects
            </button>
            <button
              onClick={() => setActiveTab('member')}
              className={`ml-8 px-4 py-4 text-sm font-medium ${
                activeTab === 'member'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Projects You&apos;re Member Of
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'owned' ? (
            <>
              {ownedProjectsLoading ? (
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
              ) : ownedProjects.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new project.</p>
                  <div className="mt-6">
                    <Button
                      variant="default"
                      // leftIcon={
                        
                      // }
                      onClick={() => setIsCreateModalOpen(true)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      New Project
                    </Button>
                  </div>
                </div>
              ) : ownedProjectsError ? (
                <p className="text-red-500">Error loading projects</p>
              )  : (
                <ProjectsTable
                  data={ownedProjects}
                  onDelete={openDeleteModal}
                  onEdit={openEditModal}
                />
              )}
            </>
          ) : (
            <>
              {memberProjectsLoading ? (
                <p>Loading projects...</p>
              ) : memberProjects.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No memberships</h3>
                  <p className="mt-1 text-sm text-gray-500">You&apos;re not a member of any projects yet.</p>
                </div>
              ) : memberProjectsError ? (
                <p className="text-red-500">Error loading projects</p>
              ) : (
                <ProjectsTable
                  data={memberProjects}
                  onDelete={openDeleteModal}
                  onEdit={openEditModal}
                />
              )}
            </>
          )}
        </div>

        {/* Create Project Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Project"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleSubmit(onSubmit)}
                isLoading={createProjectMutation.isPending}
                disabled={createProjectMutation.isPending}
              >
                Create
              </Button>
            </>
          }
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="name"
              label="Project Name"
              fullWidth
              error={errors.name?.message}
              {...register('name')}
            />

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                className={`w-full rounded-md border ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                } shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2 px-3`}
                {...register('description')}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  className={`w-full rounded-md border ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  } shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2 px-3`}
                  {...register('startDate')}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  className={`w-full rounded-md border ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  } shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2 px-3`}
                  {...register('endDate')}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                className={`w-full rounded-md border ${
                  errors.status ? 'border-red-500' : 'border-gray-300'
                } shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2 px-3`}
                {...register('status')}
              >
                <option value="Pending">Pending</option>
                <option value="In-Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>
          </form>
        </Modal>

        {/* Edit Project Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProject(null);
          }}
          title="Edit Project"
          footer={
            <>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedProject(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleSubmit(handleUpdateProject)}
                isLoading={updateProjectMutation.isPending}
                disabled={updateProjectMutation.isPending}
              >
                Save Changes
              </Button>
            </>
          }
        >
          {selectedProject && (
            <form onSubmit={handleSubmit(handleUpdateProject)} className="space-y-4">
              <Input
                id="edit-name"
                label="Project Name"
                fullWidth
                error={errors.name?.message}
                {...register('name')}
              />

              <div>
                <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  rows={4}
                  className={`w-full rounded-md border ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  } shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2 px-3`}
                  {...register('description')}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="edit-startDate"
                    className={`w-full rounded-md border ${
                      errors.startDate ? 'border-red-500' : 'border-gray-300'
                    } shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2 px-3`}
                    {...register('startDate')}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="edit-endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="edit-endDate"
                    className={`w-full rounded-md border ${
                      errors.endDate ? 'border-red-500' : 'border-gray-300'
                    } shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2 px-3`}
                    {...register('endDate')}
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="edit-status"
                  className={`w-full rounded-md border ${
                    errors.status ? 'border-red-500' : 'border-gray-300'
                  } shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2 px-3`}
                  {...register('status')}
                >
                  <option value="Pending">Pending</option>
                  <option value="In-Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                )}
              </div>

              {updateProjectMutation.isError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">Failed to update project. Please try again.</p>
                </div>
              )}
            </form>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModalState.isOpen}
          onClose={() => setDeleteModalState({ isOpen: false, projectId: null })}
          onConfirm={handleDeleteProject}
          title="Delete Project"
          message="Are you sure you want to delete this project? This action cannot be undone and all associated tasks and time logs will be deleted."
          confirmText="Delete"
          cancelText="Cancel"
          isLoading={deleteProjectMutation.isPending}
          variant="danger"
        />
      </div>
    </div>
  );
}