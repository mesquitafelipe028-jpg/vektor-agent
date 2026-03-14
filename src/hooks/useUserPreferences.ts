import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useRef, useCallback } from "react";
import { Tables } from "@/integrations/supabase/types";

export interface UserPreferences {
  alerta_vencimento: boolean;
  alerta_recebimentos: boolean;
  alerta_lembretes: boolean;
  moeda: string;
  dia_fechamento: number;
}

const defaults: UserPreferences = {
  alerta_vencimento: true,
  alerta_recebimentos: true,
  alerta_lembretes: false,
  moeda: "BRL",
  dia_fechamento: 20,
};

export function useUserPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["user_preferences", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return defaults;
      return {
        alerta_vencimento: data.alerta_vencimento ?? defaults.alerta_vencimento,
        alerta_recebimentos: data.alerta_recebimentos ?? defaults.alerta_recebimentos,
        alerta_lembretes: data.alerta_lembretes ?? defaults.alerta_lembretes,
        moeda: data.moeda ?? defaults.moeda,
        dia_fechamento: data.dia_fechamento ?? defaults.dia_fechamento,
      } as UserPreferences;
    },
    enabled: !!user,
  });

  const mutation = useMutation({
    mutationFn: async (updates: Partial<UserPreferences>) => {
      const { data: existing } = await supabase
        .from("user_preferences")
        .select("id")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("user_preferences")
          .update({ ...updates, updated_at: new Date().toISOString() } as any)
          .eq("user_id", user!.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_preferences")
          .insert({ user_id: user!.id, ...updates } as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_preferences", user?.id] });
    },
    onError: () => {
      toast.error("Erro ao salvar preferência");
    },
  });

  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const updatePreference = useCallback(<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    // Optimistic update (instant UI feedback)
    queryClient.setQueryData(["user_preferences", user?.id], (old: UserPreferences | undefined) => ({
      ...(old ?? defaults),
      [key]: value,
    }));

    // Debounce the actual API call to avoid rapid-fire mutations
    if (debounceTimers.current[key]) {
      clearTimeout(debounceTimers.current[key]);
    }
    debounceTimers.current[key] = setTimeout(() => {
      mutation.mutate({ [key]: value });
    }, 500);
  }, [user?.id, queryClient, mutation]);

  return {
    preferences: (query.data ?? defaults) as UserPreferences,
    isLoading: query.isLoading,
    updatePreference,
  };
}
