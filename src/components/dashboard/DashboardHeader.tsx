import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Plus, TrendingUp, TrendingDown, User, Briefcase, Layers } from "lucide-react";
import { useFinancialView, type FinancialView } from "@/contexts/FinancialViewContext";

interface DashboardHeaderProps {
  hasCnpj: boolean;
  onSyncOpen: () => void;
}

export function DashboardHeader({ hasCnpj, onSyncOpen }: DashboardHeaderProps) {
  const { view: financialView, setView: setFinancialView } = useFinancialView();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold">Olá, bem-vindo ao Vektor</h1>
          <p className="text-sm text-muted-foreground">Seu centro de controle financeiro.</p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="hidden md:flex">
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/receitas/nova")}>
                <TrendingUp className="h-4 w-4 mr-2" /> Registrar Receita
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/despesas/nova")}>
                <TrendingDown className="h-4 w-4 mr-2" /> Registrar Despesa
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/despesas/nova?tipo=investment")}>
                <TrendingUp className="h-4 w-4 mr-2 text-primary" /> + Investimento
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/clientes/novo")}>
                <User className="h-4 w-4 mr-2" /> Novo Cliente
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground font-medium">Visualizar:</span>
        <ToggleGroup
          type="single"
          value={financialView}
          onValueChange={(v) => { if (v) setFinancialView(v as FinancialView); }}
          className="bg-muted/50 rounded-lg p-1"
        >
          <ToggleGroupItem value="pessoal" aria-label="Pessoal" className="gap-1.5 px-3 text-xs data-[state=on]:bg-background data-[state=on]:shadow-sm rounded-md">
            <User className="h-3.5 w-3.5" />
            Pessoal
          </ToggleGroupItem>
          {hasCnpj && (
            <>
              <ToggleGroupItem value="mei" aria-label="MEI" className="gap-1.5 px-3 text-xs data-[state=on]:bg-background data-[state=on]:shadow-sm rounded-md">
                <Briefcase className="h-3.5 w-3.5" />
                MEI
              </ToggleGroupItem>
              <ToggleGroupItem value="tudo" aria-label="Tudo" className="gap-1.5 px-3 text-xs data-[state=on]:bg-background data-[state=on]:shadow-sm rounded-md">
                <Layers className="h-3.5 w-3.5" />
                Tudo
              </ToggleGroupItem>
            </>
          )}
        </ToggleGroup>
      </div>
    </div>
  );
}
