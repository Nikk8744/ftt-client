import Avatar from "@/components/ui/Avatar";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { User } from "@/types";
import { Check } from "lucide-react";
import Button from "@/components/ui/Button";

interface AssignUserModalProps {
  assignUserModalOpen: boolean;
  setAssignUserModalOpen: (open: boolean) => void;
  selectedUserId: number | null;
  setSelectedUserId: (userId: number | null) => void;
  filterText: string;
  setFilterText: (text: string) => void;
  handleAssignUser: () => void;
  assignUserMutation: { isPending: boolean };
  projectMembersLoading: boolean;
  projectMembersData?: { data: User[] };
  isEditMode: boolean;
  selectedAssignees: User[];
}

export const AssignUserModal = ({
  assignUserModalOpen,
  setAssignUserModalOpen,
  selectedUserId,
  setSelectedUserId,
  filterText,
  setFilterText,
  handleAssignUser,
  assignUserMutation,
  projectMembersLoading,
  projectMembersData,
  isEditMode,
  selectedAssignees,
}: AssignUserModalProps) => {
  return (
    <Modal
      isOpen={assignUserModalOpen}
      onClose={() => {
        setAssignUserModalOpen(false);
        setSelectedUserId(null);
        setFilterText("");
      }}
      title="Assign User to Task"
      footer={
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setAssignUserModalOpen(false);
              setSelectedUserId(null);
              setFilterText("");
            }}
          >
            Cancel
          </Button>
          <Button
            variant="brandBtn"
            onClick={handleAssignUser}
            disabled={!selectedUserId || assignUserMutation.isPending}
            isLoading={assignUserMutation.isPending}
          >
            Assign
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <Input
            id="search"
            label="Filter Users:"
            placeholder="Filter by name or email..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            fullWidth={true}
          />
        </div>

        <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
          {projectMembersLoading ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 animate-pulse"
                >
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
                .filter(
                  (user: User) =>
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
                    className={`flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                      selectedUserId === user.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => setSelectedUserId(user.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-200">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    {selectedUserId === user.id && (
                      <Check className="w-5 h-5 text-blue-600" />
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
  );
};
