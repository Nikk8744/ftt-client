import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { updateTask, deleteTask } from '@/services/task';
import { Task } from '@/types';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/Modal';
import TaskForm from './TaskForm';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';
import { getTaskAssignee } from '@/services/taskMembers';

interface TaskListProps {
  tasks: Task[];
  projectId: number;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, projectId }) => {
  const queryClient = useQueryClient();
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteModalState, setDeleteModalState] = useState<{ isOpen: boolean; taskId: number | null }>({
    isOpen: false,
    taskId: null,
  });

  // Update task status mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      updateTask(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      setDeleteModalState({ isOpen: false, taskId: null });
    },
  });

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

  const getStatusLabel = (status: string | null) => {
    if (status === null) return 'Not Set';
    
    switch (status) {
      case 'Pending':
        return 'Not Started';
      case 'In-Progress':
        return 'In Progress';
      case 'Done':
        return 'Completed';
      default:
        return status;
    }
  };

  const handleStatusChange = (taskId: number, newStatus: string) => {
    updateTaskMutation.mutate({ id: taskId, status: newStatus });
  };

  const openDeleteModal = (id: number) => {
    setDeleteModalState({
      isOpen: true,
      taskId: id,
    });
  };

  const handleDeleteTask = () => {
    if (deleteModalState.taskId) {
      deleteTaskMutation.mutate(deleteModalState.taskId);
    }
  };

  // Function to get task assignee (we'll use React Query's cache to avoid multiple requests)
  const TaskAssignee = ({ taskId }: { taskId: number }) => {
    const { data, isLoading } = useQuery({
      queryKey: ['taskAssignee', taskId],
      queryFn: () => getTaskAssignee(taskId),
      staleTime: 1000 * 60 * 5, // 5 minutes
    });

    if (isLoading || !data?.user) return null;

    return (
      <div className="flex items-center mt-2">
        <Avatar name={data.user.name} size="xs" className="mr-1" />
        <span className="text-xs text-gray-500">Assigned to: {data.user.name}</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className="hover:shadow-md transition-all duration-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <Link href={`/tasks/${task.id}`} className="text-lg font-medium text-gray-900 hover:text-primary-600">
                  {task.subject}
                </Link>
                <Badge variant={getStatusBadgeVariant(task.status)} className="ml-2">
                  {getStatusLabel(task.status)}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                {task.description || 'No description provided'}
              </p>
              <div className="mt-1 flex flex-wrap gap-2">
                {task.dueDate && (
                  <p className="text-xs text-gray-500">
                    Due: {formatDate(task.dueDate)}
                  </p>
                )}
                <TaskAssignee taskId={task.id} />
              </div>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-2">
              <Link href={`/tasks/${task.id}`}>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditTask(task)}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => openDeleteModal(task.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        </Card>
      ))}

      {/* Edit Task Modal */}
      {editTask && (
        <TaskForm
          projectId={projectId}
          task={editTask}
          isOpen={!!editTask}
          onClose={() => setEditTask(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, taskId: null })}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleteTaskMutation.isPending}
        variant="danger"
      />
    </div>
  );
};

export default TaskList;