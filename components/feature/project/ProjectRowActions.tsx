import { Row } from "@tanstack/react-table";
import { Project } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Button  from "@/components/ui/Button";
import { Ellipsis, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import useAuthStore from "@/store/auth";

interface ProjectRowActionsProps {
  row: Row<Project>;
  onDelete: (projectId: number) => void;
  onEdit: (project: Project) => void;
}

export function ProjectRowActions({ row, onDelete, onEdit }: ProjectRowActionsProps) {
  const { user } = useAuthStore();
  const isOwner = user?.id === row.original.ownerId;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex justify-end">
          <Button size="icon" variant="ghost" className="shadow-none" aria-label="Open menu">
            <Ellipsis size={16} strokeWidth={2} aria-hidden="true" />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px] border border-gray-200 dark:border-gray-700">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href={`/projects/${row.original.id}`}>
            <DropdownMenuItem>
              <Eye size={16} strokeWidth={2} aria-hidden="true" />
              View Details
            </DropdownMenuItem>
          </Link>
          
          {isOwner && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(row.original)}>
                <Pencil size={16} strokeWidth={2} aria-hidden="true" />
                Edit Project
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuGroup>
        
        {isOwner && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(row.original.id)}
              >
                <Trash2 size={16} strokeWidth={2} aria-hidden="true" />
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 