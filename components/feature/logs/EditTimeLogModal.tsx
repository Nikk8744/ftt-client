import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Project, Task, TimeLog, TimeLogUpdateData } from "@/types";
import { cn } from "@/lib/utils";

// Form validation schema
const timeLogSchema = z.object({
  description: z.string().max(1000).optional(),
  projectId: z.number().nullable().optional(),
  taskId: z.number().nullable().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});

type TimeLogFormData = z.infer<typeof timeLogSchema>;

interface EditTimeLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TimeLogUpdateData) => void;
  isLoading: boolean;
  timeLog: TimeLog | null;
  projects: Project[];
  tasks: Task[];
}

export function EditTimeLogModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  timeLog,
  projects,
  tasks,
}: EditTimeLogModalProps) {
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<TimeLogFormData>({
    resolver: zodResolver(timeLogSchema),
    defaultValues: {
      description: timeLog?.description || "",
      projectId: timeLog?.projectId ? Number(timeLog.projectId) : null,
      taskId: timeLog?.taskId ? Number(timeLog.taskId) : null,
      startTime: timeLog?.startTime
        ? new Date(timeLog.startTime).toISOString().slice(0, 16)
        : "",
      endTime: timeLog?.endTime
        ? new Date(timeLog.endTime).toISOString().slice(0, 16)
        : "",
    },
  });

  // Reset form when timeLog changes
  useEffect(() => {
    if (timeLog) {
      reset({
        description: timeLog.description || "",
        projectId: timeLog.projectId ? Number(timeLog.projectId) : null,
        taskId: timeLog.taskId ? Number(timeLog.taskId) : null,
        startTime: timeLog.startTime
          ? new Date(timeLog.startTime).toISOString().slice(0, 16)
          : "",
        endTime: timeLog.endTime
          ? new Date(timeLog.endTime).toISOString().slice(0, 16)
          : "",
      });
    }
  }, [timeLog, reset]);

  // Filter tasks based on selected project
  const selectedProjectId = watch("projectId");
  
  useEffect(() => {
    if (selectedProjectId) {
      setFilteredTasks(
        tasks.filter((task) => task.projectId === Number(selectedProjectId))
      );
    } else {
      setFilteredTasks([]);
    }
  }, [selectedProjectId, tasks]);

  const handleFormSubmit = (data: TimeLogFormData) => {
    if (!timeLog) return;

    const updateData: TimeLogUpdateData = {};

    if (data.description !== timeLog.description) {
      updateData.description = data.description || null;
    }

    if (Number(data.projectId) !== timeLog.projectId) {
      updateData.projectId = data.projectId ? Number(data.projectId) : null;
    }

    if (Number(data.taskId) !== timeLog.taskId) {
      updateData.taskId = data.taskId ? Number(data.taskId) : null;
    }

    if (data.startTime && data.startTime !== timeLog.startTime) {
      updateData.startTime = data.startTime;
    }

    if (data.endTime && data.endTime !== timeLog.endTime) {
      updateData.endTime = data.endTime;
    }

    onSubmit(updateData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Time Log"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="myBtn"
            onClick={handleSubmit(handleFormSubmit)}
            isLoading={isLoading}
          >
            Save Changes
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Start Time"
          type="datetime-local"
          error={errors.startTime?.message}
          {...register("startTime")}
          fullWidth={true}
        />

        <Input
          label="End Time"
          type="datetime-local"
          error={errors.endTime?.message}
          {...register("endTime")}
          fullWidth={true}
        />

        <div className="space-y-1.5">
          <label htmlFor="projectId" className="block text-sm font-medium text-gray-700">
            Project
          </label>
          <select
            id="projectId"
            className={cn(
              "w-full rounded-md border border-gray-300 shadow-sm py-2 px-3",
              "focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            )}
            {...register("projectId")}
          >
            <option value="">No Project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          {errors.projectId && (
            <p className="mt-1 text-sm text-red-600">
              {errors.projectId.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="taskId" className="block text-sm font-medium text-gray-700">
            Task
          </label>
          <select
            id="taskId"
            className={cn(
              "w-full rounded-md border border-gray-300 shadow-sm py-2 px-3",
              "focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            )}
            {...register("taskId")}
            disabled={!selectedProjectId}
          >
            <option value="">No Task</option>
            {filteredTasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.name || task.subject}
              </option>
            ))}
          </select>
          {errors.taskId && (
            <p className="mt-1 text-sm text-red-600">
              {errors.taskId.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            className={cn(
              "w-full rounded-md border border-gray-300 shadow-sm py-2 px-3",
              "focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            )}
            {...register("description")}
            placeholder="What did you work on?"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
}

export default EditTimeLogModal;
