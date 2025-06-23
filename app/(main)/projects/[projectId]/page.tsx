"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { TasksTable } from "@/components/feature/TasksTable";
import TeamMembers from "@/components/TeamMembers";
import {
  getProjectById,
  updateProject,
  getProjectOwner,
} from "@/services/project";
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
import { AlignLeft, Calendar, CircleCheck, Clock, Info, Pencil, Plus, User, UserPlus } from "lucide-react";
import EditProjectModal from "@/components/feature/EditProjectModal";
import AddMemberModal from "@/components/feature/AddMemberModal";
import Loader from "@/components/ui/Loader";

// Add back the project form data type
type ProjectFormData = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status?: "Pending" | "In-Progress" | "Completed";
};

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
  console.log("🚀 ~ ProjectDetailsPage ~ projectData:", projectData);

  // Get project owner information
  const { data: ownerData, isLoading: ownerLoading } = useQuery({
    queryKey: ["project-owner", projectData?.data?.ownerId],
    queryFn: () => getProjectOwner(Number(projectData?.data?.ownerId)),
    enabled: !!projectData?.data?.ownerId,
  });

  // Get project tasks
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
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
    mutationFn: (data: { userId: string }) =>
      addMemberToProject(Number(projectId), Number(data.userId)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projectMembers", projectId],
      });
      setIsAddMemberModalOpen(false);
      setApiError(null);
    },
    onError: (error) => {
      setApiError(error.message);
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (userId: number) =>
      removeMemberFromProject(Number(projectId), userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projectMembers", projectId],
      });
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

  const onAddMember = (data: { userId: string }) => {
    addMemberMutation.mutate(data);
  };

  const handleRemoveMember = (userId: number) => {
    removeMemberMutation.mutate(userId);
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

  const project = projectData?.data;
  const tasks = tasksData?.data || [];
  const teamMembers = teamData?.data || [];
  const projectOwner = ownerData?.data;

  // Check if current user is the project owner
  const isOwner = project && user ? project.ownerId === user.id : false;

  // Add back the update project function
  const onUpdateProject = (data: ProjectFormData) => {
    updateProjectMutation.mutate(data);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="border-b border-gray-400 rounded-b-3xl">
        <div className="px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
              {projectLoading ? "Loading..." : projectData?.data?.name}
            </h1>
            <p className="mt-1 text-sm text-gray-500 max-w-4xl">
              {projectData?.data?.description}
            </p>
          </div>
          <div className="flex flex-shrink-0 space-x-2">
            <Button
              variant="myBtn"
              onClick={() => setIsAddTaskModalOpen(true)}
            >
              <Plus className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Add Task</span>
            </Button>
            {isOwner && (
              <>
                <Button
                  variant="default"
                  onClick={() => setIsAddMemberModalOpen(true)}
                >
                  <UserPlus className="h-4 w-4 md:mr-1" />
                  <span className="hidden md:inline">Add Member</span>
                </Button>

                <Button
                  variant="myBtn"
                  onClick={() => {
                    if (projectData?.data) {
                      setIsEditModalOpen(true);
                    }
                  }}
                >
                  <Pencil className="h-4 w-4 md:mr-1" />
                  <span className="hidden md:inline">Edit Project</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 bg-gray-50">
        <div className="p-3 sm:p-6">
          {projectLoading ? (
            <div className="text-center py-8">
              <Loader centered text="Loading project details..." />
            </div>
          ) : projectError ? (
            <div className="text-center py-8 text-red-500">
              <p>Error loading project details</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Project Description */}
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center gap-2 mb-4">
                    <AlignLeft className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-0">
                      Description
                    </h3>
                  </div>
                  {project.description ? (
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {project.description}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlignLeft className="w-8 h-8 text-gray-400" />
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        No description provided
                      </h4>
                      <p className="text-xs text-gray-500">
                        Add a description to provide more context for this project
                      </p>
                    </div>
                  )}
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
                        Click the &quot;Add Task&quot; button to create your
                        first task.
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
                  <div className="border-b border-gray-50 bg-gradient-to-r from-gray-50 to-white px-3 sm:px-4 py-2 sm:py-3">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 flex items-center gap-2">
                      <Info className="h-4 w-4 text-indigo-600" />
                      Project Info
                    </h3>
                  </div>

                  <div className="p-3 sm:p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {/* Owner */}
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                          <User className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Owner
                          </p>
                          <p className="text-xs sm:text-sm font-semibold text-gray-900 mt-0.5">
                            {isOwner
                              ? `${user?.name} (You)`
                              : ownerLoading
                              ? "Loading..."
                              : projectOwner?.name || "Unknown User"}
                          </p>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                          <CircleCheck className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
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
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </p>
                          <p className="text-xs sm:text-sm font-semibold text-gray-900 mt-0.5">
                            {formatDate(project.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Total Hours */}
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-orange-100 rounded-full flex items-center justify-center mt-0.5">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Hours
                          </p>
                          <p className="text-xs sm:text-sm font-semibold text-gray-900 mt-0.5">
                            {project.totalHours || "0"} hrs
                          </p>
                        </div>
                      </div>

                      {/* Start Date */}
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-teal-100 rounded-full flex items-center justify-center mt-0.5">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-teal-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Start Date
                          </p>
                          <p className="text-xs sm:text-sm font-semibold text-gray-900 mt-0.5">
                            {formatDate(project.startDate)}
                          </p>
                        </div>
                      </div>

                      {/* End Date */}
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                            End Date
                          </p>
                          <p className="text-xs sm:text-sm font-semibold text-gray-900 mt-0.5">
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
      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        project={projectData?.data || null}
        onSubmit={onUpdateProject}
        isLoading={updateProjectMutation.isPending}
        error={
          updateProjectMutation.isError
            ? "Failed to update project. Please try again."
            : null
        }
      />

      {/* Add Member Modal */}
      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => {
          setIsAddMemberModalOpen(false);
          setApiError(null);
        }}
        onSubmit={onAddMember}
        isLoading={addMemberMutation.isPending}
        error={apiError}
        isOwner={isOwner}
      />

      {/* Remove Member Confirmation Modal */}
      <ConfirmModal
        isOpen={removeModalState.isOpen}
        onClose={() => setRemoveModalState({ isOpen: false, userId: null })}
        onConfirm={() => {
          if (removeModalState.userId) {
            handleRemoveMember(removeModalState.userId);
          }
        }}
        title="Remove Team Member"
        message="Are you sure you want to remove this team member from the project?"
        confirmText="Remove"
        cancelText="Cancel"
        isLoading={removeMemberMutation.isPending}
        variant="danger"
      />
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
