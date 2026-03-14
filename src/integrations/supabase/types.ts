export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      assinaturas: {
        Row: {
          created_at: string
          id: string
          plano: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          plano?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          plano?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      cartoes_credito: {
        Row: {
          banco: string | null
          created_at: string
          dia_fechamento: number | null
          dia_vencimento: number | null
          id: string
          limite_total: number | null
          nome: string
          tipo_conta: string | null
          user_id: string
        }
        Insert: {
          banco?: string | null
          created_at?: string
          dia_fechamento?: number | null
          dia_vencimento?: number | null
          id?: string
          limite_total?: number | null
          nome: string
          tipo_conta?: string | null
          user_id: string
        }
        Update: {
          banco?: string | null
          created_at?: string
          dia_fechamento?: number | null
          dia_vencimento?: number | null
          id?: string
          limite_total?: number | null
          nome?: string
          tipo_conta?: string | null
          user_id?: string
        }
        Relationships: []
      }
      categorias: {
        Row: {
          categoria_pai_id: string | null
          cor: string | null
          created_at: string
          id: string
          icone: string | null
          nome: string
          ordem: number | null
          tipo: string | null
          user_id: string
        }
        Insert: {
          categoria_pai_id?: string | null
          cor?: string | null
          created_at?: string
          id?: string
          icone?: string | null
          nome: string
          ordem?: number | null
          tipo?: string | null
          user_id: string
        }
        Update: {
          categoria_pai_id?: string | null
          cor?: string | null
          created_at?: string
          id?: string
          icone?: string | null
          nome?: string
          ordem?: number | null
          tipo?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "categorias_categoria_pai_id_fkey"
            columns: ["categoria_pai_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          created_at: string
          documento: string | null
          email: string | null
          id: string
          nome: string
          telefone: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          documento?: string | null
          email?: string | null
          id?: string
          nome: string
          telefone?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          documento?: string | null
          email?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          user_id?: string
        }
        Relationships: []
      }
      compras_cartao: {
        Row: {
          cartao_id: string
          categoria: string | null
          created_at: string
          data: string
          descricao: string
          id: string
          user_id: string
          valor: number
        }
        Insert: {
          cartao_id: string
          categoria?: string | null
          created_at?: string
          data: string
          descricao: string
          id?: string
          user_id: string
          valor: number
        }
        Update: {
          cartao_id?: string
          categoria?: string | null
          created_at?: string
          data?: string
          descricao?: string
          id?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "compras_cartao_cartao_id_fkey"
            columns: ["cartao_id"]
            isOneToOne: false
            referencedRelation: "cartoes_credito"
            referencedColumns: ["id"]
          },
        ]
      }
      contas_financeiras: {
        Row: {
          banco_id: string | null
          classificacao: string | null
          cor: string | null
          created_at: string
          id: string
          icone: string | null
          nome: string
          saldo: number | null
          tipo: string
          user_id: string
        }
        Insert: {
          banco_id?: string | null
          classificacao?: string | null
          cor?: string | null
          created_at?: string
          id?: string
          icone?: string | null
          nome: string
          saldo?: number | null
          tipo: string
          user_id: string
        }
        Update: {
          banco_id?: string | null
          classificacao?: string | null
          cor?: string | null
          created_at?: string
          id?: string
          icone?: string | null
          nome?: string
          saldo?: number | null
          tipo?: string
          user_id?: string
        }
        Relationships: []
      }
      depositos_meta: {
        Row: {
          created_at: string
          data: string
          descricao: string | null
          id: string
          meta_id: string
          user_id: string
          valor: number
        }
        Insert: {
          created_at?: string
          data: string
          descricao?: string | null
          id?: string
          meta_id: string
          user_id: string
          valor: number
        }
        Update: {
          created_at?: string
          data?: string
          descricao?: string | null
          id?: string
          meta_id?: string
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "depositos_meta_meta_id_fkey"
            columns: ["meta_id"]
            isOneToOne: false
            referencedRelation: "metas_financeiras"
            referencedColumns: ["id"]
          },
        ]
      }
      despesas: {
        Row: {
          categoria: string | null
          created_at: string
          data: string
          data_fim: string | null
          data_inicio: string | null
          descricao: string
          frequencia: string | null
          id: string
          numero_parcelas: number | null
          parcela_atual: number | null
          status: string | null
          tipo: string | null
          tipo_conta: string | null
          tipo_transacao: string | null
          transacao_pai_id: string | null
          user_id: string
          valor: number
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          data?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao: string
          frequencia?: string | null
          id?: string
          numero_parcelas?: number | null
          parcela_atual?: number | null
          status?: string | null
          tipo?: string | null
          tipo_conta?: string | null
          tipo_transacao?: string | null
          transacao_pai_id?: string | null
          user_id: string
          valor?: number
        }
        Update: {
          categoria?: string | null
          created_at?: string
          data?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string
          frequencia?: string | null
          id?: string
          numero_parcelas?: number | null
          parcela_atual?: number | null
          status?: string | null
          tipo?: string | null
          tipo_conta?: string | null
          tipo_transacao?: string | null
          transacao_pai_id?: string | null
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "despesas_transacao_pai_id_fkey"
            columns: ["transacao_pai_id"]
            isOneToOne: false
            referencedRelation: "despesas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          cnpj: string | null
          created_at: string
          cnae_principal: string | null
          data_abertura: string | null
          id: string
          natureza_juridica: string | null
          nome_fantasia: string | null
          razao_social: string | null
          situacao_cadastral: string | null
          user_id: string
        }
        Insert: {
          cnpj?: string | null
          created_at?: string
          cnae_principal?: string | null
          data_abertura?: string | null
          id?: string
          natureza_juridica?: string | null
          nome_fantasia?: string | null
          razao_social?: string | null
          situacao_cadastral?: string | null
          user_id: string
        }
        Update: {
          cnpj?: string | null
          created_at?: string
          cnae_principal?: string | null
          data_abertura?: string | null
          id?: string
          natureza_juridica?: string | null
          nome_fantasia?: string | null
          razao_social?: string | null
          situacao_cadastral?: string | null
          user_id?: string
        }
        Relationships: []
      }
      faturas_cartao: {
        Row: {
          cartao_id: string
          created_at: string
          data_pagamento: string | null
          id: string
          mes_referencia: string
          status: string | null
          user_id: string
          valor_total: number | null
        }
        Insert: {
          cartao_id: string
          created_at?: string
          data_pagamento?: string | null
          id?: string
          mes_referencia: string
          status?: string | null
          user_id: string
          valor_total?: number | null
        }
        Update: {
          cartao_id?: string
          created_at?: string
          data_pagamento?: string | null
          id?: string
          mes_referencia?: string
          status?: string | null
          user_id?: string
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "faturas_cartao_cartao_id_fkey"
            columns: ["cartao_id"]
            isOneToOne: false
            referencedRelation: "cartoes_credito"
            referencedColumns: ["id"]
          },
        ]
      }
      impostos_mei: {
        Row: {
          competencia: string
          created_at: string
          id: string
          status: string
          user_id: string
          valor: number
          vencimento: string
        }
        Insert: {
          competencia: string
          created_at?: string
          id?: string
          status?: string
          user_id: string
          valor?: number
          vencimento: string
        }
        Update: {
          competencia?: string
          created_at?: string
          id?: string
          status?: string
          user_id?: string
          valor?: number
          vencimento?: string
        }
        Relationships: []
      }
      investimento_ativos: {
        Row: {
          created_at: string
          data_compra: string | null
          id: string
          nome: string
          preco_atual: number | null
          preco_medio: number | null
          quantidade: number | null
          tipo: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_compra?: string | null
          id?: string
          nome: string
          preco_atual?: number | null
          preco_medio?: number | null
          quantidade?: number | null
          tipo: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_compra?: string | null
          id?: string
          nome?: string
          preco_atual?: number | null
          preco_medio?: number | null
          quantidade?: number | null
          tipo?: string
          user_id?: string
        }
        Relationships: []
      }
      investimento_dividendos: {
        Row: {
          ativo_id: string | null
          created_at: string
          data_recebimento: string
          id: string
          tipo: string | null
          user_id: string
          valor: number
        }
        Insert: {
          ativo_id?: string | null
          created_at?: string
          data_recebimento: string
          id?: string
          tipo?: string | null
          user_id: string
          valor: number
        }
        Update: {
          ativo_id?: string | null
          created_at?: string
          data_recebimento?: string
          id?: string
          tipo?: string | null
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "investimento_dividendos_ativo_id_fkey"
            columns: ["ativo_id"]
            isOneToOne: false
            referencedRelation: "investimento_ativos"
            referencedColumns: ["id"]
          },
        ]
      }
      metas_financeiras: {
        Row: {
          categoria: string | null
          created_at: string
          id: string
          prazo: string | null
          titulo: string
          valor_alvo: number
          valor_atual: number | null
          user_id: string
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          id?: string
          prazo?: string | null
          titulo: string
          valor_alvo: number
          valor_atual?: number | null
          user_id: string
        }
        Update: {
          categoria?: string | null
          created_at?: string
          id?: string
          prazo?: string | null
          titulo?: string
          valor_alvo?: number
          valor_atual?: number | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          email?: string
          id: string
          nome?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      receitas: {
        Row: {
          cliente_id: string | null
          conta_id: string | null
          created_at: string
          data: string
          data_fim: string | null
          data_inicio: string | null
          descricao: string
          forma_pagamento: string | null
          frequencia: string | null
          id: string
          status: string | null
          tipo_conta: string | null
          tipo_transacao: string | null
          transacao_pai_id: string | null
          user_id: string
          valor: number
        }
        Insert: {
          cliente_id?: string | null
          conta_id?: string | null
          created_at?: string
          data?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao: string
          forma_pagamento?: string | null
          frequencia?: string | null
          id?: string
          status?: string | null
          tipo_conta?: string | null
          tipo_transacao?: string | null
          transacao_pai_id?: string | null
          user_id: string
          valor?: number
        }
        Update: {
          cliente_id?: string | null
          conta_id?: string | null
          created_at?: string
          data?: string
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string
          forma_pagamento?: string | null
          frequencia?: string | null
          id?: string
          status?: string | null
          tipo_conta?: string | null
          tipo_transacao?: string | null
          transacao_pai_id?: string | null
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "receitas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receitas_transacao_pai_id_fkey"
            columns: ["transacao_pai_id"]
            isOneToOne: false
            referencedRelation: "receitas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          alerta_lembretes: boolean | null
          alerta_recebimentos: boolean | null
          alerta_vencimento: boolean | null
          dia_fechamento: number | null
          id: string
          moeda: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alerta_lembretes?: boolean | null
          alerta_recebimentos?: boolean | null
          alerta_vencimento?: boolean | null
          dia_fechamento?: number | null
          id?: string
          moeda?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alerta_lembretes?: boolean | null
          alerta_recebimentos?: boolean | null
          alerta_vencimento?: boolean | null
          dia_fechamento?: number | null
          id?: string
          moeda?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
