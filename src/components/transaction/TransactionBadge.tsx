import { Badge } from "@/components/ui/badge";
import { Repeat, Calendar, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import type { TipoTransacao, StatusReceita, StatusDespesa } from "@/types/transactions";

interface TransactionTypeBadgeProps {
  tipo: TipoTransacao;
  parcela_atual?: number | null;
  numero_parcelas?: number | null;
}

export function TransactionTypeBadge({ tipo, parcela_atual, numero_parcelas }: TransactionTypeBadgeProps) {
  if (tipo === "unica") return null;

  if (tipo === "recorrente") {
    return (
      <Badge variant="outline" className="text-[10px] gap-1 px-1.5 py-0 border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400">
        <Repeat className="h-3 w-3" />
        Recorrente
      </Badge>
    );
  }

  if (tipo === "parcelada") {
    return (
      <Badge variant="outline" className="text-[10px] gap-1 px-1.5 py-0 border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400">
        <Calendar className="h-3 w-3" />
        {parcela_atual && numero_parcelas ? `${parcela_atual}/${numero_parcelas}` : "Parcelada"}
      </Badge>
    );
  }

  return null;
}

interface StatusBadgeProps {
  status: StatusReceita | StatusDespesa;
  type: "receita" | "despesa";
}

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const configs = {
    pendente: { icon: Clock, className: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400" },
    recebido: { icon: CheckCircle, className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
    pago: { icon: CheckCircle, className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
    atrasado: { icon: AlertTriangle, className: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400" },
  };

  const config = configs[status] || configs.pendente;
  const Icon = config.icon;
  const label = status === "pago" ? "Pago" : status === "recebido" ? "Recebido" : status === "atrasado" ? "Atrasado" : "Pendente";

  return (
    <Badge variant="outline" className={`text-[10px] gap-1 px-1.5 py-0 ${config.className}`}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
