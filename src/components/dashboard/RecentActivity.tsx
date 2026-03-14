import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DollarSign, 
  TrendingDown, 
  Building2, 
  FileText,
  ChevronRight,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency, formatDate } from "@/lib/utils";

interface RecentActivityProps {
  isLoading: boolean;
  receitas: any[];
  despesas: any[];
}

type ActivityType = "receita" | "despesa" | "transferencia" | "cobranca";

interface ActivityItem {
  id: string;
  type: ActivityType;
  description: string;
  amount: number;
  date: string;
  icon: any;
  colorClass: string;
  bgClass: string;
}

export function RecentActivity({ isLoading, receitas, despesas }: RecentActivityProps) {
  const navigate = useNavigate();

  const activities = useMemo(() => {
    if (isLoading) return [];

    const unified: ActivityItem[] = [];

    // Process Receitas
    receitas.forEach((r) => {
      let type: ActivityType = "receita";
      let icon = DollarSign;
      let colorClass = "text-emerald-600 dark:text-emerald-400";
      let bgClass = "bg-emerald-500/10";

      // Transfer Check
      if (
        r.forma_pagamento?.toLowerCase().includes("transferência") || 
        r.categoria?.toLowerCase().includes("transferência") ||
        r.descricao?.toLowerCase().includes("transferência")
      ) {
        type = "transferencia";
        icon = Building2;
        colorClass = "text-blue-600 dark:text-blue-400";
        bgClass = "bg-blue-500/10";
      } 
      // Billing/Cobranca Check
      else if (r.cliente_id && (r.status === "pendente" || r.status === "atrasado")) {
        type = "cobranca";
        icon = FileText;
        colorClass = "text-amber-600 dark:text-amber-400";
        bgClass = "bg-amber-500/10";
      }

      unified.push({
        id: r.id,
        type,
        description: r.descricao,
        amount: r.valor,
        date: r.data,
        icon,
        colorClass,
        bgClass,
      });
    });

    // Process Despesas
    despesas.forEach((d) => {
      let type: ActivityType = "despesa";
      let icon = TrendingDown;
      let colorClass = "text-red-600 dark:text-red-400";
      let bgClass = "bg-red-500/10";

      // Transfer Check
      if (
        d.categoria?.toLowerCase().includes("transferência") ||
        d.descricao?.toLowerCase().includes("transferência")
      ) {
        type = "transferencia";
        icon = Building2;
        colorClass = "text-blue-600 dark:text-blue-400";
        bgClass = "bg-blue-500/10";
      }

      unified.push({
        id: d.id,
        type,
        description: d.descricao,
        amount: d.valor,
        date: d.data,
        icon,
        colorClass,
        bgClass,
      });
    });

    // Sort by date DESC and limit to 10
    return unified
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [isLoading, receitas, despesas]);

  const getActivityLabel = (type: ActivityType) => {
    switch (type) {
      case "receita": return "Receita";
      case "despesa": return "Despesa";
      case "transferencia": return "Transferência";
      case "cobranca": return "Cobrança";
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold font-heading">Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 sm:pt-0">
        <div className="space-y-1">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-4 py-4 flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))
          ) : activities.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">Nenhuma atividade recente encontrada.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Vertical line for timeline */}
              <div className="absolute left-[2.25rem] top-4 bottom-4 w-px bg-border hidden sm:block" />
              
              <div className="divide-y divide-border sm:divide-y-0">
                {activities.map((activity, i) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative flex items-center gap-4 px-4 py-4 sm:py-3 hover:bg-muted/30 transition-colors group"
                  >
                    {/* Icon container */}
                    <div className={`relative z-10 h-10 w-10 shrink-0 rounded-full ${activity.bgClass} flex items-center justify-center`}>
                      <activity.icon className={`h-5 w-5 ${activity.colorClass}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                          {getActivityLabel(activity.type)}
                        </p>
                        <span className={`text-sm font-bold ${activity.type === 'receita' || activity.type === 'cobranca' ? 'text-emerald-600 dark:text-emerald-400' : (activity.type === 'transferencia' ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400')}`}>
                          {activity.type === "receita" || activity.type === "cobranca" ? "+" : "-"}{formatCurrency(activity.amount)}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-foreground truncate">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDate(activity.date)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-4 sm:px-0 sm:pt-6 border-t border-border mt-2 sm:mt-0">
          <Button 
            variant="ghost" 
            className="w-full text-sm font-medium text-primary hover:text-primary/80 hover:bg-primary/5 flex items-center justify-center gap-2 group"
            onClick={() => navigate("/fluxo-de-caixa")}
          >
            Ver todas as atividades
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
