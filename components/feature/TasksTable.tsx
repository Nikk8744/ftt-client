import { useId, useState, useEffect } from "react";
import { Task, Project } from "@/types";
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
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
// import Badge from "@/components/ui/Badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import {
//   Pagination,
//   PaginationContent,
//   PaginationItem,
// } from "@/components/ui/pagination";
import {
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Columns3,
  ListFilter,
  CircleX,
  SquarePen,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface TasksTableProps {
  data: Task[];
  projects: Project[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: string) => void;
}

export function TasksTable({
  data,
  projects,
  onEdit,
  onDelete,
  onStatusChange,
}: TasksTableProps) {
  const id = useId();
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    description: false,
    createdAt: false,
    dueDate: false,
  });
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "subject",
      desc: false,
    },
  ]);

  const columns: ColumnDef<Task>[] = [
    {
      header: "Task",
      accessorKey: "subject",
      cell: ({ row }) => (
        <Link href={`/tasks/${row.original.id}`} className="font-medium hover:underline">
          {row.getValue("subject")}
        </Link>
      ),
      size: 200,
    },
    {
      header: "Project",
      accessorKey: "projectId",
      cell: ({ row }) => {
        const project = projects.find(p => p.id === row.original.projectId);
        return (
          <Link href={`/projects/${row.original.projectId}`} className="hover:underline">
            {project?.name || "Unknown Project"}
          </Link>
        );
      },
      size: 150,
    },
    {
      header: "Description",
      accessorKey: "description",
      cell: ({ row }) => (
        <span title={row.getValue("description")}>
          {String(row.getValue("description")).slice(0, 50)}...
        </span>
      ),
      size: 200,
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        // const getVariant = (status: string) => {
        //   switch (status) {
        //     case "Done":
        //       return "success";
        //     case "In-Progress":
        //       return "warning";
        //     default:
        //       return "secondary";
        //   }
        // };

        return (
          <Select
            value={status}
            onValueChange={(newStatus) => onStatusChange && onStatusChange(row.original, newStatus)}
          >
            <SelectTrigger className="w-[90px] sm:w-[130px] h-8 px-2 sm:px-3 py-1 rounded-full border-0 bg-blue-50/50 hover:bg-blue-100/50 focus:ring-1 focus:ring-blue-200">
              <SelectValue>
                <div className="flex items-center gap-1.5">
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    status === "Done" ? "bg-green-500" :
                    status === "In-Progress" ? "bg-yellow-500" :
                    "bg-gray-400"
                  )} />
                  <span className={cn(
                    "text-xs sm:text-sm font-medium",
                    status === "Done" ? "text-green-700" :
                    status === "In-Progress" ? "text-yellow-700" :
                    "text-gray-600"
                  )}>
                    {status}
                  </span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending" className="py-2">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-gray-400" />
                  <span className="text-sm font-medium text-gray-600">Pending</span>
                </div>
              </SelectItem>
              <SelectItem value="In-Progress" className="py-2">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span className="text-sm font-medium text-yellow-700">In Progress</span>
                </div>
              </SelectItem>
              <SelectItem value="Done" className="py-2">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-green-700">Done</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        );
      },
      size: 130,
    },
    {
      header: "Due Date",
      accessorKey: "dueDate",
      cell: ({ row }) => formatDate(row.getValue("dueDate")),
      size: 120,
    },
    {
      header: "Created At",
      accessorKey: "createdAt",
      cell: ({ row }) => formatDate(row.getValue("createdAt")),
      size: 120,
    },
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit && onEdit(row.original)}
            className="w-6 h-6 md:w-8 md:h-8"
          > 
            <SquarePen className="w-3 h-3 md:w-4 md:h-4" />
          </Button>
          {row.original.status === "Done" && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete && onDelete(row.original)}
              className="w-6 h-6 md:w-8 md:h-8"
            >
              <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
          )}
        </div>
      ),
      size: 100,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  // Set default column visibility based on screen size
  useEffect(() => {
    const handleResize = () => {
      setColumnVisibility({
        description: window.innerWidth >= 1024,
        createdAt: window.innerWidth >= 768,
        dueDate: window.innerWidth >= 640,
      });
    };
    
    // Set initial values
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Filter by task name or description */}
          <div className="relative w-full sm:w-auto">
            <Input
              id={`${id}-input`}
              onChange={(e) => {
                table.getColumn("subject")?.setFilterValue(e.target.value);
              }}
              value={(table.getColumn("subject")?.getFilterValue() as string) ?? ""}
              className={cn(
                "peer w-full sm:min-w-60 ps-9 text-xs sm:text-sm",
                Boolean(table.getColumn("subject")?.getFilterValue()) && "pe-9"
              )}
              placeholder="Filter tasks..."
              type="text"
              aria-label="Filter tasks"
            />
            <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
              <ListFilter size={16} strokeWidth={2} aria-hidden="true" />
            </div>
            {Boolean(table.getColumn("subject")?.getFilterValue()) && (
              <button
                className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Clear filter"
                onClick={() => {
                  table.getColumn("subject")?.setFilterValue("");
                }}
              >
                <CircleX size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            )}
          </div>

          {/* Toggle columns visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="text-xs sm:text-sm px-2 sm:px-3">
                <Columns3
                  className="opacity-60"
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <span className="hidden md:inline">View</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      onSelect={(event) => event.preventDefault()}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      style={{ width: `${header.getSize()}px` }}
                      className="h-10 px-2 sm:px-4 py-2 text-xs sm:text-sm"
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          className={cn(
                            "flex h-full w-full cursor-pointer select-none items-center justify-between gap-2",
                            header.column.getCanSort() &&
                              "cursor-pointer select-none"
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: (
                              <ChevronRight
                                className="ml-2 h-4 w-4"
                                aria-hidden="true"
                              />
                            ),
                            desc: (
                              <ChevronLeft
                                className="ml-2 h-4 w-4"
                                aria-hidden="true"
                              />
                            ),
                          }[header.column.getIsSorted() as string] ?? null}
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No tasks found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex flex-wrap items-center gap-4 sm:space-x-6 lg:space-x-8 order-1 sm:order-2">
          <div className="flex items-center space-x-2">
            <p className="text-xs sm:text-sm font-medium">Rows per page</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-7 sm:h-8 w-[60px] sm:w-[70px] text-xs sm:text-sm">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`} className="text-xs sm:text-sm">
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[90px] sm:w-[100px] items-center justify-center text-xs sm:text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button
              variant="outline"
              className="hidden h-7 sm:h-8 w-7 sm:w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronFirst className="h-3 sm:h-4 w-3 sm:w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-7 sm:h-8 w-7 sm:w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-3 sm:h-4 w-3 sm:w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-7 sm:h-8 w-7 sm:w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-3 sm:h-4 w-3 sm:w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-7 sm:h-8 w-7 sm:w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronLast className="h-3 sm:h-4 w-3 sm:w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 