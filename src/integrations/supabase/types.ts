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
      abandonment_risk_scores: {
        Row: {
          active_signals: Json | null
          ai_action_taken: boolean | null
          ai_message_sent: string | null
          coach_notified: boolean | null
          created_at: string | null
          id: string
          risk_level: string | null
          risk_score: number | null
          score_date: string | null
          signal_details: Json | null
          user_id: string
        }
        Insert: {
          active_signals?: Json | null
          ai_action_taken?: boolean | null
          ai_message_sent?: string | null
          coach_notified?: boolean | null
          created_at?: string | null
          id?: string
          risk_level?: string | null
          risk_score?: number | null
          score_date?: string | null
          signal_details?: Json | null
          user_id: string
        }
        Update: {
          active_signals?: Json | null
          ai_action_taken?: boolean | null
          ai_message_sent?: string | null
          coach_notified?: boolean | null
          created_at?: string | null
          id?: string
          risk_level?: string | null
          risk_score?: number | null
          score_date?: string | null
          signal_details?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      activation_metrics: {
        Row: {
          created_at: string | null
          days_active: number | null
          first_meal_at: string | null
          id: string
          last_app_open: string | null
          notification_preferences: Json | null
          notifications_configured: boolean | null
          reengagement_sent: number | null
          signup_at: string | null
          total_meals_day1: number | null
          tour_completed_at: string | null
          trial_pause_until: string | null
          trial_paused: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          days_active?: number | null
          first_meal_at?: string | null
          id?: string
          last_app_open?: string | null
          notification_preferences?: Json | null
          notifications_configured?: boolean | null
          reengagement_sent?: number | null
          signup_at?: string | null
          total_meals_day1?: number | null
          tour_completed_at?: string | null
          trial_pause_until?: string | null
          trial_paused?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          days_active?: number | null
          first_meal_at?: string | null
          id?: string
          last_app_open?: string | null
          notification_preferences?: Json | null
          notifications_configured?: boolean | null
          reengagement_sent?: number | null
          signup_at?: string | null
          total_meals_day1?: number | null
          tour_completed_at?: string | null
          trial_pause_until?: string | null
          trial_paused?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
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
      circadian_meal_plans: {
        Row: {
          ai_message: string | null
          chronotype_applied: string | null
          created_at: string | null
          generated_date: string | null
          id: string
          meals: Json | null
          total_calories: number | null
          total_carbs: number | null
          total_fat: number | null
          total_protein: number | null
          user_id: string
          workout_integrated: boolean | null
        }
        Insert: {
          ai_message?: string | null
          chronotype_applied?: string | null
          created_at?: string | null
          generated_date?: string | null
          id?: string
          meals?: Json | null
          total_calories?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_protein?: number | null
          user_id: string
          workout_integrated?: boolean | null
        }
        Update: {
          ai_message?: string | null
          chronotype_applied?: string | null
          created_at?: string | null
          generated_date?: string | null
          id?: string
          meals?: Json | null
          total_calories?: number | null
          total_carbs?: number | null
          total_fat?: number | null
          total_protein?: number | null
          user_id?: string
          workout_integrated?: boolean | null
        }
        Relationships: []
      }
      circadian_profiles: {
        Row: {
          chronotype: string
          created_at: string | null
          id: string
          meal_frequency: number
          peak_energy: string
          sleep_time: string
          updated_at: string | null
          user_id: string
          wake_time: string
        }
        Insert: {
          chronotype?: string
          created_at?: string | null
          id?: string
          meal_frequency?: number
          peak_energy?: string
          sleep_time?: string
          updated_at?: string | null
          user_id: string
          wake_time?: string
        }
        Update: {
          chronotype?: string
          created_at?: string | null
          id?: string
          meal_frequency?: number
          peak_energy?: string
          sleep_time?: string
          updated_at?: string | null
          user_id?: string
          wake_time?: string
        }
        Relationships: []
      }
      coach_alerts: {
        Row: {
          alert_type: string
          coach_id: string
          created_at: string | null
          id: string
          message: string
          patient_user_id: string
          resolved: boolean | null
          resolved_at: string | null
          severity: string | null
        }
        Insert: {
          alert_type: string
          coach_id: string
          created_at?: string | null
          id?: string
          message: string
          patient_user_id: string
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string | null
        }
        Update: {
          alert_type?: string
          coach_id?: string
          created_at?: string | null
          id?: string
          message?: string
          patient_user_id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_alerts_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_briefings: {
        Row: {
          ai_analysis: string | null
          briefing_data: Json | null
          coach_id: string
          created_at: string | null
          id: string
          patient_id: string
          positive_highlights: Json | null
          recommended_tone: string | null
          reviewed_at: string | null
          risk_level: string | null
          status: string | null
          suggested_adjustments: Json | null
          suggested_questions: Json | null
          week_start: string
        }
        Insert: {
          ai_analysis?: string | null
          briefing_data?: Json | null
          coach_id: string
          created_at?: string | null
          id?: string
          patient_id: string
          positive_highlights?: Json | null
          recommended_tone?: string | null
          reviewed_at?: string | null
          risk_level?: string | null
          status?: string | null
          suggested_adjustments?: Json | null
          suggested_questions?: Json | null
          week_start: string
        }
        Update: {
          ai_analysis?: string | null
          briefing_data?: Json | null
          coach_id?: string
          created_at?: string | null
          id?: string
          patient_id?: string
          positive_highlights?: Json | null
          recommended_tone?: string | null
          reviewed_at?: string | null
          risk_level?: string | null
          status?: string | null
          suggested_adjustments?: Json | null
          suggested_questions?: Json | null
          week_start?: string
        }
        Relationships: []
      }
      coach_messages: {
        Row: {
          attachment_url: string | null
          coach_id: string
          created_at: string | null
          id: string
          message: string
          patient_user_id: string
          read: boolean | null
          sender: string
        }
        Insert: {
          attachment_url?: string | null
          coach_id: string
          created_at?: string | null
          id?: string
          message: string
          patient_user_id: string
          read?: boolean | null
          sender?: string
        }
        Update: {
          attachment_url?: string | null
          coach_id?: string
          created_at?: string | null
          id?: string
          message?: string
          patient_user_id?: string
          read?: boolean | null
          sender?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_messages_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_patients: {
        Row: {
          coach_id: string
          created_at: string | null
          id: string
          notes: string | null
          patient_user_id: string
          started_at: string | null
          status: string | null
        }
        Insert: {
          coach_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          patient_user_id: string
          started_at?: string | null
          status?: string | null
        }
        Update: {
          coach_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          patient_user_id?: string
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_patients_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_profiles: {
        Row: {
          alert_channels: Json | null
          alert_frequency: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          crn: string | null
          id: string
          max_patients: number | null
          plan: string | null
          professional_name: string | null
          specialties: string[] | null
          tier: string | null
          trial_ends_at: string | null
          updated_at: string | null
          user_id: string
          white_label_app_name: string | null
          white_label_domain: string | null
          white_label_logo_url: string | null
          white_label_primary_color: string | null
          white_label_secondary_color: string | null
          white_label_splash_url: string | null
        }
        Insert: {
          alert_channels?: Json | null
          alert_frequency?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          crn?: string | null
          id?: string
          max_patients?: number | null
          plan?: string | null
          professional_name?: string | null
          specialties?: string[] | null
          tier?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id: string
          white_label_app_name?: string | null
          white_label_domain?: string | null
          white_label_logo_url?: string | null
          white_label_primary_color?: string | null
          white_label_secondary_color?: string | null
          white_label_splash_url?: string | null
        }
        Update: {
          alert_channels?: Json | null
          alert_frequency?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          crn?: string | null
          id?: string
          max_patients?: number | null
          plan?: string | null
          professional_name?: string | null
          specialties?: string[] | null
          tier?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id?: string
          white_label_app_name?: string | null
          white_label_domain?: string | null
          white_label_logo_url?: string | null
          white_label_primary_color?: string | null
          white_label_secondary_color?: string | null
          white_label_splash_url?: string | null
        }
        Relationships: []
      }
      coach_reports: {
        Row: {
          ai_summary: string | null
          coach_id: string
          coach_message: string | null
          created_at: string | null
          id: string
          patient_user_id: string
          report_data: Json | null
          report_period: string | null
          report_url: string | null
          sent_at: string | null
        }
        Insert: {
          ai_summary?: string | null
          coach_id: string
          coach_message?: string | null
          created_at?: string | null
          id?: string
          patient_user_id: string
          report_data?: Json | null
          report_period?: string | null
          report_url?: string | null
          sent_at?: string | null
        }
        Update: {
          ai_summary?: string | null
          coach_id?: string
          coach_message?: string | null
          created_at?: string | null
          id?: string
          patient_user_id?: string
          report_data?: Json | null
          report_period?: string | null
          report_url?: string | null
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_reports_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_slots: {
        Row: {
          id: number
          vagas_ocupadas: number | null
          vagas_totais: number | null
        }
        Insert: {
          id?: number
          vagas_ocupadas?: number | null
          vagas_totais?: number | null
        }
        Update: {
          id?: number
          vagas_ocupadas?: number | null
          vagas_totais?: number | null
        }
        Relationships: []
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
      consistency_scores: {
        Row: {
          adherence_score: number
          created_at: string
          id: string
          improvement_tip: string | null
          percentile: number | null
          positive_factor: string | null
          progress_score: number
          quality_score: number
          recovery_score: number
          total_score: number
          user_id: string
          week_end: string
          week_start: string
        }
        Insert: {
          adherence_score?: number
          created_at?: string
          id?: string
          improvement_tip?: string | null
          percentile?: number | null
          positive_factor?: string | null
          progress_score?: number
          quality_score?: number
          recovery_score?: number
          total_score?: number
          user_id: string
          week_end: string
          week_start: string
        }
        Update: {
          adherence_score?: number
          created_at?: string
          id?: string
          improvement_tip?: string | null
          percentile?: number | null
          positive_factor?: string | null
          progress_score?: number
          quality_score?: number
          recovery_score?: number
          total_score?: number
          user_id?: string
          week_end?: string
          week_start?: string
        }
        Relationships: []
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
      glp1_daily_logs: {
        Row: {
          created_at: string | null
          energy_level: number | null
          hydration_ml: number | null
          id: string
          log_date: string
          nausea_level: number | null
          notes: string | null
          protein_g: number | null
          total_kcal: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          energy_level?: number | null
          hydration_ml?: number | null
          id?: string
          log_date?: string
          nausea_level?: number | null
          notes?: string | null
          protein_g?: number | null
          total_kcal?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          energy_level?: number | null
          hydration_ml?: number | null
          id?: string
          log_date?: string
          nausea_level?: number | null
          notes?: string | null
          protein_g?: number | null
          total_kcal?: number | null
          user_id?: string
        }
        Relationships: []
      }
      glp1_profiles: {
        Row: {
          created_at: string | null
          current_dose: string | null
          duration_months: number | null
          exit_week: number | null
          id: string
          medication: string
          objective: string
          profile_class: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_dose?: string | null
          duration_months?: number | null
          exit_week?: number | null
          id?: string
          medication?: string
          objective?: string
          profile_class?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_dose?: string | null
          duration_months?: number | null
          exit_week?: number | null
          id?: string
          medication?: string
          objective?: string
          profile_class?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      glp1_subscriptions: {
        Row: {
          activated_at: string | null
          canceled_at: string | null
          id: string
          price: number | null
          status: string | null
          trigger_source: string | null
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          canceled_at?: string | null
          id?: string
          price?: number | null
          status?: string | null
          trigger_source?: string | null
          user_id: string
        }
        Update: {
          activated_at?: string | null
          canceled_at?: string | null
          id?: string
          price?: number | null
          status?: string | null
          trigger_source?: string | null
          user_id?: string
        }
        Relationships: []
      }
      glp1_weekly_scores: {
        Row: {
          alerts_triggered: number | null
          avg_hydration_ml: number | null
          avg_kcal: number | null
          avg_protein_g: number | null
          created_at: string | null
          id: string
          lean_mass_pct: number | null
          protocol_score: number | null
          user_id: string
          week_end: string
          week_start: string
          weight_kg: number | null
        }
        Insert: {
          alerts_triggered?: number | null
          avg_hydration_ml?: number | null
          avg_kcal?: number | null
          avg_protein_g?: number | null
          created_at?: string | null
          id?: string
          lean_mass_pct?: number | null
          protocol_score?: number | null
          user_id: string
          week_end: string
          week_start: string
          weight_kg?: number | null
        }
        Update: {
          alerts_triggered?: number | null
          avg_hydration_ml?: number | null
          avg_kcal?: number | null
          avg_protein_g?: number | null
          created_at?: string | null
          id?: string
          lean_mass_pct?: number | null
          protocol_score?: number | null
          user_id?: string
          week_end?: string
          week_start?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      marketplace_protocols: {
        Row: {
          coach_id: string
          created_at: string | null
          description: string | null
          duration_days: number | null
          id: string
          name: string
          price: number | null
          protocol_data: Json | null
          purchases_count: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          coach_id: string
          created_at?: string | null
          description?: string | null
          duration_days?: number | null
          id?: string
          name: string
          price?: number | null
          protocol_data?: Json | null
          purchases_count?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          coach_id?: string
          created_at?: string | null
          description?: string | null
          duration_days?: number | null
          id?: string
          name?: string
          price?: number | null
          protocol_data?: Json | null
          purchases_count?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_protocols_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      monthly_reports: {
        Row: {
          ai_message: string | null
          avg_consistency_score: number | null
          best_week: number | null
          best_week_score: number | null
          created_at: string
          focus_next_month: Json | null
          id: string
          macro_averages: Json | null
          motivational_quote: string | null
          pattern_analysis: Json | null
          previous_comparison: Json | null
          projection: Json | null
          protein_days_hit: number | null
          read: boolean
          report_month: string
          share_card_data: Json | null
          share_card_generated: boolean | null
          top_foods: Json | null
          total_meals_logged: number | null
          user_id: string
          weight_end: number | null
          weight_start: number | null
        }
        Insert: {
          ai_message?: string | null
          avg_consistency_score?: number | null
          best_week?: number | null
          best_week_score?: number | null
          created_at?: string
          focus_next_month?: Json | null
          id?: string
          macro_averages?: Json | null
          motivational_quote?: string | null
          pattern_analysis?: Json | null
          previous_comparison?: Json | null
          projection?: Json | null
          protein_days_hit?: number | null
          read?: boolean
          report_month: string
          share_card_data?: Json | null
          share_card_generated?: boolean | null
          top_foods?: Json | null
          total_meals_logged?: number | null
          user_id: string
          weight_end?: number | null
          weight_start?: number | null
        }
        Update: {
          ai_message?: string | null
          avg_consistency_score?: number | null
          best_week?: number | null
          best_week_score?: number | null
          created_at?: string
          focus_next_month?: Json | null
          id?: string
          macro_averages?: Json | null
          motivational_quote?: string | null
          pattern_analysis?: Json | null
          previous_comparison?: Json | null
          projection?: Json | null
          protein_days_hit?: number | null
          read?: boolean
          report_month?: string
          share_card_data?: Json | null
          share_card_generated?: boolean | null
          top_foods?: Json | null
          total_meals_logged?: number | null
          user_id?: string
          weight_end?: number | null
          weight_start?: number | null
        }
        Relationships: []
      }
      mood_checkins: {
        Row: {
          checkin_date: string
          created_at: string
          id: string
          mood: string
          user_id: string
        }
        Insert: {
          checkin_date?: string
          created_at?: string
          id?: string
          mood: string
          user_id: string
        }
        Update: {
          checkin_date?: string
          created_at?: string
          id?: string
          mood?: string
          user_id?: string
        }
        Relationships: []
      }
      peak_week_plans: {
        Row: {
          created_at: string | null
          daily_protocol: Json | null
          event_date: string
          event_name: string
          id: string
          start_date: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          daily_protocol?: Json | null
          event_date: string
          event_name?: string
          id?: string
          start_date: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          daily_protocol?: Json | null
          event_date?: string
          event_name?: string
          id?: string
          start_date?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      performance_pro_consent: {
        Row: {
          accepted_at: string | null
          id: string
          ip_address: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          id?: string
          ip_address?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          id?: string
          ip_address?: string | null
          user_id?: string
        }
        Relationships: []
      }
      performance_pro_exams: {
        Row: {
          ai_analysis: Json | null
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          created_at: string | null
          creatinine: number | null
          estradiol: number | null
          exam_date: string | null
          fsh: number | null
          ggt: number | null
          hdl: number | null
          hematocrit: number | null
          hemoglobin: number | null
          id: string
          ldl: number | null
          lh: number | null
          notes: string | null
          prolactin: number | null
          psa: number | null
          testosterone_free: number | null
          testosterone_total: number | null
          tgo: number | null
          tgp: number | null
          triglycerides: number | null
          urea: number | null
          user_id: string
        }
        Insert: {
          ai_analysis?: Json | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          created_at?: string | null
          creatinine?: number | null
          estradiol?: number | null
          exam_date?: string | null
          fsh?: number | null
          ggt?: number | null
          hdl?: number | null
          hematocrit?: number | null
          hemoglobin?: number | null
          id?: string
          ldl?: number | null
          lh?: number | null
          notes?: string | null
          prolactin?: number | null
          psa?: number | null
          testosterone_free?: number | null
          testosterone_total?: number | null
          tgo?: number | null
          tgp?: number | null
          triglycerides?: number | null
          urea?: number | null
          user_id: string
        }
        Update: {
          ai_analysis?: Json | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          created_at?: string | null
          creatinine?: number | null
          estradiol?: number | null
          exam_date?: string | null
          fsh?: number | null
          ggt?: number | null
          hdl?: number | null
          hematocrit?: number | null
          hemoglobin?: number | null
          id?: string
          ldl?: number | null
          lh?: number | null
          notes?: string | null
          prolactin?: number | null
          psa?: number | null
          testosterone_free?: number | null
          testosterone_total?: number | null
          tgo?: number | null
          tgp?: number | null
          triglycerides?: number | null
          urea?: number | null
          user_id?: string
        }
        Relationships: []
      }
      performance_pro_protocols: {
        Row: {
          ai_message: string | null
          created_at: string | null
          current_phase: string | null
          experience_level: string | null
          id: string
          nutrition_plan: Json | null
          objective: string | null
          safety_alerts: Json | null
          started_at: string | null
          substances: string[] | null
          support_stack: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ai_message?: string | null
          created_at?: string | null
          current_phase?: string | null
          experience_level?: string | null
          id?: string
          nutrition_plan?: Json | null
          objective?: string | null
          safety_alerts?: Json | null
          started_at?: string | null
          substances?: string[] | null
          support_stack?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ai_message?: string | null
          created_at?: string | null
          current_phase?: string | null
          experience_level?: string | null
          id?: string
          nutrition_plan?: Json | null
          objective?: string | null
          safety_alerts?: Json | null
          started_at?: string | null
          substances?: string[] | null
          support_stack?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      plan_revisions: {
        Row: {
          analysis_period_end: string | null
          analysis_period_start: string | null
          analysis_summary: string | null
          approved_at: string | null
          coach_id: string | null
          created_at: string | null
          id: string
          impact_summary: Json | null
          proposed_changes: Json | null
          rejection_reason: string | null
          revision_date: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          analysis_period_end?: string | null
          analysis_period_start?: string | null
          analysis_summary?: string | null
          approved_at?: string | null
          coach_id?: string | null
          created_at?: string | null
          id?: string
          impact_summary?: Json | null
          proposed_changes?: Json | null
          rejection_reason?: string | null
          revision_date?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          analysis_period_end?: string | null
          analysis_period_start?: string | null
          analysis_summary?: string | null
          approved_at?: string | null
          coach_id?: string | null
          created_at?: string | null
          id?: string
          impact_summary?: Json | null
          proposed_changes?: Json | null
          rejection_reason?: string | null
          revision_date?: string | null
          status?: string | null
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
          activation_completed: boolean | null
          active_protocol: string | null
          activity_level: string | null
          avatar_url: string | null
          carbs_g: number | null
          coach_profile_id: string | null
          created_at: string
          date_of_birth: string | null
          dietary_restrictions: string[] | null
          email: string | null
          fat_g: number | null
          first_meal_registered: boolean | null
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
          plano_atual: string | null
          prefere_refeicoes: string | null
          protein_g: number | null
          sex: string | null
          sport: string | null
          streak_days: number | null
          training_frequency: number | null
          trial_ends_at: string | null
          updated_at: string
          user_id: string
          uses_glp1: boolean | null
          vet_kcal: number | null
          weight_kg: number | null
          xp: number | null
        }
        Insert: {
          activation_completed?: boolean | null
          active_protocol?: string | null
          activity_level?: string | null
          avatar_url?: string | null
          carbs_g?: number | null
          coach_profile_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          dietary_restrictions?: string[] | null
          email?: string | null
          fat_g?: number | null
          first_meal_registered?: boolean | null
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
          plano_atual?: string | null
          prefere_refeicoes?: string | null
          protein_g?: number | null
          sex?: string | null
          sport?: string | null
          streak_days?: number | null
          training_frequency?: number | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
          uses_glp1?: boolean | null
          vet_kcal?: number | null
          weight_kg?: number | null
          xp?: number | null
        }
        Update: {
          activation_completed?: boolean | null
          active_protocol?: string | null
          activity_level?: string | null
          avatar_url?: string | null
          carbs_g?: number | null
          coach_profile_id?: string | null
          created_at?: string
          date_of_birth?: string | null
          dietary_restrictions?: string[] | null
          email?: string | null
          fat_g?: number | null
          first_meal_registered?: boolean | null
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
          plano_atual?: string | null
          prefere_refeicoes?: string | null
          protein_g?: number | null
          sex?: string | null
          sport?: string | null
          streak_days?: number | null
          training_frequency?: number | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
          uses_glp1?: boolean | null
          vet_kcal?: number | null
          weight_kg?: number | null
          xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_coach_profile_id_fkey"
            columns: ["coach_profile_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      special_events: {
        Row: {
          created_at: string
          day_strategy: string | null
          event_date: string
          event_type: string
          id: string
          intention: string
          post_strategy: string | null
          pre_strategy: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          day_strategy?: string | null
          event_date: string
          event_type: string
          id?: string
          intention?: string
          post_strategy?: string | null
          pre_strategy?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          day_strategy?: string | null
          event_date?: string
          event_type?: string
          id?: string
          intention?: string
          post_strategy?: string | null
          pre_strategy?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          activated_at: string | null
          canceled_at: string | null
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          kiwify_order_id: string | null
          kiwify_product_id: string | null
          periodo: string | null
          plano: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          canceled_at?: string | null
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          kiwify_order_id?: string | null
          kiwify_product_id?: string | null
          periodo?: string | null
          plano?: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activated_at?: string | null
          canceled_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          kiwify_order_id?: string | null
          kiwify_product_id?: string | null
          periodo?: string | null
          plano?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscriptions_pending: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          kiwify_order_id: string | null
          periodo: string | null
          plano: string
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          kiwify_order_id?: string | null
          periodo?: string | null
          plano: string
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          kiwify_order_id?: string | null
          periodo?: string | null
          plano?: string
        }
        Relationships: []
      }
      supplement_logs: {
        Row: {
          created_at: string | null
          id: string
          log_date: string | null
          skipped: boolean | null
          supplement_name: string
          taken_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          log_date?: string | null
          skipped?: boolean | null
          supplement_name: string
          taken_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          log_date?: string | null
          skipped?: boolean | null
          supplement_name?: string
          taken_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      supplement_stacks: {
        Row: {
          active: boolean | null
          ai_generated: boolean | null
          ai_summary: string | null
          budget_tier: string | null
          created_at: string | null
          current_supplements: string[] | null
          dietary_restrictions: string[] | null
          goal: string | null
          health_conditions: string[] | null
          id: string
          monthly_cost: number | null
          supplements: Json | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          ai_generated?: boolean | null
          ai_summary?: string | null
          budget_tier?: string | null
          created_at?: string | null
          current_supplements?: string[] | null
          dietary_restrictions?: string[] | null
          goal?: string | null
          health_conditions?: string[] | null
          id?: string
          monthly_cost?: number | null
          supplements?: Json | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          ai_generated?: boolean | null
          ai_summary?: string | null
          budget_tier?: string | null
          created_at?: string | null
          current_supplements?: string[] | null
          dietary_restrictions?: string[] | null
          goal?: string | null
          health_conditions?: string[] | null
          id?: string
          monthly_cost?: number | null
          supplements?: Json | null
          user_id?: string
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
      voice_checkins: {
        Row: {
          audio_duration: number | null
          audio_url: string | null
          confirmed: boolean | null
          created_at: string | null
          extracted_context: string | null
          extracted_foods: Json | null
          extracted_mood: string | null
          id: string
          meal_log_id: string | null
          transcription: string | null
          user_id: string
        }
        Insert: {
          audio_duration?: number | null
          audio_url?: string | null
          confirmed?: boolean | null
          created_at?: string | null
          extracted_context?: string | null
          extracted_foods?: Json | null
          extracted_mood?: string | null
          id?: string
          meal_log_id?: string | null
          transcription?: string | null
          user_id: string
        }
        Update: {
          audio_duration?: number | null
          audio_url?: string | null
          confirmed?: boolean | null
          created_at?: string | null
          extracted_context?: string | null
          extracted_foods?: Json | null
          extracted_mood?: string | null
          id?: string
          meal_log_id?: string | null
          transcription?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_checkins_meal_log_id_fkey"
            columns: ["meal_log_id"]
            isOneToOne: false
            referencedRelation: "meal_logs"
            referencedColumns: ["id"]
          },
        ]
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
      weekly_sabotage_reports: {
        Row: {
          ai_suggestion: string | null
          avg_kcal_deficit: number | null
          created_at: string
          id: string
          main_trigger: string | null
          meals_off_plan: number
          meals_on_plan: number
          positive_highlights: Json | null
          projected_kg_30d: number | null
          protein_days_hit: number
          read: boolean
          sabotage_pattern: Json | null
          total_meals_logged: number
          total_meals_planned: number
          user_id: string
          week_end: string
          week_start: string
          weight_trend: string | null
          worst_day: string | null
          worst_hour: string | null
        }
        Insert: {
          ai_suggestion?: string | null
          avg_kcal_deficit?: number | null
          created_at?: string
          id?: string
          main_trigger?: string | null
          meals_off_plan?: number
          meals_on_plan?: number
          positive_highlights?: Json | null
          projected_kg_30d?: number | null
          protein_days_hit?: number
          read?: boolean
          sabotage_pattern?: Json | null
          total_meals_logged?: number
          total_meals_planned?: number
          user_id: string
          week_end: string
          week_start: string
          weight_trend?: string | null
          worst_day?: string | null
          worst_hour?: string | null
        }
        Update: {
          ai_suggestion?: string | null
          avg_kcal_deficit?: number | null
          created_at?: string
          id?: string
          main_trigger?: string | null
          meals_off_plan?: number
          meals_on_plan?: number
          positive_highlights?: Json | null
          projected_kg_30d?: number | null
          protein_days_hit?: number
          read?: boolean
          sabotage_pattern?: Json | null
          total_meals_logged?: number
          total_meals_planned?: number
          user_id?: string
          week_end?: string
          week_start?: string
          weight_trend?: string | null
          worst_day?: string | null
          worst_hour?: string | null
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
      workout_daily_logs: {
        Row: {
          calories_adjusted: number | null
          carbs_adjusted: number | null
          completed: boolean | null
          created_at: string | null
          fat_adjusted: number | null
          hydration_adjusted: number | null
          id: string
          log_date: string | null
          notes: string | null
          protein_adjusted: number | null
          user_id: string
          workout_type: string
        }
        Insert: {
          calories_adjusted?: number | null
          carbs_adjusted?: number | null
          completed?: boolean | null
          created_at?: string | null
          fat_adjusted?: number | null
          hydration_adjusted?: number | null
          id?: string
          log_date?: string | null
          notes?: string | null
          protein_adjusted?: number | null
          user_id: string
          workout_type?: string
        }
        Update: {
          calories_adjusted?: number | null
          carbs_adjusted?: number | null
          completed?: boolean | null
          created_at?: string | null
          fat_adjusted?: number | null
          hydration_adjusted?: number | null
          id?: string
          log_date?: string | null
          notes?: string | null
          protein_adjusted?: number | null
          user_id?: string
          workout_type?: string
        }
        Relationships: []
      }
      workout_schedule: {
        Row: {
          created_at: string | null
          day_of_week: number
          duration_minutes: number
          id: string
          user_id: string
          workout_time: string
          workout_type: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          duration_minutes?: number
          id?: string
          user_id: string
          workout_time?: string
          workout_type?: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          duration_minutes?: number
          id?: string
          user_id?: string
          workout_time?: string
          workout_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      my_subscription: {
        Row: {
          activated_at: string | null
          expires_at: string | null
          periodo: string | null
          plano: string | null
          status: string | null
        }
        Insert: {
          activated_at?: string | null
          expires_at?: string | null
          periodo?: string | null
          plano?: string | null
          status?: string | null
        }
        Update: {
          activated_at?: string | null
          expires_at?: string | null
          periodo?: string | null
          plano?: string | null
          status?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      decrement_coach_slots: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_coach_slots: { Args: never; Returns: undefined }
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
