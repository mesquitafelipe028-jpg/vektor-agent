import { Tables } from "@/integrations/supabase/types";

export const LIMITE_MEI_ANUAL = 81000;
export const LIMITE_MEI_MENSAL = 6750;
export const DAS_VALOR_PADRAO = 71.60;

export const DAS_CONFIG = {
  comercio: { label: "Comércio e Indústria", icms: 1.00, iss: 0, inss: 67.00, total: 71.60 },
  servico: { label: "Prestação de Serviços", icms: 0, iss: 5.00, inss: 67.00, total: 75.60 },
  misto: { label: "Comércio e Serviços", icms: 1.00, iss: 5.00, inss: 67.00, total: 76.60 },
} as const;

export type ActivityType = keyof typeof DAS_CONFIG;

export type Imposto = Tables<"impostos_mei">;

export function getEffectiveStatus(imp: Imposto): "pago" | "pendente" | "vencido" {
  if (imp.status === "pago") return "pago";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const venc = new Date(imp.vencimento + "T12:00:00");
  venc.setHours(0, 0, 0, 0);
  return venc < today ? "vencido" : "pendente";
}

/**
 * Calcula o limite MEI proporcional com base na data de abertura da empresa
 */
export function calcularLimiteProporcional(dataAbertura?: string | null): number {
  if (!dataAbertura) return LIMITE_MEI_ANUAL;
  
  const abertura = new Date(dataAbertura + "T12:00:00");
  const agora = new Date();
  
  // Se a abertura foi em ano anterior, o limite é o total
  if (abertura.getFullYear() < agora.getFullYear()) {
    return LIMITE_MEI_ANUAL;
  }
  
  // Se a abertura foi no futuro (ano posterior), tecnicamente limite é 0 para o ano atual
  if (abertura.getFullYear() > agora.getFullYear()) {
    return 0;
  }
  
  // Se abriu este ano, o limite é proporcional aos meses restantes
  const mesesAtivos = 12 - abertura.getMonth();
  return mesesAtivos * LIMITE_MEI_MENSAL;
}

export const statusConfig = {
  pago: { label: "Pago", class: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400", icon: "✔" },
  pendente: { label: "Pendente", class: "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-400", icon: "⏳" },
  vencido: { label: "Vencido", class: "bg-destructive/15 text-destructive border-destructive/30", icon: "⚠" },
};

export const alertColorMap = {
  warning: "border-amber-500/50 bg-amber-500/10 text-amber-800 dark:text-amber-300 [&>svg]:text-amber-600",
  danger: "border-orange-500/50 bg-orange-500/10 text-orange-800 dark:text-orange-300 [&>svg]:text-orange-600",
  critical: "border-destructive/50 bg-destructive/10 text-destructive [&>svg]:text-destructive",
};

export function situacaoColor(situacao: string) {
  const s = situacao?.toLowerCase() || "";
  if (s.includes("ativa")) return { bg: "bg-emerald-500/15", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-500/30", dot: "bg-emerald-500" };
  if (s.includes("inapt")) return { bg: "bg-destructive/15", text: "text-destructive", border: "border-destructive/30", dot: "bg-destructive" };
  return { bg: "bg-amber-500/15", text: "text-amber-700 dark:text-amber-400", border: "border-amber-500/30", dot: "bg-amber-500" };
}
