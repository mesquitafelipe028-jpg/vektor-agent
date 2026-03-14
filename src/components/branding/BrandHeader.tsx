import { LogoVektor } from "./LogoVektor";
import { cn } from "@/lib/utils";

interface BrandHeaderProps {
  subtitle?: string;
  className?: string;
}

export function BrandHeader({ subtitle = "Clareza financeira para quem empreende.", className }: BrandHeaderProps) {
  return (
    <div className={cn("text-center", className)}>
      <div className="flex justify-center mb-3">
        <LogoVektor size="lg" textClassName="text-2xl text-foreground" />
      </div>
      {subtitle && (
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
