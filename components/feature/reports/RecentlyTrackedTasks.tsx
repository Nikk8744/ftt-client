"use client";

import Card from "@/components/ui/Card";
import { TimeLog } from "@/types";
import { formatDate, formatDuration } from "@/lib/utils";

interface RecentlyTrackedTasksProps {
  logs: TimeLog[];
}

export const RecentlyTrackedTasks = ({ logs }: RecentlyTrackedTasksProps) => {
  // Get the most recent 5 unique tasks
  const seen = new Set<number>();
  const recentTasks = logs
    .filter(
      (log) => log.taskId && !seen.has(log.taskId) && seen.add(log.taskId)
    )
    .slice(0, 5);

  if (recentTasks.length === 0) {
    return (
      <Card className="p-8 flex flex-col items-center justify-center min-h-[180px]">
        <span className="text-3xl mb-2">🕒</span>
        <p className="text-gray-500 dark:text-gray-400 text-base font-medium">
          No recently tracked tasks
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-5 text-gray-900 dark:text-gray-100">
        Recently Tracked Tasks
      </h3>
      <ul className="">
        {recentTasks.map((log) => (
          <li
          className="py-4 flex items-center justify-between gap-4 group hover:bg-gray-400 rounded-md transition-colors"
            key={log.id}
          >
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {log.taskName || "Unknown Task"}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {log.projectName && (
                  <span className="mr-1">Project: {log.projectName} · </span>
                )}
                {formatDate(log.startTime)}
              </span>
            </div>
            <div className="flex-shrink-0 text-right">
              <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-sm font-semibold">
                {formatDuration(log.timeSpent || 0)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
};

export default RecentlyTrackedTasks;
