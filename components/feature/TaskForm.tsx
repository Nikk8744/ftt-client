import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTask, updateTask } from "@/services/task";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Task, User, TaskCreateData } from "@/types";
import { useState, useEffect } from "react";
import {
  getTaskChecklist,
  addChecklistItem,
  updateChecklistItem,
  removeChecklistItem,
} from "@/services/taskChecklist";
import { getCurrentUser } from "@/services/user";
import Avatar from "@/components/ui/Avatar";
import axios from "axios";
import React, { ReactNode } from 'react';
import { cn } from "@/lib/utils";

// Form validation schema
const taskSchema = z.object({
  subject: z
    .string()
    .min(3, "Task subject must be at least 3 characters")
    .max(50, "Task subject must be less than 50 characters"),
  description: z.string().optional(),
  status: z.enum(["Pending", "In-Progress", "Done"]),
  dueDate: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid datetime",
    })
    .transform((val) => (val ? new Date(val).toISOString() : undefined))
    .optional(),
  assignedUserId: z.number().int().positive().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface ChecklistItem {
  id: number;
  taskId: number;
  item: string;
  isCompleted: boolean | null;
  createdAt: string;
}

interface TaskFormProps {
  projectId: number;
  task?: Task;
  isOpen: boolean;
  onClose: () => void;
}

