"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserTasks, updateTask, deleteTask } from "@/services/task";
import { getCombinedProjectsOfUser } from "@/services/project";
import { getUserAssignedTasks } from "@/services/taskMembers";
import TaskForm from "@/components/feature/TaskForm";
import { ConfirmModal } from "@/components/ui/Modal";
import { TasksTable } from "@/components/feature/TasksTable";
import { Task } from "@/types";
import { getCurrentUser } from "@/services/user";
import Loader from '@/components/ui/Loader';

export default function TasksPage() {
  const [editTaskModalOpen, setEditTaskModalOpen] = useState(false);
  const [deleteTaskModalOpen, setDeleteTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'assigned'>('all');

  const queryClient = useQueryClient();

  // Get current user
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  // Fetch tasks
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: getUserTasks,
  });

  // Fetch assigned tasks
  const { data: assignedTasksData, isLoading: assignedTasksLoading } = useQuery({
    queryKey: ["assignedTasks", userData?.user?.id],
    queryFn: () => {
      if (!userData?.user?.id) return { data: [] };
      return getUserAssignedTasks(userData.user.id);
    },
    enabled: !!userData?.user?.id,
  });

  // Fetch all projects (owned and member of)
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ["allUserProjects"],
    queryFn: getCombinedProjectsOfUser,
  });

  const ownedTasks = tasksData?.tasks || [];
  const assignedTasks = assignedTasksData?.data || [];
  
  // Combine owned and assigned tasks for the "All Tasks" view, removing duplicates
  const allTasks = [...ownedTasks];   
  
  // Add assigned tasks that aren't already in the owned tasks list
  assignedTasks.forEach((assignedTask: Task) => {
    if (!allTasks.some(task => task.id === assignedTask.id)) {
      allTasks.push(assignedTask);
    }
  });           
  
  // Determine which tasks to display based on active tab
  const displayTasks = activeTab === 'all' ? allTasks : assignedTasks;
  const isLoading = userLoading || tasksLoading || assignedTasksLoading || projectsLoading;

  // Update task status mutation
  const updateTaskMutation = useMutation({
    mutationFn: (data: {
      id: number;
      status: "Pending" | "In-Progress" | "Done";
    }) => updateTask(data.id, { status: data.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["assignedTasks"] });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["assignedTasks"] });
      setDeleteTaskModalOpen(false);
    },
  });

  // Handle status change
  const handleStatusChange = (task: Task, newStatus: string) => {
    updateTaskMutation.mutate({ 
      id: task.id, 
      status: newStatus as "Pending" | "In-Progress" | "Done" 
    });
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
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="border-b border-gray-400 rounded-b-3xl">
        <div className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              Tasks
            </h1>
            <p className="mt-1 text-sm text-gray-500 max-w-4xl">
              Manage your tasks across all projects
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 bg-gray-50">
        <div className="p-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 rounded-lg bg-gray-100 p-1 mb-6 max-w-md">
            <button
              className={`w-full rounded-md py-2.5 text-sm font-medium leading-5 ${
                activeTab === 'all'
                  ? 'bg-white shadow text-blue-700'
                  : 'text-gray-700 hover:bg-white/[0.5]'
              }`}
              onClick={() => setActiveTab('all')}
            >
              All Tasks
            </button>
            <button
              className={`w-full rounded-md py-2.5 text-sm font-medium leading-5 ${
                activeTab === 'assigned'
                  ? 'bg-white shadow text-blue-700'
                  : 'text-gray-700 hover:bg-white/[0.5]'
              }`}
              onClick={() => setActiveTab('assigned')}
            >
              Assigned to Me
            </button>
          </div>

          {isLoading ? (
            <Loader centered text="Loading tasks..." />
          ) : (
            <TasksTable
              data={displayTasks}
              projects={projectsData?.projects || []}
              onEdit={openEditTaskModal}
              onDelete={openDeleteTaskModal}
              onStatusChange={handleStatusChange}
            />
          )}
        </div>
      </div>

      {/* Edit Task Modal */}
      {editTaskModalOpen && selectedTask && (
        <TaskForm
          projectId={selectedTask.projectId}
          task={selectedTask}
          isOpen={editTaskModalOpen}
          onClose={() => {
            setEditTaskModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ["assignedTasks"] });
          }}
        />
      )}

      {/* Delete Task Confirmation Modal */}
      {deleteTaskModalOpen && selectedTask && (
        <ConfirmModal
          isOpen={deleteTaskModalOpen}
          onClose={() => setDeleteTaskModalOpen(false)}
          onConfirm={() => deleteTaskMutation.mutate(selectedTask.id)}
          title="Delete Task"
          message={`Are you sure you want to delete "${
            selectedTask.name || selectedTask.subject
          }"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          isLoading={deleteTaskMutation.isPending}
        />
      )}
    </div>
  );
}
