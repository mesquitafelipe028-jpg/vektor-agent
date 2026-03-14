import { AlertCircle, CheckCircle2, Info, Target, AlertTriangle, ShieldCheck, ShieldAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export type AlertType = "info" | "success" | "warning" | "danger";

export interface AlertItem {
  id: string;
  icon: any;
  type: AlertType;
  message: string;
}

interface HealthAlertsProps {
  alerts: AlertItem[];
  onDismiss: (id: string) => void;
}

const alertStyles = {
  info: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-700 dark:text-blue-400", iconColor: "text-blue-600" },
  success: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-700 dark:text-emerald-400", iconColor: "text-emerald-600" },
  warning: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-700 dark:text-yellow-400", iconColor: "text-yellow-600" },
  danger: { bg: "bg-destructive/10", border: "border-destructive/30", text: "text-destructive", iconColor: "text-destructive" },
};

export function HealthAlerts({ alerts, onDismiss }: HealthAlertsProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {alerts.map((alert) => {
        const style = alertStyles[alert.type];
        const Icon = alert.icon;
        return (
          <div
            key={alert.id}
            className={`flex items-start gap-3 p-3.5 rounded-xl border ${style.bg} ${style.border} ${style.text} transition-all duration-200 animate-in fade-in slide-in-from-top-2`}
          >
            <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${style.iconColor}`} />
            <p className="text-sm font-medium leading-tight flex-1">{alert.message}</p>
            <button
              onClick={() => onDismiss(alert.id)}
              className="mt-0.5 text-current opacity-50 hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
