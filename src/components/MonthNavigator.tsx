import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MonthNavigatorProps {
  month: string; // "YYYY-MM"
  onChange: (month: string) => void;
}

function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1);
  const label = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function MonthNavigator({ month, onChange }: MonthNavigatorProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onChange(shiftMonth(month, -1))}>
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <span className="font-heading text-sm font-semibold min-w-[160px] text-center">
        {formatLabel(month)}
      </span>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onChange(shiftMonth(month, 1))}>
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
