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
import Modal, { ConfirmModal } from "@/components/ui/Modal";
import { formatDate, formatDuration } from "@/lib/utils";
import TaskForm from "@/components/feature/tasks/TaskForm";
import TaskChecklist from "@/components/feature/tasks/TaskChecklist";
import Link from "next/link";
import useTimer from "@/lib/hooks/useTimer";
import Avatar from "@/components/ui/Avatar";
import { User, TimeLog, TimeLogUpdateData } from "@/types";
import { getCurrentUser, getUserById } from "@/services/user";
import { getAllMembersOfProject } from "@/services/projectMember";
import {
  Edit,
  Clock,
  Eye,
  EyeOff,
  Trash2,
  AlignLeft,
  Info,
  Users,
  Calendar,
  PlusCircle,
  X,
  Check,
  UserIcon,
  FolderOpenDot,
  UserPlus,
} from "lucide-react";
import Input from "@/components/ui/Input";
import Loader from "@/components/ui/Loader";
import { EditTimeLogModal } from "@/components/feature/logs/EditTimeLogModal";

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
  const followers = followersData?.users || [];
  // console.log("🚀 ~ TaskDetailsPage ~ followersData:", followersData)
  const logs = logsData?.data || [];
  // console.log("🚀 ~ TaskDetailsPage ~ logsData:", logsData)

  const isTaskOwner: boolean = task?.ownerId === currentUser?.id;

  // Check if current user is following this task
  const isUserFollowing = currentUser
    ? followers.some((follower) => follower.id === currentUser.id)
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
      <div className="border-b border-gray-400 rounded-b-3xl">
        <div className="px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
              {taskLoading ? "Loading..." : taskData?.data?.subject}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              {taskData?.data?.projectId && (
                <Link
                  href={`/projects/${taskData.data.projectId}`}
                  className="text-sm text-blue-600 hover:underline flex items-center"
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
            <Button variant="outline" onClick={handleFollowToggle}>
              {followersData?.users?.some(
                (follower) => follower.id === currentUser?.id
              ) ? (
                <>
                  <EyeOff className="h-4 w-4 md:mr-1" />
                  <span className="hidden md:inline">Unfollow</span>
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 md:mr-1" />
                  <span className="hidden md:inline">Follow</span>
                </>
              )}
            </Button>

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

              {/* <Button variant="myBtn" onClick={handleStartTimer}>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 mr-1" />
                  Track Time
                </div>
              </Button> */}
          </div>
        </div>
      </div>
      <div className="flex-1 bg-gray-50">
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
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center gap-2 mb-4">
                    <AlignLeft className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-0">
                      Description
                    </h3>
                  </div>
                  {task.description ? (
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {task.description}
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
                        Add a description to provide more context for this task
                      </p>
                    </div>
                  )}
                </Card>

                {/* Task Checklist */}
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <TaskChecklist taskId={Number(taskId)} />
                </Card>

                {/* Time Logs Section */}
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-brand-700" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-0">
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
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-8 h-8 text-gray-400" />
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        No time logs yet
                      </h4>
                      <p className="text-xs text-gray-500">
                        Start the timer to begin tracking time for this task
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Time
                            </th>
                            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Duration
                            </th>
                            <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Description
                            </th>
                            <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {logs.map((log: TimeLog) => (
                            <tr key={log.id} className="hover:bg-gray-50">
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                {formatDate(log.startTime)}
                              </td>
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                {new Date(log.startTime).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                                {log.endTime &&
                                  ` - ${new Date(
                                    log.endTime
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}`}
                              </td>
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                                {log.timeSpent
                                  ? formatDuration(log.timeSpent)
                                  : "In Progress"}
                              </td>
                              <td className="hidden sm:table-cell px-3 sm:px-6 py-4 text-xs sm:text-sm text-gray-500 max-w-xs truncate">
                                {log.description || "-"}
                              </td>
                              <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-right text-xs sm:text-sm font-medium">
                                {log.userId === currentUser?.id ? (
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openEditLogModal(log)}
                                      className="text-blue-600 hover:text-blue-700"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openDeleteLogModal(log)}
                                      className="text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-end gap-2">
                                    --
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Task Info */}
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Info className="w-5 h-5 text-blue-600" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-0">
                      Task Info
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {/* Created By */}
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs sm:text-sm font-medium text-gray-700">
                          Created By
                        </span>
                      </div>
                      {creatorLoading ? (
                        <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
                      ) : creatorData?.data ? (
                        <div className="flex items-center gap-2">
                          <Avatar name={creatorData.data.name} size="xs" />
                          <span className="text-xs sm:text-sm font-medium text-gray-900">
                            {creatorData.data.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs sm:text-sm font-medium text-gray-500">
                          Unknown
                        </span>
                      )}
                    </div>
                    {/* Status */}
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-xs sm:text-sm font-medium text-gray-700">
                          Status
                        </span>
                      </div>
                      <Badge
                        variant={getStatusBadgeVariant(task.status)}
                        className="text-xs"
                      >
                        {task.status || "Not Set"}
                      </Badge>
                    </div>

                    {/* Project */}
                    {project && (
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center gap-2">
                          <FolderOpenDot className="w-4 h-4 text-purple-600" />
                          <span className="text-xs sm:text-sm font-medium text-gray-700">
                            Project
                          </span>
                        </div>
                        <Link
                          href={`/projects/${project.id}`}
                          className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                        >
                          {project.name}
                        </Link>
                      </div>
                    )}

                    {/* Due Date */}
                    {task.dueDate && (
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-orange-600" />
                          <span className="text-xs sm:text-sm font-medium text-gray-700">
                            Due Date
                          </span>
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-900">
                          {formatDate(task.dueDate)}
                        </span>
                      </div>
                    )}

                    {/* Time Spent */}
                    {task && (
                      <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-teal-600" />
                          <span className="text-xs sm:text-sm font-medium text-gray-700">
                            Time Spent
                          </span>
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-gray-900">
                          {formatDuration(task.totalTimeSpent)}
                        </span>
                      </div>
                    )}

                    {/* Created */}
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <PlusCircle className="w-4 h-4 text-gray-600" />
                        <span className="text-xs sm:text-sm font-medium text-gray-700">
                          Created
                        </span>
                      </div>
                      <span className="text-xs sm:text-sm font-medium text-gray-900">
                        {formatDate(task.createdAt)}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Assignee Section */}
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-600" />
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-0">
                        Assignees
                      </h3>
                      {assignees.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {assignees.length}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setAssignUserModalOpen(true)}
                      className="text-xs"
                    >
                      <UserPlus className="h-4 w-4 md:mr-1" />
                      <span className="hidden md:inline">
                        {assignees.length > 0 ? "Add More" : "Assign"}
                      </span>
                    </Button>
                  </div>
                  {assigneeLoading ? (
                    <div className="flex items-center gap-3 animate-pulse">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  ) : assignees.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {assignees.map((assignee: User) => (
                        <div
                          key={assignee.id}
                          className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Avatar name={assignee.name} size="sm" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                                {assignee.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate hidden sm:block">
                                {assignee.email}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnassignUser(assignee.id)}
                            disabled={unassignUserMutation.isPending}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        No assignees
                      </p>
                      <p className="text-xs text-gray-400">
                        This task hasn&apos;t been assigned yet
                      </p>
                    </div>
                  )}
                </Card>

                {/* Followers Section */}
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center gap-2 mb-4">
                    <Eye className="w-5 h-5 text-yellow-600" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-0">
                      Followers
                    </h3>
                    {followers.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {followers.length}
                      </Badge>
                    )}
                  </div>
                  {followersLoading ? (
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 animate-pulse"
                        >
                          <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-3 bg-gray-200 rounded mb-1"></div>
                            <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : followers.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {followers.map((follower) => (
                        <div
                          key={follower.id}
                          className="flex items-center gap-2 sm:gap-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Avatar name={follower.name} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                              {follower.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate hidden sm:block">
                              {follower.email}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Eye className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        No followers
                      </p>
                      <p className="text-xs text-gray-400">
                        No one is following this task yet
                      </p>
                    </div>
                  )}
                </Card>
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
      <Modal
        isOpen={assignUserModalOpen}
        onClose={() => {
          setAssignUserModalOpen(false);
          setSelectedUserId(null);
          setFilterText("");
        }}
        title="Assign User to Task"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setAssignUserModalOpen(false);
                setSelectedUserId(null);
                setFilterText("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleAssignUser}
              disabled={!selectedUserId || assignUserMutation.isPending}
              isLoading={assignUserMutation.isPending}
            >
              Assign
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <Input
              id="search"
              label="Filter Users:"
              placeholder="Filter by name or email..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="flex justify-start items-center space-x-5"
            />
          </div>

          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
            {projectMembersLoading ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 animate-pulse"
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded mb-1"></div>
                      <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : projectMembersData?.data &&
              projectMembersData.data.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {projectMembersData.data
                  .filter(
                    (user: User) =>
                      !filterText ||
                      user.name
                        .toLowerCase()
                        .includes(filterText.toLowerCase()) ||
                      user.email
                        .toLowerCase()
                        .includes(filterText.toLowerCase())
                  )
                  .map((user: User) => (
                    <div
                      key={user.id}
                      className={`flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedUserId === user.id ? "bg-blue-50" : ""
                      }`}
                      onClick={() => setSelectedUserId(user.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      {selectedUserId === user.id && (
                        <Check className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p>No project members found</p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
