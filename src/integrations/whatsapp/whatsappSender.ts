/**
 * Utilitário para enviar mensagens de volta para o usuário via WhatsApp.
 * Esta versão é uma abstração que pode ser conectada à API Cloud do WhatsApp ou outros provedores.
 */
export interface WhatsAppSendOptions {
  to: string;
  message: string;
}

export async function sendWhatsAppMessage({ to, message }: WhatsAppSendOptions): Promise<{ success: boolean; error?: string }> {
  console.log(`[WhatsApp Sender] Enviando mensagem para ${to}: \n"${message}"`);

  // Em um cenário real, você faria um POST para a API do WhatsApp aqui.
  // Exemplo (com WhatsApp Cloud API):
  /*
  const response = await fetch(`https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: to,
      type: "text",
      text: { body: message },
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    return { success: false, error: errorData.error?.message || "Erro desconhecido" };
  }
  */

  // Simulação de sucesso
  return { success: true };
}

/**
 * Gera mensagens de resposta amigáveis com base no resultado do processamento.
 * Segue o formato exato solicitado pelo usuário.
 */
export function generateResponseTemplate(type: "success" | "error" | "invalid", data?: any): string {
  switch (type) {
    case "success":
      const tipoCapitalizado = data.tipo === "receita" ? "Receita" : "Despesa";
      return `${tipoCapitalizado} registrada\n\n` +
             `${data.descricao}\n` +
             `R$ ${data.valor.toString().replace(".", ",")}\n` +
             `Categoria: ${data.categoria || "Outros"}`;
    
    case "error":
      return `Não consegui registrar sua transação.\nTente novamente.`;
    
    case "invalid":
      return `❓ Não consegui entender seu lançamento.\n\n` +
             `Tente algo como:\n` +
             `- "Almoço 45,90"\n` +
             `- "Recebi 500 do cliente X"`;
             
    default:
      return "Olá! Eu sou o assistente Vektor. Como posso ajudar com suas finanças hoje?";
  }
}
