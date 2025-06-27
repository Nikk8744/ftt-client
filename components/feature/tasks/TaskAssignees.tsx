import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { User } from "@/types";
import { UseMutationResult } from "@tanstack/react-query";
import { UserPlus, Users, X } from "lucide-react";
import React from "react";

interface TaskAssigneesProps {
  assignees: User[];
  assigneeLoading: boolean;
  setAssignUserModalOpen: (open: boolean) => void;
  handleUnassignUser: (userId: number) => void;
  unassignUserMutation: UseMutationResult<void, Error, number>;
}

export const TaskAssignees = ({
  assignees,
  assigneeLoading,
  setAssignUserModalOpen,
  handleUnassignUser,
  unassignUserMutation,
}: TaskAssigneesProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-green-600" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-0">
            Assignees
          </h3>
          {assignees.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {assignees.length}
            </Badge>
          )}
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={() => setAssignUserModalOpen(true)}
          className="text-xs"
        >
          <UserPlus className="h-4 w-4 md:mr-1" />
          <span className="hidden md:inline">
            {assignees.length > 0 ? "Add More" : "Assign"}
          </span>
        </Button>
      </div>
      {assigneeLoading ? (
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      ) : assignees.length > 0 ? (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {assignees.map((assignee: User) => (
            <div
              key={assignee.id}
              className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <Avatar name={assignee.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                    {assignee.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate hidden sm:block">
                    {assignee.email}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleUnassignUser(assignee.id)}
                disabled={unassignUserMutation.isPending}
                className="text-red-500 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">No assignees</p>
          <p className="text-xs text-gray-400">
            This task hasn&apos;t been assigned yet
          </p>
        </div>
      )}
    </Card>
  );
};
