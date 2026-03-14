import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const actionRouter = {
  async handleAction(intent: string, data: any, userId: string): Promise<boolean> {
    if (intent === 'add_transaction' || intent === 'add_expense' || intent === 'add_income') {
      try {
        // Achata os dados caso a IA tenha retornado dentro de api_params
        const actualData = data.api_params || data;
        const type = actualData.type || (intent === 'add_income' ? 'income' : 'expense');
        
        console.log("[actionRouter] Enviando para vektor-api:", { ...actualData, type });

        // Chamada via vektor-api para consistência
        const { data: result, error } = await supabase.functions.invoke('vektor-api', {
          body: {
            ...actualData,
            type
          }
        });

        if (error) throw error;
        
        toast.success("Transação registrada com sucesso!");
        return true;
      } catch (err) {
        console.error("Erro ao registrar transação:", err);
        toast.error("Erro ao registrar transação");
        return false;
      }
    }

    // Outras intenções podem envolver navegação ou abertura de modais
    return false;
  }
};
