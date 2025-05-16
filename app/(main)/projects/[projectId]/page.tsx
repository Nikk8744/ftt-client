'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import PageWrapper from '@/components/layout/PageWrapper';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import TaskList from '@/components/feature/TaskList';
import TeamMembers from '@/components/TeamMembers';
import { getProjectById, updateProject } from '@/services/project';
import { getTasksByProject } from '@/services/task';
import { 
  addMemberToProject, 
  removeMemberFromProject,
  getTeamMembers
} from '@/services/projectMember';
import useAuth from '@/lib/hooks/useAuth';
import { formatDate, formatRelativeTime } from '@/lib/utils';

// Form validation schemas
const projectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters').max(255, 'Project name cannot exceed 255 characters'),
  description: z.string().min(5, 'Project description must be at least 5 characters').max(1000, 'Project description cannot exceed 1000 characters'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  status: z.enum(['Pending', 'In-Progress', 'Completed']).optional(),
});

const memberSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

type ProjectFormData = z.infer<typeof projectSchema>;
type MemberFormData = z.infer<typeof memberSchema>;

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [removeModalState, setRemoveModalState] = useState<{ isOpen: boolean; userId: number | null }>({
    isOpen: false,
    userId: null,
  });

  // Get project details
  const {
    data: projectData,
    isLoading: projectLoading,
    error: projectError,
  } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProjectById(Number(projectId)),
    enabled: !!projectId,
  });

  // Get project tasks
  const {
    data: tasksData,
    isLoading: tasksLoading,
    error: tasksError,
  } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => getTasksByProject(Number(projectId)),
    enabled: !!projectId,
  });

  // Get team members 
  const {
    data: teamData,
  } = useQuery({
    queryKey: ['team-members', projectId],
    queryFn: () => getTeamMembers(Number(projectId)),
    enabled: !!projectId,
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: (data: ProjectFormData) => updateProject(Number(projectId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      setIsEditModalOpen(false);
    },
  });

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: (data: MemberFormData) => addMemberToProject(Number(projectId), Number(data.userId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', projectId] });
      queryClient.invalidateQueries({ queryKey: ['team-members', projectId] });
      setIsAddMemberModalOpen(false);
      reset();
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (userId: number) => removeMemberFromProject(Number(projectId), userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', projectId] });
      queryClient.invalidateQueries({ queryKey: ['team-members', projectId] });
      setRemoveModalState({ isOpen: false, userId: null });
    },
  });

  const {
    register: registerProject,
    handleSubmit: handleProjectSubmit,
    formState: { errors: projectErrors },
    reset: resetProject,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      status: undefined,
    },
  });

  const {
    register: registerMember,
    handleSubmit: handleMemberSubmit,
    formState: { errors: memberErrors },
    reset,
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      userId: '',
    },
  });

  // Load project data into edit form when available
  useEffect(() => {
    if (projectData?.project) {
      resetProject({
        name: projectData.project.name,
        description: projectData.project.description,
        startDate: projectData.project.startDate ? new Date(projectData.project.startDate).toISOString().split('T')[0] : '',
        endDate: projectData.project.endDate ? new Date(projectData.project.endDate).toISOString().split('T')[0] : '',
        status: projectData.project.status || undefined,
      });
    }
  }, [projectData, resetProject]);

  const onUpdateProject = (data: ProjectFormData) => {
    // Make sure we have valid dates
    const formattedData = {
      ...data,
      startDate: data.startDate,
      endDate: data.endDate,
    };
    
    // Log the data being sent to make sure it's correct
    console.log("Update project data:", formattedData);
    
    updateProjectMutation.mutate(formattedData);
  };

  const onAddMember = (data: MemberFormData) => {
    addMemberMutation.mutate(data);
  };

  const openRemoveMemberModal = (userId: number) => {
    setRemoveModalState({ isOpen: true, userId });
  };

  const handleRemoveMember = (userId: number) => {
    if (removeModalState.isOpen) {
      removeMemberMutation.mutate(userId);
    } else {
      openRemoveMemberModal(userId);
    }
  };

  const project = projectData?.project;
  const tasks = tasksData?.tasks || [];
  const teamMembers = teamData?.members || [];
  
  // Check if current user is the project owner
  const isOwner = project && user ? project.userId === user.id : false;

  if (projectLoading) {
    return <div>Loading project details...</div>;
  }

  if (projectError || !project) {
    return <div>Error loading project details</div>;
  }

  return (
    <PageWrapper
      title={project.name}
      description={`Created ${formatRelativeTime(project.createdAt)}`}
      actions={
        isOwner && (
          <Button
            variant="outline"
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit Project
          </Button>
        )
      }
    >
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Project Description */}
            <Card>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{project.description}</p>
            </Card>

            {/* Tasks Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Tasks</h2>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAddTaskModalOpen(true)}
                >
                  Add Task
                </Button>
              </div>
              
              {tasksLoading ? (
                <p>Loading tasks...</p>
              ) : tasksError ? (
                <p className="text-red-500">Error loading tasks</p>
              ) : tasks.length === 0 ? (
                <Card>
                  <div className="text-center py-6">
                    <p className="text-gray-500">No tasks yet. Create your first task to get started.</p>
                  </div>
                </Card>
              ) : (
                <TaskList tasks={tasks} projectId={Number(projectId)} />
              )}
            </div>
          </div>

          <div className="space-y-6">
            {/* Project Info */}
            <Card>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Project Info</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Owner</p>
                  <p className="font-medium">{isOwner ? `${user?.name} (You)` : 'Another User'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium">{formatDate(project.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Start Date</p>
                  <p className="font-medium">{formatDate(project.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="font-medium">{formatDate(project.endDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge 
                    variant={
                      project.status === 'Completed' ? 'success' : 
                      project.status === 'In-Progress' ? 'warning' : 'primary'
                    } 
                    className="mt-1"
                  >
                    {project.status || 'Pending'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Hours</p>
                  <p className="font-medium">{project.totalHours || '0'}</p>
                </div>
              </div>
            </Card>

            {/* Team Members */}
            <TeamMembers 
              members={teamMembers.map((member: { id: string; name?: string; }) => ({
                id: member.id,
                name: member.name || `User ${member.id}`,
                // addedAt: member.addedAt
              }))}
              onAddMember={isOwner ? () => setIsAddMemberModalOpen(true) : undefined}
              onRemoveMember={isOwner ? handleRemoveMember : undefined}
            />
          </div>
        </div>
      </div>

      {/* Edit Project Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Project"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleProjectSubmit(onUpdateProject)}
              isLoading={updateProjectMutation.isPending}
              disabled={updateProjectMutation.isPending}
            >
              Save Changes
            </Button>
          </>
        }
      >
        <form onSubmit={handleProjectSubmit(onUpdateProject)} className="space-y-4">
          <Input
            id="name"
            label="Project Name"
            error={projectErrors.name?.message}
            {...registerProject('name')}
          />
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className={`w-full rounded-md border ${
                projectErrors.description ? 'border-red-500' : 'border-gray-300'
              } shadow-sm focus:border-primary-500 focus:ring-primary-500`}
              {...registerProject('description')}
            ></textarea>
            {projectErrors.description && (
              <p className="mt-1 text-sm text-red-600">{projectErrors.description.message}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                className={`w-full rounded-md border ${
                  projectErrors.startDate ? 'border-red-500' : 'border-gray-300'
                } shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2 px-3`}
                {...registerProject('startDate')}
              />
              {projectErrors.startDate && (
                <p className="mt-1 text-sm text-red-600">{projectErrors.startDate.message}</p>
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
                  projectErrors.endDate ? 'border-red-500' : 'border-gray-300'
                } shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2 px-3`}
                {...registerProject('endDate')}
              />
              {projectErrors.endDate && (
                <p className="mt-1 text-sm text-red-600">{projectErrors.endDate.message}</p>
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
                projectErrors.status ? 'border-red-500' : 'border-gray-300'
              } shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2 px-3`}
              {...registerProject('status')}
            >
              <option value="">Select Status</option>
              <option value="Pending">Pending</option>
              <option value="In-Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            {projectErrors.status && (
              <p className="mt-1 text-sm text-red-600">{projectErrors.status.message}</p>
            )}
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        title="Add Team Member"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsAddMemberModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleMemberSubmit(onAddMember)}
              isLoading={addMemberMutation.isPending}
              disabled={addMemberMutation.isPending}
            >
              Add Member
            </Button>
          </>
        }
      >
        <form onSubmit={handleMemberSubmit(onAddMember)} className="space-y-4">
          <Input
            id="userId"
            label="User ID"
            error={memberErrors.userId?.message}
            helperText="Enter the user ID of the person you want to add"
            {...registerMember('userId')}
          />
          
          {addMemberMutation.isError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              Failed to add member. Please check if the user ID is valid.
            </div>
          )}
        </form>
      </Modal>

      {/* Remove Member Confirmation Modal */}
      <Modal
        isOpen={removeModalState.isOpen}
        onClose={() => setRemoveModalState({ isOpen: false, userId: null })}
        title="Remove Team Member"
        footer={
          <>
            <Button variant="outline" onClick={() => setRemoveModalState({ isOpen: false, userId: null })}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => handleRemoveMember(removeModalState.userId!)}
              isLoading={removeMemberMutation.isPending}
              disabled={removeMemberMutation.isPending}
            >
              Remove
            </Button>
          </>
        }
      >
        <p>Are you sure you want to remove this team member from the project?</p>
        {removeMemberMutation.isError && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            Failed to remove member. Please try again.
          </div>
        )}
      </Modal>

      {/* Add Task Modal */}
      {isAddTaskModalOpen && (
        <Modal
          isOpen={isAddTaskModalOpen}
          onClose={() => setIsAddTaskModalOpen(false)}
          title="Add Task"
        >
          {/* Task creation form would go here */}
          <p>Task creation form would go here...</p>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsAddTaskModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary">Create Task</Button>
          </div>
        </Modal>
      )}
    </PageWrapper>
  );
} 