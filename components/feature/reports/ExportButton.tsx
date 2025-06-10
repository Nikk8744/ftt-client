'use client';

import React from 'react';
import { Download } from 'lucide-react';
import Button from '@/components/ui/Button';

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
      size="sm" 
      className={className} 
      disabled={disabled}
      onClick={onExport}
    >
      <Download className="mr-2 h-4 w-4" />
      Export PDF
    </Button>
  );
};

export default ExportButton;
