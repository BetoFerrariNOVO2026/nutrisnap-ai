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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      meal_foods: {
        Row: {
          calories: number | null
          carbs: number | null
          created_at: string
          fat: number | null
          id: string
          meal_id: string
          name: string
          portion: string | null
          protein: number | null
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          fat?: number | null
          id?: string
          meal_id: string
          name: string
          portion?: string | null
          protein?: number | null
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          created_at?: string
          fat?: number | null
          id?: string
          meal_id?: string
          name?: string
          portion?: string | null
          protein?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "meal_foods_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
        ]
      }
      meals: {
        Row: {
          created_at: string
          health_score: number | null
          id: string
          image_url: string | null
          name: string
          scanned_at: string
          suggestions: string[] | null
          total_calories: number | null
          total_carbs: number | null
          total_fat: number | null
          total_protein: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          health_score?: number | null
          id?: string
          image_url?: string | null
          name: string
          scanned_at?: string
          suggestions?: string[] | null
          total_calories?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_protein?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          health_score?: number | null
          id?: string
          image_url?: string | null
          name?: string
          scanned_at?: string
          suggestions?: string[] | null
          total_calories?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_protein?: number | null
          user_id?: string
        }
        Relationships: []
      }
      payment_webhooks: {
        Row: {
          created_at: string
          customer_email: string | null
          external_id: string | null
          id: string
          plan: string
          processed_at: string | null
          raw_payload: Json | null
          status: string
        }
        Insert: {
          created_at?: string
          customer_email?: string | null
          external_id?: string | null
          id?: string
          plan: string
          processed_at?: string | null
          raw_payload?: Json | null
          status?: string
        }
        Update: {
          created_at?: string
          customer_email?: string | null
          external_id?: string | null
          id?: string
          plan?: string
          processed_at?: string | null
          raw_payload?: Json | null
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          daily_calorie_goal: number | null
          display_name: string | null
          goal: string | null
          height: number | null
          id: string
          phone: string | null
          subscription_plan: string
          target_weight: number | null
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          daily_calorie_goal?: number | null
          display_name?: string | null
          goal?: string | null
          height?: number | null
          id?: string
          phone?: string | null
          subscription_plan?: string
          target_weight?: number | null
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          daily_calorie_goal?: number | null
          display_name?: string | null
          goal?: string | null
          height?: number | null
          id?: string
          phone?: string | null
          subscription_plan?: string
          target_weight?: number | null
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
