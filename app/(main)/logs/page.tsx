"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserLogs, updateTimeLog, deleteTimeLog } from "@/services/log";
import { getAllProjectsOfUser } from "@/services/project";
import { getUserTasks } from "@/services/task";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import PageWrapper from "@/components/layout/PageWrapper";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal, { ConfirmModal } from "@/components/ui/Modal";
import { formatDate, formatDuration } from "@/lib/utils";
import { Project, Task, TimeLog, TimeLogUpdateData } from "@/types";
import { Calendar, Check, ChevronDown, FilterIcon, FolderOpenDot, Pencil, Trash2, X, Zap } from "lucide-react";

// Form validation schema
const timeLogSchema = z.object({
  description: z.string().max(1000).optional(),
  projectId: z.number().nullable().optional(),
  taskId: z.number().nullable().optional(),
  timeSpent: z.number().nullable().optional(),
  duration: z.number().nullable().optional(),
  userId: z.number().nullable().optional(),
  name: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});

type TimeLogFormData = z.infer<typeof timeLogSchema>;

export default function LogsPage() {
  const queryClient = useQueryClient();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: "",
    endDate: "",
  });
  const [editLogId, setEditLogId] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    logId: number | null;
  }>({
    isOpen: false,
    logId: null,
  });

  // Fetch user logs
  const {
    data: logsData,
    isLoading: logsLoading,
    isError: logsError,
  } = useQuery({
    queryKey: ["logs"],
    queryFn: getUserLogs,
  });

  // Fetch projects for filter and editing
  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: getAllProjectsOfUser,
  });

  // Fetch tasks for editing
  const { data: tasksData } = useQuery({
    queryKey: ["tasks"],
    queryFn: getUserTasks,
  });

  const logs = logsData?.logs || [];
  const projects = projectsData?.projects || [];
  const tasks = tasksData?.tasks || [];
  console.log("🚀 ~ LogsPage ~ tasks:", tasks);

  // Selected log for editing
  const selectedLog = editLogId
    ? logs.find((log: TimeLog) => log.id === editLogId)
    : null;

  // Filter logs based on project and date range
  const filteredLogs = logs.filter((log: TimeLog) => {
    // Filter by project
    if (selectedProjectId && log.projectId !== Number(selectedProjectId)) {
      return false;
    }

    // Filter by date range
    if (dateRange.startDate) {
      const logDate = new Date(log.startTime);
      const startDate = new Date(dateRange.startDate);
      if (logDate < startDate) {
        return false;
      }
    }

    if (dateRange.endDate) {
      const logDate = new Date(log.startTime);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59); // Set to end of day
      if (logDate > endDate) {
        return false;
      }
    }

    return true;
  });

  // Form for editing logs
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TimeLogFormData>({
    resolver: zodResolver(timeLogSchema),
    defaultValues: {
      description: selectedLog?.description || "",
      projectId: selectedLog?.projectId
        ? Number(selectedLog.projectId)
        : undefined,
      taskId: selectedLog?.taskId ? Number(selectedLog.taskId) : undefined,
      startTime: selectedLog?.startTime || "",
      endTime: selectedLog?.endTime || "",
    },
  });

  // Update log mutation
  const updateLogMutation = useMutation({
    mutationFn: (data: { id: number; updateData: TimeLogUpdateData }) =>
      updateTimeLog(data.id, data.updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logs"] });
      setEditLogId(null);
      reset();
    },
  });

  // Delete log mutation
  const deleteLogMutation = useMutation({
    mutationFn: (id: number) => deleteTimeLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logs"] });
      setDeleteModal({ isOpen: false, logId: null });
    },
  });

  const openEditModal = (log: TimeLog) => {
    setEditLogId(log.id);
    reset({
      description: log.description || "",
      projectId: log.projectId ? Number(log.projectId) : 0,
      taskId: log.taskId ? Number(log.taskId) : 0,
      startTime: log.startTime
        ? new Date(log.startTime).toISOString().slice(0, 16)
        : "",
      endTime: log.endTime
        ? new Date(log.endTime).toISOString().slice(0, 16)
        : "",
    });
  };

  const openDeleteModal = (logId: number) => {
    setDeleteModal({
      isOpen: true,
      logId,
    });
  };

  const handleDeleteLog = () => {
    if (deleteModal.logId) {
      deleteLogMutation.mutate(deleteModal.logId);
    }
  };

  const onSubmit = (data: TimeLogFormData) => {
    if (!editLogId) return;

    const updateData: TimeLogUpdateData = {};

    if (data.description !== selectedLog?.description) {
      updateData.description = data.description || null;
    }

    if (Number(data.projectId) !== selectedLog?.projectId) {
      updateData.projectId = data.projectId ? Number(data.projectId) : null;
    }

    if (Number(data.taskId) !== selectedLog?.taskId) {
      updateData.taskId = data.taskId ? Number(data.taskId) : null;
    }

    if (data.startTime && data.startTime !== selectedLog?.startTime) {
      updateData.startTime = data.startTime;
    }

    if (data.endTime && data.endTime !== selectedLog?.endTime) {
      updateData.endTime = data.endTime;
    }

    updateLogMutation.mutate({ id: editLogId, updateData });
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projectId = e.target.value;
    setSelectedProjectId(projectId);
  };

  // Get filtered tasks based on selected project
  const filteredTasks = tasks.filter((task: Task) => {
    const selectedProjectIdNum = Number(watch("projectId"));
    return !selectedProjectIdNum || task.projectId === selectedProjectIdNum;
  });

  return (
    <PageWrapper
      title="Time Logs"
      description="View and manage your time tracking history"
    >
      <div className="p-6">
        {/* Filters */}
        <Card className="mb-6 border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FilterIcon className="w-5 h-5" />
                <h3 className="text-base font-semibold text-gray-900">
                  Filters
                </h3>
              </div>

              {/* Active filters indicator */}
              {(selectedProjectId ||
                dateRange.startDate ||
                dateRange.endDate) && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {
                      [
                        selectedProjectId && "Project",
                        dateRange.startDate && "From Date",
                        dateRange.endDate && "To Date",
                      ].filter(Boolean).length
                    }{" "}
                    active
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedProjectId("");
                      setDateRange({ startDate: "", endDate: "" });
                    }}
                    className="text-xs px-2 py-1 flex items-center gap-1"
                  >
                   <X color="red" className="w-3 h-3" />
                    Clear All
                  </Button>
                </div>
              )}
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Project Filter */}
              <div className="space-y-2">
                <label
                  htmlFor="project-filter"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700"
                >
                  <FolderOpenDot color="blue" className="w-4 h-4" />
                  Project
                </label>
                <div className="relative">
                  <select
                    id="project-filter"
                    className="w-full rounded-lg border border-gray-200 shadow-sm py-2.5 px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white appearance-none"
                    value={selectedProjectId}
                    onChange={handleProjectChange}
                  >
                    <option value="">All Projects</option>
                    {projects.map((project: Project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <ChevronDown color="blue" className="w-4 h-4" />
                  </div>
                </div>
                {selectedProjectId && (
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <Check color="blue" className="w-3 h-3" />
                    Project filter applied
                  </div>
                )}
              </div>

              {/* From Date */}
              <div className="space-y-2">
                <label
                  htmlFor="startDate"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700"
                >
                  <Calendar color="blue" className="w-4 h-4" />
                  From Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="startDate"
                    className="w-full rounded-lg border border-gray-200 shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    value={dateRange.startDate}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, startDate: e.target.value })
                    }
                  />
                </div>
                {dateRange.startDate && (
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <Check color="blue" className="w-3 h-3" />
                    Start date set
                  </div>
                )}
              </div>

              {/* To Date */}
              <div className="space-y-2">
                <label
                  htmlFor="endDate"
                  className="flex items-center gap-2 text-sm font-medium text-gray-700"
                >
                  <Calendar color="blue" className="w-4 h-4" />
                  To Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="endDate"
                    className="w-full rounded-lg border border-gray-200 shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    value={dateRange.endDate}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, endDate: e.target.value })
                    }
                    min={dateRange.startDate || undefined}
                  />
                </div>
                {dateRange.endDate && (
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <Check color="blue" className="w-3 h-3" />
                    End date set
                  </div>
                )}
              </div>
            </div>

            {/* Quick Filter Options */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Zap color="blue" className="w-4 h-4" />
                <span className="text-sm font-medium text-gray-700">
                  Quick Filters
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date().toISOString().split("T")[0];
                    setDateRange({ startDate: today, endDate: today });
                  }}
                  className="text-xs px-3 py-1.5"
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date();
                    const lastWeek = new Date(
                      today.getTime() - 7 * 24 * 60 * 60 * 1000
                    );
                    setDateRange({
                      startDate: lastWeek.toISOString().split("T")[0],
                      endDate: today.toISOString().split("T")[0],
                    });
                  }}
                  className="text-xs px-3 py-1.5"
                >
                  Last 7 Days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date();
                    const lastMonth = new Date(
                      today.getTime() - 30 * 24 * 60 * 60 * 1000
                    );
                    setDateRange({
                      startDate: lastMonth.toISOString().split("T")[0],
                      endDate: today.toISOString().split("T")[0],
                    });
                  }}
                  className="text-xs px-3 py-1.5"
                >
                  Last 30 Days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const today = new Date();
                    const firstDayOfMonth = new Date(
                      today.getFullYear(),
                      today.getMonth(),
                      1
                    );
                    setDateRange({
                      startDate: firstDayOfMonth.toISOString().split("T")[0],
                      endDate: today.toISOString().split("T")[0],
                    });
                  }}
                  className="text-xs px-3 py-1.5"
                >
                  This Month
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Time Logs Table */}
        {logsLoading ? (
          <div className="text-center py-8">
            <p>Loading time logs...</p>
          </div>
        ) : logsError ? (
          <div className="text-center py-8 text-red-500">
            <p>Error loading time logs</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-8">
            <p>No time logs found matching your filters</p>
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
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
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
                {filteredLogs.map((log: TimeLog) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(log.startTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {log.endTime &&
                        ` - ${new Date(log.endTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.projectId
                        ? projects.find((p: Project) => p.id === log.projectId)
                            ?.name || "Unknown Project"
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.taskId
                        ? tasks.find((t: Task) => t.id === log.taskId)
                            ?.subject || "Unknown Task"
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.duration ? formatDuration(log.duration) : 
                       log.timeSpent ? formatDuration(log.timeSpent) : "In Progress"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {log.description || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(log)}
                          className="hover:text-blue-500 hover:bg-gray-100"
                        >
                          <Pencil className="w-4 h-4 o" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openDeleteModal(log.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Log Modal */}
      <Modal
        isOpen={editLogId !== null}
        onClose={() => setEditLogId(null)}
        title="Edit Time Log"
        footer={
          <>
            <Button variant="outline" onClick={() => setEditLogId(null)}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleSubmit(onSubmit)}
              isLoading={updateLogMutation.isPending}
            >
              Save Changes
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              {...register("startTime")}
            />
            {errors.startTime && (
              <p className="mt-1 text-sm text-red-600">
                {errors.startTime.message}
              </p>
            )}
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
              className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              {...register("endTime")}
            />
            {errors.endTime && (
              <p className="mt-1 text-sm text-red-600">
                {errors.endTime.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="projectId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Project
            </label>
            <select
              id="projectId"
              className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              {...register("projectId")}
            >
              <option value="">No Project</option>
              {projects.map((project: Project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            {errors.projectId && (
              <p className="mt-1 text-sm text-red-600">
                {errors.projectId.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="taskId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Task
            </label>
            <select
              id="taskId"
              className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              {...register("taskId")}
              disabled={!watch("projectId")}
            >
              <option value="">No Task</option>
              {filteredTasks.map((task: Task) => (
                <option key={task.id} value={task.id}>
                  {task.name || task.subject}
                </option>
              ))}
            </select>
            {errors.taskId && (
              <p className="mt-1 text-sm text-red-600">
                {errors.taskId.message}
              </p>
            )}
          </div>

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
              className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              {...register("description")}
              placeholder="What did you work on?"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, logId: null })}
        onConfirm={handleDeleteLog}
        title="Delete Time Log"
        message="Are you sure you want to delete this time log? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={deleteLogMutation.isPending}
        variant="danger"
      />
    </PageWrapper>
  );
}
