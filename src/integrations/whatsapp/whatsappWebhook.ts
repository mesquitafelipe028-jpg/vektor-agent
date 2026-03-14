import { processIncomingWhatsAppMessage } from "./whatsappService";

/**
 * Endpoint: POST /api/whatsapp/webhook
 * 
 * Recebe mensagens enviadas pela API do WhatsApp com a estrutura:
 * {
 *  "phone": "558599999999",
 *  "message": "uber 23",
 *  "type": "text"
 * }
 */

/**
 * 1. Valida se phone e message existem na requisição.
 */
export async function receiveMessage(req: { body: any }) {
  const { phone, message, type } = req.body;

  if (!phone || !message) {
    console.error("[WhatsApp Webhook] Validação falhou: phone e message são obrigatórios.");
    return { 
      status: 400, 
      body: { error: "phone and message are required" } 
    };
  }

  return await processMessage(phone, message);
}

/**
 * 2. Registra log da mensagem recebida e encaminha para o processamento.
 */
async function processMessage(phone: string, message: string) {
  console.log(`[WhatsApp Webhook] Mensagem recebida | De: ${phone} | Mensagem: "${message}"`);
  
  return await parserFinanceMessage(phone, message);
}

/**
 * 3. Envia a mensagem para o serviço de integração financeira.
 */
async function parserFinanceMessage(phone: string, message: string) {
  try {
    // Integração com o serviço que utiliza o cliente Supabase e o parser
    await processIncomingWhatsAppMessage(phone, message);
    
    return { 
      status: 200, 
      body: { success: true, message: "Mensagem recebida e processada" } 
    };
  } catch (error) {
    console.error("[WhatsApp Webhook] Erro ao processar mensagem financeira:", error);
    return { 
      status: 500, 
      body: { error: "Internal Server Error" } 
    };
  }
}

// Handler genérico para exportação conforme padrões de Serverless Functions (ex: Vercel)
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const result = await receiveMessage(req);
  return res.status(result.status).json(result.body);
}
