"use client";

import Card from "@/components/ui/Card";
import { TimeLog } from "@/types";
import { formatDate, formatDuration } from "@/lib/utils";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

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
    <Card className="p-0 overflow-x-auto">
      <div className="p-6 pb-2">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Recently Tracked Tasks
        </h3>
      </div>
      <Table className="min-w-full text-sm">
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/3">Task Name</TableHead>
            <TableHead className="w-1/4">Project</TableHead>
            <TableHead className="w-1/4">Date</TableHead>
            <TableHead className="w-1/6 text-right">Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentTasks.map((log) => (
            <TableRow
              key={log.id}
              className="hover:bg-gray-100 dark:hover:bg-gray-900/80 transition-colors cursor-pointer group"
            >
              <TableCell className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[180px]">
                {log.taskName || "Unknown Task"}
              </TableCell>
              <TableCell className="truncate max-w-[120px] text-gray-700 dark:text-gray-300">
                {log.projectName || <span className="italic text-gray-400">N/A</span>}
              </TableCell>
              <TableCell className="text-gray-600 dark:text-gray-400">
                {formatDate(log.startTime)}
              </TableCell>
              <TableCell className="text-right">
                <span className="inline-block px-3 py-1 rounded-full bg-brand dark:bg-brand-600 text-white text-xs font-semibold">
                  {formatDuration(log.timeSpent || 0)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default RecentlyTrackedTasks;
