'use client';

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Omit the native 'size' property and then add our custom size property
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outline' | 'filled' | 'flushed';
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isRequired?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      fullWidth = false,
      size = 'md',
      variant = 'outline',
      isDisabled = false,
      isReadOnly = false,
      isRequired = false,
      className,
      id,
      ...rest
    },
    ref
  ) => {
    // Create a random ID if none provided
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

    // Base styles
    const baseStyles = "transition-colors focus:outline-none";

    // Size variations
    const sizeStyles = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-4 py-3 text-lg",
    };

    // Variant styles
    const variantStyles = {
      outline: "border border-gray-500 rounded-md focus:border-brand focus:ring-0 focus:ring-brand bg-white dark:bg-transparent",
      filled: "border border-transparent bg-gray-100 rounded-md focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand",
      flushed: "border-b border-gray-300 rounded-none focus:border-brand focus:ring-0 px-0",
    };

    // Width style
    const widthStyle = fullWidth ? "w-full" : "";

    // States
    const errorStyles = error ? "border-red-500 focus:border-red-500 focus:ring-red-500 text-red-900 placeholder-red-300" : "";
    const disabledStyles = isDisabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "";
    const readOnlyStyles = isReadOnly ? "cursor-default bg-gray-50" : "";
    
    // Icon container styles
    const hasLeftIcon = !!leftIcon;
    const hasRightIcon = !!rightIcon;
    const leftIconStyles = hasLeftIcon ? "pl-10" : "";
    const rightIconStyles = hasRightIcon ? "pr-10" : "";

    return (
      <div className={cn(widthStyle, className)}>
        {label && (
          <label 
            htmlFor={inputId} 
            className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-200"
          >
            {label}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            disabled={isDisabled}
            readOnly={isReadOnly}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            required={isRequired}
            className={cn(
              baseStyles,
              sizeStyles[size],
              variantStyles[variant],
              widthStyle,
              leftIconStyles,
              rightIconStyles,
              errorStyles,
              disabledStyles,
              readOnlyStyles
            )}
            {...rest}
          />
          
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="mt-1 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;