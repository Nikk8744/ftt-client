'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { HelpCircle, Download } from 'lucide-react';

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  showDownload?: boolean;
  onDownload?: () => void;
}

const ChartCard: React.FC<ChartCardProps> = ({ 
  title, 
  description, 
  children, 
  actions,
  showDownload = false,
  onDownload 
}) => {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex space-x-2">
            {actions}
          </div>
        )}
      </div>
      <div className="mt-4">
        {children}
      </div>
      {showDownload && onDownload && (
        <div className="mt-4 flex justify-end">
          <button 
            onClick={onDownload}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Download report"
          >
            <Download className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      )}
    </Card>
  );
};

export default ChartCard; 