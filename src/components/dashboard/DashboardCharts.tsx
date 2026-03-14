import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

const FALLBACK_COLOR = "hsl(220, 20%, 65%)";

interface DashboardChartsProps {
  monthlyData: { month: string; receitas: number; despesas: number }[];
  categoryData: { name: string; value: number; fill?: string }[];
}

export default function DashboardCharts({ monthlyData, categoryData }: DashboardChartsProps) {
  const isMobile = useIsMobile();
  const animationDuration = isMobile ? 800 : 1500;
  const pieAnimationDuration = isMobile ? 600 : 1400;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="shadow-md border-primary/5 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-lg flex items-center justify-between">
            <span className="flex items-center gap-2">Receitas vs Despesas</span>
            <span className="text-[10px] text-muted-foreground font-normal uppercase tracking-widest bg-muted/50 px-2 py-0.5 rounded border border-border/50">6 meses</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 sm:h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barGap={12} margin={{ bottom: 10, top: 10 }}>
                <defs>
                  <linearGradient id="gradReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(160, 95%, 50%)" stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(160, 95%, 40%)" stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id="gradDespesa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(0, 95%, 70%)" stopOpacity={1} />
                    <stop offset="100%" stopColor="hsl(0, 95%, 60%)" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/30" />
                <XAxis 
                  dataKey="month" 
                  className="text-[10px] font-semibold text-muted-foreground" 
                  axisLine={false} 
                  tickLine={false} 
                  dy={10}
                />
                <YAxis 
                  className="text-[10px] font-semibold text-muted-foreground" 
                  tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} 
                  axisLine={false} 
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--primary))', opacity: 0.05 }}
                  contentStyle={{ 
                    backgroundColor: 'rgba(var(--background), 0.8)', 
                    backdropFilter: 'blur(8px)',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '16px',
                    fontSize: '11px',
                    fontWeight: '700',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                  formatter={(v: number) => [formatCurrency(v), ""]} 
                />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  iconType="circle" 
                  wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingBottom: '24px' }}
                />
                <Bar 
                  dataKey="receitas" 
                  name="Receitas" 
                  fill="url(#gradReceita)" 
                  radius={[6, 6, 0, 0]} 
                  barSize={18}
                  animationDuration={animationDuration}
                />
                <Bar 
                  dataKey="despesas" 
                  name="Despesas" 
                  fill="url(#gradDespesa)" 
                  radius={[6, 6, 0, 0]} 
                  barSize={18}
                  animationDuration={animationDuration}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md border-primary/5 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="font-heading text-lg flex items-center justify-between">
            <span>Despesas por Categoria</span>
            <span className="text-[10px] text-muted-foreground font-normal uppercase tracking-widest bg-muted/50 px-2 py-0.5 rounded border border-border/50">Mensal</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 sm:h-72 mt-4 flex flex-col items-center justify-center relative">
            {categoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground italic">
                Nenhuma despesa registrada este mês.
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={98}
                      paddingAngle={6}
                      dataKey="value"
                      nameKey="name"
                      label={false}
                      stroke="none"
                      animationBegin={0}
                      animationDuration={pieAnimationDuration}
                    >
                      {categoryData.map((item, idx) => (
                        <Cell 
                          key={idx} 
                          fill={item.fill || FALLBACK_COLOR} 
                          className="hover:saturate-150 transition-all cursor-pointer outline-none"
                          style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))' }}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(var(--background), 0.8)', 
                        backdropFilter: 'blur(8px)',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '16px',
                        boxShadow: '0 12px 24px -5px rgb(0 0 0 / 0.3)',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                      itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                      formatter={(v: number, name: string) => [formatCurrency(v), name]} 
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text for Doughnut */}
                <div className="absolute inset-x-0 top-[50%] -translate-y-[50%] flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter opacity-80">Total Gasto</span>
                  <span className="text-base font-black tracking-tight text-foreground truncate px-6 max-w-full">
                    {formatCurrency(categoryData.reduce((s, c) => s + c.value, 0))}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-4 text-center opacity-60 italic font-medium">
                  Clique ou toque para ver detalhes
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
