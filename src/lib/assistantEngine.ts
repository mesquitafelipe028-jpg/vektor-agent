import { formatCurrency } from "./utils";

export type AssistantIntent = 
  | "UNKNOWN"
  | "GastoMes"
  | "ReceitaMes"
  | "SaldoAtual"
  | "MaiorDespesa"
  | "Tendencias"
  | "AnaliseCategoria"
  | "DicasEconomia";

export interface Transaction {
  id: string;
  valor: number;
  data: string;
  categoria?: string | null;
  descricao: string;
}

export interface AssistantData {
  receitas: Transaction[];
  despesas: Transaction[];
}

export function identifyIntent(message: string): AssistantIntent {
  const normalized = message.toLowerCase().trim();
  
  // 1. Tendências e Comparações
  if (
    normalized.includes("compar") || 
    normalized.includes("tendencia") || 
    normalized.includes("mes passado") || 
    normalized.includes("anterior") ||
    normalized.includes("melhorei") ||
    normalized.includes("piorou")
  ) {
    return "Tendencias";
  }

  // 2. Dicas e Economia
  if (
    normalized.includes("dica") || 
    normalized.includes("economizar") || 
    normalized.includes("ajuda") || 
    normalized.includes("investir") ||
    normalized.includes("poupar") ||
    normalized.includes("cortar")
  ) {
    return "DicasEconomia";
  }

  // 3. Gastos
  if (
    normalized.includes("gastei") || 
    normalized.includes("gasto") || 
    normalized.includes("despesa") || 
    normalized.includes("saiu") ||
    normalized.includes("paguei") ||
    normalized.includes("custo")
  ) {
    if (normalized.includes("maior") || normalized.includes("principal") || normalized.includes("mais") || normalized.includes("caro")) {
      return "MaiorDespesa";
    }
    return "GastoMes";
  }

  // 4. Receitas
  if (
    normalized.includes("recebi") || 
    normalized.includes("receita") || 
    normalized.includes("ganhei") || 
    normalized.includes("entrou") ||
    normalized.includes("faturamento") ||
    normalized.includes("vendi")
  ) {
    return "ReceitaMes";
  }

  // 5. Saldo
  if (
    normalized.includes("saldo") || 
    normalized.includes("sobrou") || 
    normalized.includes("tenho") ||
    normalized.includes("caixa") ||
    normalized.includes("disponivel") ||
    normalized.includes("dinheiro")
  ) {
    return "SaldoAtual";
  }

  return "UNKNOWN";
}

