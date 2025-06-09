'use client';

import React from 'react';
import { Download } from 'lucide-react';
import Button from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ExportButtonProps {
  onExport: (format: 'pdf' | 'csv' | 'excel') => void;
  formats?: Array<'pdf' | 'csv' | 'excel'>;
  className?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  onExport,
  formats = ['pdf', 'csv', 'excel'],
  className,
}) => {
  const formatLabels = {
    pdf: 'PDF Document',
    csv: 'CSV Spreadsheet',
    excel: 'Excel Spreadsheet',
  };

  const formatIcons = {
    pdf: '📄',
    csv: '📊',
    excel: '📑',
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {formats.map((format) => (
          <DropdownMenuItem key={format} onClick={() => onExport(format)}>
            <span className="mr-2">{formatIcons[format]}</span>
            {formatLabels[format]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButton; 