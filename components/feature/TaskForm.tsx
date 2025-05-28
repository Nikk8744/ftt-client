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
  title={isEditMode ? "Edit Task" : "Create New Task"} // Slightly more descriptive title
  footer={
    <>
      <Button variant="outline" onClick={onClose} className="mr-2"> {/* Added margin for spacing */}
        Cancel
      </Button>
      <Button
        variant="primary" // Assuming this is your main purple button
        onClick={handleSubmit(onSubmit)}
        isLoading={isPending}
        disabled={isPending}
      >
        {isEditMode ? "Save Changes" : "Create Task"} {/* More descriptive button text */}
      </Button>
    </>
  }
>
  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-1"> {/* Increased space-y and slight padding for form content */}
    {/* Task Name */}
    <Input
      id="subject"
      label="Task Name"
      placeholder="e.g., Finalize Q3 report"
      fullWidth
      error={errors.subject?.message}
      // Assuming Input component internally uses modern styling (rounded-lg, consistent py-2 px-3, focus:ring-purple-500 etc.)
      {...register("subject", {
        required: "Task name is required",
        minLength: {
          value: 3,
          message: "Task name must be at least 3 characters",
        },
        maxLength: {
          value: 70, // Slightly increased max length
          message: "Task name must be less than 70 characters",
        },
      })}
    />

    {/* Description */}
    <div>
      <label
        htmlFor="description"
        className="block text-sm font-medium text-gray-700 mb-1.5" // Slightly more margin
      >
        Description (Optional)
      </label>
      <textarea
        id="description"
        rows={4} // Increased rows for more space
        placeholder="Add more details about the task..."
        className={`w-full rounded-lg border ${ // Using rounded-lg
          errors.description ? "border-red-500 ring-1 ring-red-500" : "border-gray-300" // Added ring for error
        } shadow-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 py-2 px-3 transition-colors duration-150 ease-in-out`}
        {...register("description")}
      />
      {errors.description && (
        <p className="mt-1.5 text-sm text-red-600"> {/* Slightly more margin */}
          {errors.description.message}
        </p>
      )}
    </div>

    {/* Status and Due Date */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6"> {/* Adjusted gap for mobile */}
      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Status
        </label>
        <select
          id="status"
          className="w-full rounded-lg border border-gray-300 shadow-sm py-2.5 px-3 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 bg-white" // Added bg-white, increased py
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
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          Due Date (Optional)
        </label>
        <input
          type="datetime-local"
          id="dueDate"
          className="w-full rounded-lg border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500" // Matched select padding, py-2
          {...register("dueDate")}
        />
      </div>
    </div>

    {/* Assignee */}
    {currentUser && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Assignee
        </label>
        <div className="flex items-center space-x-3 border border-gray-200 rounded-lg p-2.5 bg-gray-50 shadow-sm"> {/* Softer border, more padding, shadow */}
          <Avatar name={currentUser.name} size="sm" /> {/* Assuming Avatar is styled */}
          <span className="text-sm font-medium text-gray-800">{currentUser.name}</span>
        </div>
        <input
          type="hidden"
          {...register("assignedUserId", { valueAsNumber: true })}
        />
      </div>
    )}

    {/* Checklist */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Checklist
      </label>

      <div className="flex gap-2 mb-3 items-center">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Add checklist item..."
          className="flex-grow rounded-lg border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
          onKeyDown={(e) => { if (e.key === 'Enter' && newItemText.trim()) { handleAddItem(e); e.preventDefault(); } }} // Add item on Enter
        />
        <Button
          variant="outline" // Assuming this is a subtle button (e.g. gray/purple outline)
          onClick={handleAddItem}
          disabled={!newItemText.trim()}
          className="px-4 py-2 text-sm" // Explicit padding for consistency
        >
          Add
        </Button>
      </div>

      <div className="space-y-2.5 max-h-40 overflow-y-auto p-0.5"> {/* Increased max-h, added p-0.5 for scrollbar space */}
        {/* Existing Checklist Items (Edit Mode) */}
        {isEditMode &&
          checklistItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg shadow-sm border border-slate-200" // Increased gap, softer bg, padding
            >
              <input
                type="checkbox"
                checked={!!item.isCompleted}
                onChange={() => handleToggleItem(item.id)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
              />
              <span
                className={`flex-grow text-sm ${
                  item.isCompleted ? "line-through text-gray-500" : "text-gray-800"
                }`}
              >
                {item.item}
              </span>
              <Button
                variant="outline" // Assuming a subtle danger button (e.g., red text, transparent bg)
                size="sm" // Assuming a smaller icon-like button size
                onClick={() => handleDeleteItem(item.id)}
                aria-label="Delete item"
                className="p-1 hover:bg-red-100 rounded-md" // ensure it's small
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-4 h-4 text-red-500">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          ))}

        {/* Temporary Checklist Items (Create/Edit Mode) */}
        {temporaryItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg shadow-sm border border-slate-200"
          >
            {editingItemId === item.id ? (
              <>
                <input // Checkbox placeholder while editing
                  type="checkbox"
                  checked={item.isCompleted}
                  disabled
                  className="h-4 w-4 border-gray-300 rounded invisible" // Keep space, but hide
                />
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) =>
                    handleEditTemporaryItem(item.id, e.target.value)
                  }
                  className="flex-grow rounded-md border border-purple-400 shadow-sm py-1.5 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500" // Highlighted border
                  autoFocus
                  onBlur={() => setEditingItemId(null)} // Consider saving on blur or requiring explicit save
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setEditingItemId(null); // Save on Enter
                      e.preventDefault();
                    } else if (e.key === "Escape") {
                      setEditingItemId(null); // Cancel edit on Escape
                      // You might want to revert changes here if not auto-saving
                      e.preventDefault();
                    }
                  }}
                />
                <Button
                  variant="primary" // Assuming a subtle save button
                  size="sm"
                  onClick={() => setEditingItemId(null)} // Save action
                  className="text-sm px-3 py-1.5"
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
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                />
                <span
                  className={`flex-grow text-sm cursor-pointer hover:text-purple-700 ${ // Make text clickable for edit
                    item.isCompleted ? "line-through text-gray-500 hover:text-gray-500" : "text-gray-800"
                  }`}
                  onClick={() => setEditingItemId(item.id)}
                >
                  {item.text}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteItem(item.id)}
                  aria-label="Delete item"
                  className="p-1 hover:bg-red-100 rounded-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-4 h-4 text-red-500">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </>
            )}
          </div>
        ))}
        
        {/* Empty States for Checklist */}
        {(!isEditMode && temporaryItems.length === 0) && (
          <p className="text-sm text-gray-500 italic p-2 text-center">
            No checklist items yet.
          </p>
        )}
        {(isEditMode && checklistItems.length === 0 && temporaryItems.length === 0 && !checklistLoading) && (
           <p className="text-sm text-gray-500 italic p-2 text-center">
            No checklist items. Start by adding one above.
          </p>
        )}
        {(isEditMode && checklistLoading) && (
          <p className="text-sm text-gray-500 italic p-2 text-center">
            Loading checklist...
          </p>
        )}
      </div>
    </div>

    {/* General Error Message for Form Submission */}
    {(createTaskMutation.isError || updateTaskMutation.isError) && (
      <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-md text-sm shadow-sm" role="alert"> {/* Enhanced alert styling */}
        <strong className="font-medium">Oops!</strong> Failed to {isEditMode ? "update" : "create"} task. Please check your input and try again.
      </div>
    )}
  </form>
</Modal>
  );
};

export default TaskForm;
