'use client';

import React from 'react';
import { Download } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ExportButtonProps {
  onExport: () => void;
  className?: string;
  disabled?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  onExport,
  className,
  disabled = false,
}) => {
  return (
    <Button 
      variant="outline" 
      size="lg" 
      className={cn(className, "text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700")} 
      disabled={disabled}
      onClick={onExport}
    >
      <Download className="mr-2 h-4 w-4 text-gray-600 dark:text-gray-400" />
      Export PDF
    </Button>
  );
};

export default ExportButton;
