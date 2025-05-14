import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTask, deleteTask } from '@/services/task';
import { Task } from '@/types';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/Modal';
import TaskForm from './TaskForm';

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
    mutationFn: ({ id, status }: { id: number; status: 'todo' | 'inprogress' | 'completed' }) => 
      updateTask(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'todo':
        return <Badge variant="secondary">To Do</Badge>;
      case 'inprogress':
        return <Badge variant="primary">In Progress</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const handleStatusChange = (taskId: number, newStatus: 'todo' | 'inprogress' | 'completed') => {
    updateTaskMutation.mutate({ id: taskId, status: newStatus });
  };

  const openDeleteModal = (taskId: number) => {
    setDeleteModalState({ isOpen: true, taskId });
  };

  const handleDeleteTask = () => {
    if (deleteModalState.taskId) {
      deleteTaskMutation.mutate(deleteModalState.taskId);
    }
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {getStatusBadge(task.status)}
                <h3 className="text-lg font-medium text-gray-900">{task.name}</h3>
              </div>
              <p className="text-sm text-gray-600">{task.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                className="rounded-md border border-gray-300 text-sm py-1 px-2"
                value={task.status}
                onChange={(e) => handleStatusChange(task.id, e.target.value as 'todo' | 'inprogress' | 'completed')}
                disabled={updateTaskMutation.isPending}
              >
                <option value="todo">To Do</option>
                <option value="inprogress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
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