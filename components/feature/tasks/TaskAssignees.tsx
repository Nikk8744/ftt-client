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
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-0">
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
          <div className="w-10 h-10 bg-muted rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-muted rounded mb-2"></div>
            <div className="h-3 bg-muted rounded w-2/3"></div>
          </div>
        </div>
      ) : assignees.length > 0 ? (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {assignees.map((assignee: User) => (
            <div
              key={assignee.id}
              className="flex items-center justify-between p-2 sm:p-3 bg-muted rounded-lg"
            >
              <div className="flex flex-col items-start gap-2 sm:gap-3">
                <div className="flex flex-row gap-3 items-center justify-center">
                <Avatar name={assignee.name} size="sm" />
                  <p className="text-xs sm:text-sm font-semibold text-foreground truncate m-0">
                    {assignee.name}
                  </p>
                </div>
                  <p className="pl-11 text-xs text-muted-foreground truncate hidden sm:block">
                    {assignee.email}
                  </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleUnassignUser(assignee.id)}
                disabled={unassignUserMutation.isPending}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">No assignees</p>
          <p className="text-xs text-muted-foreground">
            This task hasn&apos;t been assigned yet
          </p>
        </div>
      )}
    </Card>
  );
};
