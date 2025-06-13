"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { TasksTable } from "@/components/feature/TasksTable";
import TeamMembers from "@/components/TeamMembers";
import { getProjectById, updateProject, getProjectOwner } from "@/services/project";
import { getTasksByProject, updateTask, deleteTask } from "@/services/task";
import {
  addMemberToProject,
  removeMemberFromProject,
  getTeamMembers,
} from "@/services/projectMember";
import useAuth from "@/lib/hooks/useAuth";
import { formatDate } from "@/lib/utils";
import TaskForm from "@/components/feature/TaskForm";
import { ConfirmModal } from "@/components/ui/Modal";
import { Task } from "@/types";
import { Calendar, ChevronDown, CircleCheck, Clock, Info, Plus, User } from "lucide-react";

// Form validation schemas
const projectSchema = z.object({
  name: z
    .string()
    .min(3, "Project name must be at least 3 characters")
    .max(255, "Project name cannot exceed 255 characters"),
  description: z
    .string()
    .min(5, "Project description must be at least 5 characters")
    .max(1000, "Project description cannot exceed 1000 characters"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  status: z.enum(["Pending", "In-Progress", "Completed"]).optional(),
});

const memberSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

type ProjectFormData = z.infer<typeof projectSchema>;
type MemberFormData = z.infer<typeof memberSchema>;

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [isDeleteTaskModalOpen, setIsDeleteTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [removeModalState, setRemoveModalState] = useState<{
    isOpen: boolean;
    userId: number | null;
  }>({
    isOpen: false,
    userId: null,
  });
  const [apiError, setApiError] = useState<string | null>(null);

  // Get project details
  const {
    data: projectData,
    isLoading: projectLoading,
    error: projectError,
  } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProjectById(Number(projectId)),
    enabled: !!projectId,
  });

  // Get project owner information
  const {
    data: ownerData,
    isLoading: ownerLoading,
  } = useQuery({
    queryKey: ["project-owner", projectData?.project?.userId],
    queryFn: () => getProjectOwner(Number(projectData?.project?.userId)),
    enabled: !!projectData?.project?.userId,
  });

  // Get project tasks
  const {
    data: tasksData,
    isLoading: tasksLoading,
  } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => getTasksByProject(Number(projectId)),
    enabled: !!projectId,
  });

  // Get team members
  const { data: teamData } = useQuery({
    queryKey: ["team-members", projectId],
    queryFn: () => getTeamMembers(Number(projectId)),
    enabled: !!projectId,
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: (data: ProjectFormData) =>
      updateProject(Number(projectId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      setIsEditModalOpen(false);
    },
  });

  // Add member mutation
  const addMemberMutation = useMutation({
    mutationFn: (data: MemberFormData) =>
      addMemberToProject(Number(projectId), Number(data.userId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", projectId] });
      queryClient.invalidateQueries({ queryKey: ["team-members", projectId] });
      setIsAddMemberModalOpen(false);
      setApiError(null);
      reset();
    },
    onError: (error: Error | { response?: { data?: { msg?: string } } }) => {
      const errorMessage = 
        typeof error === 'object' && error !== null && 'response' in error
          ? error.response?.data?.msg || "Failed to add member. Please try again."
          : error instanceof Error
            ? error.message
            : "Failed to add member. Please try again.";
      setApiError(errorMessage);
    }
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (userId: number) =>
      removeMemberFromProject(Number(projectId), userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", projectId] });
      queryClient.invalidateQueries({ queryKey: ["team-members", projectId] });
      setRemoveModalState({ isOpen: false, userId: null });
    },
  });

  // Update task status mutation
  const updateTaskMutation = useMutation({
    mutationFn: (data: {
      id: number;
      status: "Pending" | "In-Progress" | "Done";
    }) => updateTask(data.id, { status: data.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      setIsDeleteTaskModalOpen(false);
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
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      status: undefined,
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
      userId: "",
    },
  });

  // Load project data into edit form when available
  useEffect(() => {
    if (projectData?.project) {
      resetProject({
        name: projectData.project.name,
        description: projectData.project.description,
        startDate: projectData.project.startDate
          ? new Date(projectData.project.startDate).toISOString().split("T")[0]
          : "",
        endDate: projectData.project.endDate
          ? new Date(projectData.project.endDate).toISOString().split("T")[0]
          : "",
        status: projectData.project.status || undefined,
      });
    }
  }, [projectData, resetProject]);

  const onUpdateProject = (data: ProjectFormData) => {
    // Make sure we have valid dates
    const formattedData = {
      ...data,
      startDate: data.startDate,
      endDate: data.endDate,
    };

    updateProjectMutation.mutate(formattedData);
  };

  const onAddMember = (data: MemberFormData) => {
    setApiError(null);
    addMemberMutation.mutate(data);
  };

  const openRemoveMemberModal = (userId: number) => {
    setRemoveModalState({ isOpen: true, userId });
  };

  const handleRemoveMember = (userId: number) => {
    if (removeModalState.isOpen) {
      removeMemberMutation.mutate(userId);
    } else {
      openRemoveMemberModal(userId);
    }
  };

  // Handle status change
  const handleStatusChange = (task: Task, newStatus: string) => {
    updateTaskMutation.mutate({
      id: task.id,
      status: newStatus as "Pending" | "In-Progress" | "Done",
    });
  };

  // Open edit task modal
  const openEditTaskModal = (task: Task) => {
    setSelectedTask(task);
    setIsEditTaskModalOpen(true);
  };

  // Open delete confirmation modal
  const openDeleteTaskModal = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteTaskModalOpen(true);
  };

  const project = projectData?.project;
  const tasks = tasksData?.tasks || [];
  const teamMembers = teamData?.members || [];
  const projectOwner = ownerData?.user;

  // Check if current user is the project owner
  const isOwner = project && user ? project.ownerId === user.id : false;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="border-b border-gray-400 rounded-b-3xl">
        <div className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              {projectLoading ? "Loading..." : projectData?.project?.name}
            </h1>
            <p className="mt-1 text-sm text-gray-500 max-w-4xl">
              {projectData?.project?.description}
            </p>
          </div>
          <div className="flex flex-shrink-0 space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsAddMemberModalOpen(true)}
            >
              Add Member
            </Button>
            <Button
              variant="default"
              onClick={() => setIsAddTaskModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-800"
            > 
            <Plus className="h-4 w-4" />
              Add Task
            </Button>
            <Button
              variant="default"
              onClick={() => {
                if (projectData?.project) {
                  resetProject({
                    name: projectData.project.name,
                    description: projectData.project.description,
                    startDate: projectData.project.startDate
                      ? new Date(projectData.project.startDate)
                          .toISOString()
                          .split("T")[0]
                      : "",
                    endDate: projectData.project.endDate
                      ? new Date(projectData.project.endDate)
                          .toISOString()
                          .split("T")[0]
                      : "",
                    status: projectData.project.status as
                      | "Pending"
                      | "In-Progress"
                      | "Completed"
                      | undefined,
                  });
                  setIsEditModalOpen(true);
                }
              }}
            >
              Edit Project
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-1 bg-gray-50">
        <div className="p-6">
          {projectLoading ? (
            <div className="text-center py-8">
              <p>Loading project details...</p>
            </div>
          ) : projectError ? (
            <div className="text-center py-8 text-red-500">
              <p>Error loading project details</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Project Description */}
                <Card>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600">{project.description}</p>
                </Card>

                {/* Tasks Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Tasks</h2>
                  </div>

                  {tasksLoading ? (
                    <Card className="p-8 text-center">
                      <p>Loading tasks...</p>
                    </Card>
                  ) : tasks.length === 0 ? (
                    <Card className="p-8 text-center">
                      <p className="text-gray-500 mb-4">
                        No tasks found in this project.
                      </p>
                      <p className="text-sm text-gray-500">
                        Click the &quot;Add Task&quot; button to create your first
                        task.
                      </p>
                    </Card>
                  ) : (
                    <TasksTable
                      data={tasks}
                      projects={[project]}
                      onEdit={openEditTaskModal}
                      onDelete={openDeleteTaskModal}
                      onStatusChange={handleStatusChange}
                    />
                  )}
                </div>
              </div>

              <div className="space-y-6">
                {/* Project Info */}
                <Card className="border border-gray-100 rounded-xl bg-white overflow-hidden">
                  <div className="border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white px-4 py-3">
                    <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                      <Info className="h-4 w-4 text-indigo-600" />
                      Project Info
                    </h3>
                  </div>

                  <div className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Owner */}
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                          <User className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Owner
                          </p>
                          <p className="text-sm font-semibold text-gray-900 mt-0.5">
                            {isOwner ? `${user?.name} (You)` : (ownerLoading ? "Loading..." : projectOwner?.name || "Unknown User")}
                          </p>
                        </div>
                      </div>  

                      {/* Status */}
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                          <CircleCheck className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </p>
                          <div className="mt-1">
                            <Badge
                              variant={
                                project.status === "Completed"
                                  ? "success"
                                  : project.status === "In-Progress"
                                  ? "warning"
                                  : "primary"
                              }
                              className="text-xs"
                            >
                              {project.status || "Pending"}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Created Date */}
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                          <Plus className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </p>
                          <p className="text-sm font-semibold text-gray-900 mt-0.5">
                            {formatDate(project.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Total Hours */}
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                          <Clock className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Hours
                          </p>
                          <p className="text-sm font-semibold text-gray-900 mt-0.5">
                            {project.totalHours || "0"} hrs
                          </p>
                        </div>
                      </div>

                      {/* Start Date */}
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mt-0.5">
                          <Calendar className="h-4 w-4 text-teal-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Start Date
                          </p>
                          <p className="text-sm font-semibold text-gray-900 mt-0.5">
                            {formatDate(project.startDate)}
                          </p>
                        </div>
                      </div>

                      {/* End Date */}
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                          <Calendar className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            End Date
                          </p>
                          <p className="text-sm font-semibold text-gray-900 mt-0.5">
                            {formatDate(project.endDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Team Members */}
                <TeamMembers
                  members={teamMembers.map(
                    (member: { id: string; name?: string }) => ({
                      id: member.id,
                      name: member.name || `User ${member.id}`,
                      // addedAt: member.addedAt
                    })
                  )}
                  onAddMember={() => setIsAddMemberModalOpen(true)}
                  onRemoveMember={isOwner ? handleRemoveMember : undefined}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Edit Project Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Project"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button 
              variant="outline" 
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleProjectSubmit(onUpdateProject)}
              isLoading={updateProjectMutation.isPending}
              disabled={updateProjectMutation.isPending}
              className="px-4 py-2"
            >
              Save Changes
            </Button>
          </div>
        }
      >
        <form
          onSubmit={handleProjectSubmit(onUpdateProject)}
          className="space-y-5 py-2"
        >
          <div className="space-y-1.5">
            <Input
              id="name"
              label="Project Name"
              placeholder="Enter project name"
              error={projectErrors.name?.message}
              {...registerProject("name")}
              className="focus:ring-2 focus:ring-primary-500/30"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              placeholder="Enter project description"
              className={`w-full rounded-md border ${
                projectErrors.description ? "border-red-500" : "border-gray-300"
              } shadow-sm focus:border-primary-500 focus:ring-primary-500/30 focus:ring-2 px-3 py-2 text-sm`}
              {...registerProject("description")}
            ></textarea>
            {projectErrors.description && (
              <p className="mt-1 text-xs text-red-600">
                {projectErrors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700"
              >
                Start Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="startDate"
                  className={`w-full rounded-md border ${
                    projectErrors.startDate ? "border-red-500" : "border-gray-300"
                  } shadow-sm focus:border-primary-500 focus:ring-primary-500/30 focus:ring-2 py-2 px-3 text-sm`}
                  {...registerProject("startDate")}
                />
                {projectErrors.startDate && (
                  <p className="mt-1 text-xs text-red-600">
                    {projectErrors.startDate.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700"
              >
                End Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="endDate"
                  className={`w-full rounded-md border ${
                    projectErrors.endDate ? "border-red-500" : "border-gray-300"
                  } shadow-sm focus:border-primary-500 focus:ring-primary-500/30 focus:ring-2 py-2 px-3 text-sm`}
                  {...registerProject("endDate")}
                />
                {projectErrors.endDate && (
                  <p className="mt-1 text-xs text-red-600">
                    {projectErrors.endDate.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700"
            >
              Status
            </label>
            <div className="relative">
              <select
                id="status"
                className={`w-full rounded-md border ${
                  projectErrors.status ? "border-red-500" : "border-gray-300"
                } shadow-sm focus:border-primary-500 focus:ring-primary-500/30 focus:ring-2 py-2 px-3 text-sm bg-white appearance-none`}
                {...registerProject("status")}
              >
                <option value="">Select Status</option>
                <option value="Pending">Pending</option>
                <option value="In-Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ChevronDown className="h-4 w-4 text-gray-700" />
              </div>
              {projectErrors.status && (
                <p className="mt-1 text-xs text-red-600">
                  {projectErrors.status.message}
                </p>
              )}
            </div>
          </div>

          {updateProjectMutation.isError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">Failed to update project. Please try again.</p>
            </div>
          )}
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddMemberModalOpen}
        onClose={() => {
          setIsAddMemberModalOpen(false);
          setApiError(null);
        }}
        title="Add Team Member"
        footer={
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddMemberModalOpen(false);
                setApiError(null);
              }}
              className="px-4 py-2 text-sm"
              disabled={addMemberMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleMemberSubmit(onAddMember)}
              className="px-4 py-2 text-sm"
              isLoading={addMemberMutation.isPending}
              disabled={addMemberMutation.isPending}
            >
              Add Member
            </Button>
          </div>
        }
      >
        <form onSubmit={handleMemberSubmit(onAddMember)} className="space-y-4">
          <Input
            id="userId"
            label="User ID"
            placeholder="Enter user ID to add"
            error={memberErrors.userId?.message}
            {...registerMember("userId")}
          />
          
          {apiError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{apiError}</p>
            </div>
          )}
          
          <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-md border border-blue-100">
            <p>Note: You need to know the user ID to add them to this project. {!isOwner && "Only the project owner can add members."}</p>
          </div>
        </form>
      </Modal>
      {/* Remove Member Confirmation Modal */}
      <Modal
        isOpen={removeModalState.isOpen}
        onClose={() => setRemoveModalState({ isOpen: false, userId: null })}
        title="Remove Team Member"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() =>
                setRemoveModalState({ isOpen: false, userId: null })
              }
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => handleRemoveMember(removeModalState.userId!)}
              isLoading={removeMemberMutation.isPending}
              disabled={removeMemberMutation.isPending}
            >
              Remove
            </Button>
          </>
        }
      >
        <p>
          Are you sure you want to remove this team member from the project?
        </p>
        {removeMemberMutation.isError && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            Failed to remove member. Please try again.
          </div>
        )}
      </Modal>
      {/* Add Task Modal */}
      {isAddTaskModalOpen && (
        <TaskForm
          projectId={Number(projectId)}
          isOpen={isAddTaskModalOpen}
          onClose={() => setIsAddTaskModalOpen(false)}
        />
      )}
      {/* Edit Task Modal */}
      {isEditTaskModalOpen && selectedTask && (
        <TaskForm
          projectId={Number(projectId)}
          task={selectedTask}
          isOpen={isEditTaskModalOpen}
          onClose={() => setIsEditTaskModalOpen(false)}
        />
      )}
      {/* Delete Task Confirmation Modal */}
      {isDeleteTaskModalOpen && selectedTask && (
        <ConfirmModal
          isOpen={isDeleteTaskModalOpen}
          onClose={() => setIsDeleteTaskModalOpen(false)}
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
