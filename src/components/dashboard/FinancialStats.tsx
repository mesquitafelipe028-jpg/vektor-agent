import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, TrendingUp, TrendingDown, Landmark, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface FinancialStatsProps {
  isLoading: boolean;
  saldoTotal: number;
  faturamentoMes: number;
  despesasMesTotal: number;
  totalInvestido: number;
  saldoMes: number;
}

const formatCurrency = (val: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

export function FinancialStats({
  isLoading,
  saldoTotal,
  faturamentoMes,
  despesasMesTotal,
  totalInvestido,
  saldoMes
}: FinancialStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="border-primary/10 shadow-sm hover:shadow-md transition-shadow transform hover:-translate-y-0.5 duration-300">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">Saldo Total</p>
            <h3 className="text-xl font-bold tracking-tight truncate">{formatCurrency(saldoTotal)}</h3>
          </div>
        </CardContent>
      </Card>

      <Card className="border-emerald-500/10 shadow-sm hover:shadow-md transition-shadow transform hover:-translate-y-0.5 duration-300">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 shrink-0">
            <TrendingUp className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">Entradas (Mês)</p>
            <h3 className="text-xl font-bold tracking-tight text-emerald-600 truncate">+{formatCurrency(faturamentoMes)}</h3>
          </div>
        </CardContent>
      </Card>

      <Card className="border-rose-500/10 shadow-sm hover:shadow-md transition-shadow transform hover:-translate-y-0.5 duration-300">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 shrink-0">
            <TrendingDown className="h-6 w-6 text-rose-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">Saídas (Mês)</p>
            <h3 className="text-xl font-bold tracking-tight text-rose-600 truncate">-{formatCurrency(despesasMesTotal)}</h3>
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-500/10 shadow-sm hover:shadow-md transition-shadow transform hover:-translate-y-0.5 duration-300">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 shrink-0">
            <Landmark className="h-6 w-6 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">Investimentos</p>
            <h3 className="text-xl font-bold tracking-tight text-blue-600 truncate">{formatCurrency(totalInvestido)}</h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
