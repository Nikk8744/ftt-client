import React from 'react';
import Card from '@/components/ui/Card';
import { User as UserIcon, Check, FolderOpenDot, Calendar, Clock, PlusCircle } from 'lucide-react';
import { formatDate, formatDuration } from '@/lib/utils';
import { Task, User } from '@/types';
import { Info } from 'lucide-react';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';

interface TaskInfoProps {
  task: Task;
  project?: { id: number; name: string } | null;
  creator?: User | null;
  creatorLoading?: boolean;
  statusVariant: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "default" | undefined;
}

export const TaskInfo = ({
  task,
  project,
  creator,
  creatorLoading = false,
  statusVariant,
}: TaskInfoProps) => {
  return (
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
          ) : creator ? (
            <div className="flex items-center gap-2">
              <Avatar name={creator.name} size="xs" />
              <span className="text-xs sm:text-sm font-medium text-gray-900">
                {creator.name}
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
            variant={statusVariant}
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
              {formatDuration(task.totalTimeSpent || 0)}
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
  );
}; 