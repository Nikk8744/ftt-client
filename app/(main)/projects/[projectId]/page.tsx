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
import TaskList from "@/components/feature/TaskList";
import TeamMembers from "@/components/TeamMembers";
import { getProjectById, updateProject } from "@/services/project";
import { getTasksByProject } from "@/services/task";
import {
  addMemberToProject,
  removeMemberFromProject,
  getTeamMembers,
} from "@/services/projectMember";
import useAuth from "@/lib/hooks/useAuth";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import TaskForm from "@/components/feature/TaskForm";

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
  const [removeModalState, setRemoveModalState] = useState<{
    isOpen: boolean;
    userId: number | null;
  }>({
    isOpen: false,
    userId: null,
  });
  const [showInfo, setShowInfo] = useState(false);
  const [showTips, setShowTips] = useState(false);

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

  // Get project tasks
  const {
    data: tasksData,
    isLoading: tasksLoading,
    error: tasksError,
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
      reset();
    },
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

  const project = projectData?.project;
  const tasks = tasksData?.tasks || [];
  const teamMembers = teamData?.members || [];

  // Check if current user is the project owner
  const isOwner = project && user ? project.userId === user.id : false;

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
                  variant="primary"
                  size="sm"
                  onClick={() => setIsAddTaskModalOpen(true)}
                >
                  Add Task
                </Button>
              </div>

              {tasksLoading ? (
                <p>Loading tasks...</p>
              ) : tasksError ? (
                <p className="text-red-500">Error loading tasks</p>
              ) : tasks.length === 0 ? (
                <Card>
                  <div className="text-center py-6">
                    <p className="text-gray-500">
                      No tasks yet. Create your first task to get started.
                    </p>
                  </div>
                </Card>
              ) : (
                <TaskList 
                  tasks={tasks} 
                  projectId={Number(projectId)} 
                  isProjectOwner={isOwner}
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
                        {isOwner ? `${user?.name} (You)` : "Another User"}
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
              onAddMember={
                isOwner ? () => setIsAddMemberModalOpen(true) : undefined
              }
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
          <>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleProjectSubmit(onUpdateProject)}
              isLoading={updateProjectMutation.isPending}
              disabled={updateProjectMutation.isPending}
            >
              Save Changes
            </Button>
          </>
        }
      >
        <form
          onSubmit={handleProjectSubmit(onUpdateProject)}
          className="space-y-4"
        >
          <Input
            id="name"
            label="Project Name"
            error={projectErrors.name?.message}
            {...registerProject("name")}
          />

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className={`w-full rounded-md border ${
                projectErrors.description ? "border-red-500" : "border-gray-300"
              } shadow-sm focus:border-primary-500 focus:ring-primary-500`}
              {...registerProject("description")}
            ></textarea>
            {projectErrors.description && (
              <p className="mt-1 text-sm text-red-600">
                {projectErrors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                className={`w-full rounded-md border ${
                  projectErrors.startDate ? "border-red-500" : "border-gray-300"
                } shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2 px-3`}
                {...registerProject("startDate")}
              />
              {projectErrors.startDate && (
                <p className="mt-1 text-sm text-red-600">
                  {projectErrors.startDate.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                className={`w-full rounded-md border ${
                  projectErrors.endDate ? "border-red-500" : "border-gray-300"
                } shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2 px-3`}
                {...registerProject("endDate")}
              />
              {projectErrors.endDate && (
                <p className="mt-1 text-sm text-red-600">
                  {projectErrors.endDate.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status
            </label>
            <select
              id="status"
              className={`w-full rounded-md border ${
                projectErrors.status ? "border-red-500" : "border-gray-300"
              } shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2 px-3`}
              {...registerProject("status")}
            >
              <option value="">Select Status</option>
              <option value="Pending">Pending</option>
              <option value="In-Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            {projectErrors.status && (
              <p className="mt-1 text-sm text-red-600">
                {projectErrors.status.message}
              </p>
            )}
          </div>
        </form>
      </Modal>
      
      {/* Add Member Modal */}
      <Modal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        title="Add Team Member"
        footer={
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => setIsAddMemberModalOpen(false)}
              className="px-4 py-2 text-sm"
              disabled={addMemberMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleMemberSubmit(onAddMember)}
              isLoading={addMemberMutation.isPending}
              disabled={addMemberMutation.isPending}
              className="px-6 py-2 text-sm flex items-center gap-2"
            >
              {addMemberMutation.isPending ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Adding...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
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
                  Add Member
                </>
              )}
            </Button>
          </div>
        }
      >
        <div className="py-4">
          <form
            onSubmit={handleMemberSubmit(onAddMember)}
            className="space-y-6"
          >
            {/* Info Section */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setShowInfo(!showInfo)}
                className="w-full p-4 flex items-center justify-between hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h4 className="text-sm font-medium text-blue-900">
                    Adding Team Members
                  </h4>
                </div>
                <svg
                  className={`w-4 h-4 text-blue-600 transition-transform ${
                    showInfo ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {showInfo && (
                <div className="px-4 pb-4 border-t border-blue-200">
                  <p className="text-sm text-blue-700 mt-3">
                    Enter the User ID of the person you want to add to your
                    team. They will be notified and gain access to this project.
                  </p>
                </div>
              )}
            </div>

            {/* Input Field */}
            <div className="space-y-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                </div>
                <Input
                  id="userId"
                  label="User ID"
                  error={memberErrors.userId?.message}
                  helperText="Enter the unique user ID (e.g., 12345)"
                  placeholder="Enter user ID..."
                  className="pl-10"
                  {...registerMember("userId")}
                />
              </div>
            </div>

            {/* Search/Suggestion Section (Optional Enhancement) */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setShowTips(!showTips)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    Quick Tips
                  </span>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform ${
                    showTips ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {showTips && (
                <div className="px-4 pb-4 border-t border-gray-200">
                  <ul className="text-xs text-gray-600 space-y-1 mt-3">
                    <li>• User IDs are typically numeric (e.g., 12345)</li>
                    <li>• Make sure the user has an active account</li>
                    <li>• The user will receive a notification when added</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Error Display */}
            {addMemberMutation.isError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-red-600 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-red-900 mb-1">
                      Failed to Add Member
                    </h4>
                    <p className="text-sm text-red-700">
                      Unable to add the team member. Please check if the user ID
                      is valid and try again.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Success State (if needed) */}
            {/* {addMemberMutation.isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-green-900 mb-1">Member Added Successfully</h4>
              <p className="text-sm text-green-700">
                The team member has been added and will receive a notification.
              </p>
            </div>
          </div>
        </div>
      )} */}
          </form>
        </div>
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
    </PageWrapper>
  );
}
