"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Project } from "@/types";
import { Calendar, Check, ChevronDown, FilterIcon, FolderOpenDot, X, Zap } from "lucide-react";
import { getCombinedProjectsOfUser } from "@/services/project";

interface LogsFilterProps {
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  dateRange: { startDate: string; endDate: string };
  setDateRange: (range: { startDate: string; endDate: string }) => void;
}

export const LogsFilter: React.FC<LogsFilterProps> = ({
  selectedProjectId,
  setSelectedProjectId,
  dateRange,
  setDateRange,
}) => {
  // Fetch projects for filter
  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: getCombinedProjectsOfUser,
  });

  const projects = projectsData?.projects || [];

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projectId = e.target.value;
    setSelectedProjectId(projectId);
  };

  return (
    <Card className="mb-6 border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FilterIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Filters
            </h3>
          </div>

          {/* Active filters indicator */}
          {(selectedProjectId || dateRange.startDate || dateRange.endDate) && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
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
                className="text-xs px-2 py-1 flex items-center gap-1 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
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
              className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <FolderOpenDot color="blue" className="w-4 h-4" />
              Project
            </label>
            <div className="relative">
              <select
                id="project-filter"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm py-2.5 px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 dark:text-white appearance-none"
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
              <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                <Check color="blue" className="w-3 h-3" />
                Project filter applied
              </div>
            )}
          </div>

          {/* From Date */}
          <div className="space-y-2">
            <label
              htmlFor="startDate"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <Calendar color="blue" className="w-4 h-4" />
              From Date
            </label>
            <div className="relative">
              <input
                type="date"
                id="startDate"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 dark:text-white"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
              />
            </div>
            {dateRange.startDate && (
              <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                <Check color="blue" className="w-3 h-3" />
                Start date set
              </div>
            )}
          </div>

          {/* To Date */}
          <div className="space-y-2">
            <label
              htmlFor="endDate"
              className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <Calendar color="blue" className="w-4 h-4" />
              To Date
            </label>
            <div className="relative">
              <input
                type="date"
                id="endDate"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white dark:bg-gray-700 dark:text-white"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
                min={dateRange.startDate || undefined}
              />
            </div>
            {dateRange.endDate && (
              <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                <Check color="blue" className="w-3 h-3" />
                End date set
              </div>
            )}
          </div>
        </div>

        {/* Quick Filter Options */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Zap color="blue" className="w-4 h-4" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
              className="text-xs px-3 py-1.5 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
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
              className="text-xs px-3 py-1.5 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
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
              className="text-xs px-3 py-1.5 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
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
              className="text-xs px-3 py-1.5 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              This Month
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
