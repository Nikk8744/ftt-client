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
import { Label } from "@/components/ui/label";

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

const   TaskForm = ({
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

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      subject: task?.subject || "",
      description: task?.description || "",
      status: task?.status || "Pending",
      dueDate: task?.dueDate ? task.dueDate : new Date().toISOString().slice(0, 16),
    },
  });

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
  console.log("🚀 ~ checklistData:", checklistData)

  // Load checklist items when available
  useEffect(() => {
    if (checklistData?.data) {
      setChecklistItems(checklistData.data);
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
      };

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
        // console.error("Error in task creation:", error.response?.data);
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
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["assignedTasks"] });
      onClose();
      reset();
      setTemporaryItems([]);
      setSelectedAssignees([]);
      setDueDateError(null);
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
      queryClient.invalidateQueries({ queryKey: ["assignedTasks"] });
      queryClient.invalidateQueries({ queryKey: ["checklist", task!.id] });
      setDueDateError(null);
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
          <Label htmlFor="subject" className="text-sm font-medium text-gray-900">
            Task Name
          </Label>
          <Input
            id="subject"
            placeholder="Enter task name"
            className={errors.subject ? "border-red-500" : ""}
            {...register("subject")}
          />
          {errors.subject && (
            <p className="text-sm text-red-600">{errors.subject.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-sm font-medium text-gray-900">
            Description (Optional)
          </Label>
          <div className="relative">
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
        </div>

        {/* Status and Due Date */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="status" className="text-sm font-medium text-gray-900">
              Status
            </Label>
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
            <Label htmlFor="dueDate" className="text-sm font-medium text-gray-900">
              Due Date  
            </Label>
            <Input
              type="datetime-local"
              id="dueDate"
              {...register("dueDate")}
            />
          </div>
        </div>

        {/* Assignees Section */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-900">
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
                  <div key={assignee.id} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-2.5">
                    <Avatar name={assignee.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {assignee.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {assignee.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                <p className="text-sm text-gray-500">
                  No assignees yet. Click &quot;Assign&quot; to add users.
                </p>
              </div>
            )
          ) : (
            // For new tasks, show selected assignees
            selectedAssignees.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedAssignees.map((assignee: User) => (
                  <div key={assignee.id} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-2.5">
                    <Avatar name={assignee.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {assignee.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
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
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
                <p className="text-sm text-gray-500">
                  No assignees yet. Click &quot;Assign&quot; to add users.
                </p>
              </div>
            )
          )}
        </div>

        {/* Checklist */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-900">
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
                    <X className="h-4 w-4 text-red-500" />
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
                  <X className="h-4 w-4 text-red-500" />
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
        {(createTaskMutation.isError || updateTaskMutation.isError || dueDateError) && (
          <div className="rounded-lg bg-red-50 border-l-4 border-red-400 p-4 text-sm text-red-700" role="alert">
            <p className="font-medium">Error</p>
            {dueDateError ? (
              <p>{dueDateError}</p>
            ) : (
              <p>Failed to {isEditMode ? "update" : "create"} task. Please try again.</p>
            )}
          </div>
        )}
      </form>

      {/* Assign User Modal */}
      <Modal
        isOpen={assignUserModalOpen}
        onClose={() => {
          setAssignUserModalOpen(false);
          setSelectedUserId(null);
          setFilterText('');
        }}
        title="Assign User to Task"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setAssignUserModalOpen(false);
                setSelectedUserId(null);
                setFilterText('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleAssignUser}
              disabled={!selectedUserId || (isEditMode && assignUserMutation.isPending)}
              isLoading={isEditMode && assignUserMutation.isPending}
            >
              Assign
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="search" className="text-sm font-medium text-gray-700 mb-1">
              Filter Users
            </Label>
            <Input
              type="text"
              id="search"
              placeholder="Filter by name or email..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
            {projectMembersLoading ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded mb-1"></div>
                      <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : projectMembersData?.data && projectMembersData.data.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {projectMembersData.data
                  .filter((user: User) => 
                    !filterText || 
                    user.name.toLowerCase().includes(filterText.toLowerCase()) || 
                    user.email.toLowerCase().includes(filterText.toLowerCase())
                  )
                  // For create mode, exclude already selected users
                  .filter((user: User) => 
                    isEditMode || !selectedAssignees.some(assignee => assignee.id === user.id)
                  )
                  .map((user: User) => (
                    <div 
                      key={user.id}
                      className={`flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer transition-colors ${selectedUserId === user.id ? 'bg-blue-50' : ''}`}
                      onClick={() => setSelectedUserId(user.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      {selectedUserId === user.id && (
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          asasasdasd
                        </svg>
                        
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p>No project members found</p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </Modal>
  );
};

export default TaskForm;
