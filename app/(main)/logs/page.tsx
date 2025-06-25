"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserLogs, updateTimeLog, deleteTimeLog } from "@/services/log";
import { getCombinedProjectsOfUser } from "@/services/project";
import { getUserTasks } from "@/services/task";
import { getUserAssignedTasks } from "@/services/taskMembers";
import useAuthStore from '@/store/auth';
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/Modal";
import { Project, TimeLog, TimeLogUpdateData } from "@/types";
import { Calendar, Check, ChevronDown, FilterIcon, FolderOpenDot, X, Zap } from "lucide-react";
import { LogsTable } from "@/components/feature/logs/LogsTable";
import EditTimeLogModal from "@/components/feature/logs/EditTimeLogModal";
import Loader from "@/components/ui/Loader";
import PageHeader from "@/components/layout/PageHeader";

export default function LogsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
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
    queryFn: getCombinedProjectsOfUser,
  });

  // Fetch user-owned tasks
  const { data: userTasksData } = useQuery({
    queryKey: ["userTasks"],
    queryFn: getUserTasks,
  });

  // Fetch user-assigned tasks
  const { data: assignedTasksData } = useQuery({
    queryKey: ["assignedTasks", user?.id],
    queryFn: () => user ? getUserAssignedTasks(user.id) : Promise.resolve({ tasks: [] }),
    enabled: !!user,
  });

  const userTasks = Array.isArray(userTasksData?.tasks) ? userTasksData.tasks : [];
  const assignedTasks = Array.isArray(assignedTasksData?.tasks.data) ? assignedTasksData.tasks.data : [];
  const allTasks = [...userTasks, ...assignedTasks];

  const logs = logsData?.logs || [];
  const projects = projectsData?.projects || [];

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

  // Update log mutation
  const updateLogMutation = useMutation({
    mutationFn: (data: { id: number; updateData: TimeLogUpdateData }) =>
      updateTimeLog(data.id, data.updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logs"] });
      setEditLogId(null);
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

  const handleUpdateTimeLog = (updateData: TimeLogUpdateData) => {
    if (!editLogId) return;
    updateLogMutation.mutate({ id: editLogId, updateData });
  };

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projectId = e.target.value;
    setSelectedProjectId(projectId);
  };

  // We no longer need to filter tasks here as it's handled in the EditTimeLogModal component

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <PageHeader
        title="Time Logs"
        description="View and manage your time tracking history"
        // variant="brand"
      />
      
      <div className="flex-1 bg-gray-50">
        <div className="p-3 sm:p-6">
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
              <Loader text="Loading time logs..." centered/>
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
            <Card className="overflow-hidden border border-gray-200 shadow-sm">
              <LogsTable 
                data={filteredLogs} 
                projects={projects} 
                tasks={allTasks}
                onEdit={openEditModal}
                onDelete={(log) => openDeleteModal(log.id)}
              />
            </Card>
          )}
        </div>
      </div>  

      {/* Edit Log Modal */}
      <EditTimeLogModal
        isOpen={editLogId !== null}
        onClose={() => setEditLogId(null)}
        onSubmit={handleUpdateTimeLog}
        isLoading={updateLogMutation.isPending}
        timeLog={selectedLog}
        projects={projects}
        tasks={allTasks}
      />

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
    </div>
  );
}
