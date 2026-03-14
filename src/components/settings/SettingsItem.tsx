import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface SettingsItemProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  rightComponent?: ReactNode;
  onClick?: () => void;
  className?: string;
  children?: ReactNode;
}

export function SettingsItem({
  icon: Icon,
  title,
  description,
  rightComponent,
  onClick,
  className,
  children,
}: SettingsItemProps) {
  const Wrapper = onClick ? "button" : "div";

  return (
    <div className={cn("space-y-3", className)}>
      <Wrapper
        className={cn(
          "flex items-center gap-3 w-full py-2.5 px-1 rounded-md transition-colors",
          onClick && "cursor-pointer hover:bg-muted/50 text-left"
        )}
        onClick={onClick}
      >
        {Icon && (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-none">{title}</p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {rightComponent && <div className="shrink-0">{rightComponent}</div>}
      </Wrapper>
      {children && <div className="pl-12">{children}</div>}
    </div>
  );
}
