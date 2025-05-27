import { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { deleteTask } from '@/services/task';
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
        <Card
        key={task.id}
        className="group hover:shadow-xl hover:shadow-gray-100 transition-all duration-300 rounded-xl border border-gray-100 bg-white overflow-hidden"
      >
        <div className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
            {/* Main Content Section */}
            <div className="flex-1 min-w-0">
              {/* Header with title and badge */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <Link
                  href={`/tasks/${task.id}`}
                  className="text-base font-semibold text-gray-900 hover:text-primary-600 transition-colors duration-200 line-clamp-1 group-hover:text-primary-700"
                >
                  {task.subject}
                </Link>
                <div className="flex-shrink-0">
                  <Badge 
                    variant={getStatusBadgeVariant(task.status)}
                    className="whitespace-nowrap text-xs"
                  >
                    {getStatusLabel(task.status)}
                  </Badge>
                </div>
              </div>
      
              {/* Description */}
              <p className="text-xs text-gray-600 line-clamp-1 mb-2 leading-relaxed">
                {task.description || 'No description provided'}
              </p>
      
              {/* Metadata row */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                {task.dueDate && (
                  <div className="flex items-center gap-1 text-gray-500">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium">Due:</span>
                    <span>{formatDate(task.dueDate)}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <TaskAssignee taskId={task.id} />
                </div>
              </div>
            </div>
      
            {/* Actions Section */}
            <div className="flex lg:flex-col gap-1.5 lg:min-w-[100px]">
              <Link href={`/tasks/${task.id}`} className="flex-1 lg:flex-none">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-center hover:bg-primary-50 hover:border-primary-200 hover:text-primary-700 transition-colors text-xs px-2 py-1"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setEditTask(task)}
                className="flex-1 lg:flex-none justify-center hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors text-xs px-2 py-1"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Button>
              
              <Button 
                variant="danger" 
                size="sm" 
                onClick={() => openDeleteModal(task.id)}
                className="flex-1 lg:flex-none justify-center hover:bg-red-50 hover:border-red-300 transition-colors text-xs px-2 py-1"
              >
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </Button>
            </div>
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