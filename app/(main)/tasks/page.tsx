"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserTasks, updateTask, deleteTask } from "@/services/task";
import { getAllProjectsOfUser } from "@/services/project";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PageWrapper from "@/components/layout/PageWrapper";
import { formatDate } from "@/lib/utils";
import { Project, Task } from "@/types";
import Link from "next/link";
import TaskForm from "@/components/feature/TaskForm";
import { ConfirmModal } from "@/components/ui/Modal";
// import Modal from '@/components/ui/Modal';

export default function TasksPage() {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  // Remove create task modal state
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

  // Handle marking task as complete
  const handleMarkComplete = (task: Task) => {
    updateTaskMutation.mutate({ id: task.id, status: "Done" });
  };

  // Filter tasks based on selected project and status
  const filteredTasks = tasks.filter((task: Task) => {
    const matchesProject = selectedProject
      ? task.projectId === selectedProject
      : true;
    const matchesStatus = statusFilter ? task.status === statusFilter : true;
    return matchesProject && matchesStatus;
  });

  // Status options for filter
  const statusOptions = ["Pending", "In-Progress", "Done"];

  // Get project name by ID
  const getProjectName = (projectId: number) => {
    const project = projects.find((p: Project) => p.id === projectId);
    return project ? project.name : "Unknown Project";
  };

  // Status badge color
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Pending":
        return "secondary";
      case "In-Progress":
        return "warning";
      case "Done":
        return "success";
      default:
        return "primary";
    }
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
        {/* Filters Section */}
        <Card className="mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-lg">
          {" "}
          {/* Increased rounding and shadow for more presence */}
          <div className="flex flex-col md:flex-row md:items-end gap-x-4 gap-y-3">
            {" "}
            {/* Reduced y-gap */}
            {/* Filter by Project */}
            <div className="flex-1 min-w-0">
              {/* Using a smaller, slightly stylized label */}
              <label
                htmlFor="project-filter"
                className="block text-xs font-semibold text-purple-700 mb-1 uppercase tracking-wide"
              >
                Project
              </label>
              <div className="relative">
                <select
                  id="project-filter"
                  className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 px-3.5 pr-9 shadow-sm
                     text-gray-800 placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                     transition-all duration-150 ease-in-out
                     hover:border-gray-400" // py-2 reduces height
                  value={selectedProject || ""}
                  onChange={(e) =>
                    setSelectedProject(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  disabled={projectsLoading}
                >
                  <option value="">All Projects</option>
                  {projects.map((project: Project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-500">
                  {" "}
                  {/* Smaller arrow icon padding */}
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>{" "}
                  {/* h-4 w-4 for a smaller arrow */}
                </div>
              </div>
            </div>
            {/* Filter by Status */}
            <div className="flex-1 min-w-0">
              <label
                htmlFor="status-filter"
                className="block text-xs font-semibold text-purple-700 mb-1 uppercase tracking-wide"
              >
                Status
              </label>
              <div className="relative">
                <select
                  id="status-filter"
                  className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 px-3.5 pr-9 shadow-sm
                     text-gray-800 placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                     transition-all duration-150 ease-in-out
                     hover:border-gray-400" // py-2 reduces height
                  value={statusFilter || ""}
                  onChange={(e) => setStatusFilter(e.target.value || null)}
                >
                  <option value="">All Statuses</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-500">
                  <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
            {/* Clear Filters Button */}
            {/* md:self-end aligns button to bottom of flex line on md+ screens */}
            <div className="md:self-end">
              <Button
                variant="outline"
                className="w-full md:w-auto bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold
                   py-2 px-4 rounded-lg shadow-sm border border-purple-200 hover:border-purple-300
                   transition-all duration-150 ease-in-out
                   focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75" // py-2 for matching height
                onClick={() => {
                  setSelectedProject(null);
                  setStatusFilter(null);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Tasks List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              {filteredTasks.length}{" "}
              {filteredTasks.length === 1 ? "Task" : "Tasks"}
            </h2>
          </div>

          {tasksLoading ? (
            <p>Loading tasks...</p>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                No tasks found matching your criteria.
              </p>
              <p className="text-sm text-gray-500">
                To create a new task, please go to a project and use the
                &quot;Add Task&quot; button there.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTasks.map((task: Task) => (
                <Card
                  key={task.id}
                  className="hover:shadow-md transition-all duration-200 border border-indigo-100 bg-white"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <Link href={`/tasks/${task.id}`}>
                        <h3 className="text-lg font-medium text-indigo-800 hover:text-indigo-600 cursor-pointer">
                          {task.name || task.subject}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-600 mt-1">
                        {task.description}
                      </p>
                      <div className="mt-3 flex items-center text-sm text-gray-500">
                        <span className="mr-3">
                          Project: {getProjectName(task.projectId)}
                        </span>
                        <span>
                          Due:{" "}
                          {task.dueDate
                            ? formatDate(task.dueDate)
                            : "No deadline"}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={getStatusBadgeVariant(task.status || "Pending")}
                      className="ml-2"
                    >
                      {task.status}
                    </Badge>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditTaskModal(task)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-indigo-600 border-indigo-200"
                      >
                        <Link
                          href={`/tasks/${task.id}`}
                          className="flex items-center"
                        >
                          View Details
                        </Link>
                      </Button>
                    </div>
                    {task.status !== "Done" ? (
                      <Button
                        variant="success"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleMarkComplete(task)}
                        isLoading={
                          updateTaskMutation.isPending &&
                          updateTaskMutation.variables?.id === task.id
                        }
                      >
                        Mark Complete
                      </Button>
                    ) : (
                      <Button
                        variant="danger"
                        size="sm"
                        className="text-xs"
                        onClick={() => openDeleteTaskModal(task)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
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
