import { Tables } from "@/integrations/supabase/types";

// Extended types for transaction columns added via migration
// (types.ts is auto-generated and read-only, so we extend here)

export type TipoTransacao = "unica" | "recorrente" | "parcelada";
export type Frequencia = "semanal" | "quinzenal" | "mensal" | "anual";
export type StatusReceita = "pendente" | "recebido" | "atrasado";
export type StatusDespesa = "pendente" | "pago" | "atrasado";

export interface DespesaExtended extends Omit<Tables<"despesas">, "tipo" | "frequencia" | "status" | "tipo_transacao"> {
  tipo?: "expense" | "investment";
  frequencia: Frequencia | null;
  status: StatusDespesa;
  tipo_transacao: TipoTransacao;
}

export interface ReceitaExtended extends Omit<Tables<"receitas">, "frequencia" | "status" | "tipo_transacao"> {
  frequencia: Frequencia | null;
  status: StatusReceita;
  tipo_transacao: TipoTransacao;
  clientes?: { nome: string } | null;
}

export const frequenciaLabels: Record<Frequencia, string> = {
  semanal: "Semanal",
  quinzenal: "Quinzenal",
  mensal: "Mensal",
  anual: "Anual",
};

export const statusReceitaLabels: Record<StatusReceita, string> = {
  pendente: "Pendente",
  recebido: "Recebido",
  atrasado: "Atrasado",
};

export const statusDespesaLabels: Record<StatusDespesa, string> = {
  pendente: "Pendente",
  pago: "Pago",
  atrasado: "Atrasado",
};

/** Get the interval in days for a given frequency */
export function frequenciaToDays(freq: Frequencia): number {
  switch (freq) {
    case "semanal": return 7;
    case "quinzenal": return 15;
    case "mensal": return 30;
    case "anual": return 365;
  }
}

/** Generate future dates for recurring transactions */
export function generateRecurringDates(
  startDate: string,
  frequencia: Frequencia,
  endDate?: string | null,
  maxCount = 12
): string[] {
  const dates: string[] = [];
  const start = new Date(startDate + "T12:00:00");
  const end = endDate ? new Date(endDate + "T12:00:00") : null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let current = new Date(start);
  for (let i = 0; i < maxCount; i++) {
    // Advance to next period
    if (i > 0) {
      switch (frequencia) {
        case "semanal":
          current.setDate(current.getDate() + 7);
          break;
        case "quinzenal":
          current.setDate(current.getDate() + 15);
          break;
        case "mensal":
          current.setMonth(current.getMonth() + 1);
          break;
        case "anual":
          current.setFullYear(current.getFullYear() + 1);
          break;
      }
    }
    if (end && current > end) break;
    dates.push(current.toISOString().slice(0, 10));
  }
  return dates;
}

/** Generate installment entries */
export function generateInstallments(
  valorTotal: number,
  numParcelas: number,
  dataPrimeira: string
): { valor: number; data: string; parcela: number }[] {
  const valorParcela = Math.round((valorTotal / numParcelas) * 100) / 100;
  const entries: { valor: number; data: string; parcela: number }[] = [];

  for (let i = 0; i < numParcelas; i++) {
    const d = new Date(dataPrimeira + "T12:00:00");
    d.setMonth(d.getMonth() + i);
    entries.push({
      valor: i === numParcelas - 1
        ? Math.round((valorTotal - valorParcela * (numParcelas - 1)) * 100) / 100
        : valorParcela,
      data: d.toISOString().slice(0, 10),
      parcela: i + 1,
    });
  }
  return entries;
}
