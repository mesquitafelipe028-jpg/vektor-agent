import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { transactionColors } from "@/lib/categories";
import { CategoryIcon } from "@/components/CategoryIcon";
import { Pencil, Trash2, CheckCircle, MoreVertical } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { Tables } from "@/integrations/supabase/types";

type Compra = Tables<"compras_cartao">;
type Fatura = Tables<"faturas_cartao">;
type Cartao = Tables<"cartoes_credito">;

interface InvoiceGroup {
  mesRef: string; // YYYY-MM
  compras: Compra[];
  total: number;
  faturaDb?: Fatura;
  type: "current" | "next" | "future" | "past";
}

interface InvoiceTimelineProps {
  cartao: Cartao;
  compras: Compra[];
  faturas: Fatura[];
  isMobile: boolean;
  onPayInvoice: (mesRef: string, total: number) => void;
  onEditCompra: (c: Compra) => void;
  onDeleteCompra: (id: string) => void;
}

// Helpers
function getPurchaseInvoicePeriod(purchaseDate: string, diaFechamento: number) {
  const d = new Date(purchaseDate + "T12:00:00");
  const day = d.getDate();
  const y = d.getFullYear();
  const m = d.getMonth();
  if (day >= diaFechamento) {
    const next = new Date(y, m + 1, 1);
    return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
  }
  return `${y}-${String(m + 1).padStart(2, "0")}`;
}

function getCurrentInvoicePeriod(diaFechamento: number) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  if (d >= diaFechamento) {
    const next = new Date(y, m + 1, 1);
    return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
  }
  return `${y}-${String(m + 1).padStart(2, "0")}`;
}

