import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const actionRouter = {
  async handleAction(intent: string, data: any, userId: string): Promise<boolean> {
    if (intent === 'add_transaction' || intent === 'add_expense' || intent === 'add_income') {
      try {
        const type = intent === 'add_income' ? 'income' : 'expense';
        
        // Chamada via vektor-api para consistência
        const { data: result, error } = await supabase.functions.invoke('vektor-api', {
          body: {
            ...data,
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
