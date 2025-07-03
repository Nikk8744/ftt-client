"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserLogs, updateTimeLog, deleteTimeLog } from "@/services/log";
import { getCombinedProjectsOfUser } from "@/services/project";
import { getUserTasks } from "@/services/task";
import { getUserAssignedTasks } from "@/services/taskMembers";
import useAuthStore from '@/store/auth';
import Card from "@/components/ui/Card";
import { ConfirmModal } from "@/components/ui/Modal";
import { TimeLog, TimeLogUpdateData } from "@/types";
import { LogsTable } from "@/components/feature/logs/LogsTable";
import EditTimeLogModal from "@/components/feature/logs/EditTimeLogModal";
import Loader from "@/components/ui/Loader";
import PageHeader from "@/components/layout/PageHeader";
import { LogsFilter } from "@/components/feature/logs/LogsFilter";

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
  // Projects are now fetched within LogsFilter, but we still need them for EditTimeLogModal
  // We can refetch them here or pass them down from a parent context if available.
  // For simplicity, let's keep the projectsData query here for now, as it's also used by EditTimeLogModal.
  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: getCombinedProjectsOfUser,
  });
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

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <PageHeader
        title="Time Logs"
        description="View and manage your time tracking history"
        // variant="brand"
      />
      
      <div className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="p-3 sm:p-6">
          {/* Filters */}
          <LogsFilter
            selectedProjectId={selectedProjectId}
            setSelectedProjectId={setSelectedProjectId}
            dateRange={dateRange}
            setDateRange={setDateRange}
          />

          {/* Time Logs Table */}
          {logsLoading ? (
            <div className="text-center py-8 text-gray-700 dark:text-gray-300">
              <Loader text="Loading time logs..." centered/>
            </div>
          ) : logsError ? (
            <div className="text-center py-8 text-red-500 dark:text-red-400">
              <p>Error loading time logs</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-700 dark:text-gray-300">
              <p>No time logs found matching your filters</p>
            </div>
          ) : (
            <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
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
