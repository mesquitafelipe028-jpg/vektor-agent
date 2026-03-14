import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, FileText, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface DashboardGoalsProps {
  metaAtual: any;
  prevMonth: {
    label: string;
    rec: number;
    desp: number;
    lucro: number;
    varFat: number;
  };
  navigate: (path: string) => void;
  formatCurrency: (val: number) => string;
}

export function DashboardGoals({ metaAtual, prevMonth, navigate, formatCurrency }: DashboardGoalsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {metaAtual && (
        <Card className="border-accent/20 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/metas")}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-accent" />
                <span className="font-heading font-semibold">Meta Atual: {metaAtual.titulo}</span>
              </div>
              <span className="text-xs text-muted-foreground">{metaAtual.categoria}</span>
            </div>
            <Progress value={metaAtual.valor_alvo > 0 ? Math.min((metaAtual.valor_atual / metaAtual.valor_alvo) * 100, 100) : 0} className="h-3 mb-2" />
            <div className="flex flex-wrap justify-between gap-2 text-sm">
              <span className="text-muted-foreground">Acumulado: <span className="font-semibold text-primary">{formatCurrency(metaAtual.valor_atual)}</span></span>
              <span className="text-muted-foreground">Meta: <span className="font-semibold">{formatCurrency(metaAtual.valor_alvo)}</span></span>
              <span className="text-muted-foreground">Falta: <span className="font-semibold text-destructive">{formatCurrency(Math.max(metaAtual.valor_alvo - metaAtual.valor_atual, 0))}</span></span>
            </div>
          </CardContent>
        </Card>
      )}
      <Card className={`cursor-pointer hover:shadow-md transition-shadow ${!metaAtual ? "lg:col-span-2" : ""}`} onClick={() => navigate("/relatorio-mensal")}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-chart-3" />
              <span className="font-heading font-semibold">Resumo — {prevMonth.label}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {prevMonth.varFat >= 0
                ? <ArrowUpRight className="h-3.5 w-3.5 text-primary" />
                : <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />
              }
              {Math.abs(prevMonth.varFat).toFixed(1)}% vs mês anterior
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground">Faturamento</p>
              <p className="text-lg font-bold text-primary">{formatCurrency(prevMonth.rec)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Despesas</p>
              <p className="text-lg font-bold text-destructive">{formatCurrency(prevMonth.desp)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lucro</p>
              <p className={`text-lg font-bold ${prevMonth.lucro >= 0 ? "text-primary" : "text-destructive"}`}>{formatCurrency(prevMonth.lucro)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
