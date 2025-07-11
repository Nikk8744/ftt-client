import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
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
import { useEffect, useState } from "react";
import { useToast } from '@/components/ui/use-toast';

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
  status: z.enum(["Pending", "In-Progress", "Completed"]),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function CreateProjectModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  error = null,
}: CreateProjectModalProps) {
  // Add a state to track if the modal is fully mounted
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    // Set mounted state after a small delay to ensure the modal is fully rendered
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsMounted(true);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setIsMounted(false);
    }
  }, [isOpen]);

  const { toast } = useToast();

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Default 30 days from now
      status: "Pending",
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = async (data: ProjectFormData) => {
    try {
      await onSubmit(data);
      toast({
        title: 'Project created',
        description: 'Your project has been created successfully.'
      });
      handleClose();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create project. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Project"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="px-4 py-2"
          >
            Cancel
          </Button>
          <Button
            variant="brandBtn"
            onClick={form.handleSubmit(handleSubmit)}
            isLoading={isLoading}
            disabled={isLoading}
            className="px-4 py-2"
          >
            Create
          </Button>
        </div>
      }
    >
      <div className="relative">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-5 py-2 w-full"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter project name"
                      {...field}
                      className="w-full"
                      fullWidth={true}
                      size="sm"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter project description"
                      className="w-full resize-none"
                      rows={3}
                      {...field}

                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
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

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
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
                      <SelectContent className="z-[9999] border border-gray-200 dark:border-gray-700">
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectSeparator className="bg-gray-200 dark:bg-gray-600"/>
                        <SelectItem value="In-Progress">In Progress</SelectItem>
                        <SelectSeparator className="bg-gray-200 dark:bg-gray-600" />
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/50 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </form>
        </Form>
      </div>
    </Modal>
  );
}
