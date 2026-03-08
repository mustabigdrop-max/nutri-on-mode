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
      activity_logs: {
        Row: {
          calories_burned: number | null
          created_at: string
          heart_rate_avg: number | null
          heart_rate_max: number | null
          id: string
          log_date: string
          notes: string | null
          sleep_hours: number | null
          steps: number | null
          user_id: string
        }
        Insert: {
          calories_burned?: number | null
          created_at?: string
          heart_rate_avg?: number | null
          heart_rate_max?: number | null
          id?: string
          log_date?: string
          notes?: string | null
          sleep_hours?: number | null
          steps?: number | null
          user_id: string
        }
        Update: {
          calories_burned?: number | null
          created_at?: string
          heart_rate_avg?: number | null
          heart_rate_max?: number | null
          id?: string
          log_date?: string
          notes?: string | null
          sleep_hours?: number | null
          steps?: number | null
          user_id?: string
        }
        Relationships: []
      }
      alertas_preditivos: {
        Row: {
          enviado_em: string
          id: string
          lido: boolean
          mensagem: string
          tipo_alerta: string
          user_id: string
        }
        Insert: {
          enviado_em?: string
          id?: string
          lido?: boolean
          mensagem: string
          tipo_alerta: string
          user_id: string
        }
        Update: {
          enviado_em?: string
          id?: string
          lido?: boolean
          mensagem?: string
          tipo_alerta?: string
          user_id?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          category: string
          condition_type: string
          condition_value: number
          created_at: string
          description: string
          icon: string
          id: string
          key: string
          name: string
          xp_reward: number
        }
        Insert: {
          category?: string
          condition_type: string
          condition_value?: number
          created_at?: string
          description: string
          icon?: string
          id?: string
          key: string
          name: string
          xp_reward?: number
        }
        Update: {
          category?: string
          condition_type?: string
          condition_value?: number
          created_at?: string
          description?: string
          icon?: string
          id?: string
          key?: string
          name?: string
          xp_reward?: number
        }
        Relationships: []
      }
      blood_tests: {
        Row: {
          ai_analysis: Json | null
          applied_at: string | null
          created_at: string
          id: string
          notes: string | null
          pdf_url: string
          status: string
          suggested_changes: Json | null
          test_date: string
          updated_at: string
          user_id: string
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          applied_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          pdf_url: string
          status?: string
          suggested_changes?: Json | null
          test_date?: string
          updated_at?: string
          user_id: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          applied_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          pdf_url?: string
          status?: string
          suggested_changes?: Json | null
          test_date?: string
          updated_at?: string
          user_id?: string
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: []
      }
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
      community_groups: {
        Row: {
          created_at: string
          description: string | null
          emoji: string | null
          goal_type: string
          id: string
          member_count: number | null
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          emoji?: string | null
          goal_type?: string
          id?: string
          member_count?: number | null
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          emoji?: string | null
          goal_type?: string
          id?: string
          member_count?: number | null
          name?: string
        }
        Relationships: []
      }
      community_memberships: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_memberships_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "community_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      community_messages: {
        Row: {
          content: string
          created_at: string
          group_id: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          group_id: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          group_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "community_groups"
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
      daily_missions: {
        Row: {
          completed: boolean
          created_at: string
          description: string
          id: string
          mission_date: string
          mission_type: string
          title: string
          user_id: string
          xp_reward: number
        }
        Insert: {
          completed?: boolean
          created_at?: string
          description: string
          id?: string
          mission_date?: string
          mission_type?: string
          title: string
          user_id: string
          xp_reward?: number
        }
        Update: {
          completed?: boolean
          created_at?: string
          description?: string
          id?: string
          mission_date?: string
          mission_type?: string
          title?: string
          user_id?: string
          xp_reward?: number
        }
        Relationships: []
      }
      family_meal_logs: {
        Row: {
          created_at: string
          description: string | null
          fruits_eaten: number | null
          hydration_ml: number | null
          id: string
          meal_date: string
          meal_type: string
          member_id: string
          owner_id: string
          quality_score: number | null
          veggies_eaten: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          fruits_eaten?: number | null
          hydration_ml?: number | null
          id?: string
          meal_date?: string
          meal_type: string
          member_id: string
          owner_id: string
          quality_score?: number | null
          veggies_eaten?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          fruits_eaten?: number | null
          hydration_ml?: number | null
          id?: string
          meal_date?: string
          meal_type?: string
          member_id?: string
          owner_id?: string
          quality_score?: number | null
          veggies_eaten?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "family_meal_logs_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          age: number | null
          avatar_emoji: string | null
          created_at: string
          dietary_restrictions: string[] | null
          health_notes: string | null
          height_cm: number | null
          hydration_goal_ml: number | null
          id: string
          medications: string[] | null
          name: string
          owner_id: string
          parental_lock: boolean | null
          profile_type: string
          stars: number | null
          updated_at: string
          weight_kg: number | null
          xp: number | null
        }
        Insert: {
          age?: number | null
          avatar_emoji?: string | null
          created_at?: string
          dietary_restrictions?: string[] | null
          health_notes?: string | null
          height_cm?: number | null
          hydration_goal_ml?: number | null
          id?: string
          medications?: string[] | null
          name: string
          owner_id: string
          parental_lock?: boolean | null
          profile_type?: string
          stars?: number | null
          updated_at?: string
          weight_kg?: number | null
          xp?: number | null
        }
        Update: {
          age?: number | null
          avatar_emoji?: string | null
          created_at?: string
          dietary_restrictions?: string[] | null
          health_notes?: string | null
          height_cm?: number | null
          hydration_goal_ml?: number | null
          id?: string
          medications?: string[] | null
          name?: string
          owner_id?: string
          parental_lock?: boolean | null
          profile_type?: string
          stars?: number | null
          updated_at?: string
          weight_kg?: number | null
          xp?: number | null
        }
        Relationships: []
      }
      faq_articles: {
        Row: {
          answer: string
          category: string
          created_at: string
          id: string
          question: string
          sort_order: number | null
          tags: string[] | null
        }
        Insert: {
          answer: string
          category?: string
          created_at?: string
          id?: string
          question: string
          sort_order?: number | null
          tags?: string[] | null
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          id?: string
          question?: string
          sort_order?: number | null
          tags?: string[] | null
        }
        Relationships: []
      }
      foods: {
        Row: {
          calorias_100g: number
          carbo_100g: number
          categoria: string
          created_at: string
          fibra: number | null
          fonte: string
          gordura_100g: number
          id: string
          nome: string
          proteina_100g: number
          sodio: number | null
          vitaminas: Json | null
        }
        Insert: {
          calorias_100g?: number
          carbo_100g?: number
          categoria?: string
          created_at?: string
          fibra?: number | null
          fonte?: string
          gordura_100g?: number
          id?: string
          nome: string
          proteina_100g?: number
          sodio?: number | null
          vitaminas?: Json | null
        }
        Update: {
          calorias_100g?: number
          carbo_100g?: number
          categoria?: string
          created_at?: string
          fibra?: number | null
          fonte?: string
          gordura_100g?: number
          id?: string
          nome?: string
          proteina_100g?: number
          sodio?: number | null
          vitaminas?: Json | null
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
      meals_saved: {
        Row: {
          alimentos: Json
          created_at: string
          id: string
          nome: string
          total_macros: Json
          user_id: string
        }
        Insert: {
          alimentos?: Json
          created_at?: string
          id?: string
          nome: string
          total_macros?: Json
          user_id: string
        }
        Update: {
          alimentos?: Json
          created_at?: string
          id?: string
          nome?: string
          total_macros?: Json
          user_id?: string
        }
        Relationships: []
      }
      plan_slots: {
        Row: {
          id: string
          max_slots: number
          plan_key: string
          updated_at: string
          used_slots: number
        }
        Insert: {
          id?: string
          max_slots?: number
          plan_key: string
          updated_at?: string
          used_slots?: number
        }
        Update: {
          id?: string
          max_slots?: number
          plan_key?: string
          updated_at?: string
          used_slots?: number
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
          meta_peso: number | null
          nivel_treino: string | null
          objetivo_principal: string | null
          onboarding_completed: boolean | null
          orcamento_semanal: number | null
          perfil_comportamental: string | null
          prefere_refeicoes: string | null
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
          meta_peso?: number | null
          nivel_treino?: string | null
          objetivo_principal?: string | null
          onboarding_completed?: boolean | null
          orcamento_semanal?: number | null
          perfil_comportamental?: string | null
          prefere_refeicoes?: string | null
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
          meta_peso?: number | null
          nivel_treino?: string | null
          objetivo_principal?: string | null
          onboarding_completed?: boolean | null
          orcamento_semanal?: number | null
          perfil_comportamental?: string | null
          prefere_refeicoes?: string | null
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
      progress_photos: {
        Row: {
          body_fat_pct: number | null
          created_at: string
          id: string
          kcal_target: number | null
          notes: string | null
          photo_date: string
          photo_url: string
          streak_days: number | null
          tags: string[] | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          body_fat_pct?: number | null
          created_at?: string
          id?: string
          kcal_target?: number | null
          notes?: string | null
          photo_date?: string
          photo_url: string
          streak_days?: number | null
          tags?: string[] | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          body_fat_pct?: number | null
          created_at?: string
          id?: string
          kcal_target?: number | null
          notes?: string | null
          photo_date?: string
          photo_url?: string
          streak_days?: number | null
          tags?: string[] | null
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          sender_type: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          sender_type?: string
          ticket_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          sender_type?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string
          id: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
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
      water_logs: {
        Row: {
          created_at: string
          id: string
          log_date: string
          ml_total: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          log_date?: string
          ml_total?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          log_date?: string
          ml_total?: number
          user_id?: string
        }
        Relationships: []
      }
      weekly_challenges: {
        Row: {
          challenge_type: string
          completed: boolean
          created_at: string
          current_value: number
          description: string
          id: string
          target_value: number
          title: string
          user_id: string
          week_start: string
          xp_reward: number
        }
        Insert: {
          challenge_type?: string
          completed?: boolean
          created_at?: string
          current_value?: number
          description: string
          id?: string
          target_value?: number
          title: string
          user_id: string
          week_start: string
          xp_reward?: number
        }
        Update: {
          challenge_type?: string
          completed?: boolean
          created_at?: string
          current_value?: number
          description?: string
          id?: string
          target_value?: number
          title?: string
          user_id?: string
          week_start?: string
          xp_reward?: number
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
