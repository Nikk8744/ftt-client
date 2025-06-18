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
import { ProjectsTable } from "@/components/feature/ProjectsTable";
import { Plus } from "lucide-react";
// import Card from "@/components/ui/Card";
import EditProjectModal from "@/components/feature/EditProjectModal";
import CreateProjectModal from "@/components/feature/CreateProjectModal";
import Loader from "@/components/ui/Loader";

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"owned" | "member">("owned");
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

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="border-b border-gray-400 rounded-b-3xl">
        {/* <div className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between  shadow-[0px_2px_4px_0px_rgba(12,12,13,0.05),0px_2px_4px_0px_rgba(12,12,13,0.1)] rounded-b-3xl"> */}
        <div className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between  shadow-[inset_-1px_-4px_0px_#465fff] rounded-b-3xl">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
              Projects
            </h1>
            <p className="mt-1 text-sm text-gray-500 max-w-4xl">
              Manage your projects and collaborations
            </p>
          </div>
          <div className="flex flex-shrink-0 space-x-2">
            <Button
              variant="default"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
          </div>
        </div>
      </div>
      <div className="flex-1 bg-gray-50 p-4 ">
        {/* <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('owned')}
              className={`px-4 py-4 text-sm font-medium ${
                activeTab === 'owned'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Your Projects
            </button>
            <button
              onClick={() => setActiveTab('member')}
              className={`ml-8 px-4 py-4 text-sm font-medium ${
                activeTab === 'member'
                  ? 'border-b-2 border-primary-500 text-primary-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Projects You&apos;re Member Of
            </button>
          </nav>
        </div> */}
        <div className="flex space-x-1 rounded-lg bg-gray-100 p-1 mt-3 mb-6 max-w-md">
          <button
            className={`w-full rounded-md py-2.5 text-sm font-medium leading-5 ${
              activeTab === "owned"
                ? "bg-white shadow text-blue-700"
                : "text-gray-700 hover:bg-white/[0.5]"
            }`}
            onClick={() => setActiveTab("owned")}
          >
            Your Projects
          </button>
          <button
            className={`w-full rounded-md py-2.5 text-sm font-medium leading-5 ${
              activeTab === "member"
                ? "bg-white shadow text-blue-700"
                : "text-gray-700 hover:bg-white/[0.5]"
            }`}
            onClick={() => setActiveTab("member")}
          >
            Projects You&apos;re Member Of
          </button>
        </div>

        <div className="p-6">
          {activeTab === "owned" ? (
            <>
              {ownedProjectsLoading ? (
                // <Card className="p-8 text-center">
                //   <div className="flex flex-col items-center">
                //     <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                //       <svg
                //         className="w-8 h-8 text-gray-300"
                //         fill="none"
                //         stroke="currentColor"
                //         viewBox="0 0 24 24"
                //       >
                //         <path
                //           strokeLinecap="round"
                //           strokeLinejoin="round"
                //           strokeWidth={2}
                //           d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                //         />
                //       </svg>
                //     </div>
                //     <h3 className="text-lg font-medium text-gray-700 mb-2">
                //       Loading projects...
                //     </h3>
                //     <div className="w-24 h-2 bg-gray-200 rounded animate-pulse"></div>
                //   </div>
                // </Card>
                <Loader centered text="Loading projects..." />
              ) : ownedProjects.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No projects
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a new project.
                  </p>
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
                </div>
              ) : ownedProjectsError ? (
                <p className="text-red-500">Error loading projects</p>
              ) : (
                <ProjectsTable
                  data={ownedProjects}
                  onDelete={() =>
                    setDeleteModalState({
                      isOpen: true,
                      projectId: ownedProjects[0].id,
                    })
                  }
                  onEdit={setSelectedProject}
                />
              )}
            </>
          ) : (
            <>
              {memberProjectsLoading ? (
                <p>Loading projects...</p>
              ) : memberProjects.length === 0 ? (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No memberships
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You&apos;re not a member of any projects yet.
                  </p>
                </div>
              ) : memberProjectsError ? (
                <p className="text-red-500">Error loading projects</p>
              ) : (
                <ProjectsTable
                  data={memberProjects}
                  onDelete={() =>
                    setDeleteModalState({
                      isOpen: true,
                      projectId: memberProjects[0].id,
                    })
                  }
                  onEdit={setSelectedProject}
                />
              )}
            </>
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
              ? "Failed to create project. Please try again."
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
            if (selectedProject) {
              deleteProjectMutation.mutate(selectedProject.id);
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
