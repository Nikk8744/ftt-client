'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import {  Download } from 'lucide-react';

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
    <Card className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
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
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Download report"
          >
            <Download className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      )}
    </Card>
  );
};

export default ChartCard;
