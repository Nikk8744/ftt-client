import Loader from '@/components/ui/Loader';
import Card  from '@/components/ui/Card';
import { ReactNode } from 'react';

export interface LoadingStateProps {
  /**
   * Whether the data is loading
   */
  isLoading: boolean;
  
  /**
   * Loading text to display
   */
  loadingText?: string;
  
  /**
   * Empty state message when there's no data
   */
  emptyMessage?: string;
  
  /**
   * Empty state description
   */
  emptyDescription?: string;
  
  /**
   * Empty state icon
   */
  emptyIcon?: ReactNode;
  
  /**
   * Empty state action button
   */
  emptyAction?: ReactNode;
  
  /**
   * Whether the data is empty
   */
  isEmpty?: boolean;
  
  /**
   * Size of the loader
   */
  loaderSize?: "sm" | "default" | "lg";
  
  /**
   * Children to render when not loading and not empty
   */
  children: ReactNode;
}

/**
 * A component that handles loading, empty, and data states
 */
export default function LoadingState({
  isLoading,
  loadingText = "Loading...",
  emptyMessage = "No data found",
  emptyDescription,
  emptyIcon,
  emptyAction,
  isEmpty = false,
  loaderSize = "default",
  children
}: LoadingStateProps) {
  if (isLoading) {
    return <Loader centered text={loadingText} size={loaderSize} />;
  }
  
  if (isEmpty) {
    return (
      <Card className="p-8 text-center">
        <div className="flex flex-col items-center">
          {emptyIcon && (
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              {emptyIcon}
            </div>
          )}
          <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyMessage}</h3>
          {emptyDescription && (
            <p className="text-gray-500 mb-4">{emptyDescription}</p>
          )}
          {emptyAction}
        </div>
      </Card>
    );
  }
  
  return <>{children}</>;
} 