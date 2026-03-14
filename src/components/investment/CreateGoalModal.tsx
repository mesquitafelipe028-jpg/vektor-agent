import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Target } from "lucide-react";

interface CreateGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestedName?: string;
  suggestedTarget?: number;
  suggestedYears?: number;
  suggestedMonthly?: number;
}

export function CreateGoalModal({
  open,
  onOpenChange,
  suggestedName = "",
  suggestedTarget = 0,
  suggestedYears = 1,
  suggestedMonthly = 0,
}: CreateGoalModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [titulo, setTitulo] = useState(suggestedName);
  const [valorAlvo, setValorAlvo] = useState(String(suggestedTarget));
  const [prazoAnos, setPrazoAnos] = useState(String(suggestedYears));
  const [valorMensal, setValorMensal] = useState(String(suggestedMonthly));

  // Reset form when modal opens with new values
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setTitulo(suggestedName);
      setValorAlvo(String(suggestedTarget));
      setPrazoAnos(String(suggestedYears));
      setValorMensal(String(suggestedMonthly));
    }
    onOpenChange(isOpen);
  };

  const createGoal = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Não autenticado");
      if (!titulo.trim() || !valorAlvo) throw new Error("Preencha os campos");

      const prazoDate = new Date();
      prazoDate.setFullYear(prazoDate.getFullYear() + (parseInt(prazoAnos) || 1));
      const prazo = prazoDate.toISOString().slice(0, 10);

      const { error } = await (supabase as any).from("metas_financeiras").insert({
        user_id: user.id,
        titulo: titulo.trim(),
        valor_alvo: parseFloat(valorAlvo) || 0,
        valor_atual: 0,
        prazo,
        categoria: "Investimento",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["metas_financeiras"] });
      toast.success("Meta de investimento criada com sucesso!");
      onOpenChange(false);
    },
    onError: () => toast.error("Erro ao criar meta."),
  });

  const handleSubmit = () => {
    if (!titulo.trim()) {
      toast.error("Informe o nome da meta.");
      return;
    }
    if (!valorAlvo || parseFloat(valorAlvo) <= 0) {
      toast.error("Informe um valor objetivo válido.");
      return;
    }
    createGoal.mutate();
  };

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Criar Meta de Investimento
          </DialogTitle>
          <DialogDescription>
            Salve esta simulação como uma meta financeira para acompanhar seu progresso.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Nome da meta *</Label>
            <Input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Reserva financeira, Independência financeira"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label>Valor objetivo (R$) *</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={valorAlvo}
              onChange={(e) => setValorAlvo(e.target.value)}
              placeholder="100000.00"
            />
          </div>

          <div className="space-y-2">
            <Label>Prazo (anos)</Label>
            <Input
              type="number"
              min="1"
              step="1"
              value={prazoAnos}
              onChange={(e) => setPrazoAnos(e.target.value)}
              placeholder="5"
            />
          </div>

          <div className="space-y-2">
            <Label>Valor mensal sugerido (R$)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={valorMensal}
              onChange={(e) => setValorMensal(e.target.value)}
              placeholder="500.00"
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Valor calculado automaticamente pela simulação
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={createGoal.isPending}>
            {createGoal.isPending ? "Salvando..." : "Salvar meta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