const TaskForm = ({
  projectId,
  task,
  isOpen,
  onClose,
}: TaskFormProps): React.ReactElement => {
  const queryClient = useQueryClient();
  const isEditMode = !!task;

  // Checklist state
  const [newItemText, setNewItemText] = useState("");
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [temporaryItems, setTemporaryItems] = useState<
    { id: string; text: string; isCompleted: boolean }[]
  >([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Get current user
  const { data: userData } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

  // Update current user when data is loaded
  useEffect(() => {
    if (userData?.user) {
      setCurrentUser(userData.user);
    }
  }, [userData]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      subject: task?.subject || "",
      description: task?.description || "",
      status: task?.status || "Pending",
      dueDate: task?.dueDate ? task.dueDate : "",
      assignedUserId: task?.assignedUserId || currentUser?.id,
    },
  });

  // Set default assignee after current user is loaded
  useEffect(() => {
    if (currentUser && !isEditMode) {
      setValue("assignedUserId", currentUser.id);
    }
  }, [currentUser, isEditMode, setValue]);

  // Fetch existing checklist items if editing a task
  const { data: checklistData, isLoading: checklistLoading } = useQuery<{ checklist: ChecklistItem[] }, Error>({
    queryKey: ["checklist", task?.id],
    queryFn: async () => {
      if (!task) return null;
      const result = await getTaskChecklist(task.id);
      return result;
    },
    enabled: !!task?.id && isOpen,
  });

  // Load checklist items when available
  useEffect(() => {
    if (checklistData?.checklist) {
      setChecklistItems(checklistData.checklist);
    }
  }, [checklistData]);

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      // Ensure all required fields are present and properly formatted
      const taskData: TaskCreateData = {
        subject: data.subject.trim(),
        description: data.description?.trim() || undefined,
        status: data.status || "Pending",
        dueDate: data.dueDate
          ? new Date(data.dueDate).toISOString()
          : undefined,
        assignedUserId: data.assignedUserId || currentUser?.id,
      };

      // Log the data being sent
      // console.log('Creating task with form data:', data);
      // console.log('Creating task with formatted data:', taskData);
      // console.log('Current user:', currentUser);

      try {
        const response = await createTask(projectId, taskData);
        console.log("Task creation response:", response);

        // Create checklist items for the new task
        if (response.task && temporaryItems.length > 0) {
          const newTaskId = response.task.id;
          const promises = temporaryItems.map((item) =>
            addChecklistItem({ taskId: newTaskId, item: item.text })
          );
          await Promise.all(promises);
        }
        return response;
      } catch (error) {
        console.error("Error in task creation:", error);
        if (axios.isAxiosError(error)) {
          console.error("Error response:", error.response?.data);
          // Throw a more descriptive error
          throw new Error(
            error.response?.data?.message || "Failed to create task"
          );
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      onClose();
      reset();
      setTemporaryItems([]);
    },
    onError: (error) => {
      console.error("Error creating task:", error);
      if (axios.isAxiosError(error)) {
        console.error("Error response data:", error.response?.data);
      }
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: (data: TaskFormData) => updateTask(task!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["checklist", task!.id] });
      onClose();
    },
  });

  // Add checklist item mutation (only for edit mode)
  const addItemMutation = useMutation({
    mutationFn: (text: string) =>
      addChecklistItem({
        taskId: task!.id,
        item: text,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist", task!.id] });
      setNewItemText("");
    },
  });

  // Update checklist item mutation
  const updateItemMutation = useMutation({
    mutationFn: (data: { id: number; update: { isCompleted?: boolean } }) =>
      updateChecklistItem(data.id, data.update),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist", task!.id] });
    },
  });

  // Delete checklist item mutation
  const deleteItemMutation = useMutation({
    mutationFn: (id: number) => removeChecklistItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist", task!.id] });
    },
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    if (isEditMode && task) {
      // For existing tasks, directly add to the database
      addItemMutation.mutate(newItemText.trim());
    } else {
      // For new tasks, temporarily store items to be added once the task is created
      setTemporaryItems([
        ...temporaryItems,
        {
          id: `temp-${Date.now()}`,
          text: newItemText.trim(),
          isCompleted: false,
        },
      ]);
      setNewItemText("");
    }
  };

  const handleToggleItem = (id: number | string) => {
    if (typeof id === "number" && isEditMode) {
      // Toggle existing item in database
      const item = checklistItems.find((item) => item.id === id);
      if (item) {
        updateItemMutation.mutate({
          id,
          update: { isCompleted: !item.isCompleted },
        });
      }
    } else if (typeof id === "string") {
      // Toggle temporary item
      setTemporaryItems(
        temporaryItems.map((item) =>
          item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
        )
      );
    }
  };

  const handleDeleteItem = (id: number | string) => {
    if (typeof id === "number" && isEditMode) {
      // Delete existing item from database
      deleteItemMutation.mutate(id);
    } else if (typeof id === "string") {
      // Delete temporary item
      setTemporaryItems(temporaryItems.filter((item) => item.id !== id));
    }
  };

  const onSubmit = (data: TaskFormData) => {
    console.log("Form submitted with data:", data);
    if (isEditMode) {
      updateTaskMutation.mutate(data);
    } else {
      createTaskMutation.mutate(data);
    }
  };

  const isPending =
    createTaskMutation.isPending || updateTaskMutation.isPending;

  const footerContent: ReactNode = (
    <div className="flex justify-end gap-3">
      <Button variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button
        variant="default"
        onClick={handleSubmit(onSubmit)}
        isLoading={isPending}
        disabled={isPending}
      >
        {isEditMode ? "Save Changes" : "Create Task"}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Task" : "Create Task"}
      maxWidth="xl"
      footer={footerContent}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Task Name */}
        <div className="space-y-1.5">
          <label htmlFor="subject" className="block text-sm font-medium text-gray-900">
            Task Name
          </label>
          <input
            type="text"
            id="subject"
            className={cn(
              "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm",
              "focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500",
              errors.subject && "border-red-500 focus:border-red-500 focus:ring-red-500"
            )}
            placeholder="Enter task name"
            {...register("subject")}
          />
          {errors.subject && (
            <p className="text-sm text-red-600">{errors.subject.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label htmlFor="description" className="block text-sm font-medium text-gray-900">
            Description (Optional)
          </label>
          <textarea
            id="description"
            rows={3}
            className={cn(
              "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm",
              "focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            )}
            placeholder="Add more details about the task..."
            {...register("description")}
          />
        </div>

        {/* Status and Due Date */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="status" className="block text-sm font-medium text-gray-900">
              Status
            </label>
            <select
              id="status"
              className={cn(
                "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm",
                "focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              )}
              {...register("status")}
            >
              <option value="Pending">Not Started</option>
              <option value="In-Progress">In Progress</option>
              <option value="Done">Completed</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-900">
              Due Date (Optional)
            </label>
            <input
              type="datetime-local"
              id="dueDate"
              className={cn(
                "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm",
                "focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              )}
              {...register("dueDate")}
            />
          </div>
        </div>

        {/* Assignee */}
        {currentUser && (
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-900">
              Assignee
            </label>
            <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-2.5">
              <Avatar name={currentUser.name} size="sm" />
              <span className="text-sm font-medium text-gray-900">{currentUser.name}</span>
            </div>
            <input
              type="hidden"
              {...register("assignedUserId", { valueAsNumber: true })}
            />
          </div>
        )}

        {/* Checklist */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-900">
            Checklist
          </label>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="Add checklist item..."
              className={cn(
                "flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm",
                "focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter" && newItemText.trim()) {
                  e.preventDefault();
                  handleAddItem(e);
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddItem}
              disabled={!newItemText.trim()}
              className="px-4"
            >
              Add
            </Button>
          </div>

          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {isEditMode &&
              checklistItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-2.5"
                >
                  <input
                    type="checkbox"
                    checked={!!item.isCompleted}
                    onChange={() => handleToggleItem(item.id)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span
                    className={cn(
                      "flex-1 text-sm",
                      item.isCompleted && "line-through text-gray-500"
                    )}
                  >
                    {item.item}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Button>
                </div>
              ))}

            {temporaryItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-2.5"
              >
                <input
                  type="checkbox"
                  checked={item.isCompleted}
                  onChange={() => handleToggleItem(item.id)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span
                  className={cn(
                    "flex-1 text-sm",
                    item.isCompleted && "line-through text-gray-500"
                  )}
                >
                  {item.text}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteItem(item.id)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
              </div>
            ))}

            {(!isEditMode && temporaryItems.length === 0) && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                <p className="text-sm text-gray-500">
                  No checklist items yet
                </p>
              </div>
            )}

            {(isEditMode && checklistItems.length === 0 && temporaryItems.length === 0 && !checklistLoading) && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                <p className="text-sm text-gray-500">
                  No checklist items. Start by adding one above.
                </p>
              </div>
            )}

            {(isEditMode && checklistLoading) && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                <p className="text-sm text-gray-500">
                  Loading checklist...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {(createTaskMutation.isError || updateTaskMutation.isError) && (
          <div className="rounded-lg bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700" role="alert">
            <p className="font-medium">Error</p>
            <p>Failed to {isEditMode ? "update" : "create"} task. Please try again.</p>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default TaskForm;
