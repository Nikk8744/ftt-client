'use client';

import React, { useEffect, useState } from 'react';
import { getAllProjectsUserIsMemberOf } from '@/services/projectMember';
import { getAllProjectsOfUser } from '@/services/project';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Briefcase, FolderKanban, Layers } from 'lucide-react';

interface ProjectFilterProps {
  onChange: (projectId: string) => void;
  defaultValue?: string;
}

const ProjectFilter: React.FC<ProjectFilterProps> = ({ onChange, defaultValue = 'all' }) => {
  const [projects, setProjects] = useState<Array<{ id: number; name: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        // Fetch projects user is member of
        const memberProjects = await getAllProjectsUserIsMemberOf();
        
        // Fetch projects user has created
        const ownedProjects = await getAllProjectsOfUser();
        
        // Extract project data
        const memberProjectsData = memberProjects.data || [];
        const ownedProjectsData = ownedProjects.projects || [];
        
        // Combine projects and remove duplicates
        const combinedProjects = [...memberProjectsData, ...ownedProjectsData];
        
        // Create a map to track unique projects by ID
        const uniqueProjectsMap = new Map();
        combinedProjects.forEach(project => {
          uniqueProjectsMap.set(project.id, project);
        });
        
        // Convert map back to array
        const uniqueProjects = Array.from(uniqueProjectsMap.values());
        
        setProjects(uniqueProjects);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <Select 
      defaultValue={defaultValue} 
      onValueChange={onChange}
      disabled={isLoading}
    >
      <SelectTrigger className="w-full h-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm text-gray-900 dark:text-gray-100">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          <SelectValue placeholder="Select Project" />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
        <SelectGroup>
          <SelectLabel className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-1">
            Projects
          </SelectLabel>
          <SelectItem value="all" className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              <span>All Projects</span>
            </div>
          </SelectItem>
          {projects.map((project) => (
            <SelectItem key={project.id} value={String(project.id)} className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                <span>{project.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default ProjectFilter;
