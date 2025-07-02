import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outline' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  className,
  ...props
}: CardProps) {
  // Base styles
  const baseStyles = "rounded-lg overflow-hidden";

  // Variant styles
  const variantStyles = {
    default: "bg-white dark:bg-gray-800 shadow",
    elevated: "bg-white dark:bg-gray-800 shadow-md",
    outline: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
    flat: "bg-gray-50 dark:bg-gray-900",
  };

  // Padding styles
  const paddingStyles = {
    none: "p-0",
    sm: "p-3",
    md: "p-5",
    lg: "p-7",
  };

  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
