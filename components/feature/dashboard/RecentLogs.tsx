import Link from 'next/link';
import { Clock } from 'lucide-react';
import Card from '@/components/ui/Card';
import { LogsTable } from '@/components/feature/logs/LogsTable';
import { TimeLog, Project, Task } from '@/types';

interface RecentLogsProps {
  logs: TimeLog[];
  projects: Project[];
  tasks: Task[];
  isLoading: boolean;
}

export const RecentLogs = ({ logs, projects, tasks, isLoading }: RecentLogsProps) => {
  // Get only the 5 most recent logs
  const recentLogs = logs.slice(-5);

  if (isLoading) {
    return (
      <Card className="p-8 text-center bg-white dark:bg-gray-800">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <Clock className="w-8 h-8 text-gray-300 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Loading logs...</h3>
          <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
        </div>
      </Card>
    );
  }

  if (recentLogs.length === 0) {
    return (
      <Card className="p-8 text-center bg-white dark:bg-gray-800">
        <div className="flex flex-col items-center py-6">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mb-3">
            <Clock className="w-8 h-8 text-indigo-500 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No time logs found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Start tracking time to see your activity history here</p>
          <Link href="/logs" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <Clock className="w-4 h-4 mr-2" />
            Track Time
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800">
      <LogsTable 
        data={recentLogs} 
        projects={projects} 
        tasks={tasks} 
        showActions={false}
      />
    </Card>
  );
};
