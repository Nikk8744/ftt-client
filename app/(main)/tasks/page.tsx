"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserTasks, updateTask, deleteTask } from "@/services/task";
import { getAllProjectsOfUser } from "@/services/project";
import Card from "@/components/ui/Card";
import PageWrapper from "@/components/layout/PageWrapper";
import TaskForm from "@/components/feature/TaskForm";
import { ConfirmModal } from "@/components/ui/Modal";
import { TasksTable } from "@/components/feature/TasksTable";
import { Task } from "@/types";

export default function TasksPage() {
  const [editTaskModalOpen, setEditTaskModalOpen] = useState(false);
  const [deleteTaskModalOpen, setDeleteTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const queryClient = useQueryClient();

  // Fetch tasks
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: getUserTasks,
  });

  // Fetch projects for filter
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: getAllProjectsOfUser,
  });

  const tasks = tasksData?.tasks || [];
  const projects = projectsData?.projects || [];

  // Update task status mutation
  const updateTaskMutation = useMutation({
    mutationFn: (data: {
      id: number;
      status: "Pending" | "In-Progress" | "Done";
    }) => updateTask(data.id, { status: data.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
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
        {tasksLoading || projectsLoading ? (
          <Card className="p-8 text-center">
            <p>Loading tasks...</p>
          </Card>
        ) : tasks.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500 mb-4">
              No tasks found.
            </p>
            <p className="text-sm text-gray-500">
              To create a new task, please go to a project and use the
              &quot;Add Task&quot; button there.
            </p>
          </Card>
        ) : (
          <TasksTable
            data={tasks}
            projects={projects}
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
          onClose={() => setEditTaskModalOpen(false)}
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
