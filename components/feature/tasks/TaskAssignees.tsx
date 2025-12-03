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
    <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
            <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground mb-0">
              Assignees
            </h3>
            {assignees.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {assignees.length} {assignees.length === 1 ? 'person' : 'people'} assigned
              </p>
            )}
          </div>
          {assignees.length > 0 && (
            <Badge variant="success" className="text-xs font-semibold">
              {assignees.length}
            </Badge>
          )}
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={() => setAssignUserModalOpen(true)}
          className="text-xs font-medium shadow-sm hover:shadow-md transition-shadow"
        >
          <UserPlus className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">
            {assignees.length > 0 ? "Add More" : "Assign"}
          </span>
          <span className="md:hidden">
            {assignees.length > 0 ? "Add" : "Assign"}
          </span>
        </Button>
      </div>
      
      {assigneeLoading ? (
        <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse flex-shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
          </div>
        </div>
      ) : assignees.length > 0 ? (
        <div className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
          {assignees.map((assignee: User) => (
            <div
              key={assignee.id}
              className="group flex items-center justify-between p-2 sm:p-3 bg-white dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="relative flex-shrink-0">
                  <Avatar name={assignee.name} size="xs" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs lg:text-sm mb-0 font-semibold text-foreground truncate">
                    {assignee.name}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <p className="text-xs text-muted-foreground truncate mb-0">
                      {assignee.email}
                    </p>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleUnassignUser(assignee.id)}
                disabled={unassignUserMutation.isPending}
                className="opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 flex-shrink-0 ml-2"
              >
                <X className="w-4 h-4 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 px-4">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-base font-semibold text-foreground mb-2">No assignees yet</h4>
          <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
            This task hasn&apost been assigned to anyone. Click the button above to assign team members.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAssignUserModalOpen(true)}
            className="text-xs"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Assign Team Member
          </Button>
        </div>
      )}
    </Card>
  );
};
