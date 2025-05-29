"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTaskById, deleteTask } from "@/services/task";
import { getProjectById } from "@/services/project";
import {
  getTaskAssignee,
  getTaskFollowers,
  addTaskFollower,
  removeTaskFollower,
} from "@/services/taskMembers";
import { getTaskLogs, updateTimeLog, deleteTimeLog } from "@/services/log";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Modal, { ConfirmModal } from "@/components/ui/Modal";
import PageWrapper from "@/components/layout/PageWrapper";
import { formatDate, formatDuration } from "@/lib/utils";
import TaskForm from "@/components/feature/TaskForm";
import TaskChecklist from "@/components/feature/TaskChecklist";
import Link from "next/link";
import useTimer from "@/lib/hooks/useTimer";
import Avatar from "@/components/ui/Avatar";
import { User, TimeLog, TimeLogUpdateData } from "@/types";
import { getCurrentUser } from "@/services/user";

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

  // Get current user
  const { data: userData } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  // Use useEffect to set currentUser when userData changes
  useEffect(() => {
    if (userData?.user) {
      setCurrentUser(userData.user);
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
    queryKey: ["project", taskData?.task?.projectId],
    queryFn: () => getProjectById(taskData?.task?.projectId || 0),
    enabled: !!taskData?.task?.projectId,
  });

  // Get task assignee
  const { data: assigneeData, isLoading: assigneeLoading } = useQuery({
    queryKey: ["taskAssignee", taskId],
    queryFn: () => getTaskAssignee(Number(taskId)),
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

  const task = taskData?.task;
  const project = projectData?.project;
  const assignee = assigneeData?.user;
  const followers = followersData?.users || [];
  const logs = logsData?.data || [];

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

  if (taskLoading) {
    return <div>Loading task details...</div>;
  }

  if (taskError || !task) {
    return <div>Error loading task details</div>;
  }

  return (
    <PageWrapper
      title={task.subject}
      description={`Created ${formatDate(task.createdAt)}`}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button
            variant="default"
            onClick={handleStartTimer}
            size="sm"
            className="flex items-center gap-1.5"
          >
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Start Timer
          </Button>
          <Button
            variant={isUserFollowing ? "outline" : "outline"}
            onClick={handleFollowToggle}
            isLoading={
              addFollowerMutation.isPending || removeFollowerMutation.isPending
            }
            size="sm"
            className="flex items-center gap-1.5"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isUserFollowing ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 01.52-2.341M7.5 14.5l2.5-2.5m0 0l2.5-2.5M10 12l2.5 2.5M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              )}
            </svg>
            {isUserFollowing ? "Unfollow" : "Follow"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsEditModalOpen(true)}
            size="sm"
            className="flex items-center gap-1.5"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteModalState({ isOpen: true })}
            size="sm"
            className="flex items-center gap-1.5"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete
          </Button>
        </div>
      }
    >
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Description */}
            <Card className="hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="w-5 h-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h7"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">
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
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h7"
                      />
                    </svg>
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Time Logs
                  </h3>
                </div>
                <Button
                  variant="default"
                  onClick={handleStartTimer}
                  size="sm"
                  className="flex items-center gap-1.5"
                >
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
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Start Timer
                </Button>
              </div>

              {logsLoading ? (
                <div className="text-center py-8">
                  <p>Loading time logs...</p>
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {logs.map((log: TimeLog) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(log.startTime)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(log.startTime).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {log.endTime &&
                              ` - ${new Date(log.endTime).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.timeSpent
                              ? formatDuration(log.timeSpent)
                              : "In Progress"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                            {log.description || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {log.userId === currentUser?.id && (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditLogModal(log)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openDeleteLogModal(log)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </Button>
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
                <h3 className="text-lg font-semibold text-gray-900">
                  Task Info
                </h3>
              </div>
              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center gap-2">
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
                    <span className="text-sm font-medium text-gray-700">
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
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">
                        Project
                      </span>
                    </div>
                    <Link
                      href={`/projects/${project.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                    >
                      {project.name}
                    </Link>
                  </div>
                )}

                {/* Due Date */}
                {task.dueDate && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center gap-2">
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
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">
                        Due Date
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(task.dueDate)}
                    </span>
                  </div>
                )}

                {/* Time Spent */}
                {task && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center gap-2">
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
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">
                        Time Spent
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatDuration(task.totalTimeSpent)}
                    </span>
                  </div>
                )}

                {/* Created */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">
                      Created
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(task.createdAt)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Assignee Section */}
            <Card className="hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-2 mb-4">
                <svg
                  className="w-5 h-5 text-green-600"
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
                <h3 className="text-lg font-semibold text-gray-900">
                  Assignee
                </h3>
              </div>
              {assigneeLoading ? (
                <div className="flex items-center gap-3 animate-pulse">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ) : assignee ? (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Avatar name={assignee.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {assignee.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {assignee.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-gray-400"
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
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    No assignee
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
                <svg
                  className="w-5 h-5 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900">
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
                      className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Avatar name={follower.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {follower.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {follower.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
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
        <Modal
          isOpen={editLogModalOpen}
          onClose={() => {
            setEditLogModalOpen(false);
            setSelectedLog(null);
          }}
          title="Edit Time Log"
          footer={
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setEditLogModalOpen(false);
                  setSelectedLog(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  if (!selectedLog) return;
                  updateLogMutation.mutate({
                    id: selectedLog.id,
                    updateData: {
                      description: selectedLog.description || undefined,
                      startTime: selectedLog.startTime,
                      endTime: selectedLog.endTime || undefined,
                    },
                  });
                }}
                isLoading={updateLogMutation.isPending}
              >
                Save Changes
              </Button>
            </>
          }
        >
          <div className="space-y-4">
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
                className="w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                value={selectedLog.description || ""}
                onChange={(e) =>
                  setSelectedLog({
                    ...selectedLog,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="startTime"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  id="startTime"
                  className="w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={new Date(selectedLog.startTime)
                    .toISOString()
                    .slice(0, 16)}
                  onChange={(e) =>
                    setSelectedLog({
                      ...selectedLog,
                      startTime: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="endTime"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  End Time
                </label>
                <input
                  type="datetime-local"
                  id="endTime"
                  className="w-full rounded-md border border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  value={
                    selectedLog.endTime
                      ? new Date(selectedLog.endTime).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    setSelectedLog({
                      ...selectedLog,
                      endTime: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>
        </Modal>
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
    </PageWrapper>
  );
}
