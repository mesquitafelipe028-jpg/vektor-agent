import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { TrendingUp, TrendingDown, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { expenseCategories, revenueCategories } from "@/lib/utils";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";

const QUICK_ADD_PREFS_KEY = "quickadd_prefs";

interface QuickAddPrefs {
  lastCategory: { receita: string; despesa: string };
  typeCounts: { receita: number; despesa: number };
}

function getPrefs(): QuickAddPrefs {
  try {
    const raw = localStorage.getItem(QUICK_ADD_PREFS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { lastCategory: { receita: "", despesa: "" }, typeCounts: { receita: 0, despesa: 0 } };
}

function savePrefs(prefs: QuickAddPrefs) {
  localStorage.setItem(QUICK_ADD_PREFS_KEY, JSON.stringify(prefs));
}

interface QuickAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickAddModal({ open, onOpenChange }: QuickAddModalProps) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const prefs = getPrefs();
  const defaultType = prefs.typeCounts.despesa > prefs.typeCounts.receita ? "despesa" : "receita";

  const [tipo, setTipo] = useState<"receita" | "despesa">(defaultType);
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState(prefs.lastCategory[defaultType] || "");
  const [showMore, setShowMore] = useState(false);
  const [descricao, setDescricao] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [data, setData] = useState(new Date().toISOString().slice(0, 10));

  // Reset form when opened
  useEffect(() => {
    if (open) {
      const p = getPrefs();
      const dt = p.typeCounts.despesa > p.typeCounts.receita ? "despesa" : "receita";
      setTipo(dt);
      setValor("");
      setCategoria(p.lastCategory[dt] || "");
      setShowMore(false);
      setDescricao("");
      setClienteId("");
      setData(new Date().toISOString().slice(0, 10));
    }
  }, [open]);

  // Update category when tipo changes
  useEffect(() => {
    const p = getPrefs();
    setCategoria(p.lastCategory[tipo] || "");
  }, [tipo]);

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("clientes").select("id, nome").order("nome");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const categories = tipo === "receita" ? revenueCategories : expenseCategories;

  const saveMutation = useMutation({
    mutationFn: async () => {
      const numVal = parseFloat(valor);
      if (!numVal || numVal <= 0) throw new Error("Valor inválido");

      if (tipo === "receita") {
        const { error } = await supabase.from("receitas").insert({
          descricao: descricao || categoria || "Receita rápida",
          valor: numVal,
          data,
          cliente_id: clienteId || null,
          forma_pagamento: null,
          user_id: user!.id,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("despesas").insert({
          descricao: descricao || categoria || "Despesa rápida",
          valor: numVal,
          data,
          categoria: categoria || null,
          user_id: user!.id,
        });
        if (error) throw error;
      }

      // Save prefs
      const p = getPrefs();
      p.lastCategory[tipo] = categoria;
      p.typeCounts[tipo]++;
      savePrefs(p);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.receitas() });
      qc.invalidateQueries({ queryKey: queryKeys.despesas() });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard() });
      toast.success("Transação registrada com sucesso");
      onOpenChange(false);
    },
    onError: (e) => {
      if (e.message === "Valor inválido") {
        toast.error("Informe um valor válido");
      } else {
        toast.error("Erro ao salvar transação");
      }
    },
  });

  const addQuickValue = (amount: number) => {
    const current = parseFloat(valor) || 0;
    setValor(String(current + amount));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="font-heading">Registro Rápido</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTipo("receita")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-all border",
                tipo === "receita"
                  ? "bg-primary/10 border-primary text-primary"
                  : "bg-muted/50 border-border text-muted-foreground"
              )}
            >
              <TrendingUp className="h-4 w-4" />
              Receita
            </button>
            <button
              type="button"
              onClick={() => setTipo("despesa")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-all border",
                tipo === "despesa"
                  ? "bg-destructive/10 border-destructive text-destructive"
                  : "bg-muted/50 border-border text-muted-foreground"
              )}
            >
              <TrendingDown className="h-4 w-4" />
              Despesa
            </button>
          </div>

          {/* Value - large input */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Valor (R$)</Label>
            <Input
              type="number"
              step="0.01"
              inputMode="decimal"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
              className="text-3xl font-bold h-16 text-center"
              autoFocus
            />
          </div>

          {/* Quick value buttons */}
          <div className="flex gap-2">
            {[50, 100, 200].map((amount) => (
              <Button
                key={amount}
                type="button"
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => addQuickValue(amount)}
              >
                +{amount}
              </Button>
            ))}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Categoria</Label>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* More options */}
          <Collapsible open={showMore} onOpenChange={setShowMore}>
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-1"
              >
                <span>Mais opções</span>
                <ChevronDown className={cn("h-4 w-4 transition-transform", showMore && "rotate-180")} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Descrição</Label>
                <Input
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descrição da transação"
                  maxLength={200}
                />
              </div>

              {tipo === "receita" && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Cliente</Label>
                  <Select value={clienteId} onValueChange={setClienteId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {clientes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Data</Label>
                <Input
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Save button */}
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !valor}
            className={cn(
              "w-full h-12 text-base font-semibold",
              tipo === "despesa" && "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            )}
          >
            {saveMutation.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
