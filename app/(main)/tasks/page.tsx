"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserTasks, updateTask, deleteTask } from "@/services/task";
import { getCombinedProjectsOfUser } from "@/services/project";
import { getUserAssignedTasks } from "@/services/taskMembers";
import TaskForm from "@/components/feature/tasks/TaskForm";
import { ConfirmModal } from "@/components/ui/Modal";
import { TasksTable } from "@/components/feature/tasks/TasksTable";
import { Task } from "@/types";
import { getCurrentUser } from "@/services/user";
import Loader from "@/components/ui/Loader";
import PageHeader from "@/components/layout/PageHeader";

export default function TasksPage() {
  const [editTaskModalOpen, setEditTaskModalOpen] = useState(false);
  const [deleteTaskModalOpen, setDeleteTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "owned" | "assigned">("all");

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
  const { data: assignedTasksData, isLoading: assignedTasksLoading } = useQuery(
    {
      queryKey: ["assignedTasks", userData?.data?.id],
      queryFn: () => {
        if (!userData?.data?.id) return { data: [] };
        return getUserAssignedTasks(userData.data.id);
      },
      enabled: !!userData?.data?.id,
    }
  );

  // Fetch all projects (owned and member of)
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ["allUserProjects"],
    queryFn: getCombinedProjectsOfUser,
  });
  
  const ownedTasks = tasksData?.tasks || [];
  const assignedTasks = assignedTasksData?.tasks.data || [];
  // Combine owned and assigned tasks for the "All Tasks" view, removing duplicates
  const allTasks = [...ownedTasks];

  // Add assigned tasks that aren't already in the owned tasks list
  assignedTasks.forEach((assignedTask: Task) => {
    if (!allTasks.some((task) => task.id === assignedTask.id)) {
      allTasks.push(assignedTask);
    }
  });

  // Determine which tasks to display based on active tab
  let filteredTasks: Task[] = [];
  switch (activeTab) {
    case "all":
      filteredTasks = allTasks;
      break;
    case "owned":
      filteredTasks = ownedTasks;
      break;
    case "assigned":
      filteredTasks = assignedTasks;
      break;
  }

  const isLoading =
    userLoading || tasksLoading || assignedTasksLoading || projectsLoading;

  // Update task status mutation
  const updateTaskMutation = useMutation({
    mutationFn: (data: {
      id: number;
      status?: "Pending" | "In-Progress" | "Done";
      priority?: "Low" | "Medium" | "High" | "Urgent";
    }) => updateTask(data.id, data),
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
      status: newStatus as "Pending" | "In-Progress" | "Done",
    });
  };

  // Handle priority change
  const handlePriorityChange = (task: Task, newPriority: string) => {
    updateTaskMutation.mutate({
      id: task.id,
      priority: newPriority as "Low" | "Medium" | "High" | "Urgent",
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
      <PageHeader
        title="Tasks"
        description="Manage your tasks across all projects"
        // variant="brand"
      />

      <div className="flex-1 bg-gray-50">
        <div className="p-3 sm:p-6">
            {/* Tab Navigation */}
            <div className="flex space-x-1 rounded-lg bg-gray-100 p-1 mb-4 sm:mb-6 max-w-md">
              <button
                className={`w-full rounded-md py-2 sm:py-2.5 text-xs sm:text-sm font-medium leading-5 ${
                  activeTab === "all"
                    ? "bg-white shadow text-brand-700"
                    : "text-gray-700 hover:bg-white/[0.5]"
                }`}
                onClick={() => setActiveTab("all")}
              >
                All Tasks
              </button>
              <button
                className={`w-full rounded-md py-2 sm:py-2.5 text-xs sm:text-sm font-medium leading-5 ${
                  activeTab === "owned"
                    ? "bg-white shadow text-brand-700"
                    : "text-gray-700 hover:bg-white/[0.5]"
                }`}
                onClick={() => setActiveTab("owned")}
              >
                Created
              </button>
              <button
                className={`w-full rounded-md py-2 sm:py-2.5 text-xs sm:text-sm font-medium leading-5 ${
                  activeTab === "assigned"
                    ? "bg-white shadow text-brand-700"
                    : "text-gray-700 hover:bg-white/[0.5]"
                }`}
                onClick={() => setActiveTab("assigned")}
              >
                Assigned
              </button>
            </div>

          {isLoading ? (
            <Loader centered text="Loading tasks..." />
          ) : (
            <TasksTable
              data={filteredTasks}
              projects={projectsData?.projects || []}
              onEdit={openEditTaskModal}
              onDelete={openDeleteTaskModal}
              onStatusChange={handleStatusChange}
              onPriorityChange={handlePriorityChange}
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