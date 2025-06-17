import { cn } from "@/lib/utils";

export interface LoaderProps {
  /**
   * Size of the loader
   * @default "default"
   */
  size?: "sm" | "default" | "lg";
  
  /**
   * Custom CSS classes
   */
  className?: string;
  
  /**
   * Text to display below the loader
   */
  text?: string;
  
  /**
   * Whether to center the loader in its container
   * @default false
   */
  centered?: boolean;
}

/**
 * Reusable loader component with different size variants
 */
export default function Loader({
  size = "default",
  className,
  text,
  centered = false,
}: LoaderProps) {
  // Size mappings
  const sizeClasses = {
    sm: "h-6 w-6 border-2",
    default: "h-12 w-12 border-t-2 border-b-2",
    lg: "h-16 w-16 border-t-3 border-b-3"
  };
  
  const containerClasses = cn(
    centered && "flex flex-col justify-center items-center",
    centered && (text ? "py-8" : "py-12"),
    className
  );
  
  const spinnerClasses = cn(
    "animate-spin rounded-full border-blue-500",
    sizeClasses[size]
  );
  
  return (
    <div className={containerClasses}>
      <div className={spinnerClasses}></div>
      {text && (
        <p className="mt-4 text-sm text-gray-500">{text}</p>
      )}
    </div>
  );
} 