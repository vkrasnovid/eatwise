"use client";

import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
}

export function LoadingSpinner({
  message = "Loading...",
  className,
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-12",
        className
      )}
    >
      <div className="relative h-12 w-12">
        <div className="absolute h-full w-full rounded-full border-4 border-gray-200 dark:border-gray-700" />
        <div className="absolute h-full w-full animate-spin rounded-full border-4 border-transparent border-t-primary" />
      </div>
      {message && (
        <p className="text-sm text-text-muted dark:text-gray-400 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}
