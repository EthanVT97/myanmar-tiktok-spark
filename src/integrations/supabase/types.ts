export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      api_key_status: {
        Row: {
          api_type: string
          created_at: string
          daily_usage_count: number | null
          id: string
          is_connected: boolean | null
          last_reset_date: string | null
          last_tested_at: string | null
          monthly_usage_count: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          api_type?: string
          created_at?: string
          daily_usage_count?: number | null
          id?: string
          is_connected?: boolean | null
          last_reset_date?: string | null
          last_tested_at?: string | null
          monthly_usage_count?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          api_type?: string
          created_at?: string
          daily_usage_count?: number | null
          id?: string
          is_connected?: boolean | null
          last_reset_date?: string | null
          last_tested_at?: string | null
          monthly_usage_count?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      api_usage: {
        Row: {
          api_type: string
          created_at: string
          endpoint: string | null
          error_message: string | null
          id: string
          response_time: number | null
          status: string
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          api_type?: string
          created_at?: string
          endpoint?: string | null
          error_message?: string | null
          id?: string
          response_time?: number | null
          status: string
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          api_type?: string
          created_at?: string
          endpoint?: string | null
          error_message?: string | null
          id?: string
          response_time?: number | null
          status?: string
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      coin_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          order_id: string | null
          payment_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          payment_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          payment_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coin_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coin_transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          coin_cost: number
          created_at: string
          external_order_id: string | null
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          quantity: number
          remains: number | null
          service_id: string
          start_count: number | null
          status: Database["public"]["Enums"]["order_status"]
          target_url: string
          total_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          coin_cost: number
          created_at?: string
          external_order_id?: string | null
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          quantity: number
          remains?: number | null
          service_id: string
          start_count?: number | null
          status?: Database["public"]["Enums"]["order_status"]
          target_url: string
          total_price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          coin_cost?: number
          created_at?: string
          external_order_id?: string | null
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          quantity?: number
          remains?: number | null
          service_id?: string
          start_count?: number | null
          status?: Database["public"]["Enums"]["order_status"]
          target_url?: string
          total_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_settings: {
        Row: {
          account_name: string
          account_number: string
          id: string
          is_active: boolean
          payment_method: Database["public"]["Enums"]["payment_method"]
          qr_code_url: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          account_name: string
          account_number: string
          id?: string
          is_active?: boolean
          payment_method: Database["public"]["Enums"]["payment_method"]
          qr_code_url?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          account_name?: string
          account_number?: string
          id?: string
          is_active?: boolean
          payment_method?: Database["public"]["Enums"]["payment_method"]
          qr_code_url?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          id: string
          order_id: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_proof: string | null
          status: Database["public"]["Enums"]["payment_status"]
          transaction_id: string | null
          updated_at: string
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string
          id?: string
          order_id?: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_proof?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
          updated_at?: string
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          id?: string
          order_id?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_proof?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          coin_balance: number
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          total_spent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          coin_balance?: number
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          total_spent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          coin_balance?: number
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          total_spent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          coin_price: number
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          max_quantity: number
          min_quantity: number
          name: string
          price_per_unit: number
          type: Database["public"]["Enums"]["service_type"]
          updated_at: string
        }
        Insert: {
          coin_price: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_quantity?: number
          min_quantity?: number
          name: string
          price_per_unit: number
          type: Database["public"]["Enums"]["service_type"]
          updated_at?: string
        }
        Update: {
          coin_price?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_quantity?: number
          min_quantity?: number
          name?: string
          price_per_unit?: number
          type?: Database["public"]["Enums"]["service_type"]
          updated_at?: string
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
      order_status:
        | "pending"
        | "processing"
        | "completed"
        | "cancelled"
        | "failed"
      payment_method: "kpay" | "wavepay" | "bank_transfer" | "coins"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      service_type: "followers" | "likes" | "views" | "shares"
      user_role: "user" | "admin" | "support"
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
    Enums: {
      order_status: [
        "pending",
        "processing",
        "completed",
        "cancelled",
        "failed",
      ],
      payment_method: ["kpay", "wavepay", "bank_transfer", "coins"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      service_type: ["followers", "likes", "views", "shares"],
      user_role: ["user", "admin", "support"],
    },
  },
} as const
