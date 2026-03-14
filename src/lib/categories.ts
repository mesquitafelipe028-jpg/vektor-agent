import {
  Utensils, Car, Home, Heart, GraduationCap, Gamepad2,
  Monitor, Banknote, Users, Phone, Megaphone, FileText,
  Receipt, Briefcase, ShoppingBag, Zap, Wifi, Package,
  CreditCard, Repeat, Calendar, ArrowRightLeft, Coins,
  TrendingUp, RotateCcw, Wrench, ShoppingCart,
  type LucideIcon,
} from "lucide-react";

// ── Category metadata with individual colors ──

export interface CategoryMeta {
  name: string;
  icon: LucideIcon;
  color: string;   // tailwind text color class
  bg: string;       // tailwind bg color class
}

export const expenseCategories: CategoryMeta[] = [
  { name: "Moradia/Aluguel",          icon: Home,           color: "text-violet-600 dark:text-violet-400",  bg: "bg-violet-500/20" },
  { name: "Alimentação/Supermercado", icon: Utensils,       color: "text-orange-600 dark:text-orange-400",  bg: "bg-orange-500/20" },
  { name: "Transporte/Combustível",   icon: Car,            color: "text-blue-600 dark:text-blue-400",      bg: "bg-blue-500/20" },
  { name: "Saúde/Academia",           icon: Heart,          color: "text-rose-600 dark:text-rose-400",      bg: "bg-rose-500/20" },
  { name: "Educação/Cursos",          icon: GraduationCap,  color: "text-sky-600 dark:text-sky-400",        bg: "bg-sky-500/20" },
  { name: "Lazer/Entretenimento",     icon: Gamepad2,       color: "text-pink-600 dark:text-pink-400",      bg: "bg-pink-500/20" },
  { name: "Insumos/Materiais",        icon: Package,        color: "text-amber-600 dark:text-amber-400",    bg: "bg-amber-500/20" },
  { name: "Telefonia/Internet",       icon: Wifi,           color: "text-cyan-600 dark:text-cyan-400",      bg: "bg-cyan-500/20" },
  { name: "Marketing/Ads",            icon: Megaphone,      color: "text-fuchsia-600 dark:text-fuchsia-400",bg: "bg-fuchsia-500/20" },
  { name: "Contabilidade/Impostos",   icon: Receipt,        color: "text-red-600 dark:text-red-400",        bg: "bg-red-500/20" },
  { name: "Manutenção/Equipamentos",  icon: Wrench,         color: "text-slate-600 dark:text-slate-400",    bg: "bg-slate-500/20" },
  { name: "Compras Variadas",         icon: ShoppingCart,   color: "text-gray-600 dark:text-gray-400",      bg: "bg-gray-500/20" },
];

export const revenueCategories: CategoryMeta[] = [
  { name: "Salário/Fixo",                    icon: Banknote,       color: "text-green-600 dark:text-green-400",     bg: "bg-green-500/20" },
  { name: "Freelance/Prestação de Serviços", icon: Briefcase,      color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/20" },
  { name: "Vendas/Comércio",                 icon: ShoppingBag,    color: "text-blue-600 dark:text-blue-400",       bg: "bg-blue-500/20" },
  { name: "Pix/Transferências",              icon: ArrowRightLeft, color: "text-violet-600 dark:text-violet-400",   bg: "bg-violet-500/20" },
  { name: "Dinheiro/Cartão",                 icon: Coins,          color: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-500/20" },
  { name: "Investimentos/Outros",            icon: TrendingUp,     color: "text-sky-600 dark:text-sky-400",         bg: "bg-sky-500/20" },
  { name: "Comissões/Parcerias",             icon: Users,          color: "text-purple-600 dark:text-purple-400",   bg: "bg-purple-500/20" },
  { name: "Reembolso/Estorno",               icon: RotateCcw,      color: "text-cyan-600 dark:text-cyan-400",       bg: "bg-cyan-500/20" },
];

// ── Lookup maps (kept for backward compat) ──

const expenseCategoryIcons: Record<string, LucideIcon> = Object.fromEntries(
  expenseCategories.map((c) => [c.name, c.icon])
);

const revenueCategoryIcons: Record<string, LucideIcon> = Object.fromEntries(
  revenueCategories.map((c) => [c.name, c.icon])
);

const paymentMethodIcons: Record<string, LucideIcon> = {
  "Pix": Zap, "PIX": Zap, "pix": Zap,
  "Boleto": FileText, "boleto": FileText,
  "Transferência": ArrowRightLeft, "transferência": ArrowRightLeft,
  "Dinheiro": Coins, "dinheiro": Coins,
  "Cartão": CreditCard, "cartão": CreditCard,
  "Cartão de Crédito": CreditCard, "Cartão de Débito": CreditCard,
};

export function getExpenseCategoryIcon(category: string | null): LucideIcon {
  return expenseCategoryIcons[category ?? ""] ?? paymentMethodIcons[category ?? ""] ?? Package;
}

export function getRevenueCategoryIcon(category: string | null): LucideIcon {
  return revenueCategoryIcons[category ?? ""] ?? paymentMethodIcons[category ?? ""] ?? Banknote;
}

export function getPaymentMethodIcon(method: string | null): LucideIcon {
  return paymentMethodIcons[method ?? ""] ?? Banknote;
}

// ── Transaction type colors (semantic) ──
export type TransactionType = "receita" | "despesa" | "transferencia" | "cartao" | "recorrente";

export const transactionColors: Record<TransactionType, { text: string; bg: string; border: string }> = {
  receita:       { text: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/20", border: "border-emerald-500/30" },
  despesa:       { text: "text-red-600 dark:text-red-400",         bg: "bg-red-500/20",     border: "border-red-500/30" },
  transferencia: { text: "text-blue-600 dark:text-blue-400",       bg: "bg-blue-500/20",    border: "border-blue-500/30" },
  cartao:        { text: "text-purple-600 dark:text-purple-400",   bg: "bg-purple-500/20",  border: "border-purple-500/30" },
  recorrente:    { text: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-500/20",   border: "border-amber-500/30" },
};

// ── Badge icons ──
export const RecurringIcon = Repeat;
export const InstallmentIcon = Calendar;
