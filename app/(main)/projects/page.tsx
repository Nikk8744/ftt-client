"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllProjectsOfUser,
  createProject,
  deleteProject,
  updateProject,
} from "@/services/project";
import { getAllProjectsUserIsMemberOf } from "@/services/projectMember";
import { ProjectCreateData, Project } from "@/types";
import Button from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/Modal";
import { ProjectsTable } from "@/components/feature/project/ProjectsTable";
import { Plus } from "lucide-react";
// import Card from "@/components/ui/Card";
import EditProjectModal from "@/components/feature/project/EditProjectModal";
import CreateProjectModal from "@/components/feature/project/CreateProjectModal";
import Loader from "@/components/ui/Loader";
import PageHeader from "@/components/layout/PageHeader";
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"all" | "owned" | "member">("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    projectId: number | null;
  }>({
    isOpen: false,
    projectId: null,
  });

  // Fetch owned projects
  const {
    data: ownedProjectsData,
    isLoading: ownedProjectsLoading,
    error: ownedProjectsError,
  } = useQuery({
    queryKey: ["projects", "owned"],
    queryFn: getAllProjectsOfUser,
  });

  // Fetch projects user is member of
  const {
    data: memberProjectsData,
    isLoading: memberProjectsLoading,
    error: memberProjectsError,
  } = useQuery({
    queryKey: ["projects", "member"],
    queryFn: getAllProjectsUserIsMemberOf,
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: (data: ProjectCreateData) => createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "owned"] });
      setIsCreateModalOpen(false);
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: (data: { id: number; project: ProjectCreateData }) =>
      updateProject(data.id, data.project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "owned"] });
      setIsEditModalOpen(false);
      setSelectedProject(null);
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: (id: number) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", "owned"] });
      setDeleteModalState({ isOpen: false, projectId: null });
    },
  });

  const ownedProjects = ownedProjectsData?.projects || [];
  const memberProjects = memberProjectsData?.data || [];

  // Combine owned and member projects for the "All Projects" view, removing duplicates
  const allProjects = [...ownedProjects];

  // Add member projects that aren't already in the owned projects list
  memberProjects.forEach((memberProject: Project) => {
    if (!allProjects.some((project) => project.id === memberProject.id)) {
      allProjects.push(memberProject);
    }
  });

  // Determine which projects to display based on active tab
  let displayProjects: Project[] = [];
  const isLoading = ownedProjectsLoading || memberProjectsLoading;
  const hasError = ownedProjectsError || memberProjectsError;

  switch (activeTab) {
    case "all":
      displayProjects = allProjects;
      break;
    case "owned":
      displayProjects = ownedProjects;
      break;
    case "member":
      displayProjects = memberProjects;
      break;
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <PageHeader
        title="Projects"
        description="Manage your projects and collaborations"
        actionLabel="Create Project"
        actionIcon={<Plus className="h-4 w-4" />}
        onActionClick={() => setIsCreateModalOpen(true)}
        // variant="brand"
      />

      <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-4 ">
        <Tabs value={activeTab} onValueChange={value => setActiveTab(value as 'all' | 'owned' | 'member')} className="mt-3 mb-6">
          <TabsList>
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="owned">Your Projects</TabsTrigger>
            <TabsTrigger value="member">Member Of</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="p-6">
          {isLoading ? (
            <Loader centered text="Loading projects..." />
          ) : displayProjects.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d={
                    activeTab === "member"
                      ? "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                      : "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  }
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                {activeTab === "member" ? "No memberships" : "No projects"}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {activeTab === "member"
                  ? "You're not a member of any projects yet."
                  : "Get started by creating a new project."}
              </p>
              {activeTab !== "member" && (
                <div className="mt-6">
                  <Button
                    variant="default"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    New Project
                  </Button>
                </div>
              )}
            </div>
          ) : hasError ? (
            <p className="text-red-500">Error loading projects</p>
          ) : (
            <ProjectsTable
              data={displayProjects}
              onDelete={(projectId) =>
                setDeleteModalState({
                  isOpen: true,
                  projectId: projectId,
                })
              }
              onEdit={(project) => {
                setSelectedProject(project);
                setIsEditModalOpen(true);
              }}
            />
          )}
        </div>

        {/* Create Project Modal */}
        <CreateProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={createProjectMutation.mutate}
          isLoading={createProjectMutation.isPending}
          error={
            createProjectMutation.isError
              ? createProjectMutation.error instanceof Error
                ? createProjectMutation.error.message
                : "Failed to create project. Please try again."
              : null
          }
        />

        {/* Edit Project Modal */}
        <EditProjectModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProject(null);
          }}
          project={selectedProject}
          onSubmit={(data) => {
            if (selectedProject) {
              updateProjectMutation.mutate({
                id: selectedProject.id,
                project: data,
              });
            }
          }}
          isLoading={updateProjectMutation.isPending}
          error={
            updateProjectMutation.isError
              ? "Failed to update project. Please try again."
              : null
          }
        />

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={deleteModalState.isOpen}
          onClose={() =>
            setDeleteModalState({ isOpen: false, projectId: null })
          }
          onConfirm={() => {
            if (deleteModalState.projectId) {
              deleteProjectMutation.mutate(deleteModalState.projectId);
            }
          }}
          title="Delete Project"
          message="Are you sure you want to delete this project? This action cannot be undone and all associated tasks and time logs will be deleted."
          confirmText="Delete"
          cancelText="Cancel"
          isLoading={deleteProjectMutation.isPending}
          variant="danger"
        />
      </div>
    </div>
  );
}
