"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import PageWrapper from "@/components/layout/PageWrapper";
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
import { formatDate, formatRelativeTime } from "@/lib/utils";
import TaskForm from "@/components/feature/TaskForm";
import { ConfirmModal } from "@/components/ui/Modal";
import { Task } from "@/types";

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

    // Log the data being sent to make sure it's correct
    console.log("Update project data:", formattedData);

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
  console.log("🚀 ~ ProjectDetailsPage ~ project:", project)
  const tasks = tasksData?.tasks || [];
  const teamMembers = teamData?.members || [];
  const projectOwner = ownerData?.user;
  console.log("🚀 ~ ProjectDetailsPage ~ projectOwner:", projectOwner)

  // Check if current user is the project owner
  const isOwner = project && user ? project.ownerId === user.id : false;

  if (projectLoading) {
    return <div>Loading project details...</div>;
  }

  if (projectError || !project) {
    return <div>Error loading project details</div>;
  }

  return (
    <PageWrapper
      title={project.name}
      description={`Created ${formatRelativeTime(project.createdAt)}`}
      actions={
        isOwner && (
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
            Edit Project
          </Button>
        )
      }
    >
      <div className="p-6">
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
                <Button
                  variant="default"
                  onClick={() => setIsAddTaskModalOpen(true)}
                >
                  Add Task
                </Button>
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
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  Project Info
                </h3>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Owner */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
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
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
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
                      <svg
                        className="w-4 h-4 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
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
                      <svg
                        className="w-4 h-4 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
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
                      <svg
                        className="w-4 h-4 text-teal-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
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
                      <svg
                        className="w-4 h-4 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
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
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
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
    </PageWrapper>
  );
}
