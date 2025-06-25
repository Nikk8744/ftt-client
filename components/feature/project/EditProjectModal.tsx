import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useState } from "react";
import { ChevronDown, CalendarCheck2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Project } from "@/types";

// Form validation schema
const projectSchema = z.object({
  name: z
    .string()
    .min(3, "Project name must be at least 3 characters")
    .max(255, "Project name cannot exceed 255 characters"),
  description: z
    .string()
    .min(5, "Project description must be at least 5 characters")
    .max(1000, "Project description cannot exceed 1000 characters"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  status: z.enum(["Pending", "In-Progress", "Completed"]).optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onSubmit: (data: ProjectFormData) => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function EditProjectModal({
  isOpen,
  onClose,
  project,
  onSubmit,
  isLoading = false,
  error = null,
}: EditProjectModalProps) {
  const [currentStatus, setCurrentStatus] = useState<string | undefined>(undefined);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      status: undefined,
    },
  });

  // Watch status for conditional rendering
  const watchedStatus = watch("status");
  
  // Update current status when it changes in the form
  useEffect(() => {
    setCurrentStatus(watchedStatus);
  }, [watchedStatus]);

  // Load project data into form when available
  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        description: project.description,
        startDate: project.startDate
          ? new Date(project.startDate).toISOString().split("T")[0]
          : "",
        endDate: project.endDate
          ? new Date(project.endDate).toISOString().split("T")[0]
          : "",
        status: project.status || undefined,
      });
      setCurrentStatus(project.status || undefined);
    }
  }, [project, reset]);

  // Format date for display
  const formatDateString = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Project"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="px-4 py-2"
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSubmit(onSubmit)}
            isLoading={isLoading}
            disabled={isLoading}
            className="px-4 py-2"
          >
            Save Changes
          </Button>
        </div>
      }
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 py-2"
      >
        <div className="space-y-1.5">
          <Input
            id="name"
            label="Project Name"
            placeholder="Enter project name"
            error={errors.name?.message}
            {...register("name")}
            className="focus:ring-2 focus:ring-primary-500/30"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            placeholder="Enter project description"
            className={`w-full rounded-md border ${
              errors.description ? "border-red-500" : "border-gray-300"
            } shadow-sm focus:border-primary-500 focus:ring-primary-500/30 focus:ring-2 px-3 py-2 text-sm`}
            {...register("description")}
          ></textarea>
          {errors.description && (
            <p className="mt-1 text-xs text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700"
            >
              Start Date
            </label>
            <div className="relative">
              <input
                type="date"
                id="startDate"
                className={`w-full rounded-md border ${
                  errors.startDate ? "border-red-500" : "border-gray-300"
                } shadow-sm focus:border-primary-500 focus:ring-primary-500/30 focus:ring-2 py-2 px-3 text-sm`}
                {...register("startDate")}
              />
              {errors.startDate && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.startDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700"
            >
              End Date
            </label>
            <div className="relative">
              <input
                type="date"
                id="endDate"
                className={`w-full rounded-md border ${
                  errors.endDate ? "border-red-500" : "border-gray-300"
                } shadow-sm focus:border-primary-500 focus:ring-primary-500/30 focus:ring-2 py-2 px-3 text-sm`}
                {...register("endDate")}
              />
              {errors.endDate && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700"
          >
            Status
          </label>
          <div className="relative">
            <select
              id="status"
              className={`w-full rounded-md border ${
                errors.status ? "border-red-500" : "border-gray-300"
              } shadow-sm focus:border-primary-500 focus:ring-primary-500/30 focus:ring-2 py-2 px-3 text-sm bg-white appearance-none`}
              {...register("status")}
            >
              <option value="">Select Status</option>
              <option value="Pending">Pending</option>
              <option value="In-Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown className="h-4 w-4 text-gray-700" />
            </div>
            {errors.status && (
              <p className="mt-1 text-xs text-red-600">
                {errors.status.message}
              </p>
            )}
          </div>
        </div>

        {/* Completion Date - Show only when project is completed */}
        {project?.completedAt && (currentStatus === "Completed" || project?.status === "Completed") && (
          <div className="rounded-md bg-green-50 p-3 text-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CalendarCheck2 className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <h3 className="font-medium text-green-800">Project Completed</h3>
                <div className="mt-1 text-green-700">
                  This project was completed on {formatDateString(project.completedAt)}
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </form>
    </Modal>
  );
} 