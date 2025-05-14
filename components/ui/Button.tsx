'use client';

import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'warning' | 'success' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  rounded?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      isDisabled = false,
      leftIcon,
      rightIcon,
      rounded = false,
      className,
      ...rest
    },
    ref
  ) => {
    // Base styles
    const baseStyles = "inline-flex items-center justify-center font-medium focus:outline-none transition-colors focus:ring-2 focus:ring-offset-2";

    // Size variations
    const sizeClasses = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    };

    // Variant styles
    const variantClasses = {
      primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 border border-transparent",
      secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500 border border-transparent",
      outline: "bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500 border border-gray-300",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 border border-transparent",
      warning: "bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500 border border-transparent",
      success: "bg-green-500 text-white hover:bg-green-600 focus:ring-green-500 border border-transparent",
      ghost: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500 border border-transparent",
    };

    // Disabled state
    const disabledClasses = "opacity-50 cursor-not-allowed";

    // Width
    const widthClass = fullWidth ? "w-full" : "";

    // Border radius
    const radiusClass = rounded ? "rounded-full" : "rounded-md";

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          sizeClasses[size],
          variantClasses[variant],
          radiusClass,
          widthClass,
          (isDisabled || isLoading) && disabledClasses,
          className
        )}
        disabled={isDisabled || isLoading}
        {...rest}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {leftIcon && !isLoading && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button; 