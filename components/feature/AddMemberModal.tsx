import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

// Form validation schema
const memberSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

type MemberFormData = z.infer<typeof memberSchema>;

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MemberFormData) => void;
  isLoading?: boolean;
  error?: string | null;
  isOwner?: boolean;
}

export default function AddMemberModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  error = null,
  isOwner = true,
}: AddMemberModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      userId: "",
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Team Member"
      footer={
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={handleClose}
            className="px-4 py-2 text-sm"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSubmit(onSubmit)}
            className="px-4 py-2 text-sm"
            isLoading={isLoading}
            disabled={isLoading}
          >
            Add Member
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="userId"
          label="User ID"
          placeholder="Enter user ID to add"
          error={errors.userId?.message}
          {...register("userId")}
        />
        
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        <div className="text-sm text-gray-500 bg-blue-50 p-3 rounded-md border border-blue-100">
          <p>Note: You need to know the user ID to add them to this project. {!isOwner && "Only the project owner can add members."}</p>
        </div>
      </form>
    </Modal>
  );
} 