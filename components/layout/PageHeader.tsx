'use client';

import React, { ReactNode } from 'react';
import Button from '@/components/ui/Button';

interface PageHeaderProps {
  title: string;
  description?: string;
  actionLabel?: string;
  actionIcon?: ReactNode;
  onActionClick?: () => void;
  variant?: 'default' | 'brand';
  children?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actionLabel,
  actionIcon,
  onActionClick,
  variant = 'default',
  children
}) => {
  return (
    <div className="border-b border-gray-400 dark:border-gray-700 rounded-b-3xl">
      <div className={`px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between ${
        variant === 'brand' 
          ? 'shadow-[inset_-1px_-4px_2px_var(--color-brand)]' 
          : ''
      } rounded-b-3xl`}>
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-4xl">
              {description}
            </p>
          )}
        </div>
        
        <div className="flex flex-shrink-0 space-x-2">
          {actionLabel && onActionClick && (
            <Button
              variant={variant === 'brand' ? 'brandBtn' : 'myBtn'}
              onClick={onActionClick}
            >
              {actionIcon && (
                <span className="mr-2">{actionIcon}</span>
              )}
              {actionLabel}
            </Button>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
