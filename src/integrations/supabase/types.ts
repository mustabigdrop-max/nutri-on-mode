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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      meal_logs: {
        Row: {
          confirmed: boolean | null
          created_at: string
          emotion: string | null
          food_names: string[] | null
          hunger_level: number | null
          id: string
          meal_date: string
          meal_type: string
          notes: string | null
          photo_url: string | null
          quality_score: number | null
          satiety_level: number | null
          total_carbs: number | null
          total_fat: number | null
          total_kcal: number | null
          total_protein: number | null
          user_id: string
        }
        Insert: {
          confirmed?: boolean | null
          created_at?: string
          emotion?: string | null
          food_names?: string[] | null
          hunger_level?: number | null
          id?: string
          meal_date?: string
          meal_type: string
          notes?: string | null
          photo_url?: string | null
          quality_score?: number | null
          satiety_level?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_kcal?: number | null
          total_protein?: number | null
          user_id: string
        }
        Update: {
          confirmed?: boolean | null
          created_at?: string
          emotion?: string | null
          food_names?: string[] | null
          hunger_level?: number | null
          id?: string
          meal_date?: string
          meal_type?: string
          notes?: string | null
          photo_url?: string | null
          quality_score?: number | null
          satiety_level?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_kcal?: number | null
          total_protein?: number | null
          user_id?: string
        }
        Relationships: []
      }
      meal_nutrients: {
        Row: {
          amount: number
          created_at: string
          daily_pct: number | null
          daily_recommended: number | null
          id: string
          meal_log_id: string
          nutrient: string
          unit: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          daily_pct?: number | null
          daily_recommended?: number | null
          id?: string
          meal_log_id: string
          nutrient: string
          unit?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          daily_pct?: number | null
          daily_recommended?: number | null
          id?: string
          meal_log_id?: string
          nutrient?: string
          unit?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meal_nutrients_meal_log_id_fkey"
            columns: ["meal_log_id"]
            isOneToOne: false
            referencedRelation: "meal_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      meal_plan_items: {
        Row: {
          carbs_g: number | null
          confirmed: boolean | null
          created_at: string
          day_index: number
          fat_g: number | null
          food_name: string
          id: string
          kcal: number | null
          meal_type: string
          original_food_name: string | null
          portion: string | null
          protein_g: number | null
          swapped: boolean | null
          user_id: string
          week_start: string
        }
        Insert: {
          carbs_g?: number | null
          confirmed?: boolean | null
          created_at?: string
          day_index: number
          fat_g?: number | null
          food_name: string
          id?: string
          kcal?: number | null
          meal_type: string
          original_food_name?: string | null
          portion?: string | null
          protein_g?: number | null
          swapped?: boolean | null
          user_id: string
          week_start: string
        }
        Update: {
          carbs_g?: number | null
          confirmed?: boolean | null
          created_at?: string
          day_index?: number
          fat_g?: number | null
          food_name?: string
          id?: string
          kcal?: number | null
          meal_type?: string
          original_food_name?: string | null
          portion?: string | null
          protein_g?: number | null
          swapped?: boolean | null
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      professional_patients: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          patient_id: string
          professional_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          patient_id: string
          professional_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          patient_id?: string
          professional_id?: string
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active_protocol: string | null
          activity_level: string | null
          avatar_url: string | null
          carbs_g: number | null
          created_at: string
          date_of_birth: string | null
          dietary_restrictions: string[] | null
          fat_g: number | null
          full_name: string | null
          geb_kcal: number | null
          get_kcal: number | null
          goal: string | null
          health_conditions: string[] | null
          height_cm: number | null
          id: string
          last_streak_date: string | null
          level: number | null
          onboarding_completed: boolean | null
          protein_g: number | null
          sex: string | null
          sport: string | null
          streak_days: number | null
          training_frequency: number | null
          updated_at: string
          user_id: string
          uses_glp1: boolean | null
          vet_kcal: number | null
          weight_kg: number | null
          xp: number | null
        }
        Insert: {
          active_protocol?: string | null
          activity_level?: string | null
          avatar_url?: string | null
          carbs_g?: number | null
          created_at?: string
          date_of_birth?: string | null
          dietary_restrictions?: string[] | null
          fat_g?: number | null
          full_name?: string | null
          geb_kcal?: number | null
          get_kcal?: number | null
          goal?: string | null
          health_conditions?: string[] | null
          height_cm?: number | null
          id?: string
          last_streak_date?: string | null
          level?: number | null
          onboarding_completed?: boolean | null
          protein_g?: number | null
          sex?: string | null
          sport?: string | null
          streak_days?: number | null
          training_frequency?: number | null
          updated_at?: string
          user_id: string
          uses_glp1?: boolean | null
          vet_kcal?: number | null
          weight_kg?: number | null
          xp?: number | null
        }
        Update: {
          active_protocol?: string | null
          activity_level?: string | null
          avatar_url?: string | null
          carbs_g?: number | null
          created_at?: string
          date_of_birth?: string | null
          dietary_restrictions?: string[] | null
          fat_g?: number | null
          full_name?: string | null
          geb_kcal?: number | null
          get_kcal?: number | null
          goal?: string | null
          health_conditions?: string[] | null
          height_cm?: number | null
          id?: string
          last_streak_date?: string | null
          level?: number | null
          onboarding_completed?: boolean | null
          protein_g?: number | null
          sex?: string | null
          sport?: string | null
          streak_days?: number | null
          training_frequency?: number | null
          updated_at?: string
          user_id?: string
          uses_glp1?: boolean | null
          vet_kcal?: number | null
          weight_kg?: number | null
          xp?: number | null
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
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      weight_logs: {
        Row: {
          body_fat_pct: number | null
          id: string
          logged_at: string
          muscle_mass_kg: number | null
          user_id: string
          weight_kg: number
        }
        Insert: {
          body_fat_pct?: number | null
          id?: string
          logged_at?: string
          muscle_mass_kg?: number | null
          user_id: string
          weight_kg: number
        }
        Update: {
          body_fat_pct?: number | null
          id?: string
          logged_at?: string
          muscle_mass_kg?: number | null
          user_id?: string
          weight_kg?: number
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
      app_role: "admin" | "moderator" | "user" | "professional"
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
      app_role: ["admin", "moderator", "user", "professional"],
    },
  },
} as const
