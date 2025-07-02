"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTaskById, deleteTask } from "@/services/task";
import { getProjectById } from "@/services/project";
import {
  // getTaskAssignee,
  getTaskFollowers,
  addTaskFollower,
  removeTaskFollower,
  assignUserToTask,
  unassignUserFromTask,
  getTaskAssignees,
} from "@/services/taskMembers";
import { getTaskLogs, updateTimeLog, deleteTimeLog } from "@/services/log";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/Modal";

import TaskForm from "@/components/feature/tasks/TaskForm";
import TaskChecklist from "@/components/feature/tasks/TaskChecklist";
import Link from "next/link";
import useTimer from "@/lib/hooks/useTimer";
import { User, TimeLog, TimeLogUpdateData } from "@/types";
import { getCurrentUser, getUserById } from "@/services/user";
import { getAllMembersOfProject } from "@/services/projectMember";
import {
  Edit,
  Clock,
  Trash2,
  Users,
  FolderOpenDot,
} from "lucide-react";
import Loader from "@/components/ui/Loader";
import { EditTimeLogModal } from "@/components/feature/logs/EditTimeLogModal";
import { LogsTable } from "@/components/feature/logs/LogsTable";
import { TaskInfo } from "@/components/feature/tasks/TaskInfo";
import { DescriptionSection } from "@/components/feature/common";
import { TaskAssignees } from "@/components/feature/tasks/TaskAssignees";
import { TaskFollowers } from "@/components/feature/tasks/TaskFollowers";
import { AssignUserModal } from "@/components/feature/tasks/AssignUserModal";

