import { useState } from "react";
import { TimeLog, Project, Task } from "@/types";
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
import { Clock, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate, formatDuration } from "@/lib/utils";
import Link from "next/link";

interface LogsTableProps {
  data: TimeLog[];
  projects: Project[];
  tasks: Task[];
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
  showActions = true,
  showPagination = true,
  onEdit,
  onDelete,
}: LogsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "startTime",
      desc: true,
    },
  ]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Get project name by ID
  const getProjectName = (projectId: number) => {
    const project = projects.find((p) => p.id === projectId);
    return project ? project.name : "Unknown Project";
  };

  // Get task subject by ID
  const getTaskSubject = (taskId: number) => {
    console.log("🚀 ~ getTaskSubject ~ taskId:", taskId)
    console.log("🚀 ~ getTaskSubject ~ task:", tasks)
    const task = tasks.find((t) => t.id === taskId);
    return task ? task.subject : "No Task";
  };

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
        const projectId = row.getValue("projectId") as number;
        return (
          <Link href={`/projects/${projectId}`} className="hover:underline text-blue-600">
            {getProjectName(projectId)}
          </Link>
        );
      },
      size: 150,
    },
    {
      header: "Task",
      accessorKey: "taskId",
      cell: ({ row }) => {
        const taskId = row.original.taskId;
        console.log("🚀 ~ taskId from original:", taskId);
        return taskId ? (
          <Link href={`/tasks/${taskId}`} className="hover:underline text-blue-600">
            {getTaskSubject(taskId)}
          </Link>
        ) : (
          "No Task"
        );
      },
      size: 200,
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
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} style={{ width: `${header.getSize()}px` }}>
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
                className="hover:bg-gray-50/50"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
              >
                No logs found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {showPagination && data.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
          <div className="text-sm text-gray-600">
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
              className="h-8 w-8 p-0 border-gray-300"
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
              className="h-8 w-8 p-0 border-gray-300"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 