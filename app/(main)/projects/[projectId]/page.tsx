'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjectById, updateProject } from '@/services/project';
import { getProjectTasks } from '@/services/task';
import { getAllMembersOfProject, addMemberToProject, removeMemberFromProject } from '@/services/projectMember';
import useAuth from '@/lib/hooks/useAuth';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { ConfirmModal } from '@/components/ui/Modal';
import PageWrapper from '@/components/layout/PageWrapper';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Task } from '@/types';
import TaskForm from '@/components/feature/TaskForm';
import TaskList from '@/components/feature/TaskList';

// Form validation schemas
const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().min(1, 'Project description is required'),
});

const memberSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

type ProjectFormData = z.infer<typeof projectSchema>;
type MemberFormData = z.infer<typeof memberSchema>;

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  const router = useRouter();
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
    queryFn: () => getProjectTasks(Number(projectId)),
    enabled: !!projectId,
  });

  // Get project members
  const {
    data: membersData,
    isLoading: membersLoading,
    error: membersError,
  } = useQuery({
    queryKey: ['members', projectId],
    queryFn: () => getAllMembersOfProject(Number(projectId)),
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
      setIsAddMemberModalOpen(false);
      reset();
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (userId: number) => removeMemberFromProject(Number(projectId), userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', projectId] });
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
      name: projectData?.project?.name || '',
      description: projectData?.project?.description || '',
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
  useState(() => {
    if (projectData?.project) {
      resetProject({
        name: projectData.project.name,
        description: projectData.project.description,
      });
    }
  });

  const onUpdateProject = (data: ProjectFormData) => {
    updateProjectMutation.mutate(data);
  };

  const onAddMember = (data: MemberFormData) => {
    addMemberMutation.mutate(data);
  };

  const openRemoveMemberModal = (userId: number) => {
    setRemoveModalState({ isOpen: true, userId });
  };

  const handleRemoveMember = () => {
    if (removeModalState.userId) {
      removeMemberMutation.mutate(removeModalState.userId);
    }
  };

  const project = projectData?.project;
  const tasks = tasksData?.tasks || [];
  const members = membersData?.members || [];
  
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
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant="success" className="mt-1">Active</Badge>
                </div>
              </div>
            </Card>

            {/* Project Members */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Team Members</h3>
                {isOwner && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddMemberModalOpen(true)}
                  >
                    Add Member
                  </Button>
                )}
              </div>
              
              {membersLoading ? (
                <p>Loading members...</p>
              ) : membersError ? (
                <p className="text-red-500">Error loading members</p>
              ) : members.length === 0 ? (
                <p className="text-gray-500 text-sm">No members yet.</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {members.map((member) => (
                    <li key={member.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium">User ID: {member.userId}</p>
                        <p className="text-sm text-gray-500">
                          Added {formatRelativeTime(member.createdAt)}
                        </p>
                      </div>
                      {isOwner && member.userId !== project.userId && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openRemoveMemberModal(member.userId)}
                        >
                          Remove
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
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
            fullWidth
            error={projectErrors.name?.message}
            {...registerProject('name')}
          />

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              className={`w-full rounded-md border ${
                projectErrors.description ? 'border-red-500' : 'border-gray-300'
              } shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2 px-3`}
              {...registerProject('description')}
            />
            {projectErrors.description && (
              <p className="mt-1 text-sm text-red-600">{projectErrors.description.message}</p>
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
            type="number"
            fullWidth
            helperText="Enter the user ID of the person you want to add to this project."
            error={memberErrors.userId?.message}
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
      <ConfirmModal
        isOpen={removeModalState.isOpen}
        onClose={() => setRemoveModalState({ isOpen: false, userId: null })}
        onConfirm={handleRemoveMember}
        title="Remove Team Member"
        message="Are you sure you want to remove this member from the project? They will no longer have access to project tasks and details."
        confirmText="Remove"
        cancelText="Cancel"
        isLoading={removeMemberMutation.isPending}
        variant="danger"
      />

      {/* Add Task Modal */}
      {isAddTaskModalOpen && (
        <TaskForm
          projectId={Number(projectId)}
          isOpen={isAddTaskModalOpen}
          onClose={() => setIsAddTaskModalOpen(false)}
        />
      )}
    </PageWrapper>
  );
} 