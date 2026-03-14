import { supabase } from "@/integrations/supabase/client";

export interface AgentResponse {
  message: string;
  intent: string;
  data: any;
  suggested_confirmation?: string;
}

export const agentService = {
  async sendMessage(message: string, image?: string, audio?: string): Promise<AgentResponse> {
    const { data, error } = await supabase.functions.invoke('agent-message', {
      body: { message, image, audio }
    });

    if (error) throw error;
    return data;
  },

  async getHistory() {
    const { data, error } = await supabase
      .from('assistant_messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }
};
