import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'default';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  className?: string;
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  rounded = false,
  className,
}: BadgeProps) {
  // Base style
  const baseStyle = "inline-flex items-center justify-center font-medium";

  // Variant styles 
  const variantStyles = {
    primary: "bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300",
    secondary: "bg-secondary-100 text-secondary-800 dark:bg-secondary-900/50 dark:text-secondary-300",
    success: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    danger: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
    warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
    info: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
    default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
  };

  // Size styles
  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-sm",
    lg: "px-3 py-1 text-base",
  };

  // Border radius
  const radiusStyles = rounded ? "rounded-full" : "rounded-md";

  return (
    <span
      className={cn(
        baseStyle,
        variantStyles[variant],
        sizeStyles[size],
        radiusStyles,
        className
      )}
    >
      {children}
    </span>
  );
}
