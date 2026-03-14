import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { CreditCard, Calendar, DollarSign, Pencil, Trash2 } from "lucide-react";
import { transactionColors } from "@/lib/categories";
import { banks, BankLogo } from "@/lib/banks";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tables } from "@/integrations/supabase/types";

type Cartao = Tables<"cartoes_credito">;

interface CardDashboardItemProps {
  cartao: Cartao;
  isActive: boolean;
  onClick: () => void;
  onEdit: (cartao: Cartao) => void;
  onDelete: (id: string) => void;
  limiteUsado: number;
  limiteDisponivel: number;
}

export function CardDashboardItem({
  cartao,
  isActive,
  onClick,
  onEdit,
  onDelete,
  limiteUsado,
  limiteDisponivel,
}: CardDashboardItemProps) {
  const bankInfo = banks.find((b) => b.id === cartao.banco);
  const usagePercent = cartao.limite_total && cartao.limite_total > 0 
    ? (limiteUsado / cartao.limite_total) * 100 
    : 0;

  return (
    <Card 
      className={`min-w-[300px] w-full max-w-sm shrink-0 cursor-pointer transition-all ${
        isActive 
          ? "border-purple-500 ring-1 ring-purple-500 shadow-md" 
          : "border-border hover:border-purple-500/50 hover:shadow-sm"
      }`}
      onClick={onClick}
    >
      <CardContent className="p-5 flex flex-col h-full justify-between gap-4">
        {/* Header: Logo + Nome + Ações */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              isActive ? "bg-purple-500/10" : "bg-muted"
            }`}>
               {bankInfo ? <BankLogo bankId={bankInfo.id} size={20} /> : <CreditCard className={`h-5 w-5 ${isActive ? "text-purple-600" : "text-muted-foreground"}`} />}
            </div>
            <div>
              <h3 className="font-heading font-bold text-base leading-tight">{cartao.nome}</h3>
              <p className="text-xs text-muted-foreground">{bankInfo?.name || "Outro Banco"}</p>
            </div>
          </div>
          
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(cartao)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir cartão?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Todas as compras e faturas deste cartão serão excluídas permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(cartao.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Datas importantes */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
            <Calendar className="h-3.5 w-3.5" />
            Fecha dia {cartao.dia_fechamento}
          </span>
          <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
            <DollarSign className="h-3.5 w-3.5" />
            Vence dia {cartao.dia_vencimento}
          </span>
        </div>

        {/* Barra de Limite */}
        <div className="space-y-2 mt-auto">
          <div className="flex justify-between text-sm items-end">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Limite disponível</span>
              <span className={`font-bold ${limiteDisponivel <= 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"}`}>
                {formatCurrency(limiteDisponivel)}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(cartao.limite_total || 0)}
              </span>
            </div>
          </div>
          <Progress value={Math.min(usagePercent, 100)} className={`h-2 ${usagePercent >= 100 ? "[&>div]:bg-destructive" : "[&>div]:bg-purple-500"}`} />
          <div className="text-[10px] text-right text-muted-foreground font-medium">
            Usado: {formatCurrency(limiteUsado)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
