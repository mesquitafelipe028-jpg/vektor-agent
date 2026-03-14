import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAccounts } from "@/hooks/useAccounts";
import { queryKeys } from "@/lib/queryKeys";
import { calcularLimiteProporcional } from "@/lib/fiscal";
import { useFinancialView, type FinancialView as ViewType } from "@/contexts/FinancialViewContext";

export type FinancialView = ViewType;

export function useFinancialData(overrideView?: FinancialView) {
  const { view: globalView } = useFinancialView();
  const view = overrideView || globalView;
  const { user } = useAuth();
  const { accounts, isLoading: loadingAccounts } = useAccounts();

  const { data: receitas = [], isLoading: loadingReceitas } = useQuery({
    queryKey: queryKeys.receitas(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase.from("receitas").select("*, clientes(nome)").order("data", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: despesas = [], isLoading: loadingDespesas } = useQuery({
    queryKey: queryKeys.despesas(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase.from("despesas").select("*").order("data", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: empresa } = useQuery({
    queryKey: queryKeys.empresa(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("empresas")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const now = new Date();
  const currentYear = now.getFullYear().toString();
  const currentMonth = `${currentYear}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const filteredData = useMemo(() => {
    const rSet = view === "tudo" ? receitas : receitas.filter((r: any) => r.tipo_conta === view);
    const dSet = view === "tudo" ? despesas : despesas.filter((d: any) => d.tipo_conta === view);
    
    // STRICT LOGIC: Only settled items
    const settledReceitas = rSet.filter(r => r.status === "recebido");
    const allSettledDespesas = dSet.filter(d => d.status === "pago");
    
    const settledInvestments = allSettledDespesas.filter((d: any) => d.tipo === "investment");
    const settledDespesas = allSettledDespesas.filter((d: any) => d.tipo !== "investment");

    // Orphaned Balance
    const orphanRecs = settledReceitas.filter(r => !r.conta_id);
    const orphanDesps = settledDespesas.filter(d => !d.conta_id);
    const orphanInvests = settledInvestments.filter(i => !i.conta_id);
    
    const orphanedBalance = orphanRecs.reduce((s, r) => s + r.valor, 0) - 
                           orphanDesps.reduce((s, d) => s + d.valor, 0) -
                           orphanInvests.reduce((s, i) => s + i.valor, 0);

    // Total Balance
    const accountsBalance = accounts
      .filter(a => view === "tudo" || a.classificacao === view)
      .reduce((s, a) => s + (a.saldo || 0), 0);
    
    const saldoTotal = accounts.length > 0 ? accountsBalance : orphanedBalance;

    // Monthly stats
    const receitasMes = settledReceitas.filter((r) => r.data.startsWith(currentMonth));
    const despesasMes = settledDespesas.filter((d) => d.data.startsWith(currentMonth));
    const faturamentoMes = receitasMes.reduce((s, r) => s + r.valor, 0);
    const despesasMesTotal = despesasMes.reduce((s, d) => s + d.valor, 0);
    const saldoMes = faturamentoMes - despesasMesTotal;

    // Investment stats
    const totalInvestido = settledInvestments.reduce((s, i) => s + i.valor, 0);
    const aportesMes = settledInvestments.filter((i) => i.data.startsWith(currentMonth)).reduce((s, i) => s + i.valor, 0);

    // MEI Limit
    const limiteMei = calcularLimiteProporcional(empresa?.data_abertura);
    const faturamentoAnual = settledReceitas
      .filter((r) => r.data.startsWith(currentYear))
      .reduce((s, r) => s + r.valor, 0);

    // Savings Rate (Pessoal)
    const rendaPessoalMes = settledReceitas.filter(r => r.tipo_conta === 'pessoal' && r.data.startsWith(currentMonth)).reduce((s, r) => s + r.valor, 0);
    const despPessoalMes = settledDespesas.filter(d => d.tipo_conta === 'pessoal' && d.data.startsWith(currentMonth)).reduce((s, d) => s + d.valor, 0);
    const taxaPoupanca = rendaPessoalMes > 0 ? ((rendaPessoalMes - despPessoalMes) / rendaPessoalMes) * 100 : 0;

    return {
      saldoTotal,
      faturamentoMes,
      despesasMesTotal,
      saldoMes,
      totalInvestido,
      aportesMes,
      limiteMei,
      faturamentoAnual,
      taxaPoupanca,
      orphanedBalance,
      orphanedCount: orphanRecs.length + orphanDesps.length + orphanInvests.length,
      hasCnpj: !!empresa?.cnpj,
      raw: {
        receitas: rSet,
        despesas: dSet,
        settledReceitas,
        settledDespesas
      }
    };
  // Loading flags intentionally excluded - they cause unnecessary recomputes.
  // The data arrays (receitas, despesas, accounts) already change reference when data arrives.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receitas, despesas, accounts, empresa, view, currentMonth, currentYear]);

  return {
    ...filteredData,
    empresa,
    loading: loadingReceitas || loadingDespesas || loadingAccounts,
  };
}
