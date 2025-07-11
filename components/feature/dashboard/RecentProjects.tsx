import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { Project, Task } from '@/types';

interface RecentProjectsProps {
  projects: Project[];
  tasks: Task[];
  ownedProjects: Project[];
}

export const RecentProjects = ({ projects, tasks, ownedProjects }: RecentProjectsProps) => {
  if (!projects.length) {
    return (
      <Card className="p-8 text-center bg-white dark:bg-gray-800">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No projects found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first project to get started</p>
          <Link href="/projects" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
            Create a Project
          </Link>
        </div>
      </Card>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.slice(0, 3).map((project) => (
        <Link href={`/projects/${project.id}`} key={project.id}>
          <Card className="h-full hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">{project.name}</h3>
              {ownedProjects.some((p: Project) => p.id === project.id) ? 
                <Badge variant="primary" className="text-xs">Owner</Badge> : 
                <Badge variant="secondary" className="text-xs">Member</Badge>
              }
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{project.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <Badge variant="primary" rounded>
                {tasks.filter((t: Task) => t.projectId === project.id).length} Tasks
              </Badge>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Created {formatDate(project.createdAt)}
              </span>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default RecentProjects; 