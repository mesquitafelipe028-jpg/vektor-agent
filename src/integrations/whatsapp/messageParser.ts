import { suggestCategory } from "@/lib/utils";

export interface ParsedMessage {
  isValid: boolean;
  rawText: string;
  tipo: "receita" | "despesa"; // Alterado de 'type' para 'tipo'
  valor: number;
  descricao: string;
  categoria: string | null;
}

/**
 * Interpretador de mensagens financeiras seguindo regras específicas:
 * 1. Extrai número como valor.
 * 2. Identifica tipo (recebi/ganhei/entrada = receita, caso contrário despesa).
 * 3. Descrição é todo o texto ANTES do valor.
 */
export function parseWhatsAppMessage(input: string): ParsedMessage {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      isValid: false,
      rawText: trimmed,
      tipo: "despesa",
      valor: 0,
      descricao: "",
      categoria: null,
    };
  }

  // 1. Extrair número como valor
  const valueMatch = trimmed.match(/(\d+(?:[.,]\d{1,2})?)/);
  let valor = 0;
  let valorStartIndex = -1;

  if (valueMatch) {
    const valueStr = valueMatch[1];
    valorStartIndex = valueMatch.index!;
    const normalizedValue = valueStr.replace(",", ".");
    valor = parseFloat(normalizedValue);
  }

  // 2. Identificar tipo de transação
  const receitaKeywords = ["recebi", "ganhei", "entrada"];
  const lowerInput = trimmed.toLowerCase();
  const isReceita = receitaKeywords.some((kw) => lowerInput.includes(kw));
  const tipo = isReceita ? "receita" : "despesa";

  // 3. Extrair descrição (Todo texto ANTES do valor)
  let descricao = "";
  if (valorStartIndex > 0) {
    descricao = trimmed.substring(0, valorStartIndex).trim();
  } else if (valorStartIndex === 0) {
    descricao = trimmed.replace(valueMatch![0], "").trim();
  } else {
    descricao = trimmed;
  }

  // 4. Retornar objeto estruturado
  let categoria = null;
  if (tipo === "despesa" && descricao) {
    categoria = suggestCategory(descricao) || "Outros";
  }

  return {
    isValid: valor > 0 && descricao.length > 0,
    rawText: trimmed,
    tipo,
    valor,
    descricao: descricao || "Mensagem WhatsApp",
    categoria: categoria ? categoria.toLowerCase() : null,
  };
}
