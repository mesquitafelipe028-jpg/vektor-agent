import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TrendingDown, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Receita {
  data: string;
  valor: number;
  status: string;
  recorrente?: boolean;
  frequencia?: string;
}

interface Despesa {
  data: string;
  valor: number;
  status: string;
  recorrente?: boolean;
  frequencia?: string;
}

interface CashFlowProjectionProps {
  receitas: Receita[];
  despesas: Despesa[];
  saldoAtual: number;
}

const PERIODS = [30, 60, 90] as const;
type Period = typeof PERIODS[number];

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function formatShortDate(dateStr: string) {
  const [, m, day] = dateStr.split("-");
  return `${day}/${m}`;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const balance = payload[0]?.value as number;
  const isNegative = balance < 0;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-lg text-sm">
      <p className="text-muted-foreground font-medium mb-1">{label}</p>
      <p className={`font-heading font-bold text-base ${isNegative ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}>
        {formatCurrency(balance)}
      </p>
    </div>
  );
};

export function CashFlowProjection({ receitas, despesas, saldoAtual }: CashFlowProjectionProps) {
  const [period, setPeriod] = useState<Period>(30);

  const { data, lowestBalance, criticalDays } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = addDays(today, period);

    // Map of date -> net change
    const cashMap: Record<string, number> = {};

    // Compute average monthly income/expense from last 3 months for recurrence projection
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const threeMonthsAgoStr = isoDate(threeMonthsAgo);

    const recentReceitas = receitas.filter(r => r.data >= threeMonthsAgoStr && r.status === "recebido");
    const recentDespesas = despesas.filter(d => d.data >= threeMonthsAgoStr && d.status === "pago");
    const avgMonthlyIncome = recentReceitas.reduce((s, r) => s + r.valor, 0) / 3;
    const avgMonthlyExpense = recentDespesas.reduce((s, d) => s + d.valor, 0) / 3;

    // Add future pending transactions (already entered, not yet paid/received)
    const todayStr = isoDate(today);
    const endDateStr = isoDate(endDate);

    for (const r of receitas) {
      if (r.data >= todayStr && r.data <= endDateStr && r.status !== "recebido") {
        cashMap[r.data] = (cashMap[r.data] || 0) + r.valor;
      }
    }

    for (const d of despesas) {
      if (d.data >= todayStr && d.data <= endDateStr && d.status !== "pago") {
        cashMap[d.data] = (cashMap[d.data] || 0) - d.valor;
      }
    }

    // Distribute average monthly income/expense as daily rates across remaining days
    const daysInPeriod = period;
    const dailyIncome = avgMonthlyIncome / 30;
    const dailyExpense = avgMonthlyExpense / 30;
    
    // Build projection day by day
    const points: { date: string; label: string; balance: number; isPast: boolean }[] = [];
    let runningBalance = saldoAtual;
    let lowest = saldoAtual;
    let criticalDayCount = 0;

    // Determine tick frequency
    const tickEvery = period === 30 ? 5 : period === 60 ? 10 : 15;

    for (let i = 0; i <= daysInPeriod; i++) {
      const d = addDays(today, i);
      const dateStr = isoDate(d);
      
      // Add known transactions for this date
      const knownDelta = cashMap[dateStr] || 0;
      
      // Add daily average projection (from day 1 onwards, not day 0)
      const avgDelta = i > 0 ? (dailyIncome - dailyExpense) : 0;
      
      runningBalance += knownDelta + avgDelta;

      if (runningBalance < lowest) lowest = runningBalance;
      if (runningBalance < 0) criticalDayCount++;

      // Only render ticks at intervals + first + last
      const showTick = i === 0 || i === daysInPeriod || i % tickEvery === 0;
      if (showTick) {
        points.push({
          date: dateStr,
          label: i === 0 ? "Hoje" : formatShortDate(dateStr),
          balance: Math.round(runningBalance),
          isPast: false,
        });
      }
    }

    return { data: points, lowestBalance: lowest, criticalDays: criticalDayCount };
  }, [receitas, despesas, saldoAtual, period]);

  const isHealthy = lowestBalance >= 0;
  const trendValue = data.length > 1 ? data[data.length - 1].balance - data[0].balance : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="font-heading text-lg flex items-center gap-2">
              🔮 Projeção de Fluxo de Caixa
              {isHealthy ? (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                  <CheckCircle className="h-2.5 w-2.5 mr-1" /> Saudável
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">
                  <AlertTriangle className="h-2.5 w-2.5 mr-1" /> Atenção
                </Badge>
              )}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Baseado no histórico dos últimos 3 meses + lançamentos futuros
            </p>
          </div>
          <div className="flex gap-1 shrink-0">
            {PERIODS.map((p) => (
              <Button
                key={p}
                variant={period === p ? "default" : "outline"}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setPeriod(p)}
              >
                {p}d
              </Button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3 mt-3">
          <div className="rounded-lg bg-muted/50 p-2.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Saldo Hoje</p>
            <p className={`font-heading font-bold text-sm mt-0.5 ${saldoAtual < 0 ? "text-destructive" : "text-foreground"}`}>
              {formatCurrency(saldoAtual)}
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Previsão em {period}d</p>
            <p className={`font-heading font-bold text-sm mt-0.5 ${data[data.length - 1]?.balance < 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}>
              {data.length ? formatCurrency(data[data.length - 1].balance) : "—"}
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-2.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Tendência</p>
            <p className={`font-heading font-bold text-sm mt-0.5 flex items-center gap-1 ${trendValue >= 0 ? "text-emerald-600" : "text-destructive"}`}>
              {trendValue >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trendValue >= 0 ? "+" : ""}{formatCurrency(trendValue)}
            </p>
          </div>
        </div>

        {criticalDays > 0 && (
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>
              <strong>Saldo negativo projetado em {criticalDays} dia(s)</strong>. Considere reduzir despesas ou antecipar recebimentos.
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data} margin={{ top: 10, right: 4, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={isHealthy ? "#10b981" : "#ef4444"} stopOpacity={0.25} />
                <stop offset="95%" stopColor={isHealthy ? "#10b981" : "#ef4444"} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
              width={38}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="hsl(var(--destructive))" strokeDasharray="4 2" strokeWidth={1.5} />
            <Area
              type="monotone"
              dataKey="balance"
              stroke={isHealthy ? "#10b981" : "#ef4444"}
              strokeWidth={2.5}
              fill="url(#balanceGrad)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
        <p className="text-[10px] text-muted-foreground text-center mt-1">
          Projeção baseada em média histórica + lançamentos agendados. Não é garantia de resultados futuros.
        </p>
      </CardContent>
    </Card>
  );
}
