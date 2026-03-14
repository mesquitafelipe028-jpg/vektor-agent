import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface QuoteResult {
  price: number;
  change: number;
  name: string;
}

export function useStockQuotes() {
  const [quotes, setQuotes] = useState<Record<string, QuoteResult>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  const fetchQuotes = useCallback(async (tickers: string[]) => {
    if (!tickers.length) return;

    setIsLoading(true);

    const attempt = async () => {
      const { data, error } = await supabase.functions.invoke("fetch-quotes", {
        body: { tickers },
      });
      if (error) throw error;
      return data;
    };

    try {
      let data;
      try {
        data = await attempt();
      } catch (firstErr: any) {
        // Retry once for network errors
        if (firstErr?.message?.includes("Failed to fetch") || firstErr?.name === "FunctionsFetchError") {
          await new Promise((r) => setTimeout(r, 2000));
          data = await attempt();
        } else {
          throw firstErr;
        }
      }

      if (data?.quotes) {
        setQuotes(data.quotes);
        setLastUpdated(new Date());
      }
    } catch (err: any) {
      console.error("Error fetching quotes:", err);
      const isCors = err?.message?.includes("Failed to fetch") || err?.name === "FunctionsFetchError";
      toast({
        title: "Erro ao buscar cotações",
        description: isCors
          ? "Não foi possível conectar à Edge Function. Verifique se ela está deployada e com Verify JWT desligado."
          : err?.message || "Verifique se a chave da BrAPI está configurada.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return { quotes, isLoading, lastUpdated, fetchQuotes };
}