export default function TaskDetailsPage() {
  const { taskId } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { startTimer } = useTimer();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [editLogModalOpen, setEditLogModalOpen] = useState(false);
  const [deleteLogModalOpen, setDeleteLogModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<TimeLog | null>(null);
  const [assignUserModalOpen, setAssignUserModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [filterText, setFilterText] = useState("");

  // Get current user
  const { data: userData } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  // Use useEffect to set currentUser when userData changes
  useEffect(() => {
    if (userData?.data) {
      setCurrentUser(userData.data);
    }
  }, [userData]);

  // Get task details
  const {
    data: taskData,
    isLoading: taskLoading,
    error: taskError,
  } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => getTaskById(Number(taskId)),
    enabled: !!taskId,
  });

  // Get project details
  const { data: projectData } = useQuery({
    queryKey: ["project", taskData?.data?.projectId],
    queryFn: () => getProjectById(taskData?.data?.projectId || 0),
    enabled: !!taskData?.data?.projectId,
  });

  // Get task creator details
  const { data: creatorData, isLoading: creatorLoading } = useQuery({
    queryKey: ["taskCreator", taskData?.data?.ownerId],
    queryFn: async () => {
      if (!taskData?.data?.ownerId) return { user: null };
      const response = await getUserById(taskData.data.ownerId);
      return response;
    },
    enabled: !!taskData?.data?.ownerId,
  });

  // Get task assignee
  const { data: assigneeData, isLoading: assigneeLoading } = useQuery({
    queryKey: ["taskAssignee", taskId],
    queryFn: () => getTaskAssignees(Number(taskId)),
    enabled: !!taskId,
  });

  // Get task followers
  const { data: followersData, isLoading: followersLoading } = useQuery({
    queryKey: ["taskFollowers", taskId],
    queryFn: () => getTaskFollowers(Number(taskId)),
    enabled: !!taskId,
  });

  // Get task logs
  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ["taskLogs", taskId],
    queryFn: () => getTaskLogs(Number(taskId)),
    enabled: !!taskId,
  });

  // Add follower mutation
  const addFollowerMutation = useMutation({
    mutationFn: (userId: number) => addTaskFollower(Number(taskId), userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskFollowers", taskId] });
    },
  });

  // Remove follower mutation
  const removeFollowerMutation = useMutation({
    mutationFn: (userId: number) => removeTaskFollower(Number(taskId), userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskFollowers", taskId] });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: () => deleteTask(Number(taskId)),
    onSuccess: () => {
      // Navigate back to tasks page after deletion
      router.push("/tasks");
    },
  });

  // Update log mutation
  const updateLogMutation = useMutation({
    mutationFn: (data: { id: number; updateData: TimeLogUpdateData }) =>
      updateTimeLog(data.id, data.updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskLogs", taskId] });
      setEditLogModalOpen(false);
      setSelectedLog(null);
    },
  });

  // Delete log mutation
  const deleteLogMutation = useMutation({
    mutationFn: (id: number) => deleteTimeLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskLogs", taskId] });
      setDeleteLogModalOpen(false);
      setSelectedLog(null);
    },
  });

  // Assign user mutation
  const assignUserMutation = useMutation({
    mutationFn: (userId: number) => assignUserToTask(Number(taskId), userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskAssignee", taskId] });
      setAssignUserModalOpen(false);
      setSelectedUserId(null);
    },
  });

  // Unassign user mutation
  const unassignUserMutation = useMutation({
    mutationFn: (userId: number) =>
      unassignUserFromTask(Number(taskId), userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskAssignee", taskId] });
    },
  });

  // Get project members instead of searching users
  const { data: projectMembersData, isLoading: projectMembersLoading } =
    useQuery({
      queryKey: ["projectMembers", taskData?.data?.projectId],
      queryFn: async () => {
        if (!taskData?.data?.projectId) return { members: [] };
        // Use the proper service function to get project members
        return getAllMembersOfProject(taskData.data.projectId);
      },
      enabled: !!taskData?.data?.projectId && assignUserModalOpen,
    });

  const task = taskData?.data;
  const project = projectData?.data;
  const assignees = assigneeData?.data || [];
  const followers = followersData?.data || [];
  const logs = logsData?.data || [];

  const isTaskOwner: boolean = task?.ownerId === currentUser?.id;

  // Check if current user is following this task
  const isUserFollowing = currentUser
    ? followers.some((follower: User) => follower.id === currentUser.id)
    : false;

  // Handle follow/unfollow
  const handleFollowToggle = () => {
    if (!currentUser) return;

    if (isUserFollowing) {
      removeFollowerMutation.mutate(currentUser.id);
    } else {
      addFollowerMutation.mutate(currentUser.id);
    }
  };

  // Handle task status badge color
  const getStatusBadgeVariant = (status: string | null) => {
    if (status === null) return "primary";

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

  // Start timer for this task
  const handleStartTimer = () => {
    startTimer();
  };

  const handleDeleteConfirm = () => {
    deleteTaskMutation.mutate();
  };

  // Open edit log modal
  const openEditLogModal = (log: TimeLog) => {
    setSelectedLog(log);
    setEditLogModalOpen(true);
  };

  // Open delete log modal
  const openDeleteLogModal = (log: TimeLog) => {
    setSelectedLog(log);
    setDeleteLogModalOpen(true);
  };

  // Handle assign user
  const handleAssignUser = () => {
    if (selectedUserId) {
      assignUserMutation.mutate(selectedUserId);
    }
  };

  // Handle unassign user
  const handleUnassignUser = (userId: number) => {
    unassignUserMutation.mutate(userId);
  };

  if (taskLoading) {
    return <Loader centered text="Loading task details..." />;
  }

  if (taskError || !task) {
    return (
      <div className="text-center py-8 text-red-500">
        <p>Error loading task details</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Page Header */}
      <div className="border-b border-border rounded-b-3xl dark:border-gray-400">
        <div className="px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
              {taskLoading ? "Loading..." : taskData?.data?.subject}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              {taskData?.data?.projectId && (
                <Link
                  href={`/projects/${taskData.data.projectId}`}
                  className="text-sm text-blue-600 hover:underline flex items-center dark:text-blue-400"
                >
                  <FolderOpenDot className="w-4 h-4 mr-1" />
                  {projectData?.data?.name || "Loading project..."}
                </Link>
              )}
              {taskData?.data?.status && (
                <Badge variant={getStatusBadgeVariant(taskData.data.status)}>
                  {taskData.data.status}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex flex-shrink-0 space-x-2">
            {isTaskOwner && (
              <>
                <Button
                  variant="darkBtn"
                  onClick={() => setAssignUserModalOpen(true)}
                >
                  <Users className="h-4 w-4 md:mr-1" />
                  <span className="hidden md:inline">
                    {assignees.length > 0 ? "Add More" : "Assign"}
                  </span>
                </Button>
                <Button
                  variant="myBtn"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Edit className="h-4 w-4 md:mr-1" />
                  <span className="hidden md:inline">Edit</span>
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteModalState({ isOpen: true })}
                >
                  <Trash2 className="h-4 w-4 md:mr-1" />
                  <span className="hidden md:inline">Delete</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Task Details */}
      <div className="flex-1 dark:bg-gray-900">
        <div className="p-3 sm:p-6">
          {taskLoading ? (
            <div className="text-center py-8">
              <p>Loading task details...</p>
            </div>
          ) : taskError ? (
            <div className="text-center py-8 text-red-500">
              <p>Error loading task details</p>
            </div>
          ) : !taskData?.data ? (
            <div className="text-center py-8 text-red-500">
              <p>Task not found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Task Description */}
                <DescriptionSection 
                  description={task.description} 
                  entityType="task" 
                />

                {/* Task Checklist */}
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <TaskChecklist taskId={Number(taskId)} />
                </Card>

                {/* Time Logs Section */}
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-brand-700 dark:text-brand-300" />
                      <h3 className="text-lg font-semibold text-foreground mb-0">
                        Time Logs
                      </h3>
                    </div>
                    <Button
                      variant="brandBtn"
                      onClick={handleStartTimer}
                      size="sm"
                      className="flex items-center gap-1.5"
                    >
                      <Clock className="w-4 h-4" />
                      <span className="hidden sm:inline">Start Timer</span>
                    </Button>
                  </div>

                  {logsLoading ? (
                    <Loader centered size="sm" text="Loading time logs..." />
                  ) : logs.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h4 className="text-sm font-medium text-foreground mb-2">
                        No time logs yet
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Start the timer to begin tracking time for this task
                      </p>
                    </div>
                  ) : (
                    <LogsTable
                      data={logs}
                      projects={project ? [project] : []}
                      tasks={task ? [task] : []}
                      showActions={true}
                      showPagination={true}
                      onEdit={(log) => log.userId === currentUser?.id ? openEditLogModal(log) : null}
                      onDelete={(log) => log.userId === currentUser?.id ? openDeleteLogModal(log) : null}
                    />
                  )}
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Task Info */}
                <TaskInfo 
                  task={task}
                  project={project}
                  creator={creatorData?.data}
                  creatorLoading={creatorLoading}
                  statusVariant={getStatusBadgeVariant(task.status)}
                />

                {/* Assignee Section */}
                <TaskAssignees
                  assignees={assignees}
                  assigneeLoading={assigneeLoading}
                  setAssignUserModalOpen={setAssignUserModalOpen}
                  handleUnassignUser={handleUnassignUser}
                  unassignUserMutation={unassignUserMutation}
                />

                {/* Followers Section */}
                <TaskFollowers
                  followers={followers}
                  followersLoading={followersLoading}
                  isUserFollowing={isUserFollowing}
                  handleFollowToggle={handleFollowToggle}
                  currentUserId={currentUser?.id}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Task Modal */}
      {isEditModalOpen && (
        <TaskForm
          projectId={task.projectId}
          task={task}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false })}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone and all associated data including time logs and checklist items will be deleted."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleteTaskMutation.isPending}
        variant="danger"
      />

      {/* Edit Log Modal */}
      {editLogModalOpen && selectedLog && (
        <EditTimeLogModal
          isOpen={editLogModalOpen}
          onClose={() => {
            setEditLogModalOpen(false);
            setSelectedLog(null);
          }}
          onSubmit={(updateData) => {
                  if (!selectedLog) return;
                  updateLogMutation.mutate({
                    id: selectedLog.id,
              updateData,
                  });
                }}
                isLoading={updateLogMutation.isPending}
          timeLog={selectedLog}
          projects={[project].filter(Boolean)}
          tasks={task ? [task] : []}
        />
      )}

      {/* Delete Log Modal */}
      {deleteLogModalOpen && selectedLog && (
        <ConfirmModal
          isOpen={deleteLogModalOpen}
          onClose={() => {
            setDeleteLogModalOpen(false);
            setSelectedLog(null);
          }}
          onConfirm={() => deleteLogMutation.mutate(selectedLog.id)}
          title="Delete Time Log"
          message="Are you sure you want to delete this time log? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          isLoading={deleteLogMutation.isPending}
        />
      )}

      {/* Assign User Modal */}
      <AssignUserModal
        assignUserModalOpen={assignUserModalOpen}
        setAssignUserModalOpen={setAssignUserModalOpen}
        selectedUserId={selectedUserId}
        setSelectedUserId={setSelectedUserId}
        filterText={filterText}
        setFilterText={setFilterText}
        handleAssignUser={handleAssignUser}
        assignUserMutation={assignUserMutation}
        projectMembersLoading={projectMembersLoading}
        projectMembersData={projectMembersData}
        isEditMode={!!task}
        selectedAssignees={assignees}
      />
    </div>
  );
}
