import { useMemo, useState, useEffect } from "react";
import { ShieldAlert, AlertTriangle, CheckCircle2, Flame, Lightbulb, PieChart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export interface InsightsFinanceirosProps {
  faturamentoMes: number;
  despesasMesTotal: number;
  despesaPercent: number;
  savingsRate: number;
  varFaturamento: number;
  categoryData: { name: string; value: number; fill: string }[];
}

type InsightType = "danger" | "warning" | "success" | "info";

interface Insight {
  id: string;
  type: InsightType;
  icon: any;
  title: string;
  description: string;
}

const insightColors: Record<InsightType, string> = {
  success: "border-l-green-500 bg-green-500/5",
  warning: "border-l-yellow-500 bg-yellow-500/5",
  danger: "border-l-red-500 bg-red-500/5",
  info: "border-l-blue-500 bg-blue-500/5",
};

const insightIconColors: Record<InsightType, string> = {
  success: "text-green-600",
  warning: "text-yellow-600",
  danger: "text-red-600",
  info: "text-blue-600",
};

const insightBadgeConfig: Record<InsightType, { label: string; badgeClass: string }> = {
  danger: { label: "Alerta", badgeClass: "bg-destructive/10 text-destructive border-destructive/30" },
  warning: { label: "Atenção", badgeClass: "bg-amber-500/10 text-amber-700 border-amber-500/30" },
  success: { label: "Positivo", badgeClass: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30" },
  info: { label: "Dica", badgeClass: "bg-blue-500/10 text-blue-700 border-blue-500/30" },
};

export function InsightsFinanceiros({
  faturamentoMes,
  despesasMesTotal,
  despesaPercent,
  savingsRate,
  varFaturamento,
  categoryData,
}: InsightsFinanceirosProps) {
  const insights = useMemo(() => {
    const list: Insight[] = [];

    // 1. Déficit
    if (despesasMesTotal > faturamentoMes && faturamentoMes > 0) {
      list.push({
        id: "deficit",
        type: "danger",
        icon: ShieldAlert,
        title: "Atenção ao déficit",
        description: "Suas despesas estão maiores que sua receita este mês. Priorize cobranças pendentes e adie gastos não essenciais.",
      });
    }

    // 2. Despesas elevadas
    if (despesaPercent > 80 && despesasMesTotal <= faturamentoMes && faturamentoMes > 0) {
      list.push({
        id: "high-expense",
        type: "warning",
        icon: AlertTriangle,
        title: "Despesas elevadas",
        description: `Seus gastos representam ${despesaPercent.toFixed(0)}% da receita. Tente reduzir para manter uma margem mais saudável de sobra.`,
      });
    }

    // 3. Maior categoria
    if (categoryData && categoryData.length > 0) {
      const topCategory = categoryData[0];
      if (topCategory.value > 0 && faturamentoMes > 0) {
        const catPercent = (topCategory.value / faturamentoMes) * 100;
        if (catPercent > 30) {
          list.push({
            id: "top-category",
            type: "warning",
            icon: PieChart,
            title: "Categoria em destaque",
            description: `${topCategory.name} é sua maior categoria de gasto, correspondendo a ${catPercent.toFixed(0)}% da sua receita (${formatCurrency(topCategory.value)}).`,
          });
        }
      }
    }

    // 4. Taxa de poupança (savings)
    if (savingsRate > 20) {
      list.push({
        id: "savings",
        type: "success",
        icon: CheckCircle2,
        title: "Boa taxa de poupança!",
        description: `Você está poupando ${savingsRate.toFixed(0)}% da sua receita. Excelente trabalho para nutrir sua reserva de emergência!`,
      });
    }

    // 5. Crescimento de faturamento
    if (varFaturamento > 10) {
      list.push({
        id: "growth",
        type: "success",
        icon: Flame,
        title: "Faturamento em alta!",
        description: `Seu faturamento aumentou ${varFaturamento.toFixed(0)}% em relação ao mês anterior. Ótimo ritmo!`,
      });
    }

    // 6. Dica padrão se houver poucos insights
    if (list.length === 0) {
      list.push({
        id: "default-info",
        type: "info",
        icon: Lightbulb,
        title: "Insights Financeiros",
        description: "Continue registrando todas as suas movimentações do mês. Quando houverem mais dados, gerarei dicas automáticas aqui para você.",
      });
    }

    return list;
  }, [faturamentoMes, despesasMesTotal, despesaPercent, savingsRate, varFaturamento, categoryData]);

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-cycle through insights if there's more than one
  useEffect(() => {
    if (insights.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % insights.length);
    }, 8000); // changes every 8 seconds

    return () => clearInterval(timer);
  }, [insights.length]);

  // Handle data resetting/changing
  useEffect(() => {
    if (currentIndex >= insights.length) {
      setCurrentIndex(0);
    }
  }, [insights.length, currentIndex]);

  const currentInsight = insights[currentIndex] || insights[0];

  if (!currentInsight) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-muted-foreground" />
        <h2 className="font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Insights Financeiros
          {insights.length > 1 && <span className="ml-2 text-xs font-normal lowercase">({currentIndex + 1} de {insights.length})</span>}
        </h2>
      </div>

      <div className="animate-fade-in transition-all duration-500 ease-in-out">
        <Card className={`border-l-4 ${insightColors[currentInsight.type]}`}>
          <CardContent className="p-4 flex items-start gap-3">
            <currentInsight.icon className={`h-5 w-5 mt-0.5 shrink-0 ${insightIconColors[currentInsight.type]}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold">{currentInsight.title}</p>
                <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${insightBadgeConfig[currentInsight.type].badgeClass}`}>
                  {insightBadgeConfig[currentInsight.type].label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{currentInsight.description}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {insights.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-2">
          {insights.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIndex ? "w-4 bg-primary" : "w-1.5 bg-muted hover:bg-muted-foreground/50"
              }`}
              aria-label={`Ir para o insight ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
