import { cn } from "@/lib/utils";

interface LogoVektorProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  textClassName?: string;
}

export function LogoVektor({ size = "md", showText = true, className, textClassName }: LogoVektorProps) {
  const sizes = {
    sm: "h-5 w-5",
    md: "h-7 w-7",
    lg: "h-10 w-10",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(sizes[size], "shrink-0")}
      >
        <rect width="32" height="32" rx="8" fill="hsl(var(--primary))" />
        <path
          d="M8 10L16 24L24 10"
          stroke="hsl(var(--primary-foreground))"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="10" r="2.5" fill="hsl(var(--secondary))" />
      </svg>
      {showText && (
        <span className={cn("font-heading font-bold tracking-tight", textSizes[size], textClassName)}>
          Vektor
        </span>
      )}
    </div>
  );
}
