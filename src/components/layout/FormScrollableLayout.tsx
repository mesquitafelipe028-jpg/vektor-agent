import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface FormScrollableLayoutProps extends HTMLAttributes<HTMLDivElement> {
  /** Extra classes for the outer container */
  containerClassName?: string;
}

/**
 * Reusable scroll-safe form container.
 * Provides a single reliable scroll context for form content inside modals/sheets.
 * Prevents scroll-locking issues on mobile when dropdowns or keyboards are active.
 */
export function FormScrollableLayout({
  children,
  className,
  containerClassName,
  ...props
}: FormScrollableLayoutProps) {
  return (
    <div className={cn("flex flex-col min-h-0 flex-1", containerClassName)}>
      <div
        className={cn(
          "flex-1 min-h-0 overflow-y-auto overscroll-contain",
          className,
        )}
        style={{
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
        }}
        {...props}
      >
        <div className="min-h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