function formatMonthLabel(mesRef: string) {
  const [y, m] = mesRef.split("-").map(Number);
  const d = new Date(y, m - 1);
  const label = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function InvoiceTimeline({
  cartao,
  compras,
  faturas,
  isMobile,
  onPayInvoice,
  onEditCompra,
  onDeleteCompra,
}: InvoiceTimelineProps) {
  const currentPeriod = useMemo(() => getCurrentInvoicePeriod(cartao.dia_fechamento || 1), [cartao.dia_fechamento]);

  // agrupar faturas
  const groups = useMemo(() => {
    const map = new Map<string, Compra[]>();
    for (const c of compras) {
      const period = getPurchaseInvoicePeriod(c.data, cartao.dia_fechamento || 1);
      if (!map.has(period)) map.set(period, []);
      map.get(period)!.push(c);
    }

    const result: InvoiceGroup[] = [];
    for (const [mesRef, groupCompras] of map.entries()) {
      const total = groupCompras.reduce((acc, c) => acc + c.valor, 0);
      const faturaDb = faturas.find((f) => f.mes_referencia === mesRef);
      
      let type: InvoiceGroup["type"] = "past";
      if (mesRef === currentPeriod) type = "current";
      else if (mesRef > currentPeriod) type = "future"; // simplificado (alfanumerico YYYY-MM funciona)
      // Definimos "next" como o proximo mes exato do current
      const [cy, cm] = currentPeriod.split("-").map(Number);
      const nextDate = new Date(cy, cm, 1);
      const exactNextPeriod = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;
      if (mesRef === exactNextPeriod) type = "next";

      result.push({ mesRef, compras: groupCompras, total, faturaDb, type });
    }

    // Ordenar: Faturas futuras primeiro, depois atuais, depois passadas
    return result.sort((a, b) => b.mesRef.localeCompare(a.mesRef));
  }, [compras, cartao.dia_fechamento, faturas, currentPeriod]);

  const renderPurchaseList = (groupCompras: Compra[]) => {
    if (isMobile) {
      return (
        <div className="space-y-2 mt-4">
          {groupCompras.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
            >
              <CategoryIcon category={c.categoria} type="cartao" size={28} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{c.descricao}</p>
                <p className="text-[11px] text-muted-foreground">{c.categoria ?? "Sem categoria"}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[11px] text-muted-foreground">{formatDate(c.data)}</p>
                <p className={`font-heading font-bold text-sm ${transactionColors.cartao.text}`}>
                  {formatCurrency(c.valor)}
                </p>
              </div>
              <AlertDialog>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditCompra(c)}>
                      <Pencil className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                  </DropdownMenuContent>
                </DropdownMenu>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir compra?</AlertDialogTitle>
                    <AlertDialogDescription>
                      A compra "{c.descricao}" será removida permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDeleteCompra(c.id)} className="bg-destructive text-destructive-foreground">
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </motion.div>
          ))}
        </div>
      );
    }

    return (
      <Table className="mt-4">
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupCompras.map((c, i) => (
            <motion.tr
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="border-b transition-colors hover:bg-muted/50"
            >
              <TableCell>{formatDate(c.data)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <CategoryIcon category={c.categoria} type="cartao" size={24} />
                  <span className="font-medium">{c.descricao}</span>
                </div>
              </TableCell>
              <TableCell>{c.categoria ?? "—"}</TableCell>
              <TableCell className={`text-right font-semibold ${transactionColors.cartao.text}`}>
                {formatCurrency(c.valor)}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => onEditCompra(c)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir compra?</AlertDialogTitle>
                      <AlertDialogDescription>
                        A compra "{c.descricao}" será removida permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDeleteCompra(c.id)} className="bg-destructive text-destructive-foreground">
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    );
  };

  if (groups.length === 0) {
    return <p className="text-center text-muted-foreground py-8">Nenhuma fatura encontrada para este cartão.</p>;
  }

  return (
    <Accordion type="multiple" defaultValue={[currentPeriod]} className="space-y-4">
      {groups.map((group) => {
        const isPaid = group.faturaDb?.status === "paga";
        
        // Define color and title prefix based on type
        let badgeColor = "bg-muted text-muted-foreground";
        let prefix = "";
        
        if (group.type === "current") {
          badgeColor = "bg-primary/10 text-primary border-primary/20";
          prefix = "Atual — ";
        } else if (group.type === "next") {
          badgeColor = "bg-purple-500/10 text-purple-600 border-purple-500/20";
          prefix = "Próxima — ";
        } else if (group.type === "future") {
          badgeColor = "bg-orange-500/10 text-orange-600 border-orange-500/20";
          prefix = "Futura — ";
        }

        if (isPaid) {
          badgeColor = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
        }

        return (
          <AccordionItem value={group.mesRef} key={group.mesRef} className="border rounded-lg bg-card overflow-hidden">
            <AccordionTrigger className="px-5 hover:bg-muted/50 hover:no-underline transition-colors data-[state=open]:border-b">
              <div className="flex flex-1 items-center justify-between pr-4">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-heading font-semibold text-lg text-left">
                      {prefix}{formatMonthLabel(group.mesRef)}
                    </span>
                    <Badge variant="outline" className={badgeColor}>
                      {isPaid ? "Fatura Paga" : group.type === "past" ? "Fechada/Pendente" : "Fatura Aberta"}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-muted-foreground">Total da fatura</span>
                  <span className="font-heading font-bold text-lg">{formatCurrency(group.total)}</span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-5 pb-5 pt-2">
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm font-medium">{group.compras.length} compras nessa fatura</span>
                
                {/* Botão de pagamento (apenas se não estiver paga e houver valor) */}
                {!isPaid && group.total > 0 && group.type !== "future" && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="text-secondary border-secondary hover:bg-secondary/10">
                        <CheckCircle className="mr-2 h-4 w-4" /> Pagar Fatura
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Pagar fatura de {formatMonthLabel(group.mesRef)}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Será registrada uma despesa de {formatCurrency(group.total)} no sistema. Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onPayInvoice(group.mesRef, group.total)}>
                          Confirmar Pagamento
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
              
              {renderPurchaseList(group.compras)}
              
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
