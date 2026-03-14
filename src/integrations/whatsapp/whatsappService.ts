import { supabase } from "@/integrations/supabase/client";
import { parseWhatsAppMessage, type ParsedMessage } from "./messageParser";
import { sendWhatsAppMessage, generateResponseTemplate } from "./whatsappSender";

/**
 * Serviço central que processa mensagens do WhatsApp e registra no Supabase.
 */
export async function processIncomingWhatsAppMessage(fromPhoneNumber: string, text: string) {
  console.log(`[WhatsApp Service] Iniciando processamento para ${fromPhoneNumber}`);

  // 1. Identificar usuário pelo telefone na tabela 'usuarios_whatsapp'
  const { data: whatsappUser, error: userError } = await supabase
    .from("usuarios_whatsapp" as any) // Cast para evitar erros de tipo se a tabela for nova
    .select("user_id")
    .eq("telefone", fromPhoneNumber)
    .eq("status", "ativo") // Opcional: validar se o vínculo está ativo
    .single();

  if (userError || !whatsappUser) {
    console.error("[WhatsApp Service] Vínculo não encontrado para o telefone:", fromPhoneNumber);
    await sendWhatsAppMessage({
      to: fromPhoneNumber,
      message: "Olá! Seu número ainda não está vinculado ao Vektor. Por favor, acesse as configurações do app para ativar a integração.",
    });
    return;
  }

  // 2. Interpretar a mensagem usando as regras de negócio
  const parsed: ParsedMessage = parseWhatsAppMessage(text);

  if (!parsed.isValid) {
    await sendWhatsAppMessage({
      to: fromPhoneNumber,
      message: generateResponseTemplate("invalid"),
    });
    return;
  }

  // 3. Preparar o payload com os campos obrigatórios: valor, descricao, categoria, user_id, data
  const table = parsed.tipo === "receita" ? "receitas" : "despesas";
  
  const payload: any = {
    user_id: whatsappUser.user_id,
    valor: parsed.valor,
    descricao: parsed.descricao,
    categoria: parsed.categoria || (parsed.tipo === "receita" ? "Outros" : "Outras"),
    data: new Date().toISOString().split("T")[0],
    tipo_conta: "mei", // Padrão para integração
    tipo_transacao: "unica"
  };

  // Status específico por tipo
  if (parsed.tipo === "receita") {
    payload.status = "recebido";
  } else {
    payload.status = "pago";
  }

  // 4. Salvar no banco Supabase
  const { error: insertError } = await supabase
    .from(table)
    .insert(payload);

  if (insertError) {
    console.error(`[WhatsApp Service] Erro ao registrar ${parsed.tipo}:`, insertError);
    await sendWhatsAppMessage({
      to: fromPhoneNumber,
      message: generateResponseTemplate("error"),
    });
    return;
  }

  // 5. Retornar resultado da operação via mensagem
  await sendWhatsAppMessage({
    to: fromPhoneNumber,
    message: generateResponseTemplate("success", parsed),
  });
}
