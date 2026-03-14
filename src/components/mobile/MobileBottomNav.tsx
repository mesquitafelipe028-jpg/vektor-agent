import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, TrendingUp, TrendingDown, Plus, X, Receipt, UserPlus, MoreHorizontal, LineChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Receitas", icon: TrendingUp, path: "/receitas" },
  { label: "Adicionar", icon: Plus, path: "", isFab: true },
  { label: "Despesas", icon: TrendingDown, path: "/despesas" },
  { label: "Mais", icon: MoreHorizontal, path: "/mais" },
];

const quickActions = [
  { label: "Nova Receita", icon: TrendingUp, path: "/receitas/nova", color: "text-primary" },
  { label: "Nova Despesa", icon: Receipt, path: "/despesas/nova", color: "text-destructive" },
  { label: "+ Investimento", icon: LineChart, path: "/despesas/nova?tipo=investment", color: "text-sky-500" },
  { label: "Novo Cliente", icon: UserPlus, path: "/clientes/novo", color: "text-chart-3" },
];

export function MobileBottomNav() {
  const [fabOpen, setFabOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <AnimatePresence>
        {fabOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[998]"
              onClick={() => setFabOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[999] flex flex-col gap-3 items-center"
            >
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => { setFabOpen(false); setTimeout(() => navigate(action.path), 200); }}
                  className="flex items-center gap-3 bg-card border border-border rounded-full px-5 py-3 shadow-lg min-w-[200px]"
                >
                  <action.icon className={cn("h-5 w-5", action.color)} />
                  <span className="text-sm font-medium text-foreground">{action.label}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav 
        className="fixed bottom-0 left-0 right-0 z-[997] bg-card/80 backdrop-blur-lg border-t border-border md:hidden" 
        style={{ 
          paddingBottom: "var(--safe-area-bottom)",
          height: "calc(var(--mobile-nav-height) + var(--safe-area-bottom))"
        }}
      >
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            if (item.isFab) {
              return (
                <button
                  key="fab"
                  onClick={() => setFabOpen((v) => !v)}
                  className="relative -mt-5 flex items-center justify-center h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg active:scale-95 transition-transform"
                >
                  <motion.div animate={{ rotate: fabOpen ? 45 : 0 }} transition={{ duration: 0.2 }}>
                    {fabOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                  </motion.div>
                </button>
              );
            }

            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 flex-1 py-2 transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
