import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Project, Task } from '@/types';

interface RecentTasksProps {
  tasks: Task[];
  projects: Project[];
  createdTasks: Task[];
}

const getStatusBadgeVariant = (status: string | null) => {
  if (status === null) return 'primary';
  switch (status) {
    case 'Not Started':
    case 'Pending':
      return 'secondary';
    case 'In Progress':
    case 'In-Progress':
      return 'warning';
    case 'Done':
      return 'success';
    default:
      return 'primary';
  }
};

const getTaskBorderColor = (status: string | null) => {
  if (status === 'In Progress' || status === 'In-Progress') {
    return '#f59e0b';
  } else if (status === 'Done') {
    return '#10b981';
  } else {
    return '#6366f1';
  }
};

export const RecentTasks = ({ tasks, projects, createdTasks }: RecentTasksProps) => {
  if (!tasks.length) {
    return (
      <Card className="p-8 text-center bg-white dark:bg-gray-800">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No active tasks found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Create a task to get started with your projects</p>
          <Link href="/tasks" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand hover:bg-primary-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            Create a Task
          </Link>
        </div>
      </Card>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {tasks.slice(0, 3).map((task) => (
        <Card 
          key={task.id} 
          className="hover:shadow-md transition-all duration-200 border-l-4 bg-white dark:bg-gray-800"
          style={{ borderLeftColor: getTaskBorderColor(task.status) }}
        >
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start">
              <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">{task.subject }</h3>
              <Badge variant={getStatusBadgeVariant(task.status)}>
                {task.status}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2 flex-grow">
              {task.description || 'No description provided'}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Project: {projects.find((p: Project) => p.id === task.projectId)?.name || 'Unknown'}
              </span>
              {task.dueDate && (
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Due: {formatDate(task.dueDate)}
                </span>
              )}
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {createdTasks.some((t: Task) => t.id === task.id) ? 
                <Badge variant="default" className="text-xs">Created</Badge> : 
                <Badge variant="secondary" className="text-xs">Assigned</Badge>
              }
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default RecentTasks; 