function getMonthPrefix(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getPreviousMonthPrefix(): string {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return getMonthPrefix(prev);
}

export function generateAssistantResponse(message: string, data: AssistantData): string {
  const intent = identifyIntent(message);
  const currentMonth = getMonthPrefix(new Date());
  const prevMonth = getPreviousMonthPrefix();

  switch (intent) {
    case "GastoMes": {
      const despesasMes = data.despesas.filter(d => d.data.startsWith(currentMonth));
      const totalGasto = despesasMes.reduce((acc, curr) => acc + curr.valor, 0);
      
      let response = `Você gastou ${formatCurrency(totalGasto)} neste mês.`;
      
      if (totalGasto > 0) {
        const principal = [...despesasMes].sort((a, b) => b.valor - a.valor)[0];
        response += ` A maior parte foi para "${principal.descricao}" (${formatCurrency(principal.valor)}).`;
      }
      
      return response;
    }
    
    case "ReceitaMes": {
      const receitasMes = data.receitas.filter(r => r.data.startsWith(currentMonth));
      const totalRecebido = receitasMes.reduce((acc, curr) => acc + curr.valor, 0);
      
      if (totalRecebido === 0) return "Você ainda não registrou entradas este mês. Que tal lançar suas vendas agora?";
      
      return `Você recebeu ${formatCurrency(totalRecebido)} neste mês. Ótimo trabalho!`;
    }

    case "SaldoAtual": {
      const despesasMes = data.despesas.filter(d => d.data.startsWith(currentMonth));
      const receitasMes = data.receitas.filter(r => r.data.startsWith(currentMonth));
      const totalGasto = despesasMes.reduce((acc, curr) => acc + curr.valor, 0);
      const totalRecebido = receitasMes.reduce((acc, curr) => acc + curr.valor, 0);
      const saldo = totalRecebido - totalGasto;
      
      if (saldo < 0) {
        return `Atenção: Seu saldo este mês está negativo em ${formatCurrency(Math.abs(saldo))}. Suas despesas (${formatCurrency(totalGasto)}) superaram suas receitas (${formatCurrency(totalRecebido)}).`;
      }
      
      return `Seu saldo atual deste mês está positivo em ${formatCurrency(saldo)}. Você recebeu ${formatCurrency(totalRecebido)} e gastou ${formatCurrency(totalGasto)}.`;
    }

    case "MaiorDespesa": {
      const despesasMes = data.despesas.filter(d => d.data.startsWith(currentMonth));
      if (despesasMes.length === 0) {
        return "Você não tem despesas registradas neste mês.";
      }

      const categorias: Record<string, number> = {};
      let maiorDespesaUnica = despesasMes[0];

      despesasMes.forEach(d => {
        const cat = d.categoria || "Outras";
        categorias[cat] = (categorias[cat] || 0) + d.valor;
        if (d.valor > maiorDespesaUnica.valor) maiorDespesaUnica = d;
      });

      let maiorCat = "";
      let maiorValorCat = 0;
      for (const [cat, valor] of Object.entries(categorias)) {
        if (valor > maiorValorCat) {
          maiorValorCat = valor;
          maiorCat = cat;
        }
      }

      return `Sua maior categoria de gasto foi ${maiorCat.toLowerCase()} (${formatCurrency(maiorValorCat)}).\nA maior despesa individual foi "${maiorDespesaUnica.descricao}" (${formatCurrency(maiorDespesaUnica.valor)}).`;
    }

    case "Tendencias": {
      const despesasMes = data.despesas.filter(d => d.data.startsWith(currentMonth));
      const despesasPrev = data.despesas.filter(d => d.data.startsWith(prevMonth));
      const totalMes = despesasMes.reduce((acc, curr) => acc + curr.valor, 0);
      const totalPrev = despesasPrev.reduce((acc, curr) => acc + curr.valor, 0);

      if (totalPrev === 0) return "Não tenho dados do mês passado para comparar ainda.";

      const diff = totalMes - totalPrev;
      const percent = (diff / totalPrev) * 100;

      if (diff > 0) {
        return `Seus gastos subiram ${percent.toFixed(1)}% (${formatCurrency(diff)}) em relação ao mês passado. Vamos dar uma olhada no que mudou?`;
      } else {
        return `Parabéns! Seus gastos caíram ${Math.abs(percent).toFixed(1)}% (${formatCurrency(Math.abs(diff))}) em relação ao mês anterior.`;
      }
    }

    case "DicasEconomia": {
      const despesasMes = data.despesas.filter(d => d.data.startsWith(currentMonth));
      const categorias: Record<string, number> = {};
      despesasMes.forEach(d => {
        const cat = d.categoria || "Outras";
        categorias[cat] = (categorias[cat] || 0) + d.valor;
      });

      const topCat = Object.entries(categorias).sort((a, b) => b[1] - a[1])[0];
      
      if (!topCat) return "Para te dar dicas, preciso que você registre alguns gastos primeiro!";

      const [cat, valor] = topCat;
      const tips: Record<string, string> = {
        "Alimentação": "Notei que alimentação é seu maior gasto. Tente planejar suas refeições da semana para reduzir pedidos por delivery!",
        "Transporte": "Seus gastos com transporte estão altos. Aplicativos de carona ou transporte público em alguns dias podem ajudar.",
        "Software/Assinaturas": "Revisar assinaturas que você não usa com frequência é uma forma rápida de economizar.",
        "Marketing": "Avalie o retorno sobre investimento de cada campanha para otimizar seus gastos com anúncios.",
        "Outros": "Tente categorizar melhor seus gastos para que eu possa te dar dicas mais precisas!"
      };

      return tips[cat] || `Você está gastando bastante em ${cat.toLowerCase()} (${formatCurrency(valor)}). Tente estabelecer um limite mensal para essa categoria.`;
    }

    case "UNKNOWN":
    default:
      return "Olá! Eu posso analisar seus gastos, comparar com o mês passado ou te dar dicas de economia. O que gostaria de saber hoje?";
  }
}

export function getDynamicSuggestions(data: AssistantData): string[] {
  const currentMonth = getMonthPrefix(new Date());
  const despesasMes = data.despesas.filter(d => d.data.startsWith(currentMonth));
  const receitasMes = data.receitas.filter(r => r.data.startsWith(currentMonth));
  
  const totalGasto = despesasMes.reduce((acc, curr) => acc + curr.valor, 0);
  const totalRecebido = receitasMes.reduce((acc, curr) => acc + curr.valor, 0);
  const suggestions: string[] = [];

  if (totalGasto > 0) {
    suggestions.push("Qual minha maior despesa?");
    suggestions.push("Como economizar?");
  }
  
  if (totalRecebido > 0 && totalGasto > 0) {
    suggestions.push("Saldo atual?");
  }

  if (data.despesas.some(d => d.data.startsWith(getPreviousMonthPrefix()))) {
    suggestions.push("Comparar com mês passado");
  }

  if (suggestions.length < 2) {
    return ["Quanto gastei este mês?", "Quanto recebi este mês?", "Saldo atual?", "Dicas para economizar"];
  }

  return suggestions;
}
