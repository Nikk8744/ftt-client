import { useState } from "react";
import { TimeLog, Project, Task, User } from "@/types";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Button from "@/components/ui/Button";
import { Clock, Edit, Trash2, ChevronLeft, ChevronRight, User as UserIcon } from "lucide-react";
import { formatDate, formatDuration } from "@/lib/utils";
import Link from "next/link";
import { cn } from "@/lib/utils";
import useAuthStore from "@/store/auth";

interface LogsTableProps {
  data: TimeLog[];
  projects: Project[];
  tasks: Task[];
  users?: User[];
  isLoading?: boolean;
  showActions?: boolean;
  showPagination?: boolean;
  onEdit?: (log: TimeLog) => void;
  onDelete?: (log: TimeLog) => void;
}

export function LogsTable({
  data,
  projects,
  tasks,
  users = [],
  showActions = true,
  showPagination = true,
  onEdit,
  onDelete,
}: LogsTableProps) {
  const { user: currentUser } = useAuthStore();
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "startTime",
      desc: true,
    },
  ]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  
  const columns: ColumnDef<TimeLog>[] = [
    {
      header: "Date",
      accessorKey: "startTime",
      cell: ({ row }) => formatDate(row.getValue("startTime")),
      size: 120,
    },
    {
      header: "Project",
      accessorKey: "projectId",
      cell: ({ row }) => {
        const log = row.original;
        const projectId = log.projectId;
        
        if (!projectId) return "No Project";
        
        // Use projectName from log data if available
        const projectName = log.projectName || projects.find(p => p.id === projectId)?.name || "Unknown Project";
        
        return (
          <Link href={`/projects/${projectId}`} className="hover:underline text-blue-600">
            {projectName}
          </Link>
        );
      },
      size: 150,
    },
    {
      header: "Task",
      accessorKey: "taskId",
      cell: ({ row }) => {
        const log = row.original;
        const taskId = log.taskId;
        
        if (!taskId) return "No Task";
        
        // Use taskName from log data if available
        const taskName = log.taskName || tasks.find(t => t.id === taskId)?.subject || "Unknown Task";
        
        return (
          <Link href={`/tasks/${taskId}`} className="hover:underline text-blue-600">
            {taskName}
          </Link>
        );
      },
      size: 200,
    },
    {
      header: "User",
      accessorKey: "userId",
      cell: ({ row }) => {
        const log = row.original;
        const userId = log.userId;
        
        // Get user name from multiple sources in order of priority
        let userName = log.userName;
        
        if (!userName) {
          if (currentUser && currentUser.id === userId) {
            userName = currentUser.name;
          } else {
            const user = users.find(u => u.id === userId);
            userName = user ? user.name : `Unknown User`;
          }
        }
        
        return (
          <div className="flex items-center gap-1.5">
            <UserIcon className="h-3.5 w-3.5 text-gray-500" />
            <span>{userName}</span>
          </div>
        );
      },
      size: 150,
    },
    {
      header: "Duration",
      accessorKey: "timeSpent",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-indigo-500" />
          <span className="font-medium">
            {row.getValue("timeSpent") ? formatDuration(row.getValue("timeSpent")) : "In Progress"}
          </span>
        </div>
      ),
      size: 120,
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return description ? (
          <span className="line-clamp-1">{description}</span>
        ) : (
          <span className="text-gray-400 italic">No description</span>
        );
      },
      size: 200,
    },
  ];

  // Add actions column if needed
  if (showActions && (onEdit || onDelete)) {
    columns.push({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex justify-start gap-2">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(row.original)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4 text-blue-500" />
              <span className="sr-only">Edit</span>
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(row.original)}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          )}
        </div>
      ),
      size: 100,
    });
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      <Table className="border-collapse">
        <TableHeader className="bg-gray-50 dark:bg-gray-800">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="border-b border-gray-200 dark:border-gray-700">
              {headerGroup.headers.map((header) => (
                <TableHead 
                  key={header.id} 
                  style={{ width: `${header.getSize()}px` }}
                  className="border-r border-gray-200 dark:border-gray-700 last:border-r-0 text-gray-700 dark:text-gray-300"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell 
                    key={cell.id}
                    className="border-r border-gray-200 dark:border-gray-700 last:border-r-0"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-gray-500 dark:text-gray-400"
              >
                No logs found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {showPagination && data.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              data.length
            )} of {data.length} logs
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className={cn("h-6 w-6 p-0", 
                !table.getCanPreviousPage() ? "border-gray-100" : "border-gray-200"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium">
              Page <span className="font-medium">{table.getState().pagination.pageIndex + 1}</span> of <span className="font-medium">{table.getPageCount()}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className={cn("h-6 w-6 p-0", 
                !table.getCanNextPage() ? "border-gray-100" : "border-gray-200"
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
