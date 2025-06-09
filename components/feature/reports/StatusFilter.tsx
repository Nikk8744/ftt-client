'use client';

import * as React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Status options
const statuses = [
  { value: 'all', label: 'All Statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'pending', label: 'Pending' },
  { value: 'overdue', label: 'Overdue' },
];

interface StatusFilterProps {
  onChange: (status: string) => void;
}

const StatusFilter: React.FC<StatusFilterProps> = ({ onChange }) => {
  const [value, setValue] = React.useState('all');

  React.useEffect(() => {
    onChange(value);
  }, [value, onChange]);

  const selectedStatus = statuses.find((status) => status.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between"
        >
          {selectedStatus?.label || 'Select status'}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]">
        <DropdownMenuGroup>
          {statuses.map((status) => (
            <DropdownMenuItem
              key={status.value}
              className={cn(
                "flex cursor-pointer items-center gap-2 px-3 py-2",
                value === status.value && "bg-accent"
              )}
              onClick={() => setValue(status.value)}
            >
              {value === status.value && (
                <Check className="h-4 w-4" />
              )}
              <span className={value === status.value ? "font-medium" : ""}>
                {status.label}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StatusFilter; 