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
import { Ellipsis } from "lucide-react";
import Link from "next/link";

interface ProjectRowActionsProps {
  row: Row<Project>;
  onDelete: (projectId: number) => void;
  onEdit: (project: Project) => void;
}

export function ProjectRowActions({ row, onDelete, onEdit }: ProjectRowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex justify-end">
          <Button size="icon" variant="ghost" className="shadow-none" aria-label="Open menu">
            <Ellipsis size={16} strokeWidth={2} aria-hidden="true" />
          </Button>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuGroup>
          <Link href={`/projects/${row.original.id}`}>
            <DropdownMenuItem>View Details</DropdownMenuItem>
          </Link>
          <DropdownMenuItem onClick={() => onEdit(row.original)}>Edit Project</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem 
            className="text-destructive focus:text-destructive"
            onClick={() => onDelete(row.original.id)}
          >
            Delete Project
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 