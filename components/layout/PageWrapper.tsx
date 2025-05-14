'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageWrapperProps {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
}

export default function PageWrapper({
  children,
  title,
  description,
  actions,
  className,
  contentClassName,
}: PageWrapperProps) {
  return (
    <div className={cn("flex flex-col min-h-[calc(100vh-4rem)]", className)}>
      {(title || description || actions) && (
        <div className="border-b border-gray-200 bg-white">
          <div className="px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              {title && (
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                  {title}
                </h1>
              )}
              {description && (
                <p className="mt-1 text-sm text-gray-500 max-w-4xl">
                  {description}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex flex-shrink-0 space-x-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      <div className={cn("flex-1 bg-gray-50", contentClassName)}>
        {children}
      </div>
    </div>
  );
} 