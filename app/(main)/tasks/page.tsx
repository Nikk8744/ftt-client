"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserTasks, updateTask, deleteTask } from "@/services/task";
import { getAllProjectsOfUser } from "@/services/project";
import { getUserAssignedTasks } from "@/services/taskMembers";
import Card from "@/components/ui/Card";
import PageWrapper from "@/components/layout/PageWrapper";
import TaskForm from "@/components/feature/TaskForm";
import { ConfirmModal } from "@/components/ui/Modal";
import { TasksTable } from "@/components/feature/TasksTable";
import { Task } from "@/types";
import { getCurrentUser } from "@/services/user";

export default function TasksPage() {
  const [editTaskModalOpen, setEditTaskModalOpen] = useState(false);
  const [deleteTaskModalOpen, setDeleteTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'assigned'>('all');

  const queryClient = useQueryClient();

  // Get current user
  const { data: userData } = useQuery({
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

  // Fetch projects for filter
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: getAllProjectsOfUser,
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
  const isLoading = (activeTab === 'all' ? (tasksLoading || assignedTasksLoading) : assignedTasksLoading) || !userData?.user?.id;

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
    <PageWrapper
      title="Tasks"
      description="Manage your tasks across all projects"
    >
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

        {isLoading || projectsLoading ? (
          <Card className="p-8 text-center">
            <p>Loading tasks...</p>
          </Card>
        ) : displayTasks.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500 mb-4">
              {activeTab === 'all' ? 'No tasks found.' : 'No tasks assigned to you.'}
            </p>
            <p className="text-sm text-gray-500">
              {activeTab === 'all' 
                ? 'To create a new task, please go to a project and use the "Add Task" button there.'
                : 'Tasks assigned to you will appear here.'}
            </p>
          </Card>
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
    </PageWrapper>
  );
}
