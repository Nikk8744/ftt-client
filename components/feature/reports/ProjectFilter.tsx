'use client';

import * as React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import { getAllProjectsUserIsMemberOf } from '@/services/projectMember';
import { getAllProjectsOfUser } from '@/services/project';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Project {
  id: string | number;
  name: string;
}

interface ProjectResponse {
  id: number;
  name: string;
  description?: string;
  status?: string;
}

interface ProjectFilterProps {
  onChange: (projectId: string) => void;
}

const ProjectFilter: React.FC<ProjectFilterProps> = ({ onChange }) => {
  const [value, setValue] = useState('all');
  const [projects, setProjects] = useState<Project[]>([
    { id: 'all', name: 'All Projects' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch both projects the user is a member of and projects the user has created
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        // Fetch projects user is member of
        const memberProjects = await getAllProjectsUserIsMemberOf();
        
        // Fetch projects user has created
        const ownedProjects = await getAllProjectsOfUser();
        
        console.log("Member projects:", memberProjects);
        console.log("Owned projects:", ownedProjects);
        
        // Extract project data
        const memberProjectsData = memberProjects.projects || [];
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
        
        // Add the "All Projects" option and then the user's projects
        const projectsList = [
          { id: 'all', name: 'All Projects' },
          ...uniqueProjects.map((project: ProjectResponse) => ({
            id: project.id.toString(),
            name: project.name
          }))
        ];
        
        setProjects(projectsList);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    onChange(value);
  }, [value, onChange]);

  const selectedProject = projects.find((project) => project.id.toString() === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
          disabled={isLoading}
        >
          {isLoading ? 'Loading projects...' : 
            selectedProject?.name || 'All Projects'}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[250px]">
        <DropdownMenuGroup>
          {projects.map((project) => (
            <DropdownMenuItem
              key={project.id}
              className={cn(
                "flex cursor-pointer items-center gap-2 px-3 py-2",
                value === project.id.toString() && "bg-accent"
              )}
              onClick={() => setValue(project.id.toString())}
            >
              {value === project.id.toString() && (
                <Check className="h-4 w-4" />
              )}
              <span className={value === project.id.toString() ? "font-medium" : ""}>
                {project.name}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProjectFilter; 