import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTask, updateTask } from "@/services/task";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
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

const TaskForm: React.FC<TaskFormProps> = ({
  projectId,
  task,
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const isEditMode = !!task;

  // Checklist state
  const [newItemText, setNewItemText] = useState("");
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [temporaryItems, setTemporaryItems] = useState<
    { id: string; text: string; isCompleted: boolean }[]
  >([]);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
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
    // watch,
    setValue,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      subject: task?.subject || "",
      description: task?.description || "",
      status: task?.status || "Pending",
      // dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
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
  const { data: checklistData, isLoading: checklistLoading } = useQuery({
    queryKey: ["checklist", task?.id],
    queryFn: () => (task ? getTaskChecklist(task.id) : null),
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

  const handleEditTemporaryItem = (id: string, text: string) => {
    setTemporaryItems(
      temporaryItems.map((item) => (item.id === id ? { ...item, text } : item))
    );
    setEditingItemId(null);
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Task" : "Create Task"}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            isLoading={isPending}
            disabled={isPending}
          >
            {isEditMode ? "Save" : "Create"}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="subject"
          label="Task Name"
          placeholder="Enter task name..."
          fullWidth
          error={errors.subject?.message}
          {...register("subject", {
            required: "Task subject is required",
            minLength: {
              value: 3,
              message: "Task subject must be at least 3 characters",
            },
            maxLength: {
              value: 50,
              message: "Task subject must be less than 50 characters",
            },
          })}
        />

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            placeholder="Add description..."
            className={`w-full rounded-md border ${
              errors.description ? "border-red-500" : "border-gray-300"
            } shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2 px-3`}
            {...register("description")}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status
            </label>
            <select
              id="status"
              className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              {...register("status")}
            >
              <option value="Pending">Not Started</option>
              <option value="In-Progress">In Progress</option>
              <option value="Done">Completed</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="dueDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Due Date
            </label>
            <input
              type="datetime-local"
              id="dueDate"
              className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              {...register("dueDate")}
            />
          </div>
        </div>

        {currentUser && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assignee
            </label>
            <div className="flex items-center space-x-2 border border-gray-300 rounded-md p-2 bg-gray-50">
              <Avatar name={currentUser.name} size="sm" />
              <span className="text-sm font-medium">{currentUser.name}</span>
            </div>
            <input
              type="hidden"
              {...register("assignedUserId", { valueAsNumber: true })}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Checklist
          </label>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="Add checklist item..."
              className="flex-grow rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
            <Button
              variant="outline"
              onClick={handleAddItem}
              disabled={!newItemText.trim()}
            >
              Add
            </Button>
          </div>

          <div className="space-y-2 max-h-32 overflow-y-auto">
            {isEditMode &&
              checklistItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 bg-gray-50 p-2 rounded-md"
                >
                  <input
                    type="checkbox"
                    checked={!!item.isCompleted}
                    onChange={() => handleToggleItem(item.id)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <span
                    className={`flex-grow ${
                      item.isCompleted ? "line-through text-gray-500" : ""
                    }`}
                  >
                    {item.item}
                  </span>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    ✕
                  </Button>
                </div>
              ))}

            {temporaryItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 bg-gray-50 p-2 rounded-md"
              >
                {editingItemId === item.id ? (
                  <>
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) =>
                        handleEditTemporaryItem(item.id, e.target.value)
                      }
                      className="flex-grow rounded-md border border-gray-300 shadow-sm py-1 px-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      autoFocus
                      onBlur={() => setEditingItemId(null)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          setEditingItemId(null);
                        }
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingItemId(null)}
                    >
                      Save
                    </Button>
                  </>
                ) : (
                  <>
                    <input
                      type="checkbox"
                      checked={item.isCompleted}
                      onChange={() => handleToggleItem(item.id)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span
                      className={`flex-grow ${
                        item.isCompleted ? "line-through text-gray-500" : ""
                      }`}
                      onClick={() => setEditingItemId(item.id)}
                    >
                      {item.text}
                    </span>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      ✕
                    </Button>
                  </>
                )}
              </div>
            ))}

            {!isEditMode && temporaryItems.length === 0 && (
              <p className="text-sm text-gray-500 italic p-2">
                No checklist items. Add some using the field above.
              </p>
            )}

            {isEditMode &&
              checklistItems.length === 0 &&
              temporaryItems.length === 0 &&
              !checklistLoading && (
                <p className="text-sm text-gray-500 italic p-2">
                  No checklist items. Add some using the field above.
                </p>
              )}

            {isEditMode && checklistLoading && (
              <p className="text-sm text-gray-500 italic p-2">
                Loading checklist items...
              </p>
            )}
          </div>
        </div>

        {(createTaskMutation.isError || updateTaskMutation.isError) && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
            Failed to {isEditMode ? "update" : "create"} task. Please try again.
          </div>
        )}
      </form>
    </Modal>
  );
};

export default TaskForm;
