import { useMemo } from "react";
import { TrendingDown, TrendingUp, AlertTriangle, ShieldAlert, ThumbsUp, BarChart3 } from "lucide-react";

type InsightType = "warning" | "danger" | "info" | "success";

export interface FinancialInsight {
  type: InsightType;
  title: string;
  description: string;
  suggestion: string;
  icon: typeof TrendingDown;
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function sumByMonth(items: { data: string; valor: number }[], key: string) {
  return items.filter((i) => i.data.startsWith(key)).reduce((s, i) => s + i.valor, 0);
}

export function useFinancialInsights(
  receitas: { data: string; valor: number }[],
  despesas: { data: string; valor: number; categoria?: string | null }[]
): FinancialInsight[] {
  return useMemo(() => {
    const insights: FinancialInsight[] = [];
    const now = new Date();
    const curKey = getMonthKey(now);
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevKey = getMonthKey(prevDate);

    const recCur = sumByMonth(receitas, curKey);
    const recPrev = sumByMonth(receitas, prevKey);
    const despCur = sumByMonth(despesas, curKey);
    const despPrev = sumByMonth(despesas, prevKey);
    const lucroCur = recCur - despCur;

    // 1. Aumento de despesas > 20%
    if (despPrev > 0 && (despCur - despPrev) / despPrev > 0.2) {
      const pct = Math.round(((despCur - despPrev) / despPrev) * 100);
      insights.push({
        type: "warning",
        title: "Aumento de despesas",
        description: `Suas despesas subiram ${pct}% em relação ao mês anterior.`,
        suggestion: "Revise seus gastos e identifique onde pode economizar.",
        icon: TrendingUp,
      });
    }

    // 2. Queda de faturamento > 15%
    if (recPrev > 0 && (recPrev - recCur) / recPrev > 0.15) {
      const pct = Math.round(((recPrev - recCur) / recPrev) * 100);
      insights.push({
        type: "danger",
        title: "Queda de faturamento",
        description: `Seu faturamento caiu ${pct}% em relação ao mês anterior.`,
        suggestion: "Avalie novas fontes de receita ou renegocie com clientes.",
        icon: TrendingDown,
      });
    }

    // 3. Categoria que mais cresceu (>30%)
    const catTotalsCur: Record<string, number> = {};
    const catTotalsPrev: Record<string, number> = {};
    for (const d of despesas) {
      const cat = d.categoria || "Outros";
      if (d.data.startsWith(curKey)) catTotalsCur[cat] = (catTotalsCur[cat] || 0) + d.valor;
      if (d.data.startsWith(prevKey)) catTotalsPrev[cat] = (catTotalsPrev[cat] || 0) + d.valor;
    }
    let topCat = "";
    let topPct = 0;
    for (const cat of Object.keys(catTotalsCur)) {
      const prev = catTotalsPrev[cat] || 0;
      if (prev > 0) {
        const pct = (catTotalsCur[cat] - prev) / prev;
        if (pct > 0.3 && pct > topPct) {
          topPct = pct;
          topCat = cat;
        }
      }
    }
    if (topCat) {
      insights.push({
        type: "warning",
        title: `Crescimento em ${topCat}`,
        description: `Seus gastos com ${topCat} cresceram ${Math.round(topPct * 100)}% em relação ao mês anterior.`,
        suggestion: `Considere alternativas mais econômicas para ${topCat}.`,
        icon: BarChart3,
      });
    }

    // 4. Lucro abaixo da média (últimos 3 meses)
    const lucros: number[] = [];
    for (let i = 1; i <= 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const k = getMonthKey(d);
      lucros.push(sumByMonth(receitas, k) - sumByMonth(despesas, k));
    }
    const avgLucro = lucros.reduce((a, b) => a + b, 0) / (lucros.length || 1);

    if (avgLucro > 0 && lucroCur < avgLucro * 0.7) {
      insights.push({
        type: "warning",
        title: "Lucro abaixo da média",
        description: `Seu lucro este mês está abaixo de 70% da média dos últimos 3 meses.`,
        suggestion: "Compare seus custos fixos e variáveis para encontrar oportunidades.",
        icon: AlertTriangle,
      });
    }

    // 5. Previsão de déficit
    if (despCur > recCur && recCur > 0) {
      insights.push({
        type: "danger",
        title: "Previsão de déficit",
        description: `Suas despesas superam o faturamento neste mês. Atenção ao fluxo de caixa.`,
        suggestion: "Priorize cobranças pendentes e adie despesas não essenciais.",
        icon: ShieldAlert,
      });
    }

    // 6. Mês positivo
    if (avgLucro > 0 && lucroCur > avgLucro) {
      insights.push({
        type: "success",
        title: "Mês positivo!",
        description: `Seu lucro está acima da média dos últimos 3 meses. Continue assim!`,
        suggestion: "Aproveite para criar uma reserva de emergência.",
        icon: ThumbsUp,
      });
    }

    return insights;
  }, [receitas, despesas]);
}
