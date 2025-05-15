'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTaskById, updateTask, deleteTask } from '@/services/task';
import { getProjectById } from '@/services/project';
import { getTaskAssignee, assignTask, getTaskFollowers, addTaskFollower, removeTaskFollower } from '@/services/taskMembers';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Modal, { ConfirmModal } from '@/components/ui/Modal';
import PageWrapper from '@/components/layout/PageWrapper';
import { formatDate, formatDuration } from '@/lib/utils';
import TaskForm from '@/components/feature/TaskForm';
import TaskChecklist from '@/components/feature/TaskChecklist';
import Link from 'next/link';
import useTimer from '@/lib/hooks/useTimer';
import Avatar from '@/components/ui/Avatar';
import { User } from '@/types';
import { getCurrentUser } from '@/services/user';

export default function TaskDetailsPage() {
  const { taskId } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { startTimer } = useTimer();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false });
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Get current user
  useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    onSuccess: (data) => {
      setCurrentUser(data.user);
    }
  });

  // Get task details
  const {
    data: taskData,
    isLoading: taskLoading,
    error: taskError,
  } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => getTaskById(Number(taskId)),
    enabled: !!taskId,
  });

  // Get project details
  const {
    data: projectData,
    isLoading: projectLoading,
  } = useQuery({
    queryKey: ['project', taskData?.task?.projectId],
    queryFn: () => getProjectById(taskData?.task?.projectId || 0),
    enabled: !!taskData?.task?.projectId,
  });

  // Get task assignee
  const {
    data: assigneeData,
    isLoading: assigneeLoading,
  } = useQuery({
    queryKey: ['taskAssignee', taskId],
    queryFn: () => getTaskAssignee(Number(taskId)),
    enabled: !!taskId,
  });

  // Get task followers
  const {
    data: followersData,
    isLoading: followersLoading,
  } = useQuery({
    queryKey: ['taskFollowers', taskId],
    queryFn: () => getTaskFollowers(Number(taskId)),
    enabled: !!taskId,
  });

  // Assign task mutation
  const assignTaskMutation = useMutation({
    mutationFn: (userId: number) => assignTask(Number(taskId), userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskAssignee', taskId] });
    },
  });

  // Add follower mutation
  const addFollowerMutation = useMutation({
    mutationFn: (userId: number) => addTaskFollower(Number(taskId), userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskFollowers', taskId] });
    },
  });

  // Remove follower mutation
  const removeFollowerMutation = useMutation({
    mutationFn: (userId: number) => removeTaskFollower(Number(taskId), userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskFollowers', taskId] });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: () => deleteTask(Number(taskId)),
    onSuccess: () => {
      // Navigate back to tasks page after deletion
      router.push('/tasks');
    },
  });

  const task = taskData?.task;
  const project = projectData?.project;
  const assignee = assigneeData?.user;
  const followers = followersData?.users || [];

  // Check if current user is following this task
  const isUserFollowing = currentUser ? 
    followers.some(follower => follower.id === currentUser.id) : 
    false;

  // Handle follow/unfollow
  const handleFollowToggle = () => {
    if (!currentUser) return;
    
    if (isUserFollowing) {
      removeFollowerMutation.mutate(currentUser.id);
    } else {
      addFollowerMutation.mutate(currentUser.id);
    }
  };

  // Handle task status badge color
  const getStatusBadgeVariant = (status: string | null) => {
    if (status === null) return 'primary';
    
    switch (status) {
      case 'Pending':
        return 'secondary';
      case 'In-Progress':
        return 'warning';
      case 'Done':
        return 'success';
      default:
        return 'primary';
    }
  };

  // Start timer for this task
  const handleStartTimer = () => {
    startTimer({
      projectId: task?.projectId,
      taskId: Number(taskId)
    });
  };

  const handleDeleteConfirm = () => {
    deleteTaskMutation.mutate();
  };

  if (taskLoading) {
    return <div>Loading task details...</div>;
  }

  if (taskError || !task) {
    return <div>Error loading task details</div>;
  }

  return (
    <PageWrapper
      title={task.subject}
      description={`Created ${formatDate(task.createdAt)}`}
      actions={
        <div className="flex space-x-2">
          <Button
            variant="success"
            onClick={handleStartTimer}
          >
            Start Timer
          </Button>
          <Button
            variant={isUserFollowing ? "outline" : "primary"} 
            onClick={handleFollowToggle}
            isLoading={addFollowerMutation.isPending || removeFollowerMutation.isPending}
          >
            {isUserFollowing ? 'Unfollow' : 'Follow'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit Task
          </Button>
          <Button
            variant="danger"
            onClick={() => setDeleteModalState({ isOpen: true })}
          >
            Delete
          </Button>
        </div>
      }
    >
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Task Description */}
            <Card>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{task.description || 'No description provided'}</p>
            </Card>

            {/* Task Checklist */}
            <Card>
              <TaskChecklist taskId={Number(taskId)} />
            </Card>
          </div>

          <div className="space-y-6">
            {/* Task Info */}
            <Card>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Task Info</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge variant={getStatusBadgeVariant(task.status)} className="mt-1">
                    {task.status || 'Not Set'}
                  </Badge>
                </div>
                {project && (
                  <div>
                    <p className="text-sm text-gray-500">Project</p>
                    <Link href={`/projects/${project.id}`} className="text-primary-600 hover:underline">
                      {project.name}
                    </Link>
                  </div>
                )}
                {task.dueDate && (
                  <div>
                    <p className="text-sm text-gray-500">Due Date</p>
                    <p className="font-medium">{formatDate(task.dueDate)}</p>
                  </div>
                )}
                {task.totalTimeSpent ? (
                  <div>
                    <p className="text-sm text-gray-500">Time Spent</p>
                    <p className="font-medium">{formatDuration(task.totalTimeSpent)}</p>
                  </div>
                ) : null}
                <div>
                  <p className="text-sm text-gray-500">Created</p>
                  <p className="font-medium">{formatDate(task.createdAt)}</p>
                </div>
              </div>
            </Card>

            {/* Assignee Section */}
            <Card>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Assignees</h3>
              <div className="space-y-3">
                {assigneeLoading ? (
                  <p className="text-sm text-gray-500">Loading assignee...</p>
                ) : assignee ? (
                  <div className="flex items-center space-x-2">
                    <Avatar name={assignee.name} size="sm" />
                    <div>
                      <p className="font-medium">{assignee.name}</p>
                      <p className="text-xs text-gray-500">{assignee.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No one is assigned to this task</p>
                )}
              </div>
            </Card>

            {/* Followers Section */}
            <Card>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Followers</h3>
              <div className="space-y-3">
                {followersLoading ? (
                  <p className="text-sm text-gray-500">Loading followers...</p>
                ) : followers.length > 0 ? (
                  <div className="space-y-2">
                    {followers.map(follower => (
                      <div key={follower.id} className="flex items-center space-x-2">
                        <Avatar name={follower.name} size="sm" />
                        <div>
                          <p className="font-medium">{follower.name}</p>
                          <p className="text-xs text-gray-500">{follower.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No followers</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Task Modal */}
      {isEditModalOpen && (
        <TaskForm
          projectId={task.projectId}
          task={task}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false })}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone and all associated data including time logs and checklist items will be deleted."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleteTaskMutation.isPending}
        variant="danger"
      />
    </PageWrapper>
  );
} 