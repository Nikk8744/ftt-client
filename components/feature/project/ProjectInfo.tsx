import React from 'react';
import Card from '@/components/ui/Card';
import { User, CircleCheck, Plus, Clock, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Project } from '@/types';
import { Info } from 'lucide-react';
import Badge from '@/components/ui/Badge';

interface ProjectInfoProps {
  project: Project;
  ownerName: string;
  isCurrentUserOwner?: boolean;
  ownerLoading?: boolean;
}

export const ProjectInfo = ({
  project,
  ownerName,
  isCurrentUserOwner = false,
  ownerLoading = false,
}: ProjectInfoProps) => {
  return (
    <Card className="border border-gray-100 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-800 overflow-hidden">
      <div className="border-b border-gray-50 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800 px-3 sm:px-4 py-2 sm:py-3">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Info className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          Project Info
        </h3>
      </div>

      <div className="p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Owner */}
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mt-0.5">
              <User className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Owner
              </p>
              <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
                {ownerLoading
                  ? "Loading..."
                  : isCurrentUserOwner
                  ? `${ownerName} (You)`
                  : ownerName || "Unknown User"}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mt-0.5">
              <CircleCheck className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
            <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center mt-0.5">
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Created
              </p>
              <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
                {formatDate(project.createdAt)}
              </p>
            </div>
          </div>

          {/* Total Hours */}
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center mt-0.5">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Total Hours
              </p>
              <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
                {project.totalHours || "0"} hrs
              </p>
            </div>
          </div>

          {/* Start Date */}
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-teal-100 dark:bg-teal-900/50 rounded-full flex items-center justify-center mt-0.5">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Start Date
              </p>
              <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
                {formatDate(project.startDate)}
              </p>
            </div>
          </div>

          {/* End Date */}
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mt-0.5">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                End Date
              </p>
              <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
                {formatDate(project.endDate)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
