import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tables, TablesInsert } from "@/integrations/supabase/types";

export type InvestimentoAtivo = Tables<"investimento_ativos">;
export type InvestimentoAtivoInsert = TablesInsert<"investimento_ativos">;
export type InvestimentoDividendo = Tables<"investimento_dividendos">;
export type InvestimentoDividendoInsert = TablesInsert<"investimento_dividendos">;

export function useInvestments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const ativos = useQuery({
    queryKey: ["investimento_ativos", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investimento_ativos")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as InvestimentoAtivo[];
    },
    enabled: !!userId,
  });

  const addAtivo = useMutation({
    mutationFn: async (ativo: Omit<InvestimentoAtivoInsert, "user_id">) => {
      const { error } = await supabase
        .from("investimento_ativos")
        .insert({ ...ativo, user_id: userId! } as InvestimentoAtivoInsert);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["investimento_ativos"] }),
  });

  const updateAtivo = useMutation({
    mutationFn: async ({ id, ...data }: Partial<InvestimentoAtivo> & { id: string }) => {
      const { error } = await supabase
        .from("investimento_ativos")
        .update(data as any)
        .eq("id", id)
        .eq("user_id", userId!);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["investimento_ativos"] }),
  });

  const deleteAtivo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("investimento_ativos")
        .delete()
        .eq("id", id)
        .eq("user_id", userId!);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["investimento_ativos"] }),
  });

  const dividendos = useQuery({
    queryKey: ["investimento_dividendos", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("investimento_dividendos")
        .select("*")
        .eq("user_id", userId!)
        .order("data_recebimento", { ascending: false });
      if (error) throw error;
      return (data ?? []) as InvestimentoDividendo[];
    },
    enabled: !!userId,
  });

  const addDividendo = useMutation({
    mutationFn: async (div: Omit<InvestimentoDividendoInsert, "user_id">) => {
      const { error } = await supabase
        .from("investimento_dividendos")
        .insert({ ...div, user_id: userId! } as InvestimentoDividendoInsert);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["investimento_dividendos"] }),
  });

  const deleteDividendo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("investimento_dividendos")
        .delete()
        .eq("id", id)
        .eq("user_id", userId!);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["investimento_dividendos"] }),
  });

  return { ativos, addAtivo, updateAtivo, deleteAtivo, dividendos, addDividendo, deleteDividendo };
}
