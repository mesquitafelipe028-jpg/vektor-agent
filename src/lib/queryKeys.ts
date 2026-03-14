export const queryKeys = {
  receitas: (userId?: string) => ["receitas", userId],
  despesas: (userId?: string) => ["despesas", userId],
  accounts: (userId?: string) => ["contas_financeiras", userId],
  empresa: (userId?: string) => ["empresa", userId],
  impostos: (userId?: string) => ["impostos_mei", userId],
  impostosPendente: (userId?: string) => ["impostos_mei_pendente", userId],
  metas: (userId?: string) => ["metas_financeiras", userId],
  categorias: (userId?: string, tipo?: string) => ["categorias-custom", userId, tipo],
  preferences: (userId?: string) => ["user_preferences", userId],
  investimentos: (userId?: string) => ["investimentos", userId],
  dividendos: (userId?: string) => ["dividendos", userId],
  dashboard: (userId?: string) => ["dashboard", userId],
};
