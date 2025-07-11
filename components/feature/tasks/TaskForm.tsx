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
import { assignUserToTask, getTaskAssignees } from "@/services/taskMembers";
import { getAllMembersOfProject } from "@/services/projectMember";
import { X } from "lucide-react";
import Input from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AssignUserModal } from "./AssignUserModal";
import { useToast } from '@/components/ui/use-toast';

// Form validation schema
const taskSchema = z.object({
  subject: z
    .string()
    .min(3, "Task subject must be at least 3 characters")
    .max(50, "Task subject must be less than 50 characters"),
  description: z.string().optional(),
  status: z.enum(["Pending", "In-Progress", "Done"]),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]),
  dueDate: z
    .string()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid date",
    })
    .transform((val) => {
      if (!val) return undefined;
      
      // Set the time to 23:59:59 for the selected date
      const date = new Date(val);
      date.setHours(23, 59, 59, 999);
      return date.toISOString();
    })
    .optional(),
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
  const [isMounted, setIsMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsMounted(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsMounted(false);
    }
  }, [isOpen]);

  // Checklist state
  const [newItemText, setNewItemText] = useState("");
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [temporaryItems, setTemporaryItems] = useState<
    { id: string; text: string; isCompleted: boolean }[]
  >([]);
  // New state for temporary items in edit mode
  const [editModeTemporaryItems, setEditModeTemporaryItems] = useState<
    { id: string; text: string; isCompleted: boolean }[]
  >([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [dueDateError, setDueDateError] = useState<string | null>(null);
  
  // Assignee state
  const [assignUserModalOpen, setAssignUserModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [filterText, setFilterText] = useState('');

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

  // Get task assignees if in edit mode
  const { data: assigneeData } = useQuery({
    queryKey: ["taskAssignee", task?.id],
    queryFn: () => getTaskAssignees(Number(task?.id)),
    enabled: !!task?.id && isOpen,
  });

  // Get project members for assignee selection
  const { data: projectMembersData, isLoading: projectMembersLoading } = useQuery({
    queryKey: ["projectMembers", projectId],
    queryFn: async () => {
      return getAllMembersOfProject(projectId);
    },
    enabled: isOpen && assignUserModalOpen,
  });

  // Current assignees
  const assignees = assigneeData?.data || [];

  // For new tasks, store selected assignees until task is created
  const [selectedAssignees, setSelectedAssignees] = useState<User[]>([]);
  
  useEffect(() => {
    // Add current user as default assignee for new tasks
    if (!isEditMode && currentUser && selectedAssignees.length === 0) {
      setSelectedAssignees([currentUser]);
    }
  }, [currentUser, isEditMode, selectedAssignees.length]);

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      subject: task?.subject || "",
      description: task?.description || "",
      status: task?.status || "Pending",
      priority: task?.priority || "Medium",
      dueDate: task?.dueDate ? task.dueDate.split('T')[0] : "", // Only use date part without time for display
    },
  });

  // Watch status for conditionally displaying completedAt
  const currentStatus = form.watch("status");

  // Fetch existing checklist items if editing a task
  const { data: checklistData, isLoading: checklistLoading } = useQuery<{ data: ChecklistItem[] }, Error>({
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
    if (checklistData?.data) {
      setChecklistItems(checklistData.data);
    }
  }, [checklistData]);

  // Reset temporary items when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      setTemporaryItems([]);
      setEditModeTemporaryItems([]);
    }
  }, [isOpen]);

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      // Ensure all required fields are present and properly formatted
      const taskData: TaskCreateData = {
        subject: data.subject.trim(),
        description: data.description?.trim() || undefined,
        status: data.status || "Pending",
        priority: data.priority || "Medium",
        dueDate: data.dueDate, // No need to modify here as it's already set to end of day in the schema
        // Include checklist items if there are any
        checklistItems: temporaryItems.length > 0 ? temporaryItems.map(item => item.text) : undefined
      };

      try {
        const response = await createTask(projectId, taskData);
        console.log("Task creation response:", response);

        // Assign all selected users to the task
        if (response.task && selectedAssignees.length > 0) {
          const newTaskId = response.task.id;
          const assignPromises = selectedAssignees.map(user => 
            assignUserToTask(newTaskId, user.id)
          );
          await Promise.all(assignPromises);
        }

        return response;
      } catch (error) {
        console.error("Error in task creation:", error);
        if (axios.isAxiosError(error)) {
          console.log("🚀 ~ mutationFn: ~ error:", error)
          console.error("Error response:", error.response?.data.message);
          const errorData = error.response?.data;
          if (errorData?.message?.includes("Due date") || errorData?.errors?.dueDate) {
            console.log("🚀 ~ mutationFn: ~ errorData:", errorData)
            setDueDateError(errorData?.errors?.dueDate || errorData?.message || "Invalid due date");
          }
          // Throw a more descriptive error
          throw new Error(
            error.response?.data.message
          );
        }
        throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: 'Task created',
        description: 'Your task has been created successfully.'
      });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["assignedTasks"] });
      onClose();
      form.reset();
      setTemporaryItems([]);
      setSelectedAssignees([]);
      setDueDateError(null);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create task. Please try again.',
        variant: 'destructive'
      });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (data: TaskFormData) => {
      // First update the task
      const updatedTask = await updateTask(task!.id, data);
      
      // Then add any new checklist items
      if (editModeTemporaryItems.length > 0) {
        const promises = editModeTemporaryItems.map((item) =>
          addChecklistItem({ taskId: task!.id, item: item.text })
        );
        await Promise.all(promises);
      }
      
      return updatedTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["assignedTasks"] });
      queryClient.invalidateQueries({ queryKey: ["checklist", task!.id] });
      setDueDateError(null);
      setEditModeTemporaryItems([]);
      onClose();
    },
    onError: (error) => {
      console.error("Error updating task:", error);
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data;
        if (errorData?.message?.includes("due date") || errorData?.errors?.dueDate) {
          setDueDateError(errorData?.errors?.dueDate || errorData?.message || "Invalid due date");
        }
      }
    },
  });

  // Assign user mutation
  const assignUserMutation = useMutation({
    mutationFn: (userId: number) => assignUserToTask(Number(task?.id), userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskAssignee", task?.id] });
      setAssignUserModalOpen(false);
      setSelectedUserId(null);
    },
  });

  // We'll use this function in the updateTaskMutation instead of a separate mutation

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
      // For existing tasks, store items temporarily until Save Changes is clicked
      setEditModeTemporaryItems([
        ...editModeTemporaryItems,
        {
          id: `temp-edit-${Date.now()}`,
          text: newItemText.trim(),
          isCompleted: false,
        },
      ]);
      setNewItemText("");
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
      // Check if it's a temporary item in edit mode
      if (id.startsWith('temp-edit-') && isEditMode) {
        setEditModeTemporaryItems(
          editModeTemporaryItems.map((item) =>
            item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
          )
        );
      } else {
        // Toggle temporary item for new task
        setTemporaryItems(
          temporaryItems.map((item) =>
            item.id === id ? { ...item, isCompleted: !item.isCompleted } : item
          )
        );
      }
    }
  };

  const handleDeleteItem = (id: number | string) => {
    if (typeof id === "number" && isEditMode) {
      // Delete existing item from database
      deleteItemMutation.mutate(id);
    } else if (typeof id === "string") {
      // Check if it's a temporary item in edit mode
      if (id.startsWith('temp-edit-') && isEditMode) {
        setEditModeTemporaryItems(editModeTemporaryItems.filter((item) => item.id !== id));
      } else {
        // Delete temporary item for new task
        setTemporaryItems(temporaryItems.filter((item) => item.id !== id));
      }
    }
  };

  // Handle assign user
  const handleAssignUser = () => {
    if (selectedUserId) {
      if (isEditMode) {
        // For edit mode, use API to assign user
        assignUserMutation.mutate(selectedUserId);
      } else {
        // For create mode, store in local state until task is created
        const userToAdd = projectMembersData?.data?.find(
          (member: User) => member.id === selectedUserId
        );
        
        if (userToAdd && !selectedAssignees.some(user => user.id === userToAdd.id)) {
          setSelectedAssignees([...selectedAssignees, userToAdd]);
        }
        
        setAssignUserModalOpen(false);
        setSelectedUserId(null);
        setFilterText('');
      }
    }
  };

  // Remove assigned user (only for create mode)
  const handleRemoveAssignee = (userId: number) => {
    if (!isEditMode) {
      setSelectedAssignees(selectedAssignees.filter(user => user.id !== userId));
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
        variant="brandBtn"
        onClick={form.handleSubmit(onSubmit)}
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
      <div className="relative">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
            {/* Task Name */}
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter task name"
                      {...field}
                      className="w-full"
                      fullWidth={true}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add more details about the task..."
                      className="w-full resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status, Priority and Due Date */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    {isMounted && (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="z-[9999]">
                          <SelectItem value="Pending">Not Started</SelectItem>
                          <SelectSeparator className="bg-gray-200 dark:bg-gray-600" />
                          <SelectItem value="In-Progress">In Progress</SelectItem>
                          <SelectSeparator className="bg-gray-200 dark:bg-gray-600" />
                          <SelectItem value="Done">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    {isMounted && (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="z-[9999]">
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectSeparator className="bg-gray-200 dark:bg-gray-600" />
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectSeparator className="bg-gray-200 dark:bg-gray-600" />
                          <SelectItem value="High">High</SelectItem>
                          <SelectSeparator className="bg-gray-200 dark:bg-gray-600" />
                          <SelectItem value="Urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-4">
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="w-full"
                        {...field}
                        size="sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Completion Date - Show only when status is Done and in edit mode */}
            {isEditMode && currentStatus === "Done" && task?.completedAt && (
              <div className="rounded-md bg-green-50 dark:bg-green-900/30 p-3 text-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400 dark:text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-green-800 dark:text-green-300">Task Completed</h3>
                    <div className="mt-1 text-green-700 dark:text-green-400">
                      This task was completed on {new Date(task.completedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Assignees Section */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                  Assignees
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAssignUserModalOpen(true)}
                  className="text-xs"
                >
                  {isEditMode 
                    ? (assignees.length > 0 ? "Add More" : "Assign") 
                    : (selectedAssignees.length > 0 ? "Add More" : "Assign")}
                </Button>
              </div>
              
              {isEditMode ? (
                assignees.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {assignees.map((assignee: User) => (
                      <div key={assignee.id} className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-2.5">
                        <Avatar name={assignee.name} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {assignee.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {assignee.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No assignees yet. Click &quote;Assign&quote; to add users.
                    </p>
                  </div>
                )
              ) : (
                // For new tasks, show selected assignees
                selectedAssignees.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedAssignees.map((assignee: User) => (
                      <div key={assignee.id} className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-2.5">
                        <Avatar name={assignee.name} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {assignee.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {assignee.email}
                          </p>
                        </div>
                        {selectedAssignees.length > 0 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAssignee(assignee.id)}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No assignees yet. Click &quote;Assign&quote; to add users.
                    </p>
                  </div>
                )
              )}
            </div>

            {/* Checklist */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                Checklist
              </label>

              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="Add checklist item..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newItemText.trim()) {
                      e.preventDefault();
                      handleAddItem(e);
                    }
                  }}
                  fullWidth={true}
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
                      className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-2.5"
                    >
                      <Checkbox
                        id={`item-${item.id}`}
                        checked={!!item.isCompleted}
                        onCheckedChange={() => handleToggleItem(item.id)}
                        className="h-4 w-4"
                      />
                      <label
                        htmlFor={`item-${item.id}`}
                        className={cn(
                          "flex-1 text-sm cursor-pointer dark:text-gray-300",
                          item.isCompleted && "line-through text-gray-500 dark:text-gray-400"
                        )}
                      >
                        {item.item}
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}

                {/* Render temporary items for edit mode */}
                {isEditMode && editModeTemporaryItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-2.5"
                  >
                    <Checkbox
                      id={`temp-item-${item.id}`}
                      checked={item.isCompleted}
                      onCheckedChange={() => handleToggleItem(item.id)}
                      className="h-4 w-4"
                    />
                    <label
                      htmlFor={`temp-item-${item.id}`}
                      className={cn(
                        "flex-1 text-sm cursor-pointer dark:text-gray-300",
                        item.isCompleted && "line-through text-gray-500 dark:text-gray-400"
                      )}
                    >
                      {item.text}
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-gray-400 hover:text-gray-500"
                    >                  
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}

                {/* Render temporary items for create mode */}
                {!isEditMode && temporaryItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-2.5"
                  >
                    <Checkbox
                      id={`temp-item-${item.id}`}
                      checked={item.isCompleted}
                      onCheckedChange={() => handleToggleItem(item.id)}
                      className="h-4 w-4"
                    />
                    <label
                      htmlFor={`temp-item-${item.id}`}
                      className={cn(
                        "flex-1 text-sm cursor-pointer dark:text-gray-300",
                        item.isCompleted && "line-through text-gray-500 dark:text-gray-400"
                      )}
                    >
                      {item.text}
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-gray-400 hover:text-gray-500"
                    >                  
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}

                {(!isEditMode && temporaryItems.length === 0) && (
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No checklist items yet
                    </p>
                  </div>
                )}

                {(isEditMode && checklistItems.length === 0 && editModeTemporaryItems.length === 0 && !checklistLoading) && (
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No checklist items. Start by adding one above.
                    </p>
                  </div>
                )}

                {(isEditMode && checklistLoading) && (
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Loading checklist...
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Error Message */}
            {(createTaskMutation.isError || updateTaskMutation.isError || dueDateError) && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 dark:border-red-500/50 p-4 text-sm text-red-700 dark:text-red-400" role="alert">
                <p className="font-medium">Error</p>
                {dueDateError ? (
                  <p>{dueDateError}</p>
                ) : (
                  <p>Failed to {isEditMode ? "update" : "create"} task. Please try again.</p>
                )}
              </div>
            )}
          </form>
        </Form>
      </div>

      {/* Assign User Modal */}
      <AssignUserModal
        assignUserModalOpen={assignUserModalOpen}
        setAssignUserModalOpen={setAssignUserModalOpen}
        selectedUserId={selectedUserId}
        setSelectedUserId={setSelectedUserId}
        filterText={filterText}
        setFilterText={setFilterText}
        handleAssignUser={handleAssignUser}
        assignUserMutation={assignUserMutation}
        projectMembersLoading={projectMembersLoading}
        projectMembersData={projectMembersData}
        isEditMode={isEditMode}
        selectedAssignees={selectedAssignees}
      />
    </Modal>
  );
};

export default TaskForm;
