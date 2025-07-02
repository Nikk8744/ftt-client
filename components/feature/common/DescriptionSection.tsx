import React from 'react';
import Card from '@/components/ui/Card';
import { AlignLeft } from 'lucide-react';

interface DescriptionSectionProps {
  description: string | null | undefined;
  entityType?: 'task' | 'project';
}

export const DescriptionSection = ({
  description,
  entityType = 'task',
}: DescriptionSectionProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center gap-2 mb-4">
        <AlignLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-0">
          Description
        </h3>
      </div>
      
      {description ? (
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {description}
          </p>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlignLeft className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            No description provided
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Add a description to provide more context for this {entityType}
          </p>
        </div>
      )}
    </Card>
  );
};
