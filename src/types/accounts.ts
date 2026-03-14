import { Tables, TablesInsert } from "@/integrations/supabase/types";

export type AccountType = "banco" | "digital" | "carteira" | "cartao" | "investimento";
export type AccountClassification = "pessoal" | "mei";

export interface ContaFinanceira extends Omit<Tables<"contas_financeiras">, "tipo" | "classificacao"> {
  tipo: AccountType;
  classificacao: AccountClassification;
}

export type ContaFinanceiraInsert = TablesInsert<"contas_financeiras">;
