import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Financial Formatters
export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export const formatDate = (date: string) => {
  const d = date.includes("T") ? new Date(date) : new Date(date + "T12:00:00");
  return new Intl.DateTimeFormat("pt-BR").format(d);
};

// Financial Categories
export const revenueCategories = [
  "Prestação de Serviço",
  "Venda de Produto",
  "Consultoria",
  "Comissão",
  "Outros",
];

export const expenseCategories = [
  "Aluguel",
  "Internet/Telefone",
  "Material de Escritório",
  "Transporte",
  "Alimentação",
  "Marketing",
  "Software/Assinaturas",
  "Entretenimento",
  "Impostos",
  "Outros",
];

// Auto-categorization keywords map
const categoryKeywords: Record<string, string[]> = {
  "Transporte": ["uber", "99", "cabify", "combustível", "gasolina", "estacionamento", "pedágio", "ônibus", "metrô", "táxi", "posto"],
  "Alimentação": ["ifood", "rappi", "restaurante", "lanchonete", "mercado", "supermercado", "padaria", "café", "almoço", "jantar", "comida"],
  "Software/Assinaturas": ["adobe", "google", "microsoft", "aws", "heroku", "vercel", "github", "notion", "slack", "zoom", "canva", "figma", "chatgpt", "openai", "saas", "assinatura", "licença"],
  "Entretenimento": ["netflix", "spotify", "disney", "hbo", "amazon prime", "youtube", "cinema", "show", "ingresso", "streaming", "xbox", "playstation", "steam"],
  "Internet/Telefone": ["claro", "vivo", "tim", "oi", "internet", "telefone", "celular", "fibra"],
  "Aluguel": ["aluguel", "condomínio", "iptu"],
  "Marketing": ["google ads", "facebook ads", "meta ads", "instagram", "marketing", "anúncio", "campanha", "publicidade"],
  "Material de Escritório": ["papelaria", "impressora", "toner", "papel", "caneta", "escritório"],
  "Impostos": ["imposto", "das", "simples nacional", "inss", "irpf", "iss", "icms"],
};

export function suggestCategory(description: string): string | null {
  const lower = description.toLowerCase().trim();
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category;
    }
  }
  return null;
}
