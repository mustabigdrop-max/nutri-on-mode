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
      anamnesis: {
        Row: {
          alerts: Json
          athlete_id: string | null
          athlete_name: string | null
          coach_id: string | null
          completed_at: string | null
          created_at: string
          diet_history: Json
          digestive: Json
          expires_at: string | null
          goals: Json
          health_history: Json
          hormonal: Json
          id: string
          invite_token: string | null
          lifestyle: Json
          mode: string
          personal: Json
          pharmacology: Json
          sections_completed: number
          status: string
          supplements: Json
          total_sections: number
          training: Json
          updated_at: string
        }
        Insert: {
          alerts?: Json
          athlete_id?: string | null
          athlete_name?: string | null
          coach_id?: string | null
          completed_at?: string | null
          created_at?: string
          diet_history?: Json
          digestive?: Json
          expires_at?: string | null
          goals?: Json
          health_history?: Json
          hormonal?: Json
          id?: string
          invite_token?: string | null
          lifestyle?: Json
          mode?: string
          personal?: Json
          pharmacology?: Json
          sections_completed?: number
          status?: string
          supplements?: Json
          total_sections?: number
          training?: Json
          updated_at?: string
        }
        Update: {
          alerts?: Json
          athlete_id?: string | null
          athlete_name?: string | null
          coach_id?: string | null
          completed_at?: string | null
          created_at?: string
          diet_history?: Json
          digestive?: Json
          expires_at?: string | null
          goals?: Json
          health_history?: Json
          hormonal?: Json
          id?: string
          invite_token?: string | null
          lifestyle?: Json
          mode?: string
          personal?: Json
          pharmacology?: Json
          sections_completed?: number
          status?: string
          supplements?: Json
          total_sections?: number
          training?: Json
          updated_at?: string
        }
        Relationships: []
      }
      apex_agent_sessions: {
        Row: {
          approved_at: string | null
          athlete_id: string | null
          change_log: Json
          coach_id: string
          created_at: string
          id: string
          messages: Json
          protocol_version: number
          snapshot: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          athlete_id?: string | null
          change_log?: Json
          coach_id: string
          created_at?: string
          id?: string
          messages?: Json
          protocol_version?: number
          snapshot?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          athlete_id?: string | null
          change_log?: Json
          coach_id?: string
          created_at?: string
          id?: string
          messages?: Json
          protocol_version?: number
          snapshot?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      apex_analyses: {
        Row: {
          analysis_text: string | null
          athlete_id: string | null
          bf_estimated: number | null
          bf_target: number | null
          category: string
          category_label: string | null
          coach_id: string
          created_at: string
          cycle_duration: number | null
          cycle_goal: string | null
          cycle_week: number | null
          id: string
          landmarks: Json | null
          photo_back_url: string | null
          photo_front_url: string | null
          photo_side_url: string | null
          photos: Json | null
          priority_1: string | null
          priority_2: string | null
          priority_3: string | null
          protein_ideal: string | null
          protocol: string | null
          scores: Json | null
          support: string | null
          tdee_factor: number | null
          weeks_estimated: number | null
        }
        Insert: {
          analysis_text?: string | null
          athlete_id?: string | null
          bf_estimated?: number | null
          bf_target?: number | null
          category: string
          category_label?: string | null
          coach_id: string
          created_at?: string
          cycle_duration?: number | null
          cycle_goal?: string | null
          cycle_week?: number | null
          id?: string
          landmarks?: Json | null
          photo_back_url?: string | null
          photo_front_url?: string | null
          photo_side_url?: string | null
          photos?: Json | null
          priority_1?: string | null
          priority_2?: string | null
          priority_3?: string | null
          protein_ideal?: string | null
          protocol?: string | null
          scores?: Json | null
          support?: string | null
          tdee_factor?: number | null
          weeks_estimated?: number | null
        }
        Update: {
          analysis_text?: string | null
          athlete_id?: string | null
          bf_estimated?: number | null
          bf_target?: number | null
          category?: string
          category_label?: string | null
          coach_id?: string
          created_at?: string
          cycle_duration?: number | null
          cycle_goal?: string | null
          cycle_week?: number | null
          id?: string
          landmarks?: Json | null
          photo_back_url?: string | null
          photo_front_url?: string | null
          photo_side_url?: string | null
          photos?: Json | null
          priority_1?: string | null
          priority_2?: string | null
          priority_3?: string | null
          protein_ideal?: string | null
          protocol?: string | null
          scores?: Json | null
          support?: string | null
          tdee_factor?: number | null
          weeks_estimated?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "apex_analyses_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athlete_progress_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apex_analyses_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "competition_athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      apex_assessments: {
        Row: {
          assessment_date: string
          created_at: string | null
          fms_total: number | null
          id: string
          mobility_score: number | null
          notes: string | null
          overall_score: number | null
          posture_score: number | null
          symmetry_score: number | null
          user_id: string
        }
        Insert: {
          assessment_date?: string
          created_at?: string | null
          fms_total?: number | null
          id?: string
          mobility_score?: number | null
          notes?: string | null
          overall_score?: number | null
          posture_score?: number | null
          symmetry_score?: number | null
          user_id: string
        }
        Update: {
          assessment_date?: string
          created_at?: string | null
          fms_total?: number | null
          id?: string
          mobility_score?: number | null
          notes?: string | null
          overall_score?: number | null
          posture_score?: number | null
          symmetry_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      apex_checkins: {
        Row: {
          admin_id: string | null
          analise_ia: Json | null
          atleta_id: string
          bf_percent: number | null
          created_at: string
          delta_analise: string | null
          delta_score: number | null
          fase: string | null
          foto_url: string
          id: string
          peso_kg: number | null
          score_dureza: number | null
          score_geral: number | null
          score_proporcao: number | null
          score_separacao: number | null
          score_textura: number | null
          semana: number
          semanas_faltam: number | null
        }
        Insert: {
          admin_id?: string | null
          analise_ia?: Json | null
          atleta_id: string
          bf_percent?: number | null
          created_at?: string
          delta_analise?: string | null
          delta_score?: number | null
          fase?: string | null
          foto_url: string
          id?: string
          peso_kg?: number | null
          score_dureza?: number | null
          score_geral?: number | null
          score_proporcao?: number | null
          score_separacao?: number | null
          score_textura?: number | null
          semana: number
          semanas_faltam?: number | null
        }
        Update: {
          admin_id?: string | null
          analise_ia?: Json | null
          atleta_id?: string
          bf_percent?: number | null
          created_at?: string
          delta_analise?: string | null
          delta_score?: number | null
          fase?: string | null
          foto_url?: string
          id?: string
          peso_kg?: number | null
          score_dureza?: number | null
          score_geral?: number | null
          score_proporcao?: number | null
          score_separacao?: number | null
          score_textura?: number | null
          semana?: number
          semanas_faltam?: number | null
        }
        Relationships: []
      }
      apex_corrective_protocols: {
        Row: {
          assessment_id: string
          completed_at: string | null
          created_at: string | null
          id: string
          priority: string | null
          protocol_data: Json
          user_id: string
        }
        Insert: {
          assessment_id: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          priority?: string | null
          protocol_data?: Json
          user_id: string
        }
        Update: {
          assessment_id?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          priority?: string | null
          protocol_data?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "apex_corrective_protocols_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "apex_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      apex_fms_scores: {
        Row: {
          active_slr_l: number | null
          active_slr_r: number | null
          assessment_id: string
          created_at: string | null
          deep_squat: number | null
          hurdle_step_l: number | null
          hurdle_step_r: number | null
          id: string
          inline_lunge_l: number | null
          inline_lunge_r: number | null
          rotary_stab_l: number | null
          rotary_stab_r: number | null
          shoulder_mob_l: number | null
          shoulder_mob_r: number | null
          trunk_stability: number | null
          user_id: string
        }
        Insert: {
          active_slr_l?: number | null
          active_slr_r?: number | null
          assessment_id: string
          created_at?: string | null
          deep_squat?: number | null
          hurdle_step_l?: number | null
          hurdle_step_r?: number | null
          id?: string
          inline_lunge_l?: number | null
          inline_lunge_r?: number | null
          rotary_stab_l?: number | null
          rotary_stab_r?: number | null
          shoulder_mob_l?: number | null
          shoulder_mob_r?: number | null
          trunk_stability?: number | null
          user_id: string
        }
        Update: {
          active_slr_l?: number | null
          active_slr_r?: number | null
          assessment_id?: string
          created_at?: string | null
          deep_squat?: number | null
          hurdle_step_l?: number | null
          hurdle_step_r?: number | null
          id?: string
          inline_lunge_l?: number | null
          inline_lunge_r?: number | null
          rotary_stab_l?: number | null
          rotary_stab_r?: number | null
          shoulder_mob_l?: number | null
          shoulder_mob_r?: number | null
          trunk_stability?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "apex_fms_scores_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "apex_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      apex_guided_sessions: {
        Row: {
          athlete_id: string | null
          body_score: number | null
          coach_id: string
          completed_at: string | null
          created_at: string
          duration_minutes: number | null
          fcs_score: number | null
          full_report: Json | null
          id: string
          kinetic_chains: Json | null
          metricas_atingidas: Json | null
          plano_fase_atual: number | null
          plano_mestre: Json | null
          plano_semana_atual: number | null
          session_type: string
          sri_score: number | null
          steps_data: Json
        }
        Insert: {
          athlete_id?: string | null
          body_score?: number | null
          coach_id: string
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          fcs_score?: number | null
          full_report?: Json | null
          id?: string
          kinetic_chains?: Json | null
          metricas_atingidas?: Json | null
          plano_fase_atual?: number | null
          plano_mestre?: Json | null
          plano_semana_atual?: number | null
          session_type: string
          sri_score?: number | null
          steps_data?: Json
        }
        Update: {
          athlete_id?: string | null
          body_score?: number | null
          coach_id?: string
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number | null
          fcs_score?: number | null
          full_report?: Json | null
          id?: string
          kinetic_chains?: Json | null
          metricas_atingidas?: Json | null
          plano_fase_atual?: number | null
          plano_mestre?: Json | null
          plano_semana_atual?: number | null
          session_type?: string
          sri_score?: number | null
          steps_data?: Json
        }
        Relationships: []
      }
      apex_muscle_scores: {
        Row: {
          abs_obliques: number | null
          abs_rectus: number | null
          adductors: number | null
          assessment_date: string
          biceps_l: number | null
          biceps_r: number | null
          calves_l: number | null
          calves_r: number | null
          chest_lower: number | null
          chest_upper: number | null
          created_at: string | null
          erectors: number | null
          forearms_l: number | null
          forearms_r: number | null
          glute_max: number | null
          glute_med: number | null
          hams_l: number | null
          hams_r: number | null
          id: string
          lats: number | null
          quads_l: number | null
          quads_r: number | null
          rhomboids: number | null
          shape_goal: string | null
          shoulder_ant: number | null
          shoulder_lat: number | null
          shoulder_post: number | null
          traps_lower: number | null
          traps_mid: number | null
          traps_upper: number | null
          triceps_l: number | null
          triceps_r: number | null
          user_id: string
        }
        Insert: {
          abs_obliques?: number | null
          abs_rectus?: number | null
          adductors?: number | null
          assessment_date?: string
          biceps_l?: number | null
          biceps_r?: number | null
          calves_l?: number | null
          calves_r?: number | null
          chest_lower?: number | null
          chest_upper?: number | null
          created_at?: string | null
          erectors?: number | null
          forearms_l?: number | null
          forearms_r?: number | null
          glute_max?: number | null
          glute_med?: number | null
          hams_l?: number | null
          hams_r?: number | null
          id?: string
          lats?: number | null
          quads_l?: number | null
          quads_r?: number | null
          rhomboids?: number | null
          shape_goal?: string | null
          shoulder_ant?: number | null
          shoulder_lat?: number | null
          shoulder_post?: number | null
          traps_lower?: number | null
          traps_mid?: number | null
          traps_upper?: number | null
          triceps_l?: number | null
          triceps_r?: number | null
          user_id: string
        }
        Update: {
          abs_obliques?: number | null
          abs_rectus?: number | null
          adductors?: number | null
          assessment_date?: string
          biceps_l?: number | null
          biceps_r?: number | null
          calves_l?: number | null
          calves_r?: number | null
          chest_lower?: number | null
          chest_upper?: number | null
          created_at?: string | null
          erectors?: number | null
          forearms_l?: number | null
          forearms_r?: number | null
          glute_max?: number | null
          glute_med?: number | null
          hams_l?: number | null
          hams_r?: number | null
          id?: string
          lats?: number | null
          quads_l?: number | null
          quads_r?: number | null
          rhomboids?: number | null
          shape_goal?: string | null
          shoulder_ant?: number | null
          shoulder_lat?: number | null
          shoulder_post?: number | null
          traps_lower?: number | null
          traps_mid?: number | null
          traps_upper?: number | null
          triceps_l?: number | null
          triceps_r?: number | null
          user_id?: string
        }
        Relationships: []
      }
      apex_pain_entries: {
        Row: {
          behavior: string | null
          body_region: string
          created_at: string | null
          id: string
          intensity: number | null
          notes: string | null
          onset_pattern: string | null
          pain_type: string | null
          quality: string[] | null
          red_flag: boolean | null
          resolved_at: string | null
          side: string | null
          user_id: string
        }
        Insert: {
          behavior?: string | null
          body_region: string
          created_at?: string | null
          id?: string
          intensity?: number | null
          notes?: string | null
          onset_pattern?: string | null
          pain_type?: string | null
          quality?: string[] | null
          red_flag?: boolean | null
          resolved_at?: string | null
          side?: string | null
          user_id: string
        }
        Update: {
          behavior?: string | null
          body_region?: string
          created_at?: string | null
          id?: string
          intensity?: number | null
          notes?: string | null
          onset_pattern?: string | null
          pain_type?: string | null
          quality?: string[] | null
          red_flag?: boolean | null
          resolved_at?: string | null
          side?: string | null
          user_id?: string
        }
        Relationships: []
      }
      apex_plano_progresso: {
        Row: {
          athlete_id: string | null
          coach_id: string
          concluido: boolean | null
          exercicio: string
          fase: number
          id: string
          observacao: string | null
          registrado_em: string
          semana: number
          session_id: string
        }
        Insert: {
          athlete_id?: string | null
          coach_id: string
          concluido?: boolean | null
          exercicio: string
          fase: number
          id?: string
          observacao?: string | null
          registrado_em?: string
          semana: number
          session_id: string
        }
        Update: {
          athlete_id?: string | null
          coach_id?: string
          concluido?: boolean | null
          exercicio?: string
          fase?: number
          id?: string
          observacao?: string | null
          registrado_em?: string
          semana?: number
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "apex_plano_progresso_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "apex_guided_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      apex_posture_data: {
        Row: {
          assessment_id: string
          created_at: string | null
          forward_head: string | null
          hip_asym: string | null
          id: string
          lower_crossed: string | null
          lumbar_lordosis: string | null
          pelvic_tilt: string | null
          pronation_dist: string | null
          scoliosis: string | null
          shoulder_asym: string | null
          thoracic_kyphosis: string | null
          upper_crossed: string | null
          user_id: string
        }
        Insert: {
          assessment_id: string
          created_at?: string | null
          forward_head?: string | null
          hip_asym?: string | null
          id?: string
          lower_crossed?: string | null
          lumbar_lordosis?: string | null
          pelvic_tilt?: string | null
          pronation_dist?: string | null
          scoliosis?: string | null
          shoulder_asym?: string | null
          thoracic_kyphosis?: string | null
          upper_crossed?: string | null
          user_id: string
        }
        Update: {
          assessment_id?: string
          created_at?: string | null
          forward_head?: string | null
          hip_asym?: string | null
          id?: string
          lower_crossed?: string | null
          lumbar_lordosis?: string | null
          pelvic_tilt?: string | null
          pronation_dist?: string | null
          scoliosis?: string | null
          shoulder_asym?: string | null
          thoracic_kyphosis?: string | null
          upper_crossed?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "apex_posture_data_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "apex_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      apex_reports: {
        Row: {
          angles: Json
          apex_score: number
          assessment_date: string
          athlete_age: number | null
          athlete_height: number | null
          athlete_name: string
          athlete_weight: number | null
          created_at: string
          cueing: Json | null
          findings: Json
          id: string
          image_url: string | null
          landmarks: Json | null
          muscle_status: Json | null
          notes: string | null
          phase: string | null
          protocol: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          angles: Json
          apex_score: number
          assessment_date?: string
          athlete_age?: number | null
          athlete_height?: number | null
          athlete_name: string
          athlete_weight?: number | null
          created_at?: string
          cueing?: Json | null
          findings: Json
          id?: string
          image_url?: string | null
          landmarks?: Json | null
          muscle_status?: Json | null
          notes?: string | null
          phase?: string | null
          protocol?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          angles?: Json
          apex_score?: number
          assessment_date?: string
          athlete_age?: number | null
          athlete_height?: number | null
          athlete_name?: string
          athlete_weight?: number | null
          created_at?: string
          cueing?: Json | null
          findings?: Json
          id?: string
          image_url?: string | null
          landmarks?: Json | null
          muscle_status?: Json | null
          notes?: string | null
          phase?: string | null
          protocol?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      apex_rom_measurements: {
        Row: {
          ankle_df_l: number | null
          ankle_df_r: number | null
          assessment_id: string | null
          cervical_ext: number | null
          cervical_flex: number | null
          cervical_rot_l: number | null
          cervical_rot_r: number | null
          created_at: string | null
          hip_er_l: number | null
          hip_er_r: number | null
          hip_ext_l: number | null
          hip_ext_r: number | null
          hip_flex_l: number | null
          hip_flex_r: number | null
          hip_ir_l: number | null
          hip_ir_r: number | null
          id: string
          shoulder_er_l: number | null
          shoulder_er_r: number | null
          shoulder_flex_l: number | null
          shoulder_flex_r: number | null
          thoracic_rot_l: number | null
          thoracic_rot_r: number | null
          user_id: string
        }
        Insert: {
          ankle_df_l?: number | null
          ankle_df_r?: number | null
          assessment_id?: string | null
          cervical_ext?: number | null
          cervical_flex?: number | null
          cervical_rot_l?: number | null
          cervical_rot_r?: number | null
          created_at?: string | null
          hip_er_l?: number | null
          hip_er_r?: number | null
          hip_ext_l?: number | null
          hip_ext_r?: number | null
          hip_flex_l?: number | null
          hip_flex_r?: number | null
          hip_ir_l?: number | null
          hip_ir_r?: number | null
          id?: string
          shoulder_er_l?: number | null
          shoulder_er_r?: number | null
          shoulder_flex_l?: number | null
          shoulder_flex_r?: number | null
          thoracic_rot_l?: number | null
          thoracic_rot_r?: number | null
          user_id: string
        }
        Update: {
          ankle_df_l?: number | null
          ankle_df_r?: number | null
          assessment_id?: string | null
          cervical_ext?: number | null
          cervical_flex?: number | null
          cervical_rot_l?: number | null
          cervical_rot_r?: number | null
          created_at?: string | null
          hip_er_l?: number | null
          hip_er_r?: number | null
          hip_ext_l?: number | null
          hip_ext_r?: number | null
          hip_flex_l?: number | null
          hip_flex_r?: number | null
          hip_ir_l?: number | null
          hip_ir_r?: number | null
          id?: string
          shoulder_er_l?: number | null
          shoulder_er_r?: number | null
          shoulder_flex_l?: number | null
          shoulder_flex_r?: number | null
          thoracic_rot_l?: number | null
          thoracic_rot_r?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "apex_rom_measurements_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "apex_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      apex_test_results: {
        Row: {
          athlete_id: string | null
          coach_id: string
          created_at: string
          evaluated_at: string
          findings_text: string | null
          id: string
          image_url: string | null
          measurements: Json
          muscle_updates: Json
          overall_severity: string | null
          raw_result: Json
          test_group: string | null
          test_id: string
          test_name: string
        }
        Insert: {
          athlete_id?: string | null
          coach_id: string
          created_at?: string
          evaluated_at?: string
          findings_text?: string | null
          id?: string
          image_url?: string | null
          measurements?: Json
          muscle_updates?: Json
          overall_severity?: string | null
          raw_result?: Json
          test_group?: string | null
          test_id: string
          test_name: string
        }
        Update: {
          athlete_id?: string | null
          coach_id?: string
          created_at?: string
          evaluated_at?: string
          findings_text?: string | null
          id?: string
          image_url?: string | null
          measurements?: Json
          muscle_updates?: Json
          overall_severity?: string | null
          raw_result?: Json
          test_group?: string | null
          test_id?: string
          test_name?: string
        }
        Relationships: []
      }
      apex_training_rules: {
        Row: {
          achado_key: string
          achado_label: string
          ativacao_alvo: string[] | null
          ativo: boolean | null
          contraindicados: Json
          corretivos: Json
          created_at: string | null
          id: string
          severidade_min: number | null
        }
        Insert: {
          achado_key: string
          achado_label: string
          ativacao_alvo?: string[] | null
          ativo?: boolean | null
          contraindicados?: Json
          corretivos?: Json
          created_at?: string | null
          id?: string
          severidade_min?: number | null
        }
        Update: {
          achado_key?: string
          achado_label?: string
          ativacao_alvo?: string[] | null
          ativo?: boolean | null
          contraindicados?: Json
          corretivos?: Json
          created_at?: string | null
          id?: string
          severidade_min?: number | null
        }
        Relationships: []
      }
      apex_training_sync: {
        Row: {
          apex_analysis_id: string | null
          athlete_id: string
          bf_estimated: number | null
          bf_target: number | null
          category: string | null
          coach_id: string
          corrective_protocol: string | null
          created_at: string | null
          id: string
          postural_corrections: string | null
          postural_deviations: string | null
          priorities: Json | null
          sync_status: string | null
          updated_at: string | null
          weak_points: Json | null
        }
        Insert: {
          apex_analysis_id?: string | null
          athlete_id: string
          bf_estimated?: number | null
          bf_target?: number | null
          category?: string | null
          coach_id: string
          corrective_protocol?: string | null
          created_at?: string | null
          id?: string
          postural_corrections?: string | null
          postural_deviations?: string | null
          priorities?: Json | null
          sync_status?: string | null
          updated_at?: string | null
          weak_points?: Json | null
        }
        Update: {
          apex_analysis_id?: string | null
          athlete_id?: string
          bf_estimated?: number | null
          bf_target?: number | null
          category?: string | null
          coach_id?: string
          corrective_protocol?: string | null
          created_at?: string | null
          id?: string
          postural_corrections?: string | null
          postural_deviations?: string | null
          priorities?: Json | null
          sync_status?: string | null
          updated_at?: string | null
          weak_points?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "apex_training_sync_apex_analysis_id_fkey"
            columns: ["apex_analysis_id"]
            isOneToOne: false
            referencedRelation: "apex_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      apex_vera_bridge: {
        Row: {
          atleta_id: string
          coach_user_id: string | null
          created_at: string
          id: string
          package: Json
          resultado: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          atleta_id: string
          coach_user_id?: string | null
          created_at?: string
          id?: string
          package: Json
          resultado?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          atleta_id?: string
          coach_user_id?: string | null
          created_at?: string
          id?: string
          package?: Json
          resultado?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      athlete_exams: {
        Row: {
          acido_urico: number | null
          acoes_prioritarias: Json | null
          alertas: string[] | null
          alt_tgp: number | null
          analise_ia: string | null
          ast_tgo: number | null
          b12: number | null
          bilirrubina_direta: number | null
          bilirrubina_indireta: number | null
          bilirrubina_total: number | null
          calcio: number | null
          ciclo_atual: string | null
          colesterol_total: number | null
          cortisol_matinal: number | null
          created_at: string | null
          creatinina: number | null
          data_coleta: string
          dhea_s: number | null
          estradiol: number | null
          fase: string | null
          ferritina: number | null
          ferro_serico: number | null
          fosfatase_alcalina: number | null
          fosforo: number | null
          fsh: number | null
          ggt: number | null
          gh: number | null
          glicemia_jejum: number | null
          hba1c: number | null
          hdl: number | null
          hematocrito: number | null
          hemoglobina: number | null
          homa_ir: number | null
          homocisteina: number | null
          id: string
          igf1: number | null
          insulina_jejum: number | null
          ldl: number | null
          leucocitos: number | null
          lh: number | null
          magnesio: number | null
          medicacoes_atuais: string[] | null
          microalbuminuria: number | null
          notas_medico: string | null
          pa_diastolica: number | null
          pa_sistolica: number | null
          pcr_ultrassensivel: number | null
          plaquetas: number | null
          progesterona: number | null
          prolactina: number | null
          proximos_exames: Json | null
          psa: number | null
          revisado_medico: boolean | null
          semaforo_geral: string | null
          semana_ciclo: number | null
          shbg: number | null
          suplementacao_ajust: Json | null
          t3_livre: number | null
          t4_livre: number | null
          tendencias: Json | null
          testosterona_livre: number | null
          testosterona_total: number | null
          tfg_estimado: number | null
          triglicerideos: number | null
          tsh: number | null
          ureia: number | null
          user_id: string
          variacao_baseline: Json | null
          vhs: number | null
          vitamina_d: number | null
          zinco: number | null
        }
        Insert: {
          acido_urico?: number | null
          acoes_prioritarias?: Json | null
          alertas?: string[] | null
          alt_tgp?: number | null
          analise_ia?: string | null
          ast_tgo?: number | null
          b12?: number | null
          bilirrubina_direta?: number | null
          bilirrubina_indireta?: number | null
          bilirrubina_total?: number | null
          calcio?: number | null
          ciclo_atual?: string | null
          colesterol_total?: number | null
          cortisol_matinal?: number | null
          created_at?: string | null
          creatinina?: number | null
          data_coleta: string
          dhea_s?: number | null
          estradiol?: number | null
          fase?: string | null
          ferritina?: number | null
          ferro_serico?: number | null
          fosfatase_alcalina?: number | null
          fosforo?: number | null
          fsh?: number | null
          ggt?: number | null
          gh?: number | null
          glicemia_jejum?: number | null
          hba1c?: number | null
          hdl?: number | null
          hematocrito?: number | null
          hemoglobina?: number | null
          homa_ir?: number | null
          homocisteina?: number | null
          id?: string
          igf1?: number | null
          insulina_jejum?: number | null
          ldl?: number | null
          leucocitos?: number | null
          lh?: number | null
          magnesio?: number | null
          medicacoes_atuais?: string[] | null
          microalbuminuria?: number | null
          notas_medico?: string | null
          pa_diastolica?: number | null
          pa_sistolica?: number | null
          pcr_ultrassensivel?: number | null
          plaquetas?: number | null
          progesterona?: number | null
          prolactina?: number | null
          proximos_exames?: Json | null
          psa?: number | null
          revisado_medico?: boolean | null
          semaforo_geral?: string | null
          semana_ciclo?: number | null
          shbg?: number | null
          suplementacao_ajust?: Json | null
          t3_livre?: number | null
          t4_livre?: number | null
          tendencias?: Json | null
          testosterona_livre?: number | null
          testosterona_total?: number | null
          tfg_estimado?: number | null
          triglicerideos?: number | null
          tsh?: number | null
          ureia?: number | null
          user_id: string
          variacao_baseline?: Json | null
          vhs?: number | null
          vitamina_d?: number | null
          zinco?: number | null
        }
        Update: {
          acido_urico?: number | null
          acoes_prioritarias?: Json | null
          alertas?: string[] | null
          alt_tgp?: number | null
          analise_ia?: string | null
          ast_tgo?: number | null
          b12?: number | null
          bilirrubina_direta?: number | null
          bilirrubina_indireta?: number | null
          bilirrubina_total?: number | null
          calcio?: number | null
          ciclo_atual?: string | null
          colesterol_total?: number | null
          cortisol_matinal?: number | null
          created_at?: string | null
          creatinina?: number | null
          data_coleta?: string
          dhea_s?: number | null
          estradiol?: number | null
          fase?: string | null
          ferritina?: number | null
          ferro_serico?: number | null
          fosfatase_alcalina?: number | null
          fosforo?: number | null
          fsh?: number | null
          ggt?: number | null
          gh?: number | null
          glicemia_jejum?: number | null
          hba1c?: number | null
          hdl?: number | null
          hematocrito?: number | null
          hemoglobina?: number | null
          homa_ir?: number | null
          homocisteina?: number | null
          id?: string
          igf1?: number | null
          insulina_jejum?: number | null
          ldl?: number | null
          leucocitos?: number | null
          lh?: number | null
          magnesio?: number | null
          medicacoes_atuais?: string[] | null
          microalbuminuria?: number | null
          notas_medico?: string | null
          pa_diastolica?: number | null
          pa_sistolica?: number | null
          pcr_ultrassensivel?: number | null
          plaquetas?: number | null
          progesterona?: number | null
          prolactina?: number | null
          proximos_exames?: Json | null
          psa?: number | null
          revisado_medico?: boolean | null
          semaforo_geral?: string | null
          semana_ciclo?: number | null
          shbg?: number | null
          suplementacao_ajust?: Json | null
          t3_livre?: number | null
          t4_livre?: number | null
          tendencias?: Json | null
          testosterona_livre?: number | null
          testosterona_total?: number | null
          tfg_estimado?: number | null
          triglicerideos?: number | null
          tsh?: number | null
          ureia?: number | null
          user_id?: string
          variacao_baseline?: Json | null
          vhs?: number | null
          vitamina_d?: number | null
          zinco?: number | null
        }
        Relationships: []
      }
      athlete_milestones: {
        Row: {
          athlete_id: string
          created_at: string | null
          data_marco: string | null
          descricao: string | null
          id: string
          semana_numero: number | null
          tipo: string
          titulo: string
          valor_numerico: number | null
        }
        Insert: {
          athlete_id: string
          created_at?: string | null
          data_marco?: string | null
          descricao?: string | null
          id?: string
          semana_numero?: number | null
          tipo: string
          titulo: string
          valor_numerico?: number | null
        }
        Update: {
          athlete_id?: string
          created_at?: string | null
          data_marco?: string | null
          descricao?: string | null
          id?: string
          semana_numero?: number | null
          tipo?: string
          titulo?: string
          valor_numerico?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "athlete_milestones_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athlete_progress_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_milestones_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "competition_athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_visual_assessments: {
        Row: {
          ajustes_plano: string | null
          alertas: Json | null
          analise_ia: Json | null
          athlete_id: string
          bf_estimado: number | null
          coach_id: string
          created_at: string | null
          data_avaliacao: string
          fase: string
          foto_frontal_url: string | null
          foto_lateral_url: string | null
          foto_posterior_url: string | null
          foto_url: string | null
          id: string
          massa_magra_kg: number | null
          meta_proxima_semana: string | null
          observacoes_coach: string | null
          peso_kg: number | null
          progresso_status: string | null
          score_abdomen: number | null
          score_bracos: number | null
          score_cintura: number | null
          score_condicionamento: number | null
          score_costas_espessura: number | null
          score_costas_largura: number | null
          score_geral: number | null
          score_ombros: number | null
          score_peito: number | null
          score_pernas: number | null
          score_proporcoes: number | null
          score_simetria: number | null
          semana_numero: number
          semanas_ate_palco: number | null
        }
        Insert: {
          ajustes_plano?: string | null
          alertas?: Json | null
          analise_ia?: Json | null
          athlete_id: string
          bf_estimado?: number | null
          coach_id: string
          created_at?: string | null
          data_avaliacao?: string
          fase: string
          foto_frontal_url?: string | null
          foto_lateral_url?: string | null
          foto_posterior_url?: string | null
          foto_url?: string | null
          id?: string
          massa_magra_kg?: number | null
          meta_proxima_semana?: string | null
          observacoes_coach?: string | null
          peso_kg?: number | null
          progresso_status?: string | null
          score_abdomen?: number | null
          score_bracos?: number | null
          score_cintura?: number | null
          score_condicionamento?: number | null
          score_costas_espessura?: number | null
          score_costas_largura?: number | null
          score_geral?: number | null
          score_ombros?: number | null
          score_peito?: number | null
          score_pernas?: number | null
          score_proporcoes?: number | null
          score_simetria?: number | null
          semana_numero: number
          semanas_ate_palco?: number | null
        }
        Update: {
          ajustes_plano?: string | null
          alertas?: Json | null
          analise_ia?: Json | null
          athlete_id?: string
          bf_estimado?: number | null
          coach_id?: string
          created_at?: string | null
          data_avaliacao?: string
          fase?: string
          foto_frontal_url?: string | null
          foto_lateral_url?: string | null
          foto_posterior_url?: string | null
          foto_url?: string | null
          id?: string
          massa_magra_kg?: number | null
          meta_proxima_semana?: string | null
          observacoes_coach?: string | null
          peso_kg?: number | null
          progresso_status?: string | null
          score_abdomen?: number | null
          score_bracos?: number | null
          score_cintura?: number | null
          score_condicionamento?: number | null
          score_costas_espessura?: number | null
          score_costas_largura?: number | null
          score_geral?: number | null
          score_ombros?: number | null
          score_peito?: number | null
          score_pernas?: number | null
          score_proporcoes?: number | null
          score_simetria?: number | null
          semana_numero?: number
          semanas_ate_palco?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "athlete_visual_assessments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athlete_progress_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_visual_assessments_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "competition_athletes"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_weekly_reports: {
        Row: {
          ajustes_nutricao: string | null
          ajustes_treino: string | null
          assessment_id: string | null
          athlete_id: string
          coach_id: string
          created_at: string | null
          data_envio: string | null
          enviado_email: boolean | null
          enviado_whatsapp: boolean | null
          id: string
          mensagem_motivacional: string | null
          meta_proxima_semana: string | null
          pontos_atencao: Json | null
          pontos_positivos: Json | null
          resumo_executivo: string | null
          semana_numero: number
          titulo: string | null
          variacao_bf: number | null
          variacao_peso: number | null
          variacao_score: number | null
          visualizado: boolean | null
        }
        Insert: {
          ajustes_nutricao?: string | null
          ajustes_treino?: string | null
          assessment_id?: string | null
          athlete_id: string
          coach_id: string
          created_at?: string | null
          data_envio?: string | null
          enviado_email?: boolean | null
          enviado_whatsapp?: boolean | null
          id?: string
          mensagem_motivacional?: string | null
          meta_proxima_semana?: string | null
          pontos_atencao?: Json | null
          pontos_positivos?: Json | null
          resumo_executivo?: string | null
          semana_numero: number
          titulo?: string | null
          variacao_bf?: number | null
          variacao_peso?: number | null
          variacao_score?: number | null
          visualizado?: boolean | null
        }
        Update: {
          ajustes_nutricao?: string | null
          ajustes_treino?: string | null
          assessment_id?: string | null
          athlete_id?: string
          coach_id?: string
          created_at?: string | null
          data_envio?: string | null
          enviado_email?: boolean | null
          enviado_whatsapp?: boolean | null
          id?: string
          mensagem_motivacional?: string | null
          meta_proxima_semana?: string | null
          pontos_atencao?: Json | null
          pontos_positivos?: Json | null
          resumo_executivo?: string | null
          semana_numero?: number
          titulo?: string | null
          variacao_bf?: number | null
          variacao_peso?: number | null
          variacao_score?: number | null
          visualizado?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "athlete_weekly_reports_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "athlete_visual_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_weekly_reports_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "athlete_progress_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "athlete_weekly_reports_athlete_id_fkey"
            columns: ["athlete_id"]
            isOneToOne: false
            referencedRelation: "competition_athletes"
            referencedColumns: ["id"]
          },
        ]
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
      behavioral_diary: {
        Row: {
          alimento_consumido: string | null
          alternativa_usada: string | null
          arrependimento: boolean | null
          atividade: string | null
          com_quem: string | null
          created_at: string | null
          decisao_tomada: string | null
          emocao_intensidade: number | null
          emocao_primaria: string | null
          estado_antes: string | null
          estado_depois: string | null
          fome_antes: number | null
          fome_real: boolean | null
          gatilho_id: string | null
          horario_tipo: string | null
          id: string
          intervencao_eficaz: boolean | null
          intervencao_usada: string | null
          local: string | null
          loop_identificado: string | null
          o_que_aconteceu: string | null
          o_que_aprendi: string | null
          proxima_vez: string | null
          saciedade_depois: number | null
          satisfacao: number | null
          user_id: string
        }
        Insert: {
          alimento_consumido?: string | null
          alternativa_usada?: string | null
          arrependimento?: boolean | null
          atividade?: string | null
          com_quem?: string | null
          created_at?: string | null
          decisao_tomada?: string | null
          emocao_intensidade?: number | null
          emocao_primaria?: string | null
          estado_antes?: string | null
          estado_depois?: string | null
          fome_antes?: number | null
          fome_real?: boolean | null
          gatilho_id?: string | null
          horario_tipo?: string | null
          id?: string
          intervencao_eficaz?: boolean | null
          intervencao_usada?: string | null
          local?: string | null
          loop_identificado?: string | null
          o_que_aconteceu?: string | null
          o_que_aprendi?: string | null
          proxima_vez?: string | null
          saciedade_depois?: number | null
          satisfacao?: number | null
          user_id: string
        }
        Update: {
          alimento_consumido?: string | null
          alternativa_usada?: string | null
          arrependimento?: boolean | null
          atividade?: string | null
          com_quem?: string | null
          created_at?: string | null
          decisao_tomada?: string | null
          emocao_intensidade?: number | null
          emocao_primaria?: string | null
          estado_antes?: string | null
          estado_depois?: string | null
          fome_antes?: number | null
          fome_real?: boolean | null
          gatilho_id?: string | null
          horario_tipo?: string | null
          id?: string
          intervencao_eficaz?: boolean | null
          intervencao_usada?: string | null
          local?: string | null
          loop_identificado?: string | null
          o_que_aconteceu?: string | null
          o_que_aprendi?: string | null
          proxima_vez?: string | null
          saciedade_depois?: number | null
          satisfacao?: number | null
          user_id?: string
        }
        Relationships: []
      }
      behavioral_loops: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          eficacia: number | null
          gatilho: string | null
          id: string
          recompensa: string | null
          rotina_antiga: string | null
          rotina_nova: string | null
          tipo: string | null
          user_id: string
          vezes_ativado: number | null
          vezes_sucesso: number | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          eficacia?: number | null
          gatilho?: string | null
          id?: string
          recompensa?: string | null
          rotina_antiga?: string | null
          rotina_nova?: string | null
          tipo?: string | null
          user_id: string
          vezes_ativado?: number | null
          vezes_sucesso?: number | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          eficacia?: number | null
          gatilho?: string | null
          id?: string
          recompensa?: string | null
          rotina_antiga?: string | null
          rotina_nova?: string | null
          tipo?: string | null
          user_id?: string
          vezes_ativado?: number | null
          vezes_sucesso?: number | null
        }
        Relationships: []
      }
      behavioral_predictions: {
        Row: {
          acertou: boolean | null
          created_at: string | null
          data_predicao: string | null
          id: string
          intervencao_sugerida: string | null
          resultado_real: string | null
          score_risco: number | null
          sinais_detectados: string[] | null
          tipo: string | null
          user_id: string
        }
        Insert: {
          acertou?: boolean | null
          created_at?: string | null
          data_predicao?: string | null
          id?: string
          intervencao_sugerida?: string | null
          resultado_real?: string | null
          score_risco?: number | null
          sinais_detectados?: string[] | null
          tipo?: string | null
          user_id: string
        }
        Update: {
          acertou?: boolean | null
          created_at?: string | null
          data_predicao?: string | null
          id?: string
          intervencao_sugerida?: string | null
          resultado_real?: string | null
          score_risco?: number | null
          sinais_detectados?: string[] | null
          tipo?: string | null
          user_id?: string
        }
        Relationships: []
      }
      behavioral_profiles: {
        Row: {
          alertas_ativos: string[] | null
          created_at: string | null
          crencas_limitantes: string[] | null
          decisoes_antecipadas: Json | null
          declaracao_identidade: string | null
          dias_criticos: string[] | null
          environment_design: Json | null
          episodios_emocionais: number | null
          episodios_retorno: number | null
          estagio_mudanca: string | null
          estagio_score: number | null
          gatilhos_mapeados: Json | null
          historico_sabotagem: Json | null
          horarios_criticos: string[] | null
          id: string
          identidade_score: number | null
          implementation_intents: Json | null
          intervencoes_coach: Json | null
          loops_negativos: Json | null
          loops_positivos: Json | null
          mindset_score: number | null
          mindset_tipo: string | null
          notas_coach: string | null
          padrao_recaida: string | null
          perfil_mce: string | null
          perfil_primario: string | null
          perfil_secundario: string | null
          ponto_sabotagem_percent: number | null
          previsao_abandono: string | null
          risco_abandono: number | null
          rotinas_substitutas: Json | null
          situacoes_risco: string[] | null
          streak_atual: number | null
          streak_maximo: number | null
          taxa_aderencia_7dias: number | null
          taxa_aderencia_geral: number | null
          ultima_recaida: string | null
          updated_at: string | null
          user_id: string
          velocidade_retorno_media: number | null
          votos_identidade: number | null
        }
        Insert: {
          alertas_ativos?: string[] | null
          created_at?: string | null
          crencas_limitantes?: string[] | null
          decisoes_antecipadas?: Json | null
          declaracao_identidade?: string | null
          dias_criticos?: string[] | null
          environment_design?: Json | null
          episodios_emocionais?: number | null
          episodios_retorno?: number | null
          estagio_mudanca?: string | null
          estagio_score?: number | null
          gatilhos_mapeados?: Json | null
          historico_sabotagem?: Json | null
          horarios_criticos?: string[] | null
          id?: string
          identidade_score?: number | null
          implementation_intents?: Json | null
          intervencoes_coach?: Json | null
          loops_negativos?: Json | null
          loops_positivos?: Json | null
          mindset_score?: number | null
          mindset_tipo?: string | null
          notas_coach?: string | null
          padrao_recaida?: string | null
          perfil_mce?: string | null
          perfil_primario?: string | null
          perfil_secundario?: string | null
          ponto_sabotagem_percent?: number | null
          previsao_abandono?: string | null
          risco_abandono?: number | null
          rotinas_substitutas?: Json | null
          situacoes_risco?: string[] | null
          streak_atual?: number | null
          streak_maximo?: number | null
          taxa_aderencia_7dias?: number | null
          taxa_aderencia_geral?: number | null
          ultima_recaida?: string | null
          updated_at?: string | null
          user_id: string
          velocidade_retorno_media?: number | null
          votos_identidade?: number | null
        }
        Update: {
          alertas_ativos?: string[] | null
          created_at?: string | null
          crencas_limitantes?: string[] | null
          decisoes_antecipadas?: Json | null
          declaracao_identidade?: string | null
          dias_criticos?: string[] | null
          environment_design?: Json | null
          episodios_emocionais?: number | null
          episodios_retorno?: number | null
          estagio_mudanca?: string | null
          estagio_score?: number | null
          gatilhos_mapeados?: Json | null
          historico_sabotagem?: Json | null
          horarios_criticos?: string[] | null
          id?: string
          identidade_score?: number | null
          implementation_intents?: Json | null
          intervencoes_coach?: Json | null
          loops_negativos?: Json | null
          loops_positivos?: Json | null
          mindset_score?: number | null
          mindset_tipo?: string | null
          notas_coach?: string | null
          padrao_recaida?: string | null
          perfil_mce?: string | null
          perfil_primario?: string | null
          perfil_secundario?: string | null
          ponto_sabotagem_percent?: number | null
          previsao_abandono?: string | null
          risco_abandono?: number | null
          rotinas_substitutas?: Json | null
          situacoes_risco?: string[] | null
          streak_atual?: number | null
          streak_maximo?: number | null
          taxa_aderencia_7dias?: number | null
          taxa_aderencia_geral?: number | null
          ultima_recaida?: string | null
          updated_at?: string | null
          user_id?: string
          velocidade_retorno_media?: number | null
          votos_identidade?: number | null
        }
        Relationships: []
      }
      biological_age_scores: {
        Row: {
          age_delta: number | null
          biological_age: number
          calculated_at: string
          chronological_age: number
          created_at: string | null
          id: string
          improvement_tips: string[] | null
          score_breakdown: Json | null
          user_id: string
        }
        Insert: {
          age_delta?: number | null
          biological_age: number
          calculated_at?: string
          chronological_age: number
          created_at?: string | null
          id?: string
          improvement_tips?: string[] | null
          score_breakdown?: Json | null
          user_id: string
        }
        Update: {
          age_delta?: number | null
          biological_age?: number
          calculated_at?: string
          chronological_age?: number
          created_at?: string | null
          id?: string
          improvement_tips?: string[] | null
          score_breakdown?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      biomechanics_exercises: {
        Row: {
          anatomy_text: string | null
          biomechanics_text: string | null
          created_at: string | null
          execution_text: string | null
          exercise_name: string
          id: string
          joint_actions: string[] | null
          movement_pattern: string | null
          muscle_group: string
          muscles_primary: string[] | null
          muscles_secondary: string[] | null
          muscles_stabilizer: string[] | null
          perplexity_citations: Json | null
          plane_of_motion: string | null
          recruitment_text: string | null
          science_text: string | null
          user_id: string
          youtube_url: string | null
        }
        Insert: {
          anatomy_text?: string | null
          biomechanics_text?: string | null
          created_at?: string | null
          execution_text?: string | null
          exercise_name: string
          id?: string
          joint_actions?: string[] | null
          movement_pattern?: string | null
          muscle_group: string
          muscles_primary?: string[] | null
          muscles_secondary?: string[] | null
          muscles_stabilizer?: string[] | null
          perplexity_citations?: Json | null
          plane_of_motion?: string | null
          recruitment_text?: string | null
          science_text?: string | null
          user_id: string
          youtube_url?: string | null
        }
        Update: {
          anatomy_text?: string | null
          biomechanics_text?: string | null
          created_at?: string | null
          execution_text?: string | null
          exercise_name?: string
          id?: string
          joint_actions?: string[] | null
          movement_pattern?: string | null
          muscle_group?: string
          muscles_primary?: string[] | null
          muscles_secondary?: string[] | null
          muscles_stabilizer?: string[] | null
          perplexity_citations?: Json | null
          plane_of_motion?: string | null
          recruitment_text?: string | null
          science_text?: string | null
          user_id?: string
          youtube_url?: string | null
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
      business_tasks: {
        Row: {
          coach_user_id: string
          completed: boolean
          created_at: string
          description: string
          due_date: string | null
          gym_id: string | null
          id: string
        }
        Insert: {
          coach_user_id: string
          completed?: boolean
          created_at?: string
          description: string
          due_date?: string | null
          gym_id?: string | null
          id?: string
        }
        Update: {
          coach_user_id?: string
          completed?: boolean
          created_at?: string
          description?: string
          due_date?: string | null
          gym_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_tasks_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "partner_gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      cardio_sessions: {
        Row: {
          calorias: number | null
          created_at: string | null
          data: string
          duracao: number | null
          horario: string | null
          id: string
          observacoes: string | null
          tipo: string | null
          user_id: string
          zona: string | null
        }
        Insert: {
          calorias?: number | null
          created_at?: string | null
          data: string
          duracao?: number | null
          horario?: string | null
          id?: string
          observacoes?: string | null
          tipo?: string | null
          user_id: string
          zona?: string | null
        }
        Update: {
          calorias?: number | null
          created_at?: string | null
          data?: string
          duracao?: number | null
          horario?: string | null
          id?: string
          observacoes?: string | null
          tipo?: string | null
          user_id?: string
          zona?: string | null
        }
        Relationships: []
      }
      challenge_daily_logs: {
        Row: {
          challenge_id: string
          checkin_at: string | null
          created_at: string
          day_completed: boolean
          id: string
          log_date: string
          meals_done: number[]
          mood: string | null
          points: number
          training_done: boolean
          updated_at: string
          user_id: string
          water_ml: number
        }
        Insert: {
          challenge_id: string
          checkin_at?: string | null
          created_at?: string
          day_completed?: boolean
          id?: string
          log_date?: string
          meals_done?: number[]
          mood?: string | null
          points?: number
          training_done?: boolean
          updated_at?: string
          user_id: string
          water_ml?: number
        }
        Update: {
          challenge_id?: string
          checkin_at?: string | null
          created_at?: string
          day_completed?: boolean
          id?: string
          log_date?: string
          meals_done?: number[]
          mood?: string | null
          points?: number
          training_done?: boolean
          updated_at?: string
          user_id?: string
          water_ml?: number
        }
        Relationships: [
          {
            foreignKeyName: "challenge_daily_logs_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "gym_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_participants: {
        Row: {
          carbs_g: number
          challenge_id: string
          created_at: string
          email: string | null
          fat_g: number
          full_name: string
          gym_id: string | null
          id: string
          joined_at: string
          last_checkin_at: string | null
          mce_score: number
          meals_per_day: number
          migrated_to_client: boolean
          objetivo: string
          porte: string
          protein_g: number
          status: string
          streak: number
          target_kcal: number
          tier: string
          updated_at: string
          user_id: string
          weight_current: number | null
          weight_start: number | null
          whatsapp: string | null
        }
        Insert: {
          carbs_g?: number
          challenge_id: string
          created_at?: string
          email?: string | null
          fat_g?: number
          full_name?: string
          gym_id?: string | null
          id?: string
          joined_at?: string
          last_checkin_at?: string | null
          mce_score?: number
          meals_per_day?: number
          migrated_to_client?: boolean
          objetivo?: string
          porte?: string
          protein_g?: number
          status?: string
          streak?: number
          target_kcal?: number
          tier?: string
          updated_at?: string
          user_id: string
          weight_current?: number | null
          weight_start?: number | null
          whatsapp?: string | null
        }
        Update: {
          carbs_g?: number
          challenge_id?: string
          created_at?: string
          email?: string | null
          fat_g?: number
          full_name?: string
          gym_id?: string | null
          id?: string
          joined_at?: string
          last_checkin_at?: string | null
          mce_score?: number
          meals_per_day?: number
          migrated_to_client?: boolean
          objetivo?: string
          porte?: string
          protein_g?: number
          status?: string
          streak?: number
          target_kcal?: number
          tier?: string
          updated_at?: string
          user_id?: string
          weight_current?: number | null
          weight_start?: number | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "gym_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_participants_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "partner_gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_reminder_logs: {
        Row: {
          auto: boolean
          challenge_id: string
          created_at: string
          id: string
          kind: string
          level: number
          log_date: string
          message: string | null
          participant_id: string
          sent_at: string
          sent_by: string | null
        }
        Insert: {
          auto?: boolean
          challenge_id: string
          created_at?: string
          id?: string
          kind?: string
          level?: number
          log_date?: string
          message?: string | null
          participant_id: string
          sent_at?: string
          sent_by?: string | null
        }
        Update: {
          auto?: boolean
          challenge_id?: string
          created_at?: string
          id?: string
          kind?: string
          level?: number
          log_date?: string
          message?: string | null
          participant_id?: string
          sent_at?: string
          sent_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_reminder_logs_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "gym_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_reminder_logs_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "challenge_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_signups: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          gym_id: string | null
          gym_slug: string | null
          id: string
          paid: boolean
          paid_at: string | null
          plano: string | null
          source: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          gym_id?: string | null
          gym_slug?: string | null
          id?: string
          paid?: boolean
          paid_at?: string | null
          plano?: string | null
          source?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          gym_id?: string | null
          gym_slug?: string | null
          id?: string
          paid?: boolean
          paid_at?: string | null
          plano?: string | null
          source?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_signups_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "partner_gyms"
            referencedColumns: ["id"]
          },
        ]
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
      client_audio_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          episode_id: string
          id: string
          listen_count: number
          progress_seconds: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          episode_id: string
          id?: string
          listen_count?: number
          progress_seconds?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          episode_id?: string
          id?: string
          listen_count?: number
          progress_seconds?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_audio_progress_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "mce_audio_episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      client_credentials: {
        Row: {
          client_id: string
          created_at: string
          email: string
          id: string
          password_changed: boolean
          temp_password: string
          updated_at: string
          welcome_sent: boolean
          welcome_sent_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string
          email: string
          id?: string
          password_changed?: boolean
          temp_password: string
          updated_at?: string
          welcome_sent?: boolean
          welcome_sent_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string
          email?: string
          id?: string
          password_changed?: boolean
          temp_password?: string
          updated_at?: string
          welcome_sent?: boolean
          welcome_sent_at?: string | null
        }
        Relationships: []
      }
      client_daily_activities: {
        Row: {
          activity_category: string | null
          activity_date: string
          activity_label: string | null
          activity_type: string
          carb_adjustment: number
          climate_band: string | null
          created_at: string
          duration_min: number
          epoc_kcal: number | null
          fat_adjustment: number
          gross_kcal: number | null
          hydration_adjustment_ml: number
          id: string
          intensity: string
          kcal_adjustment: number
          met: number | null
          net_adjustment: number | null
          protein_adjustment: number
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_category?: string | null
          activity_date?: string
          activity_label?: string | null
          activity_type: string
          carb_adjustment?: number
          climate_band?: string | null
          created_at?: string
          duration_min?: number
          epoc_kcal?: number | null
          fat_adjustment?: number
          gross_kcal?: number | null
          hydration_adjustment_ml?: number
          id?: string
          intensity?: string
          kcal_adjustment?: number
          met?: number | null
          net_adjustment?: number | null
          protein_adjustment?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_category?: string | null
          activity_date?: string
          activity_label?: string | null
          activity_type?: string
          carb_adjustment?: number
          climate_band?: string | null
          created_at?: string
          duration_min?: number
          epoc_kcal?: number | null
          fat_adjustment?: number
          gross_kcal?: number | null
          hydration_adjustment_ml?: number
          id?: string
          intensity?: string
          kcal_adjustment?: number
          met?: number | null
          net_adjustment?: number | null
          protein_adjustment?: number
          updated_at?: string
          user_id?: string
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
      coach_apex_log: {
        Row: {
          admin_id: string
          atleta_ref: string | null
          created_at: string | null
          id: string
          pergunta: string | null
          resposta: string | null
        }
        Insert: {
          admin_id: string
          atleta_ref?: string | null
          created_at?: string | null
          id?: string
          pergunta?: string | null
          resposta?: string | null
        }
        Update: {
          admin_id?: string
          atleta_ref?: string | null
          created_at?: string | null
          id?: string
          pergunta?: string | null
          resposta?: string | null
        }
        Relationships: []
      }
      coach_apex_sessions: {
        Row: {
          admin_id: string
          atleta_nome: string | null
          created_at: string | null
          id: string
          pergunta: string
          protocolo_salvo: boolean | null
          resposta: string | null
          tema: string | null
        }
        Insert: {
          admin_id: string
          atleta_nome?: string | null
          created_at?: string | null
          id?: string
          pergunta: string
          protocolo_salvo?: boolean | null
          resposta?: string | null
          tema?: string | null
        }
        Update: {
          admin_id?: string
          atleta_nome?: string | null
          created_at?: string | null
          id?: string
          pergunta?: string
          protocolo_salvo?: boolean | null
          resposta?: string | null
          tema?: string | null
        }
        Relationships: []
      }
      coach_atleta_prontuario: {
        Row: {
          admin_id: string
          atleta_nome: string
          created_at: string | null
          id: string
          observacoes: string | null
          protocolos: Json | null
          updated_at: string | null
        }
        Insert: {
          admin_id: string
          atleta_nome: string
          created_at?: string | null
          id?: string
          observacoes?: string | null
          protocolos?: Json | null
          updated_at?: string | null
        }
        Update: {
          admin_id?: string
          atleta_nome?: string
          created_at?: string | null
          id?: string
          observacoes?: string | null
          protocolos?: Json | null
          updated_at?: string | null
        }
        Relationships: []
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
      coach_convites: {
        Row: {
          aluno_id: string | null
          coach_id: string
          created_at: string | null
          expires_at: string
          id: string
          token: string
          usado: boolean | null
        }
        Insert: {
          aluno_id?: string | null
          coach_id: string
          created_at?: string | null
          expires_at?: string
          id?: string
          token: string
          usado?: boolean | null
        }
        Update: {
          aluno_id?: string | null
          coach_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          token?: string
          usado?: boolean | null
        }
        Relationships: []
      }
      coach_exam_protocols: {
        Row: {
          admin_id: string
          atleta_nome: string | null
          created_at: string | null
          exame: string | null
          id: string
          protocolo: Json | null
          valor: string | null
        }
        Insert: {
          admin_id: string
          atleta_nome?: string | null
          created_at?: string | null
          exame?: string | null
          id?: string
          protocolo?: Json | null
          valor?: string | null
        }
        Update: {
          admin_id?: string
          atleta_nome?: string | null
          created_at?: string | null
          exame?: string | null
          id?: string
          protocolo?: Json | null
          valor?: string | null
        }
        Relationships: []
      }
      coach_fix_all_logs: {
        Row: {
          attempt: number | null
          coach_id: string
          created_at: string
          details: Json | null
          id: string
          message: string | null
          ok: boolean
          patient_name: string | null
          patient_user_id: string | null
          run_id: string
          step_index: number
          step_type: string
        }
        Insert: {
          attempt?: number | null
          coach_id: string
          created_at?: string
          details?: Json | null
          id?: string
          message?: string | null
          ok?: boolean
          patient_name?: string | null
          patient_user_id?: string | null
          run_id: string
          step_index: number
          step_type: string
        }
        Update: {
          attempt?: number | null
          coach_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          message?: string | null
          ok?: boolean
          patient_name?: string | null
          patient_user_id?: string | null
          run_id?: string
          step_index?: number
          step_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_fix_all_logs_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coach_meal_plans: {
        Row: {
          coach_id: string
          created_at: string
          id: string
          objetivo: string | null
          observacao: string | null
          patient_name: string
          patient_user_id: string | null
          plano: Json
          sent_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          id?: string
          objetivo?: string | null
          observacao?: string | null
          patient_name: string
          patient_user_id?: string | null
          plano: Json
          sent_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          id?: string
          objetivo?: string | null
          observacao?: string | null
          patient_name?: string
          patient_user_id?: string | null
          plano?: Json
          sent_at?: string | null
          status?: string
          updated_at?: string
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
      coach_notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          message: string | null
          notification_type: string
          read: boolean
          recipient_user_id: string
          reference_id: string | null
          sender_user_id: string
          title: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string | null
          notification_type?: string
          read?: boolean
          recipient_user_id: string
          reference_id?: string | null
          sender_user_id: string
          title: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string | null
          notification_type?: string
          read?: boolean
          recipient_user_id?: string
          reference_id?: string | null
          sender_user_id?: string
          title?: string
        }
        Relationships: []
      }
      coach_patients: {
        Row: {
          coach_id: string
          created_at: string | null
          features_override: Json | null
          id: string
          notes: string | null
          patient_user_id: string
          started_at: string | null
          status: string | null
        }
        Insert: {
          coach_id: string
          created_at?: string | null
          features_override?: Json | null
          id?: string
          notes?: string | null
          patient_user_id: string
          started_at?: string | null
          status?: string | null
        }
        Update: {
          coach_id?: string
          created_at?: string | null
          features_override?: Json | null
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
      coach_plan_adjustments: {
        Row: {
          ajuste_meta: Json | null
          aplicado: boolean | null
          coach_id: string
          created_at: string
          delta_kcal: number | null
          dentro_da_banda: boolean | null
          fator: number | null
          id: string
          objetivo: string | null
          patient_name: string | null
          patient_user_id: string | null
          plano_snapshot: Json | null
          status_msg: string | null
          target_kcal: number | null
          total_antes: number | null
          total_depois: number | null
        }
        Insert: {
          ajuste_meta?: Json | null
          aplicado?: boolean | null
          coach_id: string
          created_at?: string
          delta_kcal?: number | null
          dentro_da_banda?: boolean | null
          fator?: number | null
          id?: string
          objetivo?: string | null
          patient_name?: string | null
          patient_user_id?: string | null
          plano_snapshot?: Json | null
          status_msg?: string | null
          target_kcal?: number | null
          total_antes?: number | null
          total_depois?: number | null
        }
        Update: {
          ajuste_meta?: Json | null
          aplicado?: boolean | null
          coach_id?: string
          created_at?: string
          delta_kcal?: number | null
          dentro_da_banda?: boolean | null
          fator?: number | null
          id?: string
          objetivo?: string | null
          patient_name?: string | null
          patient_user_id?: string | null
          plano_snapshot?: Json | null
          status_msg?: string | null
          target_kcal?: number | null
          total_antes?: number | null
          total_depois?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_plan_adjustments_coach_id_fkey"
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
          alunos_ativos: number | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          clinic_name: string | null
          country: string | null
          created_at: string | null
          crn: string | null
          id: string
          instagram_handle: string | null
          logo_url: string | null
          max_alunos: number | null
          max_patients: number | null
          plan: string | null
          professional_name: string | null
          professional_role: string
          professional_type: string | null
          registration_number: string | null
          show_on_plan: boolean | null
          specialties: string[] | null
          tier: string | null
          trial_ends_at: string | null
          unique_code: string | null
          updated_at: string | null
          user_id: string
          welcome_template: string | null
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
          alunos_ativos?: number | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          clinic_name?: string | null
          country?: string | null
          created_at?: string | null
          crn?: string | null
          id?: string
          instagram_handle?: string | null
          logo_url?: string | null
          max_alunos?: number | null
          max_patients?: number | null
          plan?: string | null
          professional_name?: string | null
          professional_role?: string
          professional_type?: string | null
          registration_number?: string | null
          show_on_plan?: boolean | null
          specialties?: string[] | null
          tier?: string | null
          trial_ends_at?: string | null
          unique_code?: string | null
          updated_at?: string | null
          user_id: string
          welcome_template?: string | null
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
          alunos_ativos?: number | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          clinic_name?: string | null
          country?: string | null
          created_at?: string | null
          crn?: string | null
          id?: string
          instagram_handle?: string | null
          logo_url?: string | null
          max_alunos?: number | null
          max_patients?: number | null
          plan?: string | null
          professional_name?: string | null
          professional_role?: string
          professional_type?: string | null
          registration_number?: string | null
          show_on_plan?: boolean | null
          specialties?: string[] | null
          tier?: string | null
          trial_ends_at?: string | null
          unique_code?: string | null
          updated_at?: string | null
          user_id?: string
          welcome_template?: string | null
          white_label_app_name?: string | null
          white_label_domain?: string | null
          white_label_logo_url?: string | null
          white_label_primary_color?: string | null
          white_label_secondary_color?: string | null
          white_label_splash_url?: string | null
        }
        Relationships: []
      }
      coach_protocol_templates: {
        Row: {
          carbs_per_kg: number
          category: string
          coach_id: string
          created_at: string
          description: string | null
          fat_per_kg: number
          id: string
          name: string
          pharma_notes: string | null
          protein_per_kg: number
          rest_day_carb_mult: number
          tags: string[] | null
          training_day_carb_mult: number
          updated_at: string
          use_carb_cycling: boolean
          use_chronobiology: boolean
          use_glut4_post_workout: boolean
          use_microbiota_protocol: boolean
          used_count: number
        }
        Insert: {
          carbs_per_kg?: number
          category?: string
          coach_id: string
          created_at?: string
          description?: string | null
          fat_per_kg?: number
          id?: string
          name: string
          pharma_notes?: string | null
          protein_per_kg?: number
          rest_day_carb_mult?: number
          tags?: string[] | null
          training_day_carb_mult?: number
          updated_at?: string
          use_carb_cycling?: boolean
          use_chronobiology?: boolean
          use_glut4_post_workout?: boolean
          use_microbiota_protocol?: boolean
          used_count?: number
        }
        Update: {
          carbs_per_kg?: number
          category?: string
          coach_id?: string
          created_at?: string
          description?: string | null
          fat_per_kg?: number
          id?: string
          name?: string
          pharma_notes?: string | null
          protein_per_kg?: number
          rest_day_carb_mult?: number
          tags?: string[] | null
          training_day_carb_mult?: number
          updated_at?: string
          use_carb_cycling?: boolean
          use_chronobiology?: boolean
          use_glut4_post_workout?: boolean
          use_microbiota_protocol?: boolean
          used_count?: number
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
      commissions: {
        Row: {
          amount: number | null
          client_name: string | null
          created_at: string | null
          id: string
          partner_id: string | null
          plan_purchased: string | null
        }
        Insert: {
          amount?: number | null
          client_name?: string | null
          created_at?: string | null
          id?: string
          partner_id?: string | null
          plan_purchased?: string | null
        }
        Update: {
          amount?: number | null
          client_name?: string | null
          created_at?: string | null
          id?: string
          partner_id?: string | null
          plan_purchased?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commissions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
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
      competition_athletes: {
        Row: {
          altura_cm: number | null
          ativo: boolean | null
          bf_atual: number | null
          bf_meta_palco: number | null
          categoria: string | null
          coach_id: string
          created_at: string | null
          data_competicao: string | null
          data_nascimento: string | null
          fase_atual: string | null
          federacao: string | null
          historico_lesoes: string | null
          id: string
          massa_magra_kg: number | null
          nivel: string | null
          nome: string
          nome_competicao: string | null
          patient_user_id: string | null
          peso_kg: number | null
          peso_palco_meta: number | null
          pontos_fracos_conhecidos: string | null
          protocolo_farmacologico: string | null
          sexo: string | null
          updated_at: string | null
        }
        Insert: {
          altura_cm?: number | null
          ativo?: boolean | null
          bf_atual?: number | null
          bf_meta_palco?: number | null
          categoria?: string | null
          coach_id: string
          created_at?: string | null
          data_competicao?: string | null
          data_nascimento?: string | null
          fase_atual?: string | null
          federacao?: string | null
          historico_lesoes?: string | null
          id?: string
          massa_magra_kg?: number | null
          nivel?: string | null
          nome: string
          nome_competicao?: string | null
          patient_user_id?: string | null
          peso_kg?: number | null
          peso_palco_meta?: number | null
          pontos_fracos_conhecidos?: string | null
          protocolo_farmacologico?: string | null
          sexo?: string | null
          updated_at?: string | null
        }
        Update: {
          altura_cm?: number | null
          ativo?: boolean | null
          bf_atual?: number | null
          bf_meta_palco?: number | null
          categoria?: string | null
          coach_id?: string
          created_at?: string | null
          data_competicao?: string | null
          data_nascimento?: string | null
          fase_atual?: string | null
          federacao?: string | null
          historico_lesoes?: string | null
          id?: string
          massa_magra_kg?: number | null
          nivel?: string | null
          nome?: string
          nome_competicao?: string | null
          patient_user_id?: string | null
          peso_kg?: number | null
          peso_palco_meta?: number | null
          pontos_fracos_conhecidos?: string | null
          protocolo_farmacologico?: string | null
          sexo?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      competition_daily_logs: {
        Row: {
          calorias_consumidas: number | null
          carbo_consumido: number | null
          cardio_duracao_min: number | null
          cardio_tipo: string | null
          competition_plan_id: string
          compostos_aplicados: Json | null
          created_at: string
          data: string
          duracao_posing_min: number | null
          exercicios_log: Json | null
          gordura_consumida: number | null
          hidratacao_ml: number | null
          id: string
          observacoes: string | null
          posing_realizado: boolean | null
          proteina_consumida: number | null
          recovery_score_pre: number | null
          score_dia: number | null
          semana: number
          treino_realizado: boolean | null
          volume_total_kg: number | null
        }
        Insert: {
          calorias_consumidas?: number | null
          carbo_consumido?: number | null
          cardio_duracao_min?: number | null
          cardio_tipo?: string | null
          competition_plan_id: string
          compostos_aplicados?: Json | null
          created_at?: string
          data: string
          duracao_posing_min?: number | null
          exercicios_log?: Json | null
          gordura_consumida?: number | null
          hidratacao_ml?: number | null
          id?: string
          observacoes?: string | null
          posing_realizado?: boolean | null
          proteina_consumida?: number | null
          recovery_score_pre?: number | null
          score_dia?: number | null
          semana: number
          treino_realizado?: boolean | null
          volume_total_kg?: number | null
        }
        Update: {
          calorias_consumidas?: number | null
          carbo_consumido?: number | null
          cardio_duracao_min?: number | null
          cardio_tipo?: string | null
          competition_plan_id?: string
          compostos_aplicados?: Json | null
          created_at?: string
          data?: string
          duracao_posing_min?: number | null
          exercicios_log?: Json | null
          gordura_consumida?: number | null
          hidratacao_ml?: number | null
          id?: string
          observacoes?: string | null
          posing_realizado?: boolean | null
          proteina_consumida?: number | null
          recovery_score_pre?: number | null
          score_dia?: number | null
          semana?: number
          treino_realizado?: boolean | null
          volume_total_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "competition_daily_logs_competition_plan_id_fkey"
            columns: ["competition_plan_id"]
            isOneToOne: false
            referencedRelation: "competition_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      competition_plans: {
        Row: {
          altura: number
          athlete_id: string
          bf_atual: number | null
          bloco_atual: string | null
          blocos: Json
          calculo_meta: Json | null
          categoria: string
          coach_id: string
          created_at: string
          data_competicao: string
          federacao: string
          id: string
          local_competicao: string | null
          massa_magra: number | null
          nome_competicao: string
          peso_alvo_palco: number
          peso_atual: number
          peso_limite_categoria: number | null
          protocolo_farmacologico: string | null
          semana_atual: number
          status: string
          updated_at: string
        }
        Insert: {
          altura: number
          athlete_id: string
          bf_atual?: number | null
          bloco_atual?: string | null
          blocos?: Json
          calculo_meta?: Json | null
          categoria: string
          coach_id: string
          created_at?: string
          data_competicao: string
          federacao: string
          id?: string
          local_competicao?: string | null
          massa_magra?: number | null
          nome_competicao: string
          peso_alvo_palco: number
          peso_atual: number
          peso_limite_categoria?: number | null
          protocolo_farmacologico?: string | null
          semana_atual?: number
          status?: string
          updated_at?: string
        }
        Update: {
          altura?: number
          athlete_id?: string
          bf_atual?: number | null
          bloco_atual?: string | null
          blocos?: Json
          calculo_meta?: Json | null
          categoria?: string
          coach_id?: string
          created_at?: string
          data_competicao?: string
          federacao?: string
          id?: string
          local_competicao?: string | null
          massa_magra?: number | null
          nome_competicao?: string
          peso_alvo_palco?: number
          peso_atual?: number
          peso_limite_categoria?: number | null
          protocolo_farmacologico?: string | null
          semana_atual?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      competition_weekly_logs: {
        Row: {
          aderencia_dieta: number | null
          aderencia_treino: number | null
          ajuste_calorico: number | null
          ajuste_cardio: number | null
          ajuste_volume: number | null
          ajustes_proxima_semana: Json | null
          alertas: Json | null
          analise_semana: string | null
          bf_estimado: number | null
          bloco: string | null
          circunferencia_cintura: number | null
          competition_plan_id: string
          created_at: string
          dor_muscular: number | null
          energia_geral: number | null
          episodio_compulsao: boolean | null
          forca_status: string | null
          foto_costas_url: string | null
          foto_frente_url: string | null
          foto_lateral_url: string | null
          horas_sono_media: number | null
          id: string
          maior_dificuldade: string | null
          massa_magra_estimada: number | null
          peso: number | null
          posing_com_musica: boolean | null
          posing_minutos: number | null
          qualidade_sono: number | null
          recovery_score: number | null
          semana: number
        }
        Insert: {
          aderencia_dieta?: number | null
          aderencia_treino?: number | null
          ajuste_calorico?: number | null
          ajuste_cardio?: number | null
          ajuste_volume?: number | null
          ajustes_proxima_semana?: Json | null
          alertas?: Json | null
          analise_semana?: string | null
          bf_estimado?: number | null
          bloco?: string | null
          circunferencia_cintura?: number | null
          competition_plan_id: string
          created_at?: string
          dor_muscular?: number | null
          energia_geral?: number | null
          episodio_compulsao?: boolean | null
          forca_status?: string | null
          foto_costas_url?: string | null
          foto_frente_url?: string | null
          foto_lateral_url?: string | null
          horas_sono_media?: number | null
          id?: string
          maior_dificuldade?: string | null
          massa_magra_estimada?: number | null
          peso?: number | null
          posing_com_musica?: boolean | null
          posing_minutos?: number | null
          qualidade_sono?: number | null
          recovery_score?: number | null
          semana: number
        }
        Update: {
          aderencia_dieta?: number | null
          aderencia_treino?: number | null
          ajuste_calorico?: number | null
          ajuste_cardio?: number | null
          ajuste_volume?: number | null
          ajustes_proxima_semana?: Json | null
          alertas?: Json | null
          analise_semana?: string | null
          bf_estimado?: number | null
          bloco?: string | null
          circunferencia_cintura?: number | null
          competition_plan_id?: string
          created_at?: string
          dor_muscular?: number | null
          energia_geral?: number | null
          episodio_compulsao?: boolean | null
          forca_status?: string | null
          foto_costas_url?: string | null
          foto_frente_url?: string | null
          foto_lateral_url?: string | null
          horas_sono_media?: number | null
          id?: string
          maior_dificuldade?: string | null
          massa_magra_estimada?: number | null
          peso?: number | null
          posing_com_musica?: boolean | null
          posing_minutos?: number | null
          qualidade_sono?: number | null
          recovery_score?: number | null
          semana?: number
        }
        Relationships: [
          {
            foreignKeyName: "competition_weekly_logs_competition_plan_id_fkey"
            columns: ["competition_plan_id"]
            isOneToOne: false
            referencedRelation: "competition_plans"
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
      conversion_events: {
        Row: {
          action: string | null
          converted: boolean | null
          created_at: string | null
          feature: string
          id: string
          user_id: string
        }
        Insert: {
          action?: string | null
          converted?: boolean | null
          created_at?: string | null
          feature: string
          id?: string
          user_id: string
        }
        Update: {
          action?: string | null
          converted?: boolean | null
          created_at?: string | null
          feature?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      corrective_training_plans: {
        Row: {
          apex_imported: boolean | null
          apex_sync_id: string | null
          apex_weak_points: Json | null
          athlete_id: string
          category: string | null
          coach_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          split_type: string | null
          training_method: string | null
          training_text: string | null
          updated_at: string | null
          volume_valid: boolean | null
          volume_violations: Json | null
          weak_points: Json | null
          week_number: number | null
          weekly_volume: Json | null
        }
        Insert: {
          apex_imported?: boolean | null
          apex_sync_id?: string | null
          apex_weak_points?: Json | null
          athlete_id: string
          category?: string | null
          coach_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          split_type?: string | null
          training_method?: string | null
          training_text?: string | null
          updated_at?: string | null
          volume_valid?: boolean | null
          volume_violations?: Json | null
          weak_points?: Json | null
          week_number?: number | null
          weekly_volume?: Json | null
        }
        Update: {
          apex_imported?: boolean | null
          apex_sync_id?: string | null
          apex_weak_points?: Json | null
          athlete_id?: string
          category?: string | null
          coach_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          split_type?: string | null
          training_method?: string | null
          training_text?: string | null
          updated_at?: string | null
          volume_valid?: boolean | null
          volume_violations?: Json | null
          weak_points?: Json | null
          week_number?: number | null
          weekly_volume?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "corrective_training_plans_apex_sync_id_fkey"
            columns: ["apex_sync_id"]
            isOneToOne: false
            referencedRelation: "apex_training_sync"
            referencedColumns: ["id"]
          },
        ]
      }
      cycle_tracking: {
        Row: {
          compostos: Json | null
          created_at: string | null
          data_fim_prevista: string | null
          data_inicio: string | null
          doses: Json | null
          fase_atual: string | null
          id: string
          nome_ciclo: string | null
          observacoes: string | null
          protocolo_suporte: Json | null
          semana_atual: number | null
          tpc_protocolo: Json | null
          user_id: string
        }
        Insert: {
          compostos?: Json | null
          created_at?: string | null
          data_fim_prevista?: string | null
          data_inicio?: string | null
          doses?: Json | null
          fase_atual?: string | null
          id?: string
          nome_ciclo?: string | null
          observacoes?: string | null
          protocolo_suporte?: Json | null
          semana_atual?: number | null
          tpc_protocolo?: Json | null
          user_id: string
        }
        Update: {
          compostos?: Json | null
          created_at?: string | null
          data_fim_prevista?: string | null
          data_inicio?: string | null
          doses?: Json | null
          fase_atual?: string | null
          id?: string
          nome_ciclo?: string | null
          observacoes?: string | null
          protocolo_suporte?: Json | null
          semana_atual?: number | null
          tpc_protocolo?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      daily_briefings: {
        Row: {
          audio_url: string | null
          briefing_date: string
          created_at: string
          id: string
          listened: boolean
          listened_at: string | null
          text_content: string
          updated_at: string
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          briefing_date?: string
          created_at?: string
          id?: string
          listened?: boolean
          listened_at?: string | null
          text_content?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          audio_url?: string | null
          briefing_date?: string
          created_at?: string
          id?: string
          listened?: boolean
          listened_at?: string | null
          text_content?: string
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
      daily_nutrition_protocol: {
        Row: {
          alertas_gerados: Json | null
          calorias_consumidas: number | null
          calorias_meta: number | null
          carb_consumido: number | null
          carb_meta: number | null
          cardio_duracao: number | null
          cardio_tipo: string | null
          data: string
          gordura_consumida: number | null
          gordura_meta: number | null
          id: string
          meal_timeline: Json | null
          objetivo: string | null
          proteina_consumida: number | null
          proteina_meta: number | null
          sincronizado: boolean | null
          supplement_schedule: Json | null
          tipo_dia: string | null
          treino_tipo: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          alertas_gerados?: Json | null
          calorias_consumidas?: number | null
          calorias_meta?: number | null
          carb_consumido?: number | null
          carb_meta?: number | null
          cardio_duracao?: number | null
          cardio_tipo?: string | null
          data: string
          gordura_consumida?: number | null
          gordura_meta?: number | null
          id?: string
          meal_timeline?: Json | null
          objetivo?: string | null
          proteina_consumida?: number | null
          proteina_meta?: number | null
          sincronizado?: boolean | null
          supplement_schedule?: Json | null
          tipo_dia?: string | null
          treino_tipo?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          alertas_gerados?: Json | null
          calorias_consumidas?: number | null
          calorias_meta?: number | null
          carb_consumido?: number | null
          carb_meta?: number | null
          cardio_duracao?: number | null
          cardio_tipo?: string | null
          data?: string
          gordura_consumida?: number | null
          gordura_meta?: number | null
          id?: string
          meal_timeline?: Json | null
          objetivo?: string | null
          proteina_consumida?: number | null
          proteina_meta?: number | null
          sincronizado?: boolean | null
          supplement_schedule?: Json | null
          tipo_dia?: string | null
          treino_tipo?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      dr_evidence_history: {
        Row: {
          asked_at: string | null
          citations: Json | null
          claude_answer: string | null
          context_tags: string[] | null
          id: string
          perplexity_raw: string | null
          question: string | null
          user_id: string
        }
        Insert: {
          asked_at?: string | null
          citations?: Json | null
          claude_answer?: string | null
          context_tags?: string[] | null
          id?: string
          perplexity_raw?: string | null
          question?: string | null
          user_id: string
        }
        Update: {
          asked_at?: string | null
          citations?: Json | null
          claude_answer?: string | null
          context_tags?: string[] | null
          id?: string
          perplexity_raw?: string | null
          question?: string | null
          user_id?: string
        }
        Relationships: []
      }
      emotion_regulation_log: {
        Row: {
          created_at: string | null
          decisao_pos: string | null
          duracao_segundos: number | null
          eficacia: number | null
          emocao: string | null
          id: string
          intensidade: number | null
          tecnica_usada: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          decisao_pos?: string | null
          duracao_segundos?: number | null
          eficacia?: number | null
          emocao?: string | null
          id?: string
          intensidade?: number | null
          tecnica_usada?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          decisao_pos?: string | null
          duracao_segundos?: number | null
          eficacia?: number | null
          emocao?: string | null
          id?: string
          intensidade?: number | null
          tecnica_usada?: string | null
          user_id?: string
        }
        Relationships: []
      }
      emotional_episodes: {
        Row: {
          ate_anyway: boolean | null
          automatic_thought: string | null
          behavior: string | null
          context_deficit_kcal: number | null
          context_sleep_quality: number | null
          context_stress_level: number | null
          created_at: string | null
          day_of_week: number | null
          emotion: string | null
          emotion_intensity: number | null
          hour_of_day: number | null
          hunger_type: string | null
          id: string
          linked_meal_log_id: string | null
          notes: string | null
          occurred_at: string | null
          post_emotion_intensity: number | null
          resisted: boolean | null
          situation: string | null
          technique_completed: boolean | null
          technique_duration_sec: number | null
          technique_used: string | null
          user_id: string
        }
        Insert: {
          ate_anyway?: boolean | null
          automatic_thought?: string | null
          behavior?: string | null
          context_deficit_kcal?: number | null
          context_sleep_quality?: number | null
          context_stress_level?: number | null
          created_at?: string | null
          day_of_week?: number | null
          emotion?: string | null
          emotion_intensity?: number | null
          hour_of_day?: number | null
          hunger_type?: string | null
          id?: string
          linked_meal_log_id?: string | null
          notes?: string | null
          occurred_at?: string | null
          post_emotion_intensity?: number | null
          resisted?: boolean | null
          situation?: string | null
          technique_completed?: boolean | null
          technique_duration_sec?: number | null
          technique_used?: string | null
          user_id: string
        }
        Update: {
          ate_anyway?: boolean | null
          automatic_thought?: string | null
          behavior?: string | null
          context_deficit_kcal?: number | null
          context_sleep_quality?: number | null
          context_stress_level?: number | null
          created_at?: string | null
          day_of_week?: number | null
          emotion?: string | null
          emotion_intensity?: number | null
          hour_of_day?: number | null
          hunger_type?: string | null
          id?: string
          linked_meal_log_id?: string | null
          notes?: string | null
          occurred_at?: string | null
          post_emotion_intensity?: number | null
          resisted?: boolean | null
          situation?: string | null
          technique_completed?: boolean | null
          technique_duration_sec?: number | null
          technique_used?: string | null
          user_id?: string
        }
        Relationships: []
      }
      emotional_win_rates: {
        Row: {
          id: string
          resisted_count: number | null
          streak_days: number | null
          top_emotion: string | null
          top_technique: string | null
          total_episodes: number | null
          user_id: string
          week_start: string
          win_rate: number | null
        }
        Insert: {
          id?: string
          resisted_count?: number | null
          streak_days?: number | null
          top_emotion?: string | null
          top_technique?: string | null
          total_episodes?: number | null
          user_id: string
          week_start: string
          win_rate?: number | null
        }
        Update: {
          id?: string
          resisted_count?: number | null
          streak_days?: number | null
          top_emotion?: string | null
          top_technique?: string | null
          total_episodes?: number | null
          user_id?: string
          week_start?: string
          win_rate?: number | null
        }
        Relationships: []
      }
      energy_insights: {
        Row: {
          generated_at: string | null
          id: string
          insight_text: string | null
          insight_type: string | null
          read: boolean | null
          user_id: string
        }
        Insert: {
          generated_at?: string | null
          id?: string
          insight_text?: string | null
          insight_type?: string | null
          read?: boolean | null
          user_id: string
        }
        Update: {
          generated_at?: string | null
          id?: string
          insight_text?: string | null
          insight_type?: string | null
          read?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      energy_scores: {
        Row: {
          calories_that_day: number | null
          created_at: string | null
          id: string
          nootropic_taken: boolean | null
          possible_cause: string | null
          score: number
          score_date: string | null
          sleep_hours: number | null
          user_id: string
          workout_type: string | null
        }
        Insert: {
          calories_that_day?: number | null
          created_at?: string | null
          id?: string
          nootropic_taken?: boolean | null
          possible_cause?: string | null
          score?: number
          score_date?: string | null
          sleep_hours?: number | null
          user_id: string
          workout_type?: string | null
        }
        Update: {
          calories_that_day?: number | null
          created_at?: string | null
          id?: string
          nootropic_taken?: boolean | null
          possible_cause?: string | null
          score?: number
          score_date?: string | null
          sleep_hours?: number | null
          user_id?: string
          workout_type?: string | null
        }
        Relationships: []
      }
      ergo_checkins: {
        Row: {
          analise_ia: string | null
          created_at: string
          data_checkin: string
          diary_id: string
          exames: Json | null
          id: string
          libido: string | null
          observacoes: string | null
          pa_diastolica: number | null
          pa_sistolica: number | null
          peso: number | null
          qualidade_sono: number | null
          semana: number | null
          sensacao_geral: number | null
          user_id: string
        }
        Insert: {
          analise_ia?: string | null
          created_at?: string
          data_checkin?: string
          diary_id: string
          exames?: Json | null
          id?: string
          libido?: string | null
          observacoes?: string | null
          pa_diastolica?: number | null
          pa_sistolica?: number | null
          peso?: number | null
          qualidade_sono?: number | null
          semana?: number | null
          sensacao_geral?: number | null
          user_id: string
        }
        Update: {
          analise_ia?: string | null
          created_at?: string
          data_checkin?: string
          diary_id?: string
          exames?: Json | null
          id?: string
          libido?: string | null
          observacoes?: string | null
          pa_diastolica?: number | null
          pa_sistolica?: number | null
          peso?: number | null
          qualidade_sono?: number | null
          semana?: number | null
          sensacao_geral?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ergo_checkins_diary_id_fkey"
            columns: ["diary_id"]
            isOneToOne: false
            referencedRelation: "ergo_diaries"
            referencedColumns: ["id"]
          },
        ]
      }
      ergo_diaries: {
        Row: {
          alertas: Json | null
          auxiliares: Json | null
          bf_inicial: number | null
          created_at: string
          data_fim_prevista: string | null
          data_inicio: string | null
          duracao_semanas: number | null
          exames_pre_ciclo: Json | null
          id: string
          nome: string
          objetivo: string | null
          observacoes: string | null
          peptideos: Json | null
          perfil_usuario: string | null
          peso_inicial: number | null
          status: string | null
          substancias: Json | null
          tpc_planejada: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alertas?: Json | null
          auxiliares?: Json | null
          bf_inicial?: number | null
          created_at?: string
          data_fim_prevista?: string | null
          data_inicio?: string | null
          duracao_semanas?: number | null
          exames_pre_ciclo?: Json | null
          id?: string
          nome: string
          objetivo?: string | null
          observacoes?: string | null
          peptideos?: Json | null
          perfil_usuario?: string | null
          peso_inicial?: number | null
          status?: string | null
          substancias?: Json | null
          tpc_planejada?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alertas?: Json | null
          auxiliares?: Json | null
          bf_inicial?: number | null
          created_at?: string
          data_fim_prevista?: string | null
          data_inicio?: string | null
          duracao_semanas?: number | null
          exames_pre_ciclo?: Json | null
          id?: string
          nome?: string
          objetivo?: string | null
          observacoes?: string | null
          peptideos?: Json | null
          perfil_usuario?: string | null
          peso_inicial?: number | null
          status?: string | null
          substancias?: Json | null
          tpc_planejada?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ergo_diary_messages: {
        Row: {
          content: string
          created_at: string
          diary_id: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          diary_id?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          diary_id?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ergo_diary_messages_diary_id_fkey"
            columns: ["diary_id"]
            isOneToOne: false
            referencedRelation: "ergo_diaries"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_alerts: {
        Row: {
          acao_recomendada: string | null
          created_at: string | null
          exam_id: string | null
          id: string
          marcador: string | null
          mensagem: string | null
          nivel: string | null
          resolvido: boolean | null
          user_id: string
          valor: number | null
        }
        Insert: {
          acao_recomendada?: string | null
          created_at?: string | null
          exam_id?: string | null
          id?: string
          marcador?: string | null
          mensagem?: string | null
          nivel?: string | null
          resolvido?: boolean | null
          user_id: string
          valor?: number | null
        }
        Update: {
          acao_recomendada?: string | null
          created_at?: string | null
          exam_id?: string | null
          id?: string
          marcador?: string | null
          mensagem?: string | null
          nivel?: string | null
          resolvido?: boolean | null
          user_id?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_alerts_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "athlete_exams"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_request_results: {
        Row: {
          coach_id: string
          created_at: string
          data_coleta: string | null
          exame_id: string
          id: string
          request_id: string
          status: string | null
          unidade: string | null
          valor: number | null
        }
        Insert: {
          coach_id: string
          created_at?: string
          data_coleta?: string | null
          exame_id: string
          id?: string
          request_id: string
          status?: string | null
          unidade?: string | null
          valor?: number | null
        }
        Update: {
          coach_id?: string
          created_at?: string
          data_coleta?: string | null
          exame_id?: string
          id?: string
          request_id?: string
          status?: string | null
          unidade?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_request_results_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "exam_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_requests: {
        Row: {
          coach_id: string
          created_at: string
          exames: Json
          id: string
          justificativa: string | null
          observacoes: string | null
          paineis: Json
          patient_age: number | null
          patient_name: string | null
          patient_sex: string | null
          patient_user_id: string | null
          periodicidade: string | null
          proxima_solicitacao: string | null
          status: string
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          exames?: Json
          id?: string
          justificativa?: string | null
          observacoes?: string | null
          paineis?: Json
          patient_age?: number | null
          patient_name?: string | null
          patient_sex?: string | null
          patient_user_id?: string | null
          periodicidade?: string | null
          proxima_solicitacao?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          exames?: Json
          id?: string
          justificativa?: string | null
          observacoes?: string | null
          paineis?: Json
          patient_age?: number | null
          patient_name?: string | null
          patient_sex?: string | null
          patient_user_id?: string | null
          periodicidade?: string | null
          proxima_solicitacao?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      exercise_cues: {
        Row: {
          created_at: string | null
          cue_texto: string
          cue_tipo: string | null
          exercise_id: string | null
          fase: string | null
          id: string
          musculo_alvo: string | null
          problema_comum: string | null
          solucao: string | null
        }
        Insert: {
          created_at?: string | null
          cue_texto: string
          cue_tipo?: string | null
          exercise_id?: string | null
          fase?: string | null
          id?: string
          musculo_alvo?: string | null
          problema_comum?: string | null
          solucao?: string | null
        }
        Update: {
          created_at?: string | null
          cue_texto?: string
          cue_tipo?: string | null
          exercise_id?: string | null
          fase?: string | null
          id?: string
          musculo_alvo?: string | null
          problema_comum?: string | null
          solucao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_cues_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_sets: {
        Row: {
          concluida: boolean | null
          created_at: string | null
          diary_id: string
          exercise_id: string | null
          exercise_name: string
          id: string
          peso: number | null
          reps: number | null
          rir: number | null
          serie_numero: number
          tecnica_especial: string | null
          tempo_descanso: number | null
        }
        Insert: {
          concluida?: boolean | null
          created_at?: string | null
          diary_id: string
          exercise_id?: string | null
          exercise_name: string
          id?: string
          peso?: number | null
          reps?: number | null
          rir?: number | null
          serie_numero?: number
          tecnica_especial?: string | null
          tempo_descanso?: number | null
        }
        Update: {
          concluida?: boolean | null
          created_at?: string | null
          diary_id?: string
          exercise_id?: string | null
          exercise_name?: string
          id?: string
          peso?: number | null
          reps?: number | null
          rir?: number | null
          serie_numero?: number
          tecnica_especial?: string | null
          tempo_descanso?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exercise_sets_diary_id_fkey"
            columns: ["diary_id"]
            isOneToOne: false
            referencedRelation: "workout_diary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_sets_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string | null
          dicas_biomecanica: string | null
          dificuldade: string | null
          emg_activation: Json | null
          equipamento: string | null
          erros_comuns: string[] | null
          execucao_texto: string | null
          fases_recomendadas: string[] | null
          grupo_muscular: string
          id: string
          muscle_portion: string | null
          musculo_primario: string
          musculos_secundarios: string[] | null
          nome: string
          prioridade: number | null
          profile_evidence: string | null
          resistance_profile: string | null
          subgrupo_especifico: string
          variacoes: string[] | null
        }
        Insert: {
          created_at?: string | null
          dicas_biomecanica?: string | null
          dificuldade?: string | null
          emg_activation?: Json | null
          equipamento?: string | null
          erros_comuns?: string[] | null
          execucao_texto?: string | null
          fases_recomendadas?: string[] | null
          grupo_muscular: string
          id?: string
          muscle_portion?: string | null
          musculo_primario: string
          musculos_secundarios?: string[] | null
          nome: string
          prioridade?: number | null
          profile_evidence?: string | null
          resistance_profile?: string | null
          subgrupo_especifico: string
          variacoes?: string[] | null
        }
        Update: {
          created_at?: string | null
          dicas_biomecanica?: string | null
          dificuldade?: string | null
          emg_activation?: Json | null
          equipamento?: string | null
          erros_comuns?: string[] | null
          execucao_texto?: string | null
          fases_recomendadas?: string[] | null
          grupo_muscular?: string
          id?: string
          muscle_portion?: string | null
          musculo_primario?: string
          musculos_secundarios?: string[] | null
          nome?: string
          prioridade?: number | null
          profile_evidence?: string | null
          resistance_profile?: string | null
          subgrupo_especifico?: string
          variacoes?: string[] | null
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
      feminine_profiles: {
        Row: {
          anticoncepcional: string
          created_at: string
          duracao_ciclo: number
          fase_ciclo: string
          id: string
          menopausa: string
          tpm_severa: boolean
          triada_suspeita: boolean
          ultima_menstruacao: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          anticoncepcional?: string
          created_at?: string
          duracao_ciclo?: number
          fase_ciclo?: string
          id?: string
          menopausa?: string
          tpm_severa?: boolean
          triada_suspeita?: boolean
          ultima_menstruacao?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          anticoncepcional?: string
          created_at?: string
          duracao_ciclo?: number
          fase_ciclo?: string
          id?: string
          menopausa?: string
          tpm_severa?: boolean
          triada_suspeita?: boolean
          ultima_menstruacao?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feminino_perplexity_cache: {
        Row: {
          cache_key: string
          conhecimento: string
          expira_em: string
          fontes: Json | null
          gerado_em: string
          id: string
          user_id: string
        }
        Insert: {
          cache_key: string
          conhecimento: string
          expira_em: string
          fontes?: Json | null
          gerado_em?: string
          id?: string
          user_id: string
        }
        Update: {
          cache_key?: string
          conhecimento?: string
          expira_em?: string
          fontes?: Json | null
          gerado_em?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      fiber_profiles: {
        Row: {
          dominancia: string | null
          id: string
          notas: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          dominancia?: string | null
          id?: string
          notas?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          dominancia?: string | null
          id?: string
          notas?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      fitoterapicos_lib: {
        Row: {
          categorias: string[] | null
          ciclo: string | null
          contraindicoes: string[] | null
          created_at: string | null
          dose: string | null
          evidencia: string | null
          farmacocinetica: Json | null
          id: string
          indicacoes: string[] | null
          interacoes: string[] | null
          mecanismo: string | null
          nivel: string | null
          nome: string
          nome_cientifico: string | null
          nota_elite: string | null
          origem: string | null
          timing: string | null
        }
        Insert: {
          categorias?: string[] | null
          ciclo?: string | null
          contraindicoes?: string[] | null
          created_at?: string | null
          dose?: string | null
          evidencia?: string | null
          farmacocinetica?: Json | null
          id?: string
          indicacoes?: string[] | null
          interacoes?: string[] | null
          mecanismo?: string | null
          nivel?: string | null
          nome: string
          nome_cientifico?: string | null
          nota_elite?: string | null
          origem?: string | null
          timing?: string | null
        }
        Update: {
          categorias?: string[] | null
          ciclo?: string | null
          contraindicoes?: string[] | null
          created_at?: string | null
          dose?: string | null
          evidencia?: string | null
          farmacocinetica?: Json | null
          id?: string
          indicacoes?: string[] | null
          interacoes?: string[] | null
          mecanismo?: string | null
          nivel?: string | null
          nome?: string
          nome_cientifico?: string | null
          nota_elite?: string | null
          origem?: string | null
          timing?: string | null
        }
        Relationships: []
      }
      focus_mode_logs: {
        Row: {
          created_at: string | null
          duration_hours: number | null
          event_date: string | null
          event_time: string | null
          event_type: string | null
          id: string
          performance_score: number | null
          protocol_generated: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration_hours?: number | null
          event_date?: string | null
          event_time?: string | null
          event_type?: string | null
          id?: string
          performance_score?: number | null
          protocol_generated?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration_hours?: number | null
          event_date?: string | null
          event_time?: string | null
          event_type?: string | null
          id?: string
          performance_score?: number | null
          protocol_generated?: Json | null
          user_id?: string
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
      guton_assessments: {
        Row: {
          antibiotic_last_year: boolean | null
          assessed_at: string | null
          bloating_frequency: string | null
          bristol_score: number | null
          foods_trigger: string[] | null
          id: string
          notes: string | null
          pattern: string | null
          sleep_quality: string | null
          stress_level: string | null
          symptoms: string[] | null
          user_id: string
        }
        Insert: {
          antibiotic_last_year?: boolean | null
          assessed_at?: string | null
          bloating_frequency?: string | null
          bristol_score?: number | null
          foods_trigger?: string[] | null
          id?: string
          notes?: string | null
          pattern?: string | null
          sleep_quality?: string | null
          stress_level?: string | null
          symptoms?: string[] | null
          user_id: string
        }
        Update: {
          antibiotic_last_year?: boolean | null
          assessed_at?: string | null
          bloating_frequency?: string | null
          bristol_score?: number | null
          foods_trigger?: string[] | null
          id?: string
          notes?: string | null
          pattern?: string | null
          sleep_quality?: string | null
          stress_level?: string | null
          symptoms?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      guton_conversations: {
        Row: {
          ai_source: string | null
          created_at: string | null
          id: string
          message: string
          pattern_detected: string | null
          response: string
          user_id: string
        }
        Insert: {
          ai_source?: string | null
          created_at?: string | null
          id?: string
          message: string
          pattern_detected?: string | null
          response: string
          user_id: string
        }
        Update: {
          ai_source?: string | null
          created_at?: string | null
          id?: string
          message?: string
          pattern_detected?: string | null
          response?: string
          user_id?: string
        }
        Relationships: []
      }
      guton_protocols: {
        Row: {
          foods_allowed: string[] | null
          foods_restricted: string[] | null
          id: string
          pattern: string | null
          phase: number | null
          protocol_text: string | null
          started_at: string | null
          supplements: Json | null
          target_end_at: string | null
          user_id: string
          week_number: number | null
        }
        Insert: {
          foods_allowed?: string[] | null
          foods_restricted?: string[] | null
          id?: string
          pattern?: string | null
          phase?: number | null
          protocol_text?: string | null
          started_at?: string | null
          supplements?: Json | null
          target_end_at?: string | null
          user_id: string
          week_number?: number | null
        }
        Update: {
          foods_allowed?: string[] | null
          foods_restricted?: string[] | null
          id?: string
          pattern?: string | null
          phase?: number | null
          protocol_text?: string | null
          started_at?: string | null
          supplements?: Json | null
          target_end_at?: string | null
          user_id?: string
          week_number?: number | null
        }
        Relationships: []
      }
      guton_symptom_log: {
        Row: {
          bloating: number | null
          bristol: number | null
          date: string | null
          energy: number | null
          evacuations: number | null
          id: string
          mood: number | null
          notes: string | null
          pain: number | null
          user_id: string
        }
        Insert: {
          bloating?: number | null
          bristol?: number | null
          date?: string | null
          energy?: number | null
          evacuations?: number | null
          id?: string
          mood?: number | null
          notes?: string | null
          pain?: number | null
          user_id: string
        }
        Update: {
          bloating?: number | null
          bristol?: number | null
          date?: string | null
          energy?: number | null
          evacuations?: number | null
          id?: string
          mood?: number | null
          notes?: string | null
          pain?: number | null
          user_id?: string
        }
        Relationships: []
      }
      gym_challenges: {
        Row: {
          coach_user_id: string
          commission_percent: number
          created_at: string
          end_date: string
          gym_id: string | null
          id: string
          name: string
          premium_count: number
          qr_code_url: string | null
          reminder_checkin_message: string | null
          reminder_checkin_time: string
          reminder_deadline_time: string
          reminder_escalation_hours: number[]
          reminder_escalation_messages: string[]
          reminder_meal_message: string | null
          reminder_meal_times: string[]
          reminders_enabled: boolean
          revenue_total: number
          slug: string | null
          start_date: string
          status: string
          total_participants: number
          updated_at: string
          vip_count: number
        }
        Insert: {
          coach_user_id: string
          commission_percent?: number
          created_at?: string
          end_date: string
          gym_id?: string | null
          id?: string
          name: string
          premium_count?: number
          qr_code_url?: string | null
          reminder_checkin_message?: string | null
          reminder_checkin_time?: string
          reminder_deadline_time?: string
          reminder_escalation_hours?: number[]
          reminder_escalation_messages?: string[]
          reminder_meal_message?: string | null
          reminder_meal_times?: string[]
          reminders_enabled?: boolean
          revenue_total?: number
          slug?: string | null
          start_date: string
          status?: string
          total_participants?: number
          updated_at?: string
          vip_count?: number
        }
        Update: {
          coach_user_id?: string
          commission_percent?: number
          created_at?: string
          end_date?: string
          gym_id?: string | null
          id?: string
          name?: string
          premium_count?: number
          qr_code_url?: string | null
          reminder_checkin_message?: string | null
          reminder_checkin_time?: string
          reminder_deadline_time?: string
          reminder_escalation_hours?: number[]
          reminder_escalation_messages?: string[]
          reminder_meal_message?: string | null
          reminder_meal_times?: string[]
          reminders_enabled?: boolean
          revenue_total?: number
          slug?: string | null
          start_date?: string
          status?: string
          total_participants?: number
          updated_at?: string
          vip_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "gym_challenges_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "partner_gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      gym_interactions: {
        Row: {
          coach_user_id: string
          created_at: string
          description: string | null
          gym_id: string
          id: string
          type: string
        }
        Insert: {
          coach_user_id: string
          created_at?: string
          description?: string | null
          gym_id: string
          id?: string
          type: string
        }
        Update: {
          coach_user_id?: string
          created_at?: string
          description?: string | null
          gym_id?: string
          id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "gym_interactions_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "partner_gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_conversations: {
        Row: {
          created_at: string | null
          fontes: Json | null
          id: string
          intent_type: string | null
          pergunta: string
          perplexity_usado: boolean | null
          resposta: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          fontes?: Json | null
          id?: string
          intent_type?: string | null
          pergunta: string
          perplexity_usado?: boolean | null
          resposta?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          fontes?: Json | null
          id?: string
          intent_type?: string | null
          pergunta?: string
          perplexity_usado?: boolean | null
          resposta?: string | null
          user_id?: string
        }
        Relationships: []
      }
      lab_protocols: {
        Row: {
          categoria: string
          conteudo: Json | null
          created_at: string | null
          fontes: Json | null
          id: string
          nivel: string | null
          tempo_leitura: number | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          categoria: string
          conteudo?: Json | null
          created_at?: string | null
          fontes?: Json | null
          id?: string
          nivel?: string | null
          tempo_leitura?: number | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          categoria?: string
          conteudo?: Json | null
          created_at?: string | null
          fontes?: Json | null
          id?: string
          nivel?: string | null
          tempo_leitura?: number | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      lab_saved_items: {
        Row: {
          conteudo: Json | null
          created_at: string | null
          id: string
          tags: string[] | null
          tipo: string
          titulo: string | null
          user_id: string
        }
        Insert: {
          conteudo?: Json | null
          created_at?: string | null
          id?: string
          tags?: string[] | null
          tipo?: string
          titulo?: string | null
          user_id: string
        }
        Update: {
          conteudo?: Json | null
          created_at?: string | null
          id?: string
          tags?: string[] | null
          tipo?: string
          titulo?: string | null
          user_id?: string
        }
        Relationships: []
      }
      lab_subscriptions: {
        Row: {
          activated_at: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          kiwify_order_id: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          kiwify_order_id?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          activated_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          kiwify_order_id?: string | null
          status?: string | null
          user_id?: string
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
      mce_alter_ego: {
        Row: {
          activation_phrase: string | null
          created_at: string
          name: string
          posture: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activation_phrase?: string | null
          created_at?: string
          name: string
          posture?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activation_phrase?: string | null
          created_at?: string
          name?: string
          posture?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mce_audio_episodes: {
        Row: {
          audio_url: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          duration_seconds: number
          episode_number: number | null
          id: string
          is_premium: boolean
          scientific_reference: string | null
          series: string
          sort_order: number
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          audio_url?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          duration_seconds?: number
          episode_number?: number | null
          id?: string
          is_premium?: boolean
          scientific_reference?: string | null
          series: string
          sort_order?: number
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          audio_url?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          duration_seconds?: number
          episode_number?: number | null
          id?: string
          is_premium?: boolean
          scientific_reference?: string | null
          series?: string
          sort_order?: number
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      mce_chat_sessions: {
        Row: {
          id: string
          messages: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          messages?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          messages?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mce_checkins: {
        Row: {
          checkin_date: string
          created_at: string
          focus_clarity: number
          hydration: number
          id: string
          movement: number
          notes: string | null
          nutrition_adherence: number
          sleep_quality: number
          stress_level: number
          updated_at: string
          user_id: string
        }
        Insert: {
          checkin_date?: string
          created_at?: string
          focus_clarity: number
          hydration: number
          id?: string
          movement: number
          notes?: string | null
          nutrition_adherence: number
          sleep_quality: number
          stress_level: number
          updated_at?: string
          user_id: string
        }
        Update: {
          checkin_date?: string
          created_at?: string
          focus_clarity?: number
          hydration?: number
          id?: string
          movement?: number
          notes?: string | null
          nutrition_adherence?: number
          sleep_quality?: number
          stress_level?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mce_diagnostics: {
        Row: {
          answers: number[]
          created_at: string
          id: string
          pillar: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: number[]
          created_at?: string
          id?: string
          pillar: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: number[]
          created_at?: string
          id?: string
          pillar?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mce_exercises_done: {
        Row: {
          completed_at: string
          exercise_key: string
          id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          exercise_key: string
          id?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          exercise_key?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      mce_lead_activities: {
        Row: {
          coach_id: string | null
          content: string | null
          created_at: string
          id: string
          lead_id: string
          new_value: string | null
          old_value: string | null
          type: string
        }
        Insert: {
          coach_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          lead_id: string
          new_value?: string | null
          old_value?: string | null
          type: string
        }
        Update: {
          coach_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          lead_id?: string
          new_value?: string | null
          old_value?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "mce_lead_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "mce_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      mce_leads: {
        Row: {
          answers: Json
          coach_id: string | null
          contacted_at: string | null
          converted_at: string | null
          created_at: string
          device: string | null
          goal: string | null
          id: string
          level: string
          name: string
          notes: string | null
          referrer: string | null
          score_comportamento: number
          score_execucao: number
          score_mentalidade: number
          score_total: number
          status: string
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          whatsapp: string | null
        }
        Insert: {
          answers?: Json
          coach_id?: string | null
          contacted_at?: string | null
          converted_at?: string | null
          created_at?: string
          device?: string | null
          goal?: string | null
          id?: string
          level?: string
          name: string
          notes?: string | null
          referrer?: string | null
          score_comportamento?: number
          score_execucao?: number
          score_mentalidade?: number
          score_total?: number
          status?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          whatsapp?: string | null
        }
        Update: {
          answers?: Json
          coach_id?: string | null
          contacted_at?: string | null
          converted_at?: string | null
          created_at?: string
          device?: string | null
          goal?: string | null
          id?: string
          level?: string
          name?: string
          notes?: string | null
          referrer?: string | null
          score_comportamento?: number
          score_execucao?: number
          score_mentalidade?: number
          score_total?: number
          status?: string
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      mce_scores: {
        Row: {
          created_at: string
          id: string
          score_c: number
          score_e: number
          score_m: number
          source: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          score_c: number
          score_e: number
          score_m: number
          source?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          score_c?: number
          score_e?: number
          score_m?: number
          source?: string
          user_id?: string
        }
        Relationships: []
      }
      mce_voice_notes: {
        Row: {
          audio_path: string
          created_at: string
          duration_seconds: number
          id: string
          kind: string
          mce_score: number | null
          note_date: string
          transcript: string | null
          unlock_at: string | null
          user_id: string
        }
        Insert: {
          audio_path: string
          created_at?: string
          duration_seconds?: number
          id?: string
          kind?: string
          mce_score?: number | null
          note_date?: string
          transcript?: string | null
          unlock_at?: string | null
          user_id: string
        }
        Update: {
          audio_path?: string
          created_at?: string
          duration_seconds?: number
          id?: string
          kind?: string
          mce_score?: number | null
          note_date?: string
          transcript?: string | null
          unlock_at?: string | null
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
          coach_edited: boolean | null
          coach_note: string | null
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
          coach_edited?: boolean | null
          coach_note?: string | null
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
          coach_edited?: boolean | null
          coach_note?: string | null
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
      meridian_athlete_parameters: {
        Row: {
          adherence_pattern: string | null
          athlete_track: Database["public"]["Enums"]["athlete_track"]
          avg_cycle_length_days: number | null
          best_stage_bf_percent: number | null
          best_stage_weight_kg: number | null
          bf_measurement_method: string | null
          biological_sex: Database["public"]["Enums"]["biological_sex"]
          cortisol_morning: number | null
          created_at: string
          current_bf_percent: number
          current_lean_mass_kg: number | null
          current_weight_kg: number
          date_of_birth: string | null
          deficit_tolerance: string | null
          emotional_eating_risk: string | null
          estradiol_female: number | null
          estradiol_male: number | null
          ferritin: number | null
          free_testosterone: number | null
          fsh: number | null
          height_cm: number
          hrv_baseline: number | null
          last_competition_date: string | null
          last_menstruation_date: string | null
          last_prep_duration_weeks: number | null
          last_prep_satisfaction_score: number | null
          lh: number | null
          menstrual_status:
            | Database["public"]["Enums"]["menstrual_status"]
            | null
          progesterone: number | null
          prolactin: number | null
          resting_hr: number | null
          shbg: number | null
          t3_value: number | null
          t4_value: number | null
          total_preps_completed: number | null
          total_testosterone: number | null
          tsh_value: number | null
          updated_at: string
          user_id: string
          vitamin_d: number | null
          years_in_track: number | null
        }
        Insert: {
          adherence_pattern?: string | null
          athlete_track?: Database["public"]["Enums"]["athlete_track"]
          avg_cycle_length_days?: number | null
          best_stage_bf_percent?: number | null
          best_stage_weight_kg?: number | null
          bf_measurement_method?: string | null
          biological_sex: Database["public"]["Enums"]["biological_sex"]
          cortisol_morning?: number | null
          created_at?: string
          current_bf_percent: number
          current_lean_mass_kg?: number | null
          current_weight_kg: number
          date_of_birth?: string | null
          deficit_tolerance?: string | null
          emotional_eating_risk?: string | null
          estradiol_female?: number | null
          estradiol_male?: number | null
          ferritin?: number | null
          free_testosterone?: number | null
          fsh?: number | null
          height_cm: number
          hrv_baseline?: number | null
          last_competition_date?: string | null
          last_menstruation_date?: string | null
          last_prep_duration_weeks?: number | null
          last_prep_satisfaction_score?: number | null
          lh?: number | null
          menstrual_status?:
            | Database["public"]["Enums"]["menstrual_status"]
            | null
          progesterone?: number | null
          prolactin?: number | null
          resting_hr?: number | null
          shbg?: number | null
          t3_value?: number | null
          t4_value?: number | null
          total_preps_completed?: number | null
          total_testosterone?: number | null
          tsh_value?: number | null
          updated_at?: string
          user_id: string
          vitamin_d?: number | null
          years_in_track?: number | null
        }
        Update: {
          adherence_pattern?: string | null
          athlete_track?: Database["public"]["Enums"]["athlete_track"]
          avg_cycle_length_days?: number | null
          best_stage_bf_percent?: number | null
          best_stage_weight_kg?: number | null
          bf_measurement_method?: string | null
          biological_sex?: Database["public"]["Enums"]["biological_sex"]
          cortisol_morning?: number | null
          created_at?: string
          current_bf_percent?: number
          current_lean_mass_kg?: number | null
          current_weight_kg?: number
          date_of_birth?: string | null
          deficit_tolerance?: string | null
          emotional_eating_risk?: string | null
          estradiol_female?: number | null
          estradiol_male?: number | null
          ferritin?: number | null
          free_testosterone?: number | null
          fsh?: number | null
          height_cm?: number
          hrv_baseline?: number | null
          last_competition_date?: string | null
          last_menstruation_date?: string | null
          last_prep_duration_weeks?: number | null
          last_prep_satisfaction_score?: number | null
          lh?: number | null
          menstrual_status?:
            | Database["public"]["Enums"]["menstrual_status"]
            | null
          progesterone?: number | null
          prolactin?: number | null
          resting_hr?: number | null
          shbg?: number | null
          t3_value?: number | null
          t4_value?: number | null
          total_preps_completed?: number | null
          total_testosterone?: number | null
          tsh_value?: number | null
          updated_at?: string
          user_id?: string
          vitamin_d?: number | null
          years_in_track?: number | null
        }
        Relationships: []
      }
      meridian_competitions: {
        Row: {
          age_group: Database["public"]["Enums"]["age_group"]
          category: Database["public"]["Enums"]["bodybuilding_category"]
          competition_date: string
          created_at: string
          drug_test_pre_contest_window_days: number | null
          drug_test_required: boolean
          drug_test_type: string[] | null
          federation: string
          height_class: string | null
          id: string
          is_natural_federation: boolean
          is_primary: boolean
          location: string | null
          name: string
          result_notes: string | null
          result_placement: number | null
          status: string
          updated_at: string
          user_id: string
          weight_class: string | null
        }
        Insert: {
          age_group?: Database["public"]["Enums"]["age_group"]
          category: Database["public"]["Enums"]["bodybuilding_category"]
          competition_date: string
          created_at?: string
          drug_test_pre_contest_window_days?: number | null
          drug_test_required?: boolean
          drug_test_type?: string[] | null
          federation: string
          height_class?: string | null
          id?: string
          is_natural_federation?: boolean
          is_primary?: boolean
          location?: string | null
          name: string
          result_notes?: string | null
          result_placement?: number | null
          status?: string
          updated_at?: string
          user_id: string
          weight_class?: string | null
        }
        Update: {
          age_group?: Database["public"]["Enums"]["age_group"]
          category?: Database["public"]["Enums"]["bodybuilding_category"]
          competition_date?: string
          created_at?: string
          drug_test_pre_contest_window_days?: number | null
          drug_test_required?: boolean
          drug_test_type?: string[] | null
          federation?: string
          height_class?: string | null
          id?: string
          is_natural_federation?: boolean
          is_primary?: boolean
          location?: string | null
          name?: string
          result_notes?: string | null
          result_placement?: number | null
          status?: string
          updated_at?: string
          user_id?: string
          weight_class?: string | null
        }
        Relationships: []
      }
      meridian_default_parameters: {
        Row: {
          age_group: Database["public"]["Enums"]["age_group"]
          amenorrhea_is_red_flag: boolean | null
          athlete_track: Database["public"]["Enums"]["athlete_track"]
          biological_sex: Database["public"]["Enums"]["biological_sex"]
          buffer_weeks_min: number
          buffer_weeks_recommended: number
          category: Database["public"]["Enums"]["bodybuilding_category"]
          created_at: string
          cycle_sync_recommended: boolean | null
          diet_phase_loss_max: number
          diet_phase_loss_min: number
          final_sharpening_weeks_default: number
          glute_specialization_required: boolean | null
          hard_cut_loss_max: number
          hard_cut_loss_min: number
          has_weight_cap: boolean
          id: string
          min_weeks_between_peaks: number
          notes: string | null
          pre_prep_weeks_default: number
          recovery_multiplier: number | null
          red_flag_thresholds: Json | null
          required_health_markers: string[] | null
          reverse_diet_weeks_min: number
          reverse_diet_weeks_recommended: number
          routine_practice_required: boolean | null
          routine_practice_weeks_before_stage: number | null
          stage_bf_max: number
          stage_bf_min: number
          weight_cap_table: Json | null
        }
        Insert: {
          age_group?: Database["public"]["Enums"]["age_group"]
          amenorrhea_is_red_flag?: boolean | null
          athlete_track: Database["public"]["Enums"]["athlete_track"]
          biological_sex: Database["public"]["Enums"]["biological_sex"]
          buffer_weeks_min?: number
          buffer_weeks_recommended?: number
          category: Database["public"]["Enums"]["bodybuilding_category"]
          created_at?: string
          cycle_sync_recommended?: boolean | null
          diet_phase_loss_max: number
          diet_phase_loss_min: number
          final_sharpening_weeks_default?: number
          glute_specialization_required?: boolean | null
          hard_cut_loss_max: number
          hard_cut_loss_min: number
          has_weight_cap?: boolean
          id?: string
          min_weeks_between_peaks: number
          notes?: string | null
          pre_prep_weeks_default?: number
          recovery_multiplier?: number | null
          red_flag_thresholds?: Json | null
          required_health_markers?: string[] | null
          reverse_diet_weeks_min: number
          reverse_diet_weeks_recommended: number
          routine_practice_required?: boolean | null
          routine_practice_weeks_before_stage?: number | null
          stage_bf_max: number
          stage_bf_min: number
          weight_cap_table?: Json | null
        }
        Update: {
          age_group?: Database["public"]["Enums"]["age_group"]
          amenorrhea_is_red_flag?: boolean | null
          athlete_track?: Database["public"]["Enums"]["athlete_track"]
          biological_sex?: Database["public"]["Enums"]["biological_sex"]
          buffer_weeks_min?: number
          buffer_weeks_recommended?: number
          category?: Database["public"]["Enums"]["bodybuilding_category"]
          created_at?: string
          cycle_sync_recommended?: boolean | null
          diet_phase_loss_max?: number
          diet_phase_loss_min?: number
          final_sharpening_weeks_default?: number
          glute_specialization_required?: boolean | null
          hard_cut_loss_max?: number
          hard_cut_loss_min?: number
          has_weight_cap?: boolean
          id?: string
          min_weeks_between_peaks?: number
          notes?: string | null
          pre_prep_weeks_default?: number
          recovery_multiplier?: number | null
          red_flag_thresholds?: Json | null
          required_health_markers?: string[] | null
          reverse_diet_weeks_min?: number
          reverse_diet_weeks_recommended?: number
          routine_practice_required?: boolean | null
          routine_practice_weeks_before_stage?: number | null
          stage_bf_max?: number
          stage_bf_min?: number
          weight_cap_table?: Json | null
        }
        Relationships: []
      }
      meridian_drug_tests: {
        Row: {
          competition_id: string | null
          created_at: string
          federation: string
          id: string
          is_mandatory: boolean
          notes: string | null
          plan_id: string | null
          result: string | null
          scheduled_date: string
          status: string
          test_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          competition_id?: string | null
          created_at?: string
          federation: string
          id?: string
          is_mandatory?: boolean
          notes?: string | null
          plan_id?: string | null
          result?: string | null
          scheduled_date: string
          status?: string
          test_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          competition_id?: string | null
          created_at?: string
          federation?: string
          id?: string
          is_mandatory?: boolean
          notes?: string | null
          plan_id?: string | null
          result?: string | null
          scheduled_date?: string
          status?: string
          test_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meridian_drug_tests_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "meridian_competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meridian_drug_tests_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "meridian_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      meridian_handoffs: {
        Row: {
          applied_at: string | null
          competition_id: string
          created_at: string
          id: string
          notes: string | null
          payload: Json
          phase: string
          plan_id: string
          status: string
          target_module: string
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          competition_id: string
          created_at?: string
          id?: string
          notes?: string | null
          payload?: Json
          phase: string
          plan_id: string
          status?: string
          target_module: string
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_at?: string | null
          competition_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          payload?: Json
          phase?: string
          plan_id?: string
          status?: string
          target_module?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meridian_handoffs_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "meridian_competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meridian_handoffs_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "meridian_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      meridian_lifestyle_routines: {
        Row: {
          cardio_minutes_per_week: number
          created_at: string
          current_phase: string
          id: string
          next_event_date: string | null
          next_event_name: string | null
          notes: string | null
          plan_id: string | null
          step_target_daily: number
          sustainability_score: number | null
          target_bf_max: number
          target_bf_min: number
          training_days_per_week: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cardio_minutes_per_week?: number
          created_at?: string
          current_phase?: string
          id?: string
          next_event_date?: string | null
          next_event_name?: string | null
          notes?: string | null
          plan_id?: string | null
          step_target_daily?: number
          sustainability_score?: number | null
          target_bf_max: number
          target_bf_min: number
          training_days_per_week?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cardio_minutes_per_week?: number
          created_at?: string
          current_phase?: string
          id?: string
          next_event_date?: string | null
          next_event_name?: string | null
          notes?: string | null
          plan_id?: string | null
          step_target_daily?: number
          sustainability_score?: number | null
          target_bf_max?: number
          target_bf_min?: number
          training_days_per_week?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meridian_lifestyle_routines_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "meridian_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      meridian_menstrual_cycle: {
        Row: {
          created_at: string
          current_phase: string | null
          cycle_length_days: number | null
          cycle_start_date: string
          flow_intensity: string | null
          id: string
          menstruation_duration_days: number | null
          notes: string | null
          pms_severity: number | null
          symptoms: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_phase?: string | null
          cycle_length_days?: number | null
          cycle_start_date: string
          flow_intensity?: string | null
          id?: string
          menstruation_duration_days?: number | null
          notes?: string | null
          pms_severity?: number | null
          symptoms?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_phase?: string | null
          cycle_length_days?: number | null
          cycle_start_date?: string
          flow_intensity?: string | null
          id?: string
          menstruation_duration_days?: number | null
          notes?: string | null
          pms_severity?: number | null
          symptoms?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      meridian_multi_show_chains: {
        Row: {
          created_at: string
          gap_days: number
          id: string
          intra_chain_notes: string | null
          mini_refeed_days: number
          primary_competition_id: string
          secondary_competition_id: string
          strategy: string
          updated_at: string
          user_id: string
          viability_status: string
          warnings: Json
        }
        Insert: {
          created_at?: string
          gap_days: number
          id?: string
          intra_chain_notes?: string | null
          mini_refeed_days?: number
          primary_competition_id: string
          secondary_competition_id: string
          strategy?: string
          updated_at?: string
          user_id: string
          viability_status?: string
          warnings?: Json
        }
        Update: {
          created_at?: string
          gap_days?: number
          id?: string
          intra_chain_notes?: string | null
          mini_refeed_days?: number
          primary_competition_id?: string
          secondary_competition_id?: string
          strategy?: string
          updated_at?: string
          user_id?: string
          viability_status?: string
          warnings?: Json
        }
        Relationships: []
      }
      meridian_notifications: {
        Row: {
          body: string | null
          competition_id: string | null
          created_at: string
          dedupe_key: string
          id: string
          kind: string
          payload: Json | null
          plan_id: string | null
          read_at: string | null
          severity: string
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          competition_id?: string | null
          created_at?: string
          dedupe_key: string
          id?: string
          kind: string
          payload?: Json | null
          plan_id?: string | null
          read_at?: string | null
          severity?: string
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          competition_id?: string | null
          created_at?: string
          dedupe_key?: string
          id?: string
          kind?: string
          payload?: Json | null
          plan_id?: string | null
          read_at?: string | null
          severity?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meridian_notifications_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "meridian_competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meridian_notifications_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "meridian_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      meridian_peak_week_protocols: {
        Row: {
          carbs_grams: Json
          competition_id: string
          created_at: string
          id: string
          notes: string | null
          plan_id: string
          posing_minutes: Json
          potassium_mg: Json
          sodium_mg: Json
          start_date: string
          status: string
          tanning_schedule: string | null
          training_focus: Json
          updated_at: string
          user_id: string
          water_liters: Json
        }
        Insert: {
          carbs_grams?: Json
          competition_id: string
          created_at?: string
          id?: string
          notes?: string | null
          plan_id: string
          posing_minutes?: Json
          potassium_mg?: Json
          sodium_mg?: Json
          start_date: string
          status?: string
          tanning_schedule?: string | null
          training_focus?: Json
          updated_at?: string
          user_id: string
          water_liters?: Json
        }
        Update: {
          carbs_grams?: Json
          competition_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          plan_id?: string
          posing_minutes?: Json
          potassium_mg?: Json
          sodium_mg?: Json
          start_date?: string
          status?: string
          tanning_schedule?: string | null
          training_focus?: Json
          updated_at?: string
          user_id?: string
          water_liters?: Json
        }
        Relationships: []
      }
      meridian_plan_adjustments: {
        Row: {
          adjustment_date: string
          adjustment_type: string
          ai_rationale: string | null
          applied_by: string
          carbs_delta_g: number | null
          cardio_delta_min: number | null
          checkpoint_id: string | null
          created_at: string
          fat_delta_g: number | null
          id: string
          kcal_delta: number | null
          plan_id: string
          protein_delta_g: number | null
          reason: string | null
          user_id: string
        }
        Insert: {
          adjustment_date?: string
          adjustment_type: string
          ai_rationale?: string | null
          applied_by?: string
          carbs_delta_g?: number | null
          cardio_delta_min?: number | null
          checkpoint_id?: string | null
          created_at?: string
          fat_delta_g?: number | null
          id?: string
          kcal_delta?: number | null
          plan_id: string
          protein_delta_g?: number | null
          reason?: string | null
          user_id: string
        }
        Update: {
          adjustment_date?: string
          adjustment_type?: string
          ai_rationale?: string | null
          applied_by?: string
          carbs_delta_g?: number | null
          cardio_delta_min?: number | null
          checkpoint_id?: string | null
          created_at?: string
          fat_delta_g?: number | null
          id?: string
          kcal_delta?: number | null
          plan_id?: string
          protein_delta_g?: number | null
          reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "meridian_plan_adjustments_checkpoint_id_fkey"
            columns: ["checkpoint_id"]
            isOneToOne: false
            referencedRelation: "meridian_weekly_checkpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meridian_plan_adjustments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "meridian_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      meridian_plans: {
        Row: {
          buffer_weeks: number
          build_phase_start_date: string | null
          calculation_inputs: Json | null
          competition_id: string
          created_at: string
          diet_phase_start_date: string | null
          final_sharpening_start_date: string
          generated_by: string | null
          hard_cut_start_date: string | null
          id: string
          is_active: boolean
          off_season_end_date: string
          peak_week_start_date: string
          plan_strategy: string
          post_stage_recovery_end_date: string
          pre_prep_start_date: string
          projected_fat_loss_kg: number | null
          projected_lean_gain_kg: number | null
          refine_phase_start_date: string | null
          stage_target_bf_percent: number
          stage_target_weight_kg: number
          total_weeks_to_stage: number
          user_id: string
          version: number
          viability_status: string | null
          warnings: string[] | null
        }
        Insert: {
          buffer_weeks?: number
          build_phase_start_date?: string | null
          calculation_inputs?: Json | null
          competition_id: string
          created_at?: string
          diet_phase_start_date?: string | null
          final_sharpening_start_date: string
          generated_by?: string | null
          hard_cut_start_date?: string | null
          id?: string
          is_active?: boolean
          off_season_end_date: string
          peak_week_start_date: string
          plan_strategy?: string
          post_stage_recovery_end_date: string
          pre_prep_start_date: string
          projected_fat_loss_kg?: number | null
          projected_lean_gain_kg?: number | null
          refine_phase_start_date?: string | null
          stage_target_bf_percent: number
          stage_target_weight_kg: number
          total_weeks_to_stage: number
          user_id: string
          version?: number
          viability_status?: string | null
          warnings?: string[] | null
        }
        Update: {
          buffer_weeks?: number
          build_phase_start_date?: string | null
          calculation_inputs?: Json | null
          competition_id?: string
          created_at?: string
          diet_phase_start_date?: string | null
          final_sharpening_start_date?: string
          generated_by?: string | null
          hard_cut_start_date?: string | null
          id?: string
          is_active?: boolean
          off_season_end_date?: string
          peak_week_start_date?: string
          plan_strategy?: string
          post_stage_recovery_end_date?: string
          pre_prep_start_date?: string
          projected_fat_loss_kg?: number | null
          projected_lean_gain_kg?: number | null
          refine_phase_start_date?: string | null
          stage_target_bf_percent?: number
          stage_target_weight_kg?: number
          total_weeks_to_stage?: number
          user_id?: string
          version?: number
          viability_status?: string | null
          warnings?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "meridian_plans_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "meridian_competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      meridian_post_stage_recovery: {
        Row: {
          binge_risk_level: string
          competition_id: string
          created_at: string
          id: string
          mental_health_check: Json
          notes: string | null
          plan_id: string
          recovery_start_date: string
          recovery_weeks: number
          refeed_days_per_week: number
          reverse_diet_kcal_step: number
          training_deload_weeks: number
          updated_at: string
          user_id: string
          weekly_kcal_targets: Json
        }
        Insert: {
          binge_risk_level?: string
          competition_id: string
          created_at?: string
          id?: string
          mental_health_check?: Json
          notes?: string | null
          plan_id: string
          recovery_start_date: string
          recovery_weeks?: number
          refeed_days_per_week?: number
          reverse_diet_kcal_step?: number
          training_deload_weeks?: number
          updated_at?: string
          user_id: string
          weekly_kcal_targets?: Json
        }
        Update: {
          binge_risk_level?: string
          competition_id?: string
          created_at?: string
          id?: string
          mental_health_check?: Json
          notes?: string | null
          plan_id?: string
          recovery_start_date?: string
          recovery_weeks?: number
          refeed_days_per_week?: number
          reverse_diet_kcal_step?: number
          training_deload_weeks?: number
          updated_at?: string
          user_id?: string
          weekly_kcal_targets?: Json
        }
        Relationships: []
      }
      meridian_telemetry: {
        Row: {
          created_at: string
          event_data: Json
          event_type: string
          id: string
          plan_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_data?: Json
          event_type: string
          id?: string
          plan_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_data?: Json
          event_type?: string
          id?: string
          plan_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      meridian_triad_log: {
        Row: {
          body_temp_morning: number | null
          bone_density_z_score: number | null
          competition_id: string | null
          created_at: string
          energy_availability_kcal_per_kg_lbm: number | null
          estradiol: number | null
          ferritin: number | null
          flags: string[] | null
          id: string
          log_date: string
          menstrual_status:
            | Database["public"]["Enums"]["menstrual_status"]
            | null
          months_since_menstruation: number | null
          notes: string | null
          resting_hr: number | null
          severity: string
          tsh: number | null
          user_id: string
          weight_loss_rate_pct_per_week: number | null
        }
        Insert: {
          body_temp_morning?: number | null
          bone_density_z_score?: number | null
          competition_id?: string | null
          created_at?: string
          energy_availability_kcal_per_kg_lbm?: number | null
          estradiol?: number | null
          ferritin?: number | null
          flags?: string[] | null
          id?: string
          log_date?: string
          menstrual_status?:
            | Database["public"]["Enums"]["menstrual_status"]
            | null
          months_since_menstruation?: number | null
          notes?: string | null
          resting_hr?: number | null
          severity?: string
          tsh?: number | null
          user_id: string
          weight_loss_rate_pct_per_week?: number | null
        }
        Update: {
          body_temp_morning?: number | null
          bone_density_z_score?: number | null
          competition_id?: string | null
          created_at?: string
          energy_availability_kcal_per_kg_lbm?: number | null
          estradiol?: number | null
          ferritin?: number | null
          flags?: string[] | null
          id?: string
          log_date?: string
          menstrual_status?:
            | Database["public"]["Enums"]["menstrual_status"]
            | null
          months_since_menstruation?: number | null
          notes?: string | null
          resting_hr?: number | null
          severity?: string
          tsh?: number | null
          user_id?: string
          weight_loss_rate_pct_per_week?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "meridian_triad_log_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "meridian_competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      meridian_weekly_checkpoints: {
        Row: {
          adherence_pct: number | null
          ai_assessment: Json | null
          bf_percent: number | null
          checkpoint_date: string
          competition_id: string | null
          created_at: string
          current_phase: string | null
          energy_level: number | null
          hunger_level: number | null
          id: string
          mood: number | null
          notes: string | null
          photo_back_url: string | null
          photo_front_url: string | null
          photo_side_url: string | null
          plan_id: string | null
          sleep_quality: number | null
          training_performance: number | null
          updated_at: string
          user_id: string
          waist_cm: number | null
          week_number: number | null
          weight_kg: number | null
        }
        Insert: {
          adherence_pct?: number | null
          ai_assessment?: Json | null
          bf_percent?: number | null
          checkpoint_date?: string
          competition_id?: string | null
          created_at?: string
          current_phase?: string | null
          energy_level?: number | null
          hunger_level?: number | null
          id?: string
          mood?: number | null
          notes?: string | null
          photo_back_url?: string | null
          photo_front_url?: string | null
          photo_side_url?: string | null
          plan_id?: string | null
          sleep_quality?: number | null
          training_performance?: number | null
          updated_at?: string
          user_id: string
          waist_cm?: number | null
          week_number?: number | null
          weight_kg?: number | null
        }
        Update: {
          adherence_pct?: number | null
          ai_assessment?: Json | null
          bf_percent?: number | null
          checkpoint_date?: string
          competition_id?: string | null
          created_at?: string
          current_phase?: string | null
          energy_level?: number | null
          hunger_level?: number | null
          id?: string
          mood?: number | null
          notes?: string | null
          photo_back_url?: string | null
          photo_front_url?: string | null
          photo_side_url?: string | null
          plan_id?: string | null
          sleep_quality?: number | null
          training_performance?: number | null
          updated_at?: string
          user_id?: string
          waist_cm?: number | null
          week_number?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "meridian_weekly_checkpoints_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "meridian_competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meridian_weekly_checkpoints_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "meridian_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      metabolicon_conversations: {
        Row: {
          ai_source: string | null
          created_at: string | null
          id: string
          message: string
          response: string
          route: string | null
          user_id: string
        }
        Insert: {
          ai_source?: string | null
          created_at?: string | null
          id?: string
          message: string
          response: string
          route?: string | null
          user_id: string
        }
        Update: {
          ai_source?: string | null
          created_at?: string | null
          id?: string
          message?: string
          response?: string
          route?: string | null
          user_id?: string
        }
        Relationships: []
      }
      microbioma_logs: {
        Row: {
          analise_ia: string | null
          classificacao: string
          created_at: string | null
          id: string
          meta_fibras_g: number | null
          perfil_snapshot: Json | null
          score: number
          sintomas: string[]
          user_id: string
        }
        Insert: {
          analise_ia?: string | null
          classificacao?: string
          created_at?: string | null
          id?: string
          meta_fibras_g?: number | null
          perfil_snapshot?: Json | null
          score?: number
          sintomas?: string[]
          user_id: string
        }
        Update: {
          analise_ia?: string | null
          classificacao?: string
          created_at?: string | null
          id?: string
          meta_fibras_g?: number | null
          perfil_snapshot?: Json | null
          score?: number
          sintomas?: string[]
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
      muscle_state_checkins: {
        Row: {
          checkin_date: string
          created_at: string | null
          id: string
          state: string
          user_id: string
        }
        Insert: {
          checkin_date?: string
          created_at?: string | null
          id?: string
          state: string
          user_id: string
        }
        Update: {
          checkin_date?: string
          created_at?: string | null
          id?: string
          state?: string
          user_id?: string
        }
        Relationships: []
      }
      nexus_bio_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      nexus_compounds: {
        Row: {
          analise_offlabel: string | null
          aplicacoes_clinicas: string | null
          aplicacoes_offlabel: string | null
          briefing_rapido: string | null
          classe: string
          created_at: string
          created_by: string | null
          editorial_estudo_semana: string | null
          estudos_chave: Json | null
          familia_farmacologica: string | null
          id: string
          lacunas_evidencia: string | null
          mapa_sinergias: string | null
          mecanismo_acao: string | null
          nivel_evidencia: string | null
          nome: string
          nome_quimico: string | null
          origem: string | null
          perfil_seguranca: Json | null
          protocolos: Json | null
          sinergias: Json | null
          sinonimos: string[] | null
          status_regulatorio: string | null
          status_regulatorio_paises: Json | null
          take_nexus: string | null
          updated_at: string
          uso_performance: string | null
        }
        Insert: {
          analise_offlabel?: string | null
          aplicacoes_clinicas?: string | null
          aplicacoes_offlabel?: string | null
          briefing_rapido?: string | null
          classe?: string
          created_at?: string
          created_by?: string | null
          editorial_estudo_semana?: string | null
          estudos_chave?: Json | null
          familia_farmacologica?: string | null
          id?: string
          lacunas_evidencia?: string | null
          mapa_sinergias?: string | null
          mecanismo_acao?: string | null
          nivel_evidencia?: string | null
          nome: string
          nome_quimico?: string | null
          origem?: string | null
          perfil_seguranca?: Json | null
          protocolos?: Json | null
          sinergias?: Json | null
          sinonimos?: string[] | null
          status_regulatorio?: string | null
          status_regulatorio_paises?: Json | null
          take_nexus?: string | null
          updated_at?: string
          uso_performance?: string | null
        }
        Update: {
          analise_offlabel?: string | null
          aplicacoes_clinicas?: string | null
          aplicacoes_offlabel?: string | null
          briefing_rapido?: string | null
          classe?: string
          created_at?: string
          created_by?: string | null
          editorial_estudo_semana?: string | null
          estudos_chave?: Json | null
          familia_farmacologica?: string | null
          id?: string
          lacunas_evidencia?: string | null
          mapa_sinergias?: string | null
          mecanismo_acao?: string | null
          nivel_evidencia?: string | null
          nome?: string
          nome_quimico?: string | null
          origem?: string | null
          perfil_seguranca?: Json | null
          protocolos?: Json | null
          sinergias?: Json | null
          sinonimos?: string[] | null
          status_regulatorio?: string | null
          status_regulatorio_paises?: Json | null
          take_nexus?: string | null
          updated_at?: string
          uso_performance?: string | null
        }
        Relationships: []
      }
      nootropic_daily_logs: {
        Row: {
          adherence_score: number | null
          created_at: string | null
          id: string
          items_taken: Json | null
          log_date: string | null
          user_id: string
        }
        Insert: {
          adherence_score?: number | null
          created_at?: string | null
          id?: string
          items_taken?: Json | null
          log_date?: string | null
          user_id: string
        }
        Update: {
          adherence_score?: number | null
          created_at?: string | null
          id?: string
          items_taken?: Json | null
          log_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      nootropic_stacks: {
        Row: {
          caffeine_tolerance: string | null
          challenge: string | null
          created_at: string | null
          generated_stack: Json | null
          health_conditions: string[] | null
          id: string
          objective: string | null
          user_id: string
        }
        Insert: {
          caffeine_tolerance?: string | null
          challenge?: string | null
          created_at?: string | null
          generated_stack?: Json | null
          health_conditions?: string[] | null
          id?: string
          objective?: string | null
          user_id: string
        }
        Update: {
          caffeine_tolerance?: string | null
          challenge?: string | null
          created_at?: string | null
          generated_stack?: Json | null
          health_conditions?: string[] | null
          id?: string
          objective?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string | null
          created_at: string
          id: string
          metadata: Json | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          body?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          body?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      nutry_sync_log: {
        Row: {
          alteracoes: Json | null
          created_at: string | null
          data: string | null
          id: string
          trigger: string | null
          user_id: string
        }
        Insert: {
          alteracoes?: Json | null
          created_at?: string | null
          data?: string | null
          id?: string
          trigger?: string | null
          user_id: string
        }
        Update: {
          alteracoes?: Json | null
          created_at?: string | null
          data?: string | null
          id?: string
          trigger?: string | null
          user_id?: string
        }
        Relationships: []
      }
      partner_gyms: {
        Row: {
          active: boolean
          address: string | null
          challenge_slug: string | null
          city: string | null
          closed_at: string | null
          coach_profile_id: string | null
          coach_user_id: string
          commission_percent: number
          contact_name: string | null
          contact_phone: string | null
          contacted_at: string | null
          created_at: string
          estimated_members: number | null
          followup_paused: boolean
          gym_type: string | null
          id: string
          instagram: string | null
          name: string
          neighborhood: string | null
          next_followup_at: string | null
          notes: string | null
          owner_name: string | null
          owner_phone: string | null
          status: string
          updated_at: string
          visited_at: string | null
        }
        Insert: {
          active?: boolean
          address?: string | null
          challenge_slug?: string | null
          city?: string | null
          closed_at?: string | null
          coach_profile_id?: string | null
          coach_user_id: string
          commission_percent?: number
          contact_name?: string | null
          contact_phone?: string | null
          contacted_at?: string | null
          created_at?: string
          estimated_members?: number | null
          followup_paused?: boolean
          gym_type?: string | null
          id?: string
          instagram?: string | null
          name: string
          neighborhood?: string | null
          next_followup_at?: string | null
          notes?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          status?: string
          updated_at?: string
          visited_at?: string | null
        }
        Update: {
          active?: boolean
          address?: string | null
          challenge_slug?: string | null
          city?: string | null
          closed_at?: string | null
          coach_profile_id?: string | null
          coach_user_id?: string
          commission_percent?: number
          contact_name?: string | null
          contact_phone?: string | null
          contacted_at?: string | null
          created_at?: string
          estimated_members?: number | null
          followup_paused?: boolean
          gym_type?: string | null
          id?: string
          instagram?: string | null
          name?: string
          neighborhood?: string | null
          next_followup_at?: string | null
          notes?: string | null
          owner_name?: string | null
          owner_phone?: string | null
          status?: string
          updated_at?: string
          visited_at?: string | null
        }
        Relationships: []
      }
      partner_sessions: {
        Row: {
          created_at: string | null
          device_info: string | null
          id: string
          ip_address: string | null
          last_active: string | null
          partner_id: string | null
          session_token: string
        }
        Insert: {
          created_at?: string | null
          device_info?: string | null
          id?: string
          ip_address?: string | null
          last_active?: string | null
          partner_id?: string | null
          session_token: string
        }
        Update: {
          created_at?: string | null
          device_info?: string | null
          id?: string
          ip_address?: string | null
          last_active?: string | null
          partner_id?: string | null
          session_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_sessions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partners: {
        Row: {
          commission_total: number | null
          created_at: string | null
          created_by: string | null
          email: string
          full_name: string
          id: string
          internal_note: string | null
          modules: string[] | null
          plan: string | null
          referral_count: number | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          commission_total?: number | null
          created_at?: string | null
          created_by?: string | null
          email: string
          full_name: string
          id?: string
          internal_note?: string | null
          modules?: string[] | null
          plan?: string | null
          referral_count?: number | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          commission_total?: number | null
          created_at?: string | null
          created_by?: string | null
          email?: string
          full_name?: string
          id?: string
          internal_note?: string | null
          modules?: string[] | null
          plan?: string | null
          referral_count?: number | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      patient_team: {
        Row: {
          accepted_at: string | null
          created_at: string
          id: string
          invite_message: string | null
          invited_by: string | null
          patient_consent: boolean
          patient_consent_at: string | null
          patient_id: string
          permissions: Json
          professional_id: string
          professional_role: Database["public"]["Enums"]["professional_role"]
          status: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invite_message?: string | null
          invited_by?: string | null
          patient_consent?: boolean
          patient_consent_at?: string | null
          patient_id: string
          permissions?: Json
          professional_id: string
          professional_role: Database["public"]["Enums"]["professional_role"]
          status?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invite_message?: string | null
          invited_by?: string | null
          patient_consent?: boolean
          patient_consent_at?: string | null
          patient_id?: string
          permissions?: Json
          professional_id?: string
          professional_role?: Database["public"]["Enums"]["professional_role"]
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      patient_timeline: {
        Row: {
          actor_id: string | null
          actor_name: string | null
          actor_role: Database["public"]["Enums"]["professional_role"] | null
          created_at: string
          data_category: string | null
          description: string | null
          event_type: string
          id: string
          metadata: Json
          patient_id: string
          title: string
        }
        Insert: {
          actor_id?: string | null
          actor_name?: string | null
          actor_role?: Database["public"]["Enums"]["professional_role"] | null
          created_at?: string
          data_category?: string | null
          description?: string | null
          event_type: string
          id?: string
          metadata?: Json
          patient_id: string
          title: string
        }
        Update: {
          actor_id?: string | null
          actor_name?: string | null
          actor_role?: Database["public"]["Enums"]["professional_role"] | null
          created_at?: string
          data_category?: string | null
          description?: string | null
          event_type?: string
          id?: string
          metadata?: Json
          patient_id?: string
          title?: string
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
      peptide_search_history: {
        Row: {
          created_at: string
          id: string
          query: string
          result_summary: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          query: string
          result_summary?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          query?: string
          result_summary?: string | null
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
      personal_records: {
        Row: {
          created_at: string | null
          data: string | null
          exercise_name: string
          id: string
          notas: string | null
          peso_maximo: number | null
          reps_com_peso: number | null
          user_id: string
          volume_serie: number | null
        }
        Insert: {
          created_at?: string | null
          data?: string | null
          exercise_name: string
          id?: string
          notas?: string | null
          peso_maximo?: number | null
          reps_com_peso?: number | null
          user_id: string
          volume_serie?: number | null
        }
        Update: {
          created_at?: string | null
          data?: string | null
          exercise_name?: string
          id?: string
          notas?: string | null
          peso_maximo?: number | null
          reps_com_peso?: number | null
          user_id?: string
          volume_serie?: number | null
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
      plano_comparacoes_historico: {
        Row: {
          coach_id: string
          created_at: string
          id: string
          modo_principal: string
          objetivo: string | null
          observacao: string | null
          patient_name: string | null
          plano_a: Json
          plano_b: Json
          resumo: Json | null
        }
        Insert: {
          coach_id: string
          created_at?: string
          id?: string
          modo_principal?: string
          objetivo?: string | null
          observacao?: string | null
          patient_name?: string | null
          plano_a: Json
          plano_b: Json
          resumo?: Json | null
        }
        Update: {
          coach_id?: string
          created_at?: string
          id?: string
          modo_principal?: string
          objetivo?: string | null
          observacao?: string | null
          patient_name?: string | null
          plano_a?: Json
          plano_b?: Json
          resumo?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "plano_comparacoes_historico_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plateau_protocols: {
        Row: {
          ajustes: Json | null
          applied_at: string
          athlete_id: string
          created_at: string
          exercise_name: string
          id: string
          protocol_type: string
          resolved_at: string | null
          resultado: string | null
          score: number | null
          sinais: Json | null
        }
        Insert: {
          ajustes?: Json | null
          applied_at?: string
          athlete_id: string
          created_at?: string
          exercise_name: string
          id?: string
          protocol_type: string
          resolved_at?: string | null
          resultado?: string | null
          score?: number | null
          sinais?: Json | null
        }
        Update: {
          ajustes?: Json | null
          applied_at?: string
          athlete_id?: string
          created_at?: string
          exercise_name?: string
          id?: string
          protocol_type?: string
          resolved_at?: string | null
          resultado?: string | null
          score?: number | null
          sinais?: Json | null
        }
        Relationships: []
      }
      postural_photos: {
        Row: {
          category: string
          created_at: string
          id: string
          notes: string | null
          photo_date: string
          photo_url: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          notes?: string | null
          photo_date?: string
          photo_url: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          notes?: string | null
          photo_date?: string
          photo_url?: string
          user_id?: string
        }
        Relationships: []
      }
      praxis_conversations: {
        Row: {
          athlete_id: string
          created_at: string
          id: string
          message_praxis: string
          message_user: string
          topic: string | null
        }
        Insert: {
          athlete_id: string
          created_at?: string
          id?: string
          message_praxis: string
          message_user: string
          topic?: string | null
        }
        Update: {
          athlete_id?: string
          created_at?: string
          id?: string
          message_praxis?: string
          message_user?: string
          topic?: string | null
        }
        Relationships: []
      }
      prism_analyses: {
        Row: {
          ai_analysis: Json | null
          ai_content: Json | null
          ai_decision: Json | null
          coach_id: string
          context: string | null
          created_at: string
          file_types: string[]
          files_count: number
          format_used: string | null
          id: string
          mode: string | null
          objective_used: string | null
          product_mentioned: string | null
          published: boolean
          published_at: string | null
          sale_level: string | null
          saved: boolean
          subtype: string | null
          tone_used: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          ai_content?: Json | null
          ai_decision?: Json | null
          coach_id: string
          context?: string | null
          created_at?: string
          file_types?: string[]
          files_count?: number
          format_used?: string | null
          id?: string
          mode?: string | null
          objective_used?: string | null
          product_mentioned?: string | null
          published?: boolean
          published_at?: string | null
          sale_level?: string | null
          saved?: boolean
          subtype?: string | null
          tone_used?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          ai_content?: Json | null
          ai_decision?: Json | null
          coach_id?: string
          context?: string | null
          created_at?: string
          file_types?: string[]
          files_count?: number
          format_used?: string | null
          id?: string
          mode?: string | null
          objective_used?: string | null
          product_mentioned?: string | null
          published?: boolean
          published_at?: string | null
          sale_level?: string | null
          saved?: boolean
          subtype?: string | null
          tone_used?: string | null
        }
        Relationships: []
      }
      professional_alerts: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          message: string
          patient_id: string
          status: string
          target_professional: string
          trigger_type: string
          triggered_by: string | null
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          message: string
          patient_id: string
          status?: string
          target_professional: string
          trigger_type: string
          triggered_by?: string | null
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          message?: string
          patient_id?: string
          status?: string
          target_professional?: string
          trigger_type?: string
          triggered_by?: string | null
        }
        Relationships: []
      }
      professional_invites: {
        Row: {
          accepted_at: string | null
          accepted_by_user_id: string | null
          coach_profile_id: string
          created_at: string
          email: string | null
          expires_at: string
          id: string
          invite_code: string
          message: string | null
          status: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          coach_profile_id: string
          created_at?: string
          email?: string | null
          expires_at?: string
          id?: string
          invite_code?: string
          message?: string | null
          status?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by_user_id?: string | null
          coach_profile_id?: string
          created_at?: string
          email?: string | null
          expires_at?: string
          id?: string
          invite_code?: string
          message?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_invites_coach_profile_id_fkey"
            columns: ["coach_profile_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_notes: {
        Row: {
          author_id: string
          author_role: Database["public"]["Enums"]["professional_role"]
          content: string
          created_at: string
          id: string
          patient_id: string
          updated_at: string
          visibility: string
        }
        Insert: {
          author_id: string
          author_role: Database["public"]["Enums"]["professional_role"]
          content: string
          created_at?: string
          id?: string
          patient_id: string
          updated_at?: string
          visibility?: string
        }
        Update: {
          author_id?: string
          author_role?: Database["public"]["Enums"]["professional_role"]
          content?: string
          created_at?: string
          id?: string
          patient_id?: string
          updated_at?: string
          visibility?: string
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
          abw_factor: number | null
          activation_completed: boolean | null
          active_protocol: string | null
          activity_level: string | null
          adjusted_weight_kg: number | null
          age: number | null
          avatar_url: string | null
          bf_percent: number | null
          body_profile: string | null
          carbs_g: number | null
          challenge_id: string | null
          coach_notes: string | null
          coach_profile_id: string | null
          comorbidities: string[] | null
          created_at: string
          created_by: string | null
          date_of_birth: string | null
          dietary_restrictions: string[] | null
          email: string | null
          fat_distribution: string | null
          fat_g: number | null
          features_override: Json | null
          first_meal_registered: boolean | null
          full_name: string | null
          geb_kcal: number | null
          get_kcal: number | null
          goal: string | null
          gym_id: string | null
          health_conditions: string[] | null
          height_cm: number | null
          id: string
          ideal_weight_kg: number | null
          last_streak_date: string | null
          lean_mass_kg: number | null
          level: number | null
          meta_peso: number | null
          migrated_at: string | null
          migrated_from_challenge: boolean
          muscle_development: string | null
          nivel_treino: string | null
          nutrition_periodization: Json | null
          nutritional_priorities: string[] | null
          objetivo_principal: string | null
          onboarding_completed: boolean | null
          orcamento_semanal: number | null
          origin: string
          perfil_comportamental: string | null
          phone: string | null
          plano_atual: string | null
          prefere_refeicoes: string | null
          professional_role:
            | Database["public"]["Enums"]["professional_role"]
            | null
          professional_type: string | null
          profile_analyzed_at: string | null
          profile_source: string | null
          protein_g: number | null
          protein_reference: string | null
          registration_number: string | null
          registration_type: string | null
          role: string | null
          sex: string | null
          sodium_target_mg: number | null
          special_conditions: string[]
          sport: string | null
          streak_days: number | null
          training_frequency: number | null
          trial_ends_at: string | null
          updated_at: string
          user_id: string
          uses_glp1: boolean | null
          vet_kcal: number | null
          visual_indicators: string[] | null
          waist_cm: number | null
          weight_kg: number | null
          xp: number | null
        }
        Insert: {
          abw_factor?: number | null
          activation_completed?: boolean | null
          active_protocol?: string | null
          activity_level?: string | null
          adjusted_weight_kg?: number | null
          age?: number | null
          avatar_url?: string | null
          bf_percent?: number | null
          body_profile?: string | null
          carbs_g?: number | null
          challenge_id?: string | null
          coach_notes?: string | null
          coach_profile_id?: string | null
          comorbidities?: string[] | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          dietary_restrictions?: string[] | null
          email?: string | null
          fat_distribution?: string | null
          fat_g?: number | null
          features_override?: Json | null
          first_meal_registered?: boolean | null
          full_name?: string | null
          geb_kcal?: number | null
          get_kcal?: number | null
          goal?: string | null
          gym_id?: string | null
          health_conditions?: string[] | null
          height_cm?: number | null
          id?: string
          ideal_weight_kg?: number | null
          last_streak_date?: string | null
          lean_mass_kg?: number | null
          level?: number | null
          meta_peso?: number | null
          migrated_at?: string | null
          migrated_from_challenge?: boolean
          muscle_development?: string | null
          nivel_treino?: string | null
          nutrition_periodization?: Json | null
          nutritional_priorities?: string[] | null
          objetivo_principal?: string | null
          onboarding_completed?: boolean | null
          orcamento_semanal?: number | null
          origin?: string
          perfil_comportamental?: string | null
          phone?: string | null
          plano_atual?: string | null
          prefere_refeicoes?: string | null
          professional_role?:
            | Database["public"]["Enums"]["professional_role"]
            | null
          professional_type?: string | null
          profile_analyzed_at?: string | null
          profile_source?: string | null
          protein_g?: number | null
          protein_reference?: string | null
          registration_number?: string | null
          registration_type?: string | null
          role?: string | null
          sex?: string | null
          sodium_target_mg?: number | null
          special_conditions?: string[]
          sport?: string | null
          streak_days?: number | null
          training_frequency?: number | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
          uses_glp1?: boolean | null
          vet_kcal?: number | null
          visual_indicators?: string[] | null
          waist_cm?: number | null
          weight_kg?: number | null
          xp?: number | null
        }
        Update: {
          abw_factor?: number | null
          activation_completed?: boolean | null
          active_protocol?: string | null
          activity_level?: string | null
          adjusted_weight_kg?: number | null
          age?: number | null
          avatar_url?: string | null
          bf_percent?: number | null
          body_profile?: string | null
          carbs_g?: number | null
          challenge_id?: string | null
          coach_notes?: string | null
          coach_profile_id?: string | null
          comorbidities?: string[] | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          dietary_restrictions?: string[] | null
          email?: string | null
          fat_distribution?: string | null
          fat_g?: number | null
          features_override?: Json | null
          first_meal_registered?: boolean | null
          full_name?: string | null
          geb_kcal?: number | null
          get_kcal?: number | null
          goal?: string | null
          gym_id?: string | null
          health_conditions?: string[] | null
          height_cm?: number | null
          id?: string
          ideal_weight_kg?: number | null
          last_streak_date?: string | null
          lean_mass_kg?: number | null
          level?: number | null
          meta_peso?: number | null
          migrated_at?: string | null
          migrated_from_challenge?: boolean
          muscle_development?: string | null
          nivel_treino?: string | null
          nutrition_periodization?: Json | null
          nutritional_priorities?: string[] | null
          objetivo_principal?: string | null
          onboarding_completed?: boolean | null
          orcamento_semanal?: number | null
          origin?: string
          perfil_comportamental?: string | null
          phone?: string | null
          plano_atual?: string | null
          prefere_refeicoes?: string | null
          professional_role?:
            | Database["public"]["Enums"]["professional_role"]
            | null
          professional_type?: string | null
          profile_analyzed_at?: string | null
          profile_source?: string | null
          protein_g?: number | null
          protein_reference?: string | null
          registration_number?: string | null
          registration_type?: string | null
          role?: string | null
          sex?: string | null
          sodium_target_mg?: number | null
          special_conditions?: string[]
          sport?: string | null
          streak_days?: number | null
          training_frequency?: number | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
          uses_glp1?: boolean | null
          vet_kcal?: number | null
          visual_indicators?: string[] | null
          waist_cm?: number | null
          weight_kg?: number | null
          xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "gym_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_coach_profile_id_fkey"
            columns: ["coach_profile_id"]
            isOneToOne: false
            referencedRelation: "coach_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "partner_gyms"
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
      progression_log: {
        Row: {
          acao_tomada: string | null
          carga_atual: number | null
          created_at: string | null
          data: string | null
          exercise_id: string | null
          id: string
          reps_atual: number | null
          rir_medio: number | null
          sugestao_ia: string | null
          user_id: string
          volume_serie: number | null
        }
        Insert: {
          acao_tomada?: string | null
          carga_atual?: number | null
          created_at?: string | null
          data?: string | null
          exercise_id?: string | null
          id?: string
          reps_atual?: number | null
          rir_medio?: number | null
          sugestao_ia?: string | null
          user_id: string
          volume_serie?: number | null
        }
        Update: {
          acao_tomada?: string | null
          carga_atual?: number | null
          created_at?: string | null
          data?: string | null
          exercise_id?: string | null
          id?: string
          reps_atual?: number | null
          rir_medio?: number | null
          sugestao_ia?: string | null
          user_id?: string
          volume_serie?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "progression_log_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      protocol_phases: {
        Row: {
          carb_cycling: boolean | null
          carbs_g: number | null
          cardio_protocol: string | null
          coach_id: string
          color: string | null
          completion_notes: string | null
          completion_rating: number | null
          created_at: string
          emoji: string | null
          end_date: string
          fat_g: number | null
          id: string
          kcal: number | null
          name: string
          patient_user_id: string
          phase_type: string
          protein_g: number | null
          refeed_protocol: string | null
          start_date: string
          status: string
          target_body_fat: number | null
          target_weight_kg: number | null
          template_id: string | null
          updated_at: string
          visible_to_patient: boolean | null
        }
        Insert: {
          carb_cycling?: boolean | null
          carbs_g?: number | null
          cardio_protocol?: string | null
          coach_id: string
          color?: string | null
          completion_notes?: string | null
          completion_rating?: number | null
          created_at?: string
          emoji?: string | null
          end_date: string
          fat_g?: number | null
          id?: string
          kcal?: number | null
          name: string
          patient_user_id: string
          phase_type?: string
          protein_g?: number | null
          refeed_protocol?: string | null
          start_date: string
          status?: string
          target_body_fat?: number | null
          target_weight_kg?: number | null
          template_id?: string | null
          updated_at?: string
          visible_to_patient?: boolean | null
        }
        Update: {
          carb_cycling?: boolean | null
          carbs_g?: number | null
          cardio_protocol?: string | null
          coach_id?: string
          color?: string | null
          completion_notes?: string | null
          completion_rating?: number | null
          created_at?: string
          emoji?: string | null
          end_date?: string
          fat_g?: number | null
          id?: string
          kcal?: number | null
          name?: string
          patient_user_id?: string
          phase_type?: string
          protein_g?: number | null
          refeed_protocol?: string | null
          start_date?: string
          status?: string
          target_body_fat?: number | null
          target_weight_kg?: number | null
          template_id?: string | null
          updated_at?: string
          visible_to_patient?: boolean | null
        }
        Relationships: []
      }
      protocol_reviews: {
        Row: {
          approved_at: string | null
          athlete_id: string | null
          coach_id: string
          created_at: string
          final_protocol: string | null
          id: string
          messages: Json
          protocol_id: string | null
          protocol_version: number
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          athlete_id?: string | null
          coach_id: string
          created_at?: string
          final_protocol?: string | null
          id?: string
          messages?: Json
          protocol_id?: string | null
          protocol_version?: number
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          athlete_id?: string | null
          coach_id?: string
          created_at?: string
          final_protocol?: string | null
          id?: string
          messages?: Json
          protocol_id?: string | null
          protocol_version?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      protocol_suggestions: {
        Row: {
          analysis: string | null
          approved_at: string | null
          approved_option: number | null
          athlete_id: string
          category: string | null
          coach_id: string | null
          created_at: string
          custom_action: string | null
          id: string
          options: Json
          reasoning: string | null
          rule_id: string
          severity: string
          snoozed_until: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          analysis?: string | null
          approved_at?: string | null
          approved_option?: number | null
          athlete_id: string
          category?: string | null
          coach_id?: string | null
          created_at?: string
          custom_action?: string | null
          id?: string
          options?: Json
          reasoning?: string | null
          rule_id: string
          severity?: string
          snoozed_until?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          analysis?: string | null
          approved_at?: string | null
          approved_option?: number | null
          athlete_id?: string
          category?: string | null
          coach_id?: string | null
          created_at?: string
          custom_action?: string | null
          id?: string
          options?: Json
          reasoning?: string | null
          rule_id?: string
          severity?: string
          snoozed_until?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      protocolo_envios: {
        Row: {
          coach_id: string
          conteudo_ids: Json | null
          created_at: string
          destinatario_id: string
          id: string
          observacao: string | null
          status: string
          tipo_conteudo: string[]
          tipo_destinatario: string
        }
        Insert: {
          coach_id: string
          conteudo_ids?: Json | null
          created_at?: string
          destinatario_id: string
          id?: string
          observacao?: string | null
          status?: string
          tipo_conteudo?: string[]
          tipo_destinatario: string
        }
        Update: {
          coach_id?: string
          conteudo_ids?: Json | null
          created_at?: string
          destinatario_id?: string
          id?: string
          observacao?: string | null
          status?: string
          tipo_conteudo?: string[]
          tipo_destinatario?: string
        }
        Relationships: []
      }
      reels_variations: {
        Row: {
          analysis_id: string | null
          coach_id: string
          content: string
          created_at: string
          id: string
          is_winner: boolean
          kind: string
          label: string | null
          likes: number | null
          notes: string | null
          saves: number | null
          updated_at: string
          views: number | null
        }
        Insert: {
          analysis_id?: string | null
          coach_id: string
          content: string
          created_at?: string
          id?: string
          is_winner?: boolean
          kind: string
          label?: string | null
          likes?: number | null
          notes?: string | null
          saves?: number | null
          updated_at?: string
          views?: number | null
        }
        Update: {
          analysis_id?: string | null
          coach_id?: string
          content?: string
          created_at?: string
          id?: string
          is_winner?: boolean
          kind?: string
          label?: string | null
          likes?: number | null
          notes?: string | null
          saves?: number | null
          updated_at?: string
          views?: number | null
        }
        Relationships: []
      }
      refeicoes_log: {
        Row: {
          analise_completa: Json
          calorias_total: number | null
          carboidratos_g: number | null
          classificacao: string | null
          created_at: string | null
          descricao_usuario: string | null
          gorduras_g: number | null
          id: string
          imagem_url: string | null
          proteinas_g: number | null
          score: number | null
          tipo_input: string
          user_id: string
        }
        Insert: {
          analise_completa?: Json
          calorias_total?: number | null
          carboidratos_g?: number | null
          classificacao?: string | null
          created_at?: string | null
          descricao_usuario?: string | null
          gorduras_g?: number | null
          id?: string
          imagem_url?: string | null
          proteinas_g?: number | null
          score?: number | null
          tipo_input?: string
          user_id: string
        }
        Update: {
          analise_completa?: Json
          calorias_total?: number | null
          carboidratos_g?: number | null
          classificacao?: string | null
          created_at?: string | null
          descricao_usuario?: string | null
          gorduras_g?: number | null
          id?: string
          imagem_url?: string | null
          proteinas_g?: number | null
          score?: number | null
          tipo_input?: string
          user_id?: string
        }
        Relationships: []
      }
      research_searches: {
        Row: {
          category: string | null
          citations: Json | null
          created_at: string | null
          id: string
          query: string
          results: Json | null
          user_id: string
        }
        Insert: {
          category?: string | null
          citations?: Json | null
          created_at?: string | null
          id?: string
          query: string
          results?: Json | null
          user_id: string
        }
        Update: {
          category?: string | null
          citations?: Json | null
          created_at?: string | null
          id?: string
          query?: string
          results?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      risk_interventions: {
        Row: {
          acao_resultante: string | null
          created_at: string | null
          eficacia: number | null
          id: string
          intervencao_tipo: string | null
          resposta_usuario: string | null
          score_risco: number | null
          tipo_risco: string | null
          user_id: string
        }
        Insert: {
          acao_resultante?: string | null
          created_at?: string | null
          eficacia?: number | null
          id?: string
          intervencao_tipo?: string | null
          resposta_usuario?: string | null
          score_risco?: number | null
          tipo_risco?: string | null
          user_id: string
        }
        Update: {
          acao_resultante?: string | null
          created_at?: string | null
          eficacia?: number | null
          id?: string
          intervencao_tipo?: string | null
          resposta_usuario?: string | null
          score_risco?: number | null
          tipo_risco?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ritual_completions: {
        Row: {
          created_at: string
          id: string
          mce_points: number
          ritual_date: string
          ritual_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mce_points?: number
          ritual_date?: string
          ritual_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mce_points?: number
          ritual_date?: string
          ritual_type?: string
          user_id?: string
        }
        Relationships: []
      }
      runon_profiles: {
        Row: {
          created_at: string
          id: string
          profile: Json
          protocol: Json | null
          race_mode: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile?: Json
          protocol?: Json | null
          race_mode?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          profile?: Json
          protocol?: Json | null
          race_mode?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_studies: {
        Row: {
          authors: string | null
          exercise_tags: string[] | null
          finding: string | null
          id: string
          journal: string | null
          muscle_tags: string[] | null
          practical_implication: string | null
          saved_at: string | null
          title: string | null
          topic_tags: string[] | null
          url: string | null
          user_id: string
          year: number | null
        }
        Insert: {
          authors?: string | null
          exercise_tags?: string[] | null
          finding?: string | null
          id?: string
          journal?: string | null
          muscle_tags?: string[] | null
          practical_implication?: string | null
          saved_at?: string | null
          title?: string | null
          topic_tags?: string[] | null
          url?: string | null
          user_id: string
          year?: number | null
        }
        Update: {
          authors?: string | null
          exercise_tags?: string[] | null
          finding?: string | null
          id?: string
          journal?: string | null
          muscle_tags?: string[] | null
          practical_implication?: string | null
          saved_at?: string | null
          title?: string | null
          topic_tags?: string[] | null
          url?: string | null
          user_id?: string
          year?: number | null
        }
        Relationships: []
      }
      science_cache: {
        Row: {
          cache_key: string
          citations: Json | null
          claude_formatted: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          module: string | null
          perplexity_raw: string | null
          query: string
        }
        Insert: {
          cache_key: string
          citations?: Json | null
          claude_formatted?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          module?: string | null
          perplexity_raw?: string | null
          query: string
        }
        Update: {
          cache_key?: string
          citations?: Json | null
          claude_formatted?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          module?: string | null
          perplexity_raw?: string | null
          query?: string
        }
        Relationships: []
      }
      science_feed: {
        Row: {
          category: string | null
          citations: Json | null
          created_at: string | null
          full_content: string | null
          id: string
          relevance_score: number | null
          summary: string | null
          topic: string | null
          week_reference: string | null
        }
        Insert: {
          category?: string | null
          citations?: Json | null
          created_at?: string | null
          full_content?: string | null
          id?: string
          relevance_score?: number | null
          summary?: string | null
          topic?: string | null
          week_reference?: string | null
        }
        Update: {
          category?: string | null
          citations?: Json | null
          created_at?: string | null
          full_content?: string | null
          id?: string
          relevance_score?: number | null
          summary?: string | null
          topic?: string | null
          week_reference?: string | null
        }
        Relationships: []
      }
      sent_plans: {
        Row: {
          athlete_id: string
          coach_id: string
          coach_message: string
          created_at: string
          id: string
          metadata: Json
          plan_data: Json
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          athlete_id: string
          coach_id: string
          coach_message?: string
          created_at?: string
          id?: string
          metadata?: Json
          plan_data?: Json
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          athlete_id?: string
          coach_id?: string
          coach_message?: string
          created_at?: string
          id?: string
          metadata?: Json
          plan_data?: Json
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      session_alerts: {
        Row: {
          action_taken: string | null
          created_at: string | null
          id: string
          ips: string[] | null
          partner_id: string | null
          partner_name: string | null
          sessions_count: number | null
        }
        Insert: {
          action_taken?: string | null
          created_at?: string | null
          id?: string
          ips?: string[] | null
          partner_id?: string | null
          partner_name?: string | null
          sessions_count?: number | null
        }
        Update: {
          action_taken?: string | null
          created_at?: string | null
          id?: string
          ips?: string[] | null
          partner_id?: string | null
          partner_name?: string | null
          sessions_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "session_alerts_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      social_audits: {
        Row: {
          audited_at: string
          bio_score: number | null
          coach_id: string
          content_mix: Json | null
          handle: string | null
          id: string
          issues: Json | null
          recommendations: Json | null
        }
        Insert: {
          audited_at?: string
          bio_score?: number | null
          coach_id: string
          content_mix?: Json | null
          handle?: string | null
          id?: string
          issues?: Json | null
          recommendations?: Json | null
        }
        Update: {
          audited_at?: string
          bio_score?: number | null
          coach_id?: string
          content_mix?: Json | null
          handle?: string | null
          id?: string
          issues?: Json | null
          recommendations?: Json | null
        }
        Relationships: []
      }
      social_content: {
        Row: {
          caption: string | null
          coach_id: string
          created_at: string
          format: string
          funnel: string
          hashtags: string[] | null
          hook: string | null
          id: string
          objective: string | null
          product: string | null
          production_tips: Json | null
          published: boolean
          scheduled_date: string | null
          script: string | null
          status: string
          strategy_notes: string | null
          suggested_time: string | null
          tone: string | null
          topic: string | null
          updated_at: string
        }
        Insert: {
          caption?: string | null
          coach_id: string
          created_at?: string
          format: string
          funnel: string
          hashtags?: string[] | null
          hook?: string | null
          id?: string
          objective?: string | null
          product?: string | null
          production_tips?: Json | null
          published?: boolean
          scheduled_date?: string | null
          script?: string | null
          status?: string
          strategy_notes?: string | null
          suggested_time?: string | null
          tone?: string | null
          topic?: string | null
          updated_at?: string
        }
        Update: {
          caption?: string | null
          coach_id?: string
          created_at?: string
          format?: string
          funnel?: string
          hashtags?: string[] | null
          hook?: string | null
          id?: string
          objective?: string | null
          product?: string | null
          production_tips?: Json | null
          published?: boolean
          scheduled_date?: string | null
          script?: string | null
          status?: string
          strategy_notes?: string | null
          suggested_time?: string | null
          tone?: string | null
          topic?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      social_content_calendar: {
        Row: {
          caption: string | null
          coach_id: string
          created_at: string
          date: string
          day_index: number | null
          format: string
          hashtags: string[] | null
          hook: string | null
          id: string
          pillar: string
          prism_analysis_id: string | null
          published_at: string | null
          reel_done: boolean
          reel_script: string | null
          scheduled_time: string | null
          source: string
          status: string
          stories_done: boolean
          topic: string
          updated_at: string
        }
        Insert: {
          caption?: string | null
          coach_id: string
          created_at?: string
          date: string
          day_index?: number | null
          format: string
          hashtags?: string[] | null
          hook?: string | null
          id?: string
          pillar: string
          prism_analysis_id?: string | null
          published_at?: string | null
          reel_done?: boolean
          reel_script?: string | null
          scheduled_time?: string | null
          source?: string
          status?: string
          stories_done?: boolean
          topic: string
          updated_at?: string
        }
        Update: {
          caption?: string | null
          coach_id?: string
          created_at?: string
          date?: string
          day_index?: number | null
          format?: string
          hashtags?: string[] | null
          hook?: string | null
          id?: string
          pillar?: string
          prism_analysis_id?: string | null
          published_at?: string | null
          reel_done?: boolean
          reel_script?: string | null
          scheduled_time?: string | null
          source?: string
          status?: string
          stories_done?: boolean
          topic?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_content_calendar_prism_analysis_id_fkey"
            columns: ["prism_analysis_id"]
            isOneToOne: false
            referencedRelation: "prism_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      social_hooks: {
        Row: {
          category: string
          coach_id: string
          created_at: string
          engagement_score: number | null
          hook_text: string
          id: string
          used_count: number
        }
        Insert: {
          category?: string
          coach_id: string
          created_at?: string
          engagement_score?: number | null
          hook_text: string
          id?: string
          used_count?: number
        }
        Update: {
          category?: string
          coach_id?: string
          created_at?: string
          engagement_score?: number | null
          hook_text?: string
          id?: string
          used_count?: number
        }
        Relationships: []
      }
      social_instagram_accounts: {
        Row: {
          access_token: string
          biography: string | null
          coach_id: string
          connected_at: string
          followers_count: number | null
          follows_count: number | null
          full_name: string | null
          ig_user_id: string
          media_count: number | null
          page_id: string | null
          profile_picture_url: string | null
          recent_media: Json | null
          source: string
          synced_at: string | null
          token_expires_at: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          access_token?: string
          biography?: string | null
          coach_id: string
          connected_at?: string
          followers_count?: number | null
          follows_count?: number | null
          full_name?: string | null
          ig_user_id: string
          media_count?: number | null
          page_id?: string | null
          profile_picture_url?: string | null
          recent_media?: Json | null
          source?: string
          synced_at?: string | null
          token_expires_at?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          access_token?: string
          biography?: string | null
          coach_id?: string
          connected_at?: string
          followers_count?: number | null
          follows_count?: number | null
          full_name?: string | null
          ig_user_id?: string
          media_count?: number | null
          page_id?: string | null
          profile_picture_url?: string | null
          recent_media?: Json | null
          source?: string
          synced_at?: string | null
          token_expires_at?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      social_instagram_posts: {
        Row: {
          attempts: number
          calendar_id: string | null
          caption: string | null
          coach_id: string
          created_at: string
          error: string | null
          id: string
          ig_media_id: string | null
          kind: string
          media_type: string
          media_url: string | null
          next_attempt_at: string | null
          permalink: string | null
          scheduled_at: string | null
          self_comment: string | null
          status: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          calendar_id?: string | null
          caption?: string | null
          coach_id: string
          created_at?: string
          error?: string | null
          id?: string
          ig_media_id?: string | null
          kind?: string
          media_type?: string
          media_url?: string | null
          next_attempt_at?: string | null
          permalink?: string | null
          scheduled_at?: string | null
          self_comment?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          calendar_id?: string | null
          caption?: string | null
          coach_id?: string
          created_at?: string
          error?: string | null
          id?: string
          ig_media_id?: string | null
          kind?: string
          media_type?: string
          media_url?: string | null
          next_attempt_at?: string | null
          permalink?: string | null
          scheduled_at?: string | null
          self_comment?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      social_instagram_scheduler_state: {
        Row: {
          id: number
          last_run_at: string | null
          lease_until: string | null
          pause_reason: string | null
          paused: boolean
          updated_at: string
        }
        Insert: {
          id?: number
          last_run_at?: string | null
          lease_until?: string | null
          pause_reason?: string | null
          paused?: boolean
          updated_at?: string
        }
        Update: {
          id?: number
          last_run_at?: string | null
          lease_until?: string | null
          pause_reason?: string | null
          paused?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      social_learning_progress: {
        Row: {
          coach_id: string
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          lesson: string
          track: string
        }
        Insert: {
          coach_id: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson: string
          track: string
        }
        Update: {
          coach_id?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          lesson?: string
          track?: string
        }
        Relationships: []
      }
      social_packages: {
        Row: {
          carousel_style: string
          category: string | null
          created_at: string
          generated_content: Json
          id: string
          objective: string | null
          photos: Json
          product: string | null
          published_at: string | null
          published_items: Json
          status: string
          title: string | null
          tone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          carousel_style?: string
          category?: string | null
          created_at?: string
          generated_content?: Json
          id?: string
          objective?: string | null
          photos?: Json
          product?: string | null
          published_at?: string | null
          published_items?: Json
          status?: string
          title?: string | null
          tone?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          carousel_style?: string
          category?: string | null
          created_at?: string
          generated_content?: Json
          id?: string
          objective?: string | null
          photos?: Json
          product?: string | null
          published_at?: string | null
          published_items?: Json
          status?: string
          title?: string | null
          tone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      social_profile: {
        Row: {
          audit_completed: boolean
          audited_at: string | null
          bio_current: string | null
          bio_score: number | null
          coach_id: string
          content_pillars: Json | null
          created_at: string
          differentials: Json | null
          funnel_stage: string
          id: string
          instagram_handle: string | null
          ladder_metrics: Json | null
          media_kit_token: string | null
          niches: Json | null
          products: Json | null
          updated_at: string
          visual_palette: Json | null
        }
        Insert: {
          audit_completed?: boolean
          audited_at?: string | null
          bio_current?: string | null
          bio_score?: number | null
          coach_id: string
          content_pillars?: Json | null
          created_at?: string
          differentials?: Json | null
          funnel_stage?: string
          id?: string
          instagram_handle?: string | null
          ladder_metrics?: Json | null
          media_kit_token?: string | null
          niches?: Json | null
          products?: Json | null
          updated_at?: string
          visual_palette?: Json | null
        }
        Update: {
          audit_completed?: boolean
          audited_at?: string | null
          bio_current?: string | null
          bio_score?: number | null
          coach_id?: string
          content_pillars?: Json | null
          created_at?: string
          differentials?: Json | null
          funnel_stage?: string
          id?: string
          instagram_handle?: string | null
          ladder_metrics?: Json | null
          media_kit_token?: string | null
          niches?: Json | null
          products?: Json | null
          updated_at?: string
          visual_palette?: Json | null
        }
        Relationships: []
      }
      social_weekly_checklist: {
        Row: {
          coach_id: string
          completion_percent: number
          created_at: string
          id: string
          items: Json
          updated_at: string
          week_start: string
        }
        Insert: {
          coach_id: string
          completion_percent?: number
          created_at?: string
          id?: string
          items?: Json
          updated_at?: string
          week_start: string
        }
        Update: {
          coach_id?: string
          completion_percent?: number
          created_at?: string
          id?: string
          items?: Json
          updated_at?: string
          week_start?: string
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
      sport_perplexity_cache: {
        Row: {
          cache_key: string
          conhecimento: string
          expira_em: string
          fontes: Json | null
          gerado_em: string
          id: string
          user_id: string
        }
        Insert: {
          cache_key: string
          conhecimento: string
          expira_em: string
          fontes?: Json | null
          gerado_em?: string
          id?: string
          user_id: string
        }
        Update: {
          cache_key?: string
          conhecimento?: string
          expira_em?: string
          fontes?: Json | null
          gerado_em?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      stratum_adaptations: {
        Row: {
          aplicado: boolean | null
          created_at: string
          dados: Json | null
          detalhe: string
          exercicio: string | null
          id: string
          tipo: string
          user_id: string
        }
        Insert: {
          aplicado?: boolean | null
          created_at?: string
          dados?: Json | null
          detalhe: string
          exercicio?: string | null
          id?: string
          tipo: string
          user_id: string
        }
        Update: {
          aplicado?: boolean | null
          created_at?: string
          dados?: Json | null
          detalhe?: string
          exercicio?: string | null
          id?: string
          tipo?: string
          user_id?: string
        }
        Relationships: []
      }
      stratum_exercises: {
        Row: {
          carga: number | null
          created_at: string
          exercicio: string
          id: string
          ordem: number | null
          pr: boolean | null
          reps_realizadas: Json | null
          reps_target: string | null
          rir: number | null
          rpe: number | null
          session_id: string
          sets: number | null
          unidade: string | null
          user_id: string
        }
        Insert: {
          carga?: number | null
          created_at?: string
          exercicio: string
          id?: string
          ordem?: number | null
          pr?: boolean | null
          reps_realizadas?: Json | null
          reps_target?: string | null
          rir?: number | null
          rpe?: number | null
          session_id: string
          sets?: number | null
          unidade?: string | null
          user_id: string
        }
        Update: {
          carga?: number | null
          created_at?: string
          exercicio?: string
          id?: string
          ordem?: number | null
          pr?: boolean | null
          reps_realizadas?: Json | null
          reps_target?: string | null
          rir?: number | null
          rpe?: number | null
          session_id?: string
          sets?: number | null
          unidade?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stratum_exercises_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "stratum_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      stratum_profiles: {
        Row: {
          acesso_academia: string | null
          adaptacoes: Json | null
          anamnese_respostas: Json | null
          contraindicacoes: Json | null
          created_at: string
          diagnostico_completo: string | null
          frequencia_semanal: number | null
          historico_protocolos: Json | null
          id: string
          lesoes: Json | null
          modulo_recomendado: string | null
          morfologia: Json | null
          nivel: string | null
          objetivo: string | null
          pca_perfil: string | null
          prioridades: Json | null
          prontidao_psicologica: number | null
          split_ideal: string | null
          tempo_por_sessao: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          acesso_academia?: string | null
          adaptacoes?: Json | null
          anamnese_respostas?: Json | null
          contraindicacoes?: Json | null
          created_at?: string
          diagnostico_completo?: string | null
          frequencia_semanal?: number | null
          historico_protocolos?: Json | null
          id?: string
          lesoes?: Json | null
          modulo_recomendado?: string | null
          morfologia?: Json | null
          nivel?: string | null
          objetivo?: string | null
          pca_perfil?: string | null
          prioridades?: Json | null
          prontidao_psicologica?: number | null
          split_ideal?: string | null
          tempo_por_sessao?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          acesso_academia?: string | null
          adaptacoes?: Json | null
          anamnese_respostas?: Json | null
          contraindicacoes?: Json | null
          created_at?: string
          diagnostico_completo?: string | null
          frequencia_semanal?: number | null
          historico_protocolos?: Json | null
          id?: string
          lesoes?: Json | null
          modulo_recomendado?: string | null
          morfologia?: Json | null
          nivel?: string | null
          objetivo?: string | null
          pca_perfil?: string | null
          prioridades?: Json | null
          prontidao_psicologica?: number | null
          split_ideal?: string | null
          tempo_por_sessao?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stratum_readiness: {
        Row: {
          check_date: string
          created_at: string
          dor: string | null
          dor_local: string | null
          energia: number | null
          estresse: string | null
          hrv_delta: number | null
          id: string
          recomendacao: string | null
          score: number | null
          sono: number | null
          user_id: string
          zona: string | null
        }
        Insert: {
          check_date?: string
          created_at?: string
          dor?: string | null
          dor_local?: string | null
          energia?: number | null
          estresse?: string | null
          hrv_delta?: number | null
          id?: string
          recomendacao?: string | null
          score?: number | null
          sono?: number | null
          user_id: string
          zona?: string | null
        }
        Update: {
          check_date?: string
          created_at?: string
          dor?: string | null
          dor_local?: string | null
          energia?: number | null
          estresse?: string | null
          hrv_delta?: number | null
          id?: string
          recomendacao?: string | null
          score?: number | null
          sono?: number | null
          user_id?: string
          zona?: string | null
        }
        Relationships: []
      }
      stratum_reports: {
        Row: {
          aderencia_pct: number | null
          ajustes_automaticos: Json | null
          alertas: Json | null
          analise_pca: string | null
          created_at: string
          enviado: boolean | null
          fase_proxima: string | null
          id: string
          prontidao_media: number | null
          proxima_semana: Json | null
          prs: Json | null
          ratio_empurrar_puxar: string | null
          rpe_medio: number | null
          semana_fim: string
          semana_inicio: string
          user_id: string
          volume_por_grupo: Json | null
          volume_total: number | null
        }
        Insert: {
          aderencia_pct?: number | null
          ajustes_automaticos?: Json | null
          alertas?: Json | null
          analise_pca?: string | null
          created_at?: string
          enviado?: boolean | null
          fase_proxima?: string | null
          id?: string
          prontidao_media?: number | null
          proxima_semana?: Json | null
          prs?: Json | null
          ratio_empurrar_puxar?: string | null
          rpe_medio?: number | null
          semana_fim: string
          semana_inicio: string
          user_id: string
          volume_por_grupo?: Json | null
          volume_total?: number | null
        }
        Update: {
          aderencia_pct?: number | null
          ajustes_automaticos?: Json | null
          alertas?: Json | null
          analise_pca?: string | null
          created_at?: string
          enviado?: boolean | null
          fase_proxima?: string | null
          id?: string
          prontidao_media?: number | null
          proxima_semana?: Json | null
          prs?: Json | null
          ratio_empurrar_puxar?: string | null
          rpe_medio?: number | null
          semana_fim?: string
          semana_inicio?: string
          user_id?: string
          volume_por_grupo?: Json | null
          volume_total?: number | null
        }
        Relationships: []
      }
      stratum_sessions: {
        Row: {
          completado: boolean | null
          created_at: string
          data_sessao: string
          duracao_minutos: number | null
          fadiga_reportada: number | null
          grupo_principal: string | null
          id: string
          modulo: string | null
          motivo_incompleto: string | null
          observacoes: string | null
          rpe_medio: number | null
          tipo_treino: string | null
          user_id: string
          volume_total: number | null
        }
        Insert: {
          completado?: boolean | null
          created_at?: string
          data_sessao?: string
          duracao_minutos?: number | null
          fadiga_reportada?: number | null
          grupo_principal?: string | null
          id?: string
          modulo?: string | null
          motivo_incompleto?: string | null
          observacoes?: string | null
          rpe_medio?: number | null
          tipo_treino?: string | null
          user_id: string
          volume_total?: number | null
        }
        Update: {
          completado?: boolean | null
          created_at?: string
          data_sessao?: string
          duracao_minutos?: number | null
          fadiga_reportada?: number | null
          grupo_principal?: string | null
          id?: string
          modulo?: string | null
          motivo_incompleto?: string | null
          observacoes?: string | null
          rpe_medio?: number | null
          tipo_treino?: string | null
          user_id?: string
          volume_total?: number | null
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
      supplement_analyses: {
        Row: {
          analysis_text: string | null
          citations: Json | null
          evidence_level: string | null
          id: string
          last_updated: string | null
          supplement_name: string | null
        }
        Insert: {
          analysis_text?: string | null
          citations?: Json | null
          evidence_level?: string | null
          id?: string
          last_updated?: string | null
          supplement_name?: string | null
        }
        Update: {
          analysis_text?: string | null
          citations?: Json | null
          evidence_level?: string | null
          id?: string
          last_updated?: string | null
          supplement_name?: string | null
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
      tensor_assessments: {
        Row: {
          age_years: number
          assessment_date: string
          assessment_mode: Database["public"]["Enums"]["tensor_assessment_mode"]
          bia_device: Database["public"]["Enums"]["bia_device_type"] | null
          biological_sex: string
          clinical_notes: string | null
          coach_user_id: string | null
          consent_signed: boolean | null
          consent_signed_at: string | null
          created_at: string | null
          height_cm: number
          hours_since_exercise: number | null
          hours_since_last_meal: number | null
          hydration_status: string | null
          id: string
          is_fasting: boolean | null
          is_post_exercise: boolean | null
          is_validated: boolean | null
          location: string | null
          menstrual_phase: string | null
          patient_subjective_notes: string | null
          patient_user_id: string
          skinfold_protocol:
            | Database["public"]["Enums"]["skinfold_protocol"]
            | null
          updated_at: string | null
          validated_at: string | null
          weight_kg: number
        }
        Insert: {
          age_years: number
          assessment_date?: string
          assessment_mode: Database["public"]["Enums"]["tensor_assessment_mode"]
          bia_device?: Database["public"]["Enums"]["bia_device_type"] | null
          biological_sex: string
          clinical_notes?: string | null
          coach_user_id?: string | null
          consent_signed?: boolean | null
          consent_signed_at?: string | null
          created_at?: string | null
          height_cm: number
          hours_since_exercise?: number | null
          hours_since_last_meal?: number | null
          hydration_status?: string | null
          id?: string
          is_fasting?: boolean | null
          is_post_exercise?: boolean | null
          is_validated?: boolean | null
          location?: string | null
          menstrual_phase?: string | null
          patient_subjective_notes?: string | null
          patient_user_id: string
          skinfold_protocol?:
            | Database["public"]["Enums"]["skinfold_protocol"]
            | null
          updated_at?: string | null
          validated_at?: string | null
          weight_kg: number
        }
        Update: {
          age_years?: number
          assessment_date?: string
          assessment_mode?: Database["public"]["Enums"]["tensor_assessment_mode"]
          bia_device?: Database["public"]["Enums"]["bia_device_type"] | null
          biological_sex?: string
          clinical_notes?: string | null
          coach_user_id?: string | null
          consent_signed?: boolean | null
          consent_signed_at?: string | null
          created_at?: string | null
          height_cm?: number
          hours_since_exercise?: number | null
          hours_since_last_meal?: number | null
          hydration_status?: string | null
          id?: string
          is_fasting?: boolean | null
          is_post_exercise?: boolean | null
          is_validated?: boolean | null
          location?: string | null
          menstrual_phase?: string | null
          patient_subjective_notes?: string | null
          patient_user_id?: string
          skinfold_protocol?:
            | Database["public"]["Enums"]["skinfold_protocol"]
            | null
          updated_at?: string | null
          validated_at?: string | null
          weight_kg?: number
        }
        Relationships: []
      }
      tensor_bia_results: {
        Row: {
          assessment_id: string
          body_fat_kg: number | null
          body_fat_percent: number | null
          bone_mineral_content_kg: number | null
          created_at: string | null
          ecw_tbw_ratio: number | null
          extracellular_water_l: number | null
          fat_free_mass_kg: number | null
          frequency_hz: number | null
          icw_ecw_ratio: number | null
          id: string
          impedance_ohms: number | null
          intracellular_water_l: number | null
          lean_body_mass_kg: number | null
          mineral_kg: number | null
          phase_angle_degrees: number | null
          protein_kg: number | null
          raw_device_output: Json | null
          reactance_ohms: number | null
          resistance_ohms: number | null
          segmental_fat_mass: Json | null
          segmental_lean_mass: Json | null
          segmental_water: Json | null
          skeletal_muscle_mass_kg: number | null
          total_body_water_l: number | null
          visceral_fat_area_cm2: number | null
          visceral_fat_level: number | null
        }
        Insert: {
          assessment_id: string
          body_fat_kg?: number | null
          body_fat_percent?: number | null
          bone_mineral_content_kg?: number | null
          created_at?: string | null
          ecw_tbw_ratio?: number | null
          extracellular_water_l?: number | null
          fat_free_mass_kg?: number | null
          frequency_hz?: number | null
          icw_ecw_ratio?: number | null
          id?: string
          impedance_ohms?: number | null
          intracellular_water_l?: number | null
          lean_body_mass_kg?: number | null
          mineral_kg?: number | null
          phase_angle_degrees?: number | null
          protein_kg?: number | null
          raw_device_output?: Json | null
          reactance_ohms?: number | null
          resistance_ohms?: number | null
          segmental_fat_mass?: Json | null
          segmental_lean_mass?: Json | null
          segmental_water?: Json | null
          skeletal_muscle_mass_kg?: number | null
          total_body_water_l?: number | null
          visceral_fat_area_cm2?: number | null
          visceral_fat_level?: number | null
        }
        Update: {
          assessment_id?: string
          body_fat_kg?: number | null
          body_fat_percent?: number | null
          bone_mineral_content_kg?: number | null
          created_at?: string | null
          ecw_tbw_ratio?: number | null
          extracellular_water_l?: number | null
          fat_free_mass_kg?: number | null
          frequency_hz?: number | null
          icw_ecw_ratio?: number | null
          id?: string
          impedance_ohms?: number | null
          intracellular_water_l?: number | null
          lean_body_mass_kg?: number | null
          mineral_kg?: number | null
          phase_angle_degrees?: number | null
          protein_kg?: number | null
          raw_device_output?: Json | null
          reactance_ohms?: number | null
          resistance_ohms?: number | null
          segmental_fat_mass?: Json | null
          segmental_lean_mass?: Json | null
          segmental_water?: Json | null
          skeletal_muscle_mass_kg?: number | null
          total_body_water_l?: number | null
          visceral_fat_area_cm2?: number | null
          visceral_fat_level?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tensor_bia_results_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: true
            referencedRelation: "tensor_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      tensor_bone_diameters: {
        Row: {
          assessment_id: string
          created_at: string | null
          id: string
          notes: string | null
          site: Database["public"]["Enums"]["bone_diameter_site"]
          value_cm: number
        }
        Insert: {
          assessment_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          site: Database["public"]["Enums"]["bone_diameter_site"]
          value_cm: number
        }
        Update: {
          assessment_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          site?: Database["public"]["Enums"]["bone_diameter_site"]
          value_cm?: number
        }
        Relationships: [
          {
            foreignKeyName: "tensor_bone_diameters_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "tensor_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      tensor_calculated_results: {
        Row: {
          assessment_id: string
          bf_kg_skinfold: number | null
          bf_percent_bia: number | null
          bf_percent_consensus: number | null
          bf_percent_skinfold: number | null
          bmi: number | null
          body_adiposity_index: number | null
          body_density_g_ml: number | null
          calculated_at: string | null
          calculation_engine_version: string | null
          catabolism_risk: string | null
          conicity_index: number | null
          consensus_method: string | null
          ectomorphy: number | null
          endomorphy: number | null
          id: string
          inter_protocol_alert: boolean | null
          inter_protocol_alert_message: string | null
          inter_protocol_delta_bf: number | null
          lbm_kg_bia: number | null
          lbm_kg_consensus: number | null
          lbm_kg_skinfold: number | null
          mesomorphy: number | null
          phase_angle_prognosis: string | null
          smm_kg_lee: number | null
          somatotype_classification: string | null
          sport_specific_metrics: Json | null
          waist_height_ratio: number | null
          waist_hip_ratio: number | null
          warnings: string[] | null
        }
        Insert: {
          assessment_id: string
          bf_kg_skinfold?: number | null
          bf_percent_bia?: number | null
          bf_percent_consensus?: number | null
          bf_percent_skinfold?: number | null
          bmi?: number | null
          body_adiposity_index?: number | null
          body_density_g_ml?: number | null
          calculated_at?: string | null
          calculation_engine_version?: string | null
          catabolism_risk?: string | null
          conicity_index?: number | null
          consensus_method?: string | null
          ectomorphy?: number | null
          endomorphy?: number | null
          id?: string
          inter_protocol_alert?: boolean | null
          inter_protocol_alert_message?: string | null
          inter_protocol_delta_bf?: number | null
          lbm_kg_bia?: number | null
          lbm_kg_consensus?: number | null
          lbm_kg_skinfold?: number | null
          mesomorphy?: number | null
          phase_angle_prognosis?: string | null
          smm_kg_lee?: number | null
          somatotype_classification?: string | null
          sport_specific_metrics?: Json | null
          waist_height_ratio?: number | null
          waist_hip_ratio?: number | null
          warnings?: string[] | null
        }
        Update: {
          assessment_id?: string
          bf_kg_skinfold?: number | null
          bf_percent_bia?: number | null
          bf_percent_consensus?: number | null
          bf_percent_skinfold?: number | null
          bmi?: number | null
          body_adiposity_index?: number | null
          body_density_g_ml?: number | null
          calculated_at?: string | null
          calculation_engine_version?: string | null
          catabolism_risk?: string | null
          conicity_index?: number | null
          consensus_method?: string | null
          ectomorphy?: number | null
          endomorphy?: number | null
          id?: string
          inter_protocol_alert?: boolean | null
          inter_protocol_alert_message?: string | null
          inter_protocol_delta_bf?: number | null
          lbm_kg_bia?: number | null
          lbm_kg_consensus?: number | null
          lbm_kg_skinfold?: number | null
          mesomorphy?: number | null
          phase_angle_prognosis?: string | null
          smm_kg_lee?: number | null
          somatotype_classification?: string | null
          sport_specific_metrics?: Json | null
          waist_height_ratio?: number | null
          waist_hip_ratio?: number | null
          warnings?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "tensor_calculated_results_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: true
            referencedRelation: "tensor_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      tensor_consent_log: {
        Row: {
          assessment_id: string | null
          consent_text: string
          consent_type: string
          id: string
          ip_address: string | null
          patient_user_id: string
          signed_at: string | null
          user_agent: string | null
        }
        Insert: {
          assessment_id?: string | null
          consent_text: string
          consent_type: string
          id?: string
          ip_address?: string | null
          patient_user_id: string
          signed_at?: string | null
          user_agent?: string | null
        }
        Update: {
          assessment_id?: string | null
          consent_text?: string
          consent_type?: string
          id?: string
          ip_address?: string | null
          patient_user_id?: string
          signed_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tensor_consent_log_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "tensor_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      tensor_equations: {
        Row: {
          age_max_years: number | null
          age_min_years: number | null
          bf_conversion_method: string
          density_formula: string
          ethnicity: string | null
          id: string
          notes: string | null
          population_sex: string | null
          protocol: Database["public"]["Enums"]["skinfold_protocol"]
          reference_citation: string | null
          required_sites: string[]
        }
        Insert: {
          age_max_years?: number | null
          age_min_years?: number | null
          bf_conversion_method: string
          density_formula: string
          ethnicity?: string | null
          id?: string
          notes?: string | null
          population_sex?: string | null
          protocol: Database["public"]["Enums"]["skinfold_protocol"]
          reference_citation?: string | null
          required_sites: string[]
        }
        Update: {
          age_max_years?: number | null
          age_min_years?: number | null
          bf_conversion_method?: string
          density_formula?: string
          ethnicity?: string | null
          id?: string
          notes?: string | null
          population_sex?: string | null
          protocol?: Database["public"]["Enums"]["skinfold_protocol"]
          reference_citation?: string | null
          required_sites?: string[]
        }
        Relationships: []
      }
      tensor_girth_measurements: {
        Row: {
          assessment_id: string
          created_at: string | null
          final_value_cm: number | null
          id: string
          measure_1_cm: number
          measure_2_cm: number | null
          notes: string | null
          site: Database["public"]["Enums"]["girth_site"]
        }
        Insert: {
          assessment_id: string
          created_at?: string | null
          final_value_cm?: number | null
          id?: string
          measure_1_cm: number
          measure_2_cm?: number | null
          notes?: string | null
          site: Database["public"]["Enums"]["girth_site"]
        }
        Update: {
          assessment_id?: string
          created_at?: string | null
          final_value_cm?: number | null
          id?: string
          measure_1_cm?: number
          measure_2_cm?: number | null
          notes?: string | null
          site?: Database["public"]["Enums"]["girth_site"]
        }
        Relationships: [
          {
            foreignKeyName: "tensor_girth_measurements_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "tensor_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      tensor_skinfold_measurements: {
        Row: {
          assessment_id: string
          created_at: string | null
          etm_intra: number | null
          final_value_mm: number | null
          id: string
          is_outlier: boolean | null
          measure_1_mm: number
          measure_2_mm: number | null
          measure_3_mm: number | null
          notes: string | null
          outlier_reason: string | null
          site: Database["public"]["Enums"]["skinfold_site"]
        }
        Insert: {
          assessment_id: string
          created_at?: string | null
          etm_intra?: number | null
          final_value_mm?: number | null
          id?: string
          is_outlier?: boolean | null
          measure_1_mm: number
          measure_2_mm?: number | null
          measure_3_mm?: number | null
          notes?: string | null
          outlier_reason?: string | null
          site: Database["public"]["Enums"]["skinfold_site"]
        }
        Update: {
          assessment_id?: string
          created_at?: string | null
          etm_intra?: number | null
          final_value_mm?: number | null
          id?: string
          is_outlier?: boolean | null
          measure_1_mm?: number
          measure_2_mm?: number | null
          measure_3_mm?: number | null
          notes?: string | null
          outlier_reason?: string | null
          site?: Database["public"]["Enums"]["skinfold_site"]
        }
        Relationships: [
          {
            foreignKeyName: "tensor_skinfold_measurements_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "tensor_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      tensor_trajectory: {
        Row: {
          bf_percent_delta: number | null
          created_at: string | null
          days_between: number
          fat_delta_kg: number | null
          from_assessment_id: string
          id: string
          insights: string[] | null
          lean_delta_kg: number | null
          patient_user_id: string
          phase_angle_delta: number | null
          smm_delta_kg: number | null
          to_assessment_id: string
          trajectory_quality: string | null
          water_delta_l: number | null
          weight_delta_kg: number | null
        }
        Insert: {
          bf_percent_delta?: number | null
          created_at?: string | null
          days_between: number
          fat_delta_kg?: number | null
          from_assessment_id: string
          id?: string
          insights?: string[] | null
          lean_delta_kg?: number | null
          patient_user_id: string
          phase_angle_delta?: number | null
          smm_delta_kg?: number | null
          to_assessment_id: string
          trajectory_quality?: string | null
          water_delta_l?: number | null
          weight_delta_kg?: number | null
        }
        Update: {
          bf_percent_delta?: number | null
          created_at?: string | null
          days_between?: number
          fat_delta_kg?: number | null
          from_assessment_id?: string
          id?: string
          insights?: string[] | null
          lean_delta_kg?: number | null
          patient_user_id?: string
          phase_angle_delta?: number | null
          smm_delta_kg?: number | null
          to_assessment_id?: string
          trajectory_quality?: string | null
          water_delta_l?: number | null
          weight_delta_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tensor_trajectory_from_assessment_id_fkey"
            columns: ["from_assessment_id"]
            isOneToOne: false
            referencedRelation: "tensor_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tensor_trajectory_to_assessment_id_fkey"
            columns: ["to_assessment_id"]
            isOneToOne: false
            referencedRelation: "tensor_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      training_feedback: {
        Row: {
          athlete_id: string
          coach_id: string | null
          created_at: string | null
          id: string
          muscle_connections: Json | null
          notes: string | null
          pump_scores: Json | null
          session_date: string
        }
        Insert: {
          athlete_id: string
          coach_id?: string | null
          created_at?: string | null
          id?: string
          muscle_connections?: Json | null
          notes?: string | null
          pump_scores?: Json | null
          session_date?: string
        }
        Update: {
          athlete_id?: string
          coach_id?: string | null
          created_at?: string | null
          id?: string
          muscle_connections?: Json | null
          notes?: string | null
          pump_scores?: Json | null
          session_date?: string
        }
        Relationships: []
      }
      training_nutrition_sync: {
        Row: {
          cardio_mesmo_dia: boolean | null
          created_at: string
          id: string
          intensidade_treino: string | null
          musculos_prioritarios: string[] | null
          sistema_treino: string | null
          stratum_fase: string | null
          tempo_sessao_min: number | null
          tipo_fibra: string | null
          training_days: Json | null
          training_phase: string | null
          updated_at: string
          user_id: string
          volume_sets_semana: number | null
        }
        Insert: {
          cardio_mesmo_dia?: boolean | null
          created_at?: string
          id?: string
          intensidade_treino?: string | null
          musculos_prioritarios?: string[] | null
          sistema_treino?: string | null
          stratum_fase?: string | null
          tempo_sessao_min?: number | null
          tipo_fibra?: string | null
          training_days?: Json | null
          training_phase?: string | null
          updated_at?: string
          user_id: string
          volume_sets_semana?: number | null
        }
        Update: {
          cardio_mesmo_dia?: boolean | null
          created_at?: string
          id?: string
          intensidade_treino?: string | null
          musculos_prioritarios?: string[] | null
          sistema_treino?: string | null
          stratum_fase?: string | null
          tempo_sessao_min?: number | null
          tipo_fibra?: string | null
          training_days?: Json | null
          training_phase?: string | null
          updated_at?: string
          user_id?: string
          volume_sets_semana?: number | null
        }
        Relationships: []
      }
      training_progress: {
        Row: {
          client_name: string | null
          exercise: string | null
          id: string
          logged_at: string | null
          notes: string | null
          protocol_id: string | null
          reps_done: number | null
          rpe_real: number | null
          sets_done: number | null
          user_id: string
          week_number: number | null
          weight_kg: number | null
        }
        Insert: {
          client_name?: string | null
          exercise?: string | null
          id?: string
          logged_at?: string | null
          notes?: string | null
          protocol_id?: string | null
          reps_done?: number | null
          rpe_real?: number | null
          sets_done?: number | null
          user_id: string
          week_number?: number | null
          weight_kg?: number | null
        }
        Update: {
          client_name?: string | null
          exercise?: string | null
          id?: string
          logged_at?: string | null
          notes?: string | null
          protocol_id?: string | null
          reps_done?: number | null
          rpe_real?: number | null
          sets_done?: number | null
          user_id?: string
          week_number?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "training_progress_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "training_protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      training_protocols: {
        Row: {
          anatomy_text: string | null
          client_name: string | null
          created_at: string | null
          days_per_week: string | null
          equipment: string | null
          id: string
          injuries: string | null
          last_viewed_week: number | null
          level: string | null
          muscles: string[] | null
          patient_user_id: string | null
          periodizacao_text: string | null
          phase: string | null
          protocol_text: string | null
          session_duration: string | null
          tecnica_text: string | null
          user_id: string
          volume_landmarks: Json | null
          weeks: string | null
        }
        Insert: {
          anatomy_text?: string | null
          client_name?: string | null
          created_at?: string | null
          days_per_week?: string | null
          equipment?: string | null
          id?: string
          injuries?: string | null
          last_viewed_week?: number | null
          level?: string | null
          muscles?: string[] | null
          patient_user_id?: string | null
          periodizacao_text?: string | null
          phase?: string | null
          protocol_text?: string | null
          session_duration?: string | null
          tecnica_text?: string | null
          user_id: string
          volume_landmarks?: Json | null
          weeks?: string | null
        }
        Update: {
          anatomy_text?: string | null
          client_name?: string | null
          created_at?: string | null
          days_per_week?: string | null
          equipment?: string | null
          id?: string
          injuries?: string | null
          last_viewed_week?: number | null
          level?: string | null
          muscles?: string[] | null
          patient_user_id?: string | null
          periodizacao_text?: string | null
          phase?: string | null
          protocol_text?: string | null
          session_duration?: string | null
          tecnica_text?: string | null
          user_id?: string
          volume_landmarks?: Json | null
          weeks?: string | null
        }
        Relationships: []
      }
      training_sessions_completed: {
        Row: {
          ai_message: string | null
          backoff_count: number | null
          completed: boolean
          created_at: string
          duration_minutes: number | null
          feedback_summary: Json | null
          feeder_count: number | null
          id: string
          primary_muscle_group: string | null
          session_date: string
          total_sets: number | null
          user_id: string
          warmup_completed: boolean
          working_count: number | null
        }
        Insert: {
          ai_message?: string | null
          backoff_count?: number | null
          completed?: boolean
          created_at?: string
          duration_minutes?: number | null
          feedback_summary?: Json | null
          feeder_count?: number | null
          id?: string
          primary_muscle_group?: string | null
          session_date: string
          total_sets?: number | null
          user_id: string
          warmup_completed?: boolean
          working_count?: number | null
        }
        Update: {
          ai_message?: string | null
          backoff_count?: number | null
          completed?: boolean
          created_at?: string
          duration_minutes?: number | null
          feedback_summary?: Json | null
          feeder_count?: number | null
          id?: string
          primary_muscle_group?: string | null
          session_date?: string
          total_sets?: number | null
          user_id?: string
          warmup_completed?: boolean
          working_count?: number | null
        }
        Relationships: []
      }
      training_set_logs: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          exercise_id: string
          feedback: string | null
          id: string
          load_done: number | null
          load_prescribed: string | null
          reps_done: number | null
          reps_prescribed: string | null
          session_date: string
          set_number: number
          set_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          exercise_id: string
          feedback?: string | null
          id?: string
          load_done?: number | null
          load_prescribed?: string | null
          reps_done?: number | null
          reps_prescribed?: string | null
          session_date?: string
          set_number: number
          set_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          exercise_id?: string
          feedback?: string | null
          id?: string
          load_done?: number | null
          load_prescribed?: string | null
          reps_done?: number | null
          reps_prescribed?: string | null
          session_date?: string
          set_number?: number
          set_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      training_templates: {
        Row: {
          created_at: string | null
          days_per_week: string | null
          equipment: string | null
          id: string
          level: string | null
          muscles: string[] | null
          phase: string | null
          protocol_text: string | null
          template_name: string | null
          user_id: string
          weeks: string | null
        }
        Insert: {
          created_at?: string | null
          days_per_week?: string | null
          equipment?: string | null
          id?: string
          level?: string | null
          muscles?: string[] | null
          phase?: string | null
          protocol_text?: string | null
          template_name?: string | null
          user_id: string
          weeks?: string | null
        }
        Update: {
          created_at?: string | null
          days_per_week?: string | null
          equipment?: string | null
          id?: string
          level?: string | null
          muscles?: string[] | null
          phase?: string | null
          protocol_text?: string | null
          template_name?: string | null
          user_id?: string
          weeks?: string | null
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
      user_metabolic_profiles: {
        Row: {
          activity_level: string | null
          age: number | null
          body_fat_percent: number | null
          budget_level: string | null
          created_at: string | null
          does_aej: boolean | null
          goal: string | null
          health_conditions: string[] | null
          height: number | null
          id: string
          lean_mass: number | null
          pca_profile: string | null
          post_cardio: boolean | null
          restrictions: string[] | null
          sex: string | null
          tdee: number | null
          train_time: string | null
          updated_at: string | null
          user_id: string
          weight: number | null
        }
        Insert: {
          activity_level?: string | null
          age?: number | null
          body_fat_percent?: number | null
          budget_level?: string | null
          created_at?: string | null
          does_aej?: boolean | null
          goal?: string | null
          health_conditions?: string[] | null
          height?: number | null
          id?: string
          lean_mass?: number | null
          pca_profile?: string | null
          post_cardio?: boolean | null
          restrictions?: string[] | null
          sex?: string | null
          tdee?: number | null
          train_time?: string | null
          updated_at?: string | null
          user_id: string
          weight?: number | null
        }
        Update: {
          activity_level?: string | null
          age?: number | null
          body_fat_percent?: number | null
          budget_level?: string | null
          created_at?: string | null
          does_aej?: boolean | null
          goal?: string | null
          health_conditions?: string[] | null
          height?: number | null
          id?: string
          lean_mass?: number | null
          pca_profile?: string | null
          post_cardio?: boolean | null
          restrictions?: string[] | null
          sex?: string | null
          tdee?: number | null
          train_time?: string | null
          updated_at?: string | null
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
      vera_anamnese: {
        Row: {
          anos_restricao: number | null
          anticoncepcional_nome: string | null
          athlete_id: string
          categoria_competicao: string | null
          ciclo_regular: boolean | null
          ciclos_anteriores: number | null
          coach_id: string
          compostos_em_uso: string | null
          created_at: string
          dia_ciclo_atual: number | null
          duracao_ciclo: number | null
          fase_atual: string | null
          gestacao_recente: boolean | null
          historico_dieta_restritiva: boolean | null
          historico_ta: boolean | null
          id: string
          lesoes: string | null
          menopausa: boolean | null
          meses_pos_parto: number | null
          objetivo_principal: string | null
          perimenopausa: boolean | null
          pontos_fracos: string | null
          tipo_anticoncepcional: string | null
          updated_at: string
          usa_anticoncepcional: boolean | null
          usa_eaa: boolean | null
        }
        Insert: {
          anos_restricao?: number | null
          anticoncepcional_nome?: string | null
          athlete_id: string
          categoria_competicao?: string | null
          ciclo_regular?: boolean | null
          ciclos_anteriores?: number | null
          coach_id: string
          compostos_em_uso?: string | null
          created_at?: string
          dia_ciclo_atual?: number | null
          duracao_ciclo?: number | null
          fase_atual?: string | null
          gestacao_recente?: boolean | null
          historico_dieta_restritiva?: boolean | null
          historico_ta?: boolean | null
          id?: string
          lesoes?: string | null
          menopausa?: boolean | null
          meses_pos_parto?: number | null
          objetivo_principal?: string | null
          perimenopausa?: boolean | null
          pontos_fracos?: string | null
          tipo_anticoncepcional?: string | null
          updated_at?: string
          usa_anticoncepcional?: boolean | null
          usa_eaa?: boolean | null
        }
        Update: {
          anos_restricao?: number | null
          anticoncepcional_nome?: string | null
          athlete_id?: string
          categoria_competicao?: string | null
          ciclo_regular?: boolean | null
          ciclos_anteriores?: number | null
          coach_id?: string
          compostos_em_uso?: string | null
          created_at?: string
          dia_ciclo_atual?: number | null
          duracao_ciclo?: number | null
          fase_atual?: string | null
          gestacao_recente?: boolean | null
          historico_dieta_restritiva?: boolean | null
          historico_ta?: boolean | null
          id?: string
          lesoes?: string | null
          menopausa?: boolean | null
          meses_pos_parto?: number | null
          objetivo_principal?: string | null
          perimenopausa?: boolean | null
          pontos_fracos?: string | null
          tipo_anticoncepcional?: string | null
          updated_at?: string
          usa_anticoncepcional?: boolean | null
          usa_eaa?: boolean | null
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
      weekly_checkins: {
        Row: {
          adherence_diet: number | null
          adherence_energy: number | null
          adherence_hunger: number | null
          adherence_sleep: number | null
          adherence_stress: number | null
          adherence_training: number | null
          arm_cm: number | null
          bloating_days: number | null
          bristol_scale: number | null
          coach_feedback: string | null
          coach_macro_adjustment: Json | null
          coach_responded_at: string | null
          created_at: string
          hip_cm: number | null
          id: string
          notes: string | null
          photo_front_url: string | null
          symptoms: string[] | null
          updated_at: string
          user_id: string
          waist_cm: number | null
          week_start: string
          weight_delta_kg: number | null
          weight_kg: number | null
        }
        Insert: {
          adherence_diet?: number | null
          adherence_energy?: number | null
          adherence_hunger?: number | null
          adherence_sleep?: number | null
          adherence_stress?: number | null
          adherence_training?: number | null
          arm_cm?: number | null
          bloating_days?: number | null
          bristol_scale?: number | null
          coach_feedback?: string | null
          coach_macro_adjustment?: Json | null
          coach_responded_at?: string | null
          created_at?: string
          hip_cm?: number | null
          id?: string
          notes?: string | null
          photo_front_url?: string | null
          symptoms?: string[] | null
          updated_at?: string
          user_id: string
          waist_cm?: number | null
          week_start: string
          weight_delta_kg?: number | null
          weight_kg?: number | null
        }
        Update: {
          adherence_diet?: number | null
          adherence_energy?: number | null
          adherence_hunger?: number | null
          adherence_sleep?: number | null
          adherence_stress?: number | null
          adherence_training?: number | null
          arm_cm?: number | null
          bloating_days?: number | null
          bristol_scale?: number | null
          coach_feedback?: string | null
          coach_macro_adjustment?: Json | null
          coach_responded_at?: string | null
          created_at?: string
          hip_cm?: number | null
          id?: string
          notes?: string | null
          photo_front_url?: string | null
          symptoms?: string[] | null
          updated_at?: string
          user_id?: string
          waist_cm?: number | null
          week_start?: string
          weight_delta_kg?: number | null
          weight_kg?: number | null
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
      workout_diary: {
        Row: {
          avaliacao_subjetiva: number | null
          created_at: string | null
          data: string
          duracao_minutos: number | null
          energia_durante: number | null
          fadiga_pos: number | null
          humor_pre: string | null
          id: string
          notas: string | null
          reps_total: number | null
          series_total: number | null
          split_dia: string | null
          user_id: string
          volume_total: number | null
        }
        Insert: {
          avaliacao_subjetiva?: number | null
          created_at?: string | null
          data?: string
          duracao_minutos?: number | null
          energia_durante?: number | null
          fadiga_pos?: number | null
          humor_pre?: string | null
          id?: string
          notas?: string | null
          reps_total?: number | null
          series_total?: number | null
          split_dia?: string | null
          user_id: string
          volume_total?: number | null
        }
        Update: {
          avaliacao_subjetiva?: number | null
          created_at?: string | null
          data?: string
          duracao_minutos?: number | null
          energia_durante?: number | null
          fadiga_pos?: number | null
          humor_pre?: string | null
          id?: string
          notas?: string | null
          reps_total?: number | null
          series_total?: number | null
          split_dia?: string | null
          user_id?: string
          volume_total?: number | null
        }
        Relationships: []
      }
      workout_feedback: {
        Row: {
          created_at: string | null
          diary_id: string | null
          exercise_id: string | null
          id: string
          musculo_correto: boolean | null
          notas: string | null
          problemas: string[] | null
          qualidade_contracao: number | null
          rir_real: number | null
          set_id: string | null
        }
        Insert: {
          created_at?: string | null
          diary_id?: string | null
          exercise_id?: string | null
          id?: string
          musculo_correto?: boolean | null
          notas?: string | null
          problemas?: string[] | null
          qualidade_contracao?: number | null
          rir_real?: number | null
          set_id?: string | null
        }
        Update: {
          created_at?: string | null
          diary_id?: string | null
          exercise_id?: string | null
          id?: string
          musculo_correto?: boolean | null
          notas?: string | null
          problemas?: string[] | null
          qualidade_contracao?: number | null
          rir_real?: number | null
          set_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_feedback_diary_id_fkey"
            columns: ["diary_id"]
            isOneToOne: false
            referencedRelation: "workout_diary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_feedback_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_feedback_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "workout_sets_detail"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_logs: {
        Row: {
          athlete_id: string
          created_at: string
          day_number: number
          exercise_name: string
          id: string
          logged_at: string
          notes: string | null
          protocol_id: string | null
          rpe_felt: number | null
          top_set_kg: number | null
          week_number: number
        }
        Insert: {
          athlete_id: string
          created_at?: string
          day_number: number
          exercise_name: string
          id?: string
          logged_at?: string
          notes?: string | null
          protocol_id?: string | null
          rpe_felt?: number | null
          top_set_kg?: number | null
          week_number: number
        }
        Update: {
          athlete_id?: string
          created_at?: string
          day_number?: number
          exercise_name?: string
          id?: string
          logged_at?: string
          notes?: string | null
          protocol_id?: string | null
          rpe_felt?: number | null
          top_set_kg?: number | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "workout_logs_protocol_id_fkey"
            columns: ["protocol_id"]
            isOneToOne: false
            referencedRelation: "training_protocols"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_schedule: {
        Row: {
          created_at: string | null
          day_of_week: number
          duration_minutes: number
          id: string
          slot: number
          user_id: string
          workout_time: string
          workout_type: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          duration_minutes?: number
          id?: string
          slot?: number
          user_id: string
          workout_time?: string
          workout_type?: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          duration_minutes?: number
          id?: string
          slot?: number
          user_id?: string
          workout_time?: string
          workout_type?: string
        }
        Relationships: []
      }
      workout_sets_detail: {
        Row: {
          carga: number | null
          concluida: boolean | null
          created_at: string | null
          diary_id: string | null
          exercise_id: string | null
          id: string
          notas: string | null
          onde_sentiu: string | null
          percentual_top: number | null
          qualidade: number | null
          reps_alvo: number | null
          reps_realizadas: number | null
          rir_alvo: number | null
          rir_real: number | null
          set_number: number | null
          set_type: string
          tecnica_especial: string | null
          tempo_descanso: number | null
          tempo_execucao: string | null
        }
        Insert: {
          carga?: number | null
          concluida?: boolean | null
          created_at?: string | null
          diary_id?: string | null
          exercise_id?: string | null
          id?: string
          notas?: string | null
          onde_sentiu?: string | null
          percentual_top?: number | null
          qualidade?: number | null
          reps_alvo?: number | null
          reps_realizadas?: number | null
          rir_alvo?: number | null
          rir_real?: number | null
          set_number?: number | null
          set_type?: string
          tecnica_especial?: string | null
          tempo_descanso?: number | null
          tempo_execucao?: string | null
        }
        Update: {
          carga?: number | null
          concluida?: boolean | null
          created_at?: string | null
          diary_id?: string | null
          exercise_id?: string | null
          id?: string
          notas?: string | null
          onde_sentiu?: string | null
          percentual_top?: number | null
          qualidade?: number | null
          reps_alvo?: number | null
          reps_realizadas?: number | null
          rir_alvo?: number | null
          rir_real?: number | null
          set_number?: number | null
          set_type?: string
          tecnica_especial?: string | null
          tempo_descanso?: number | null
          tempo_execucao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_sets_detail_diary_id_fkey"
            columns: ["diary_id"]
            isOneToOne: false
            referencedRelation: "workout_diary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_sets_detail_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_templates: {
        Row: {
          created_at: string | null
          exercicios: Json | null
          fase: string | null
          id: string
          nome: string
          split_tipo: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          exercicios?: Json | null
          fase?: string | null
          id?: string
          nome: string
          split_tipo?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          exercicios?: Json | null
          fase?: string | null
          id?: string
          nome?: string
          split_tipo?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      athlete_progress_summary: {
        Row: {
          bf_atual: number | null
          categoria: string | null
          coach_id: string | null
          data_competicao: string | null
          dias_acompanhamento: number | null
          dias_ate_palco: number | null
          fase_atual: string | null
          id: string | null
          melhor_score: number | null
          nome: string | null
          peso_atual: number | null
          semanas_ate_palco: number | null
          total_avaliacoes: number | null
          ultimo_bf: number | null
          ultimo_peso: number | null
          ultimo_score: number | null
        }
        Relationships: []
      }
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
      generate_unique_coach_code: { Args: never; Returns: string }
      get_anamnesis_by_token: {
        Args: { _token: string }
        Returns: {
          alerts: Json
          athlete_id: string | null
          athlete_name: string | null
          coach_id: string | null
          completed_at: string | null
          created_at: string
          diet_history: Json
          digestive: Json
          expires_at: string | null
          goals: Json
          health_history: Json
          hormonal: Json
          id: string
          invite_token: string | null
          lifestyle: Json
          mode: string
          personal: Json
          pharmacology: Json
          sections_completed: number
          status: string
          supplements: Json
          total_sections: number
          training: Json
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "anamnesis"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_challenge_public: {
        Args: { _slug: string }
        Returns: {
          end_date: string
          gym_name: string
          id: string
          name: string
          participants: number
          slug: string
          start_date: string
          status: string
        }[]
      }
      get_challenge_ranking_public: {
        Args: { _limit?: number; _slug: string }
        Returns: {
          display_name: string
          mce_score: number
          rank_position: number
          streak: number
          tier: string
        }[]
      }
      get_coach_invite_by_token: {
        Args: { _token: string }
        Returns: {
          aluno_id: string | null
          coach_id: string
          created_at: string | null
          expires_at: string
          id: string
          token: string
          usado: boolean | null
        }[]
        SetofOptions: {
          from: "*"
          to: "coach_convites"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_media_kit_by_token: { Args: { _token: string }; Returns: Json }
      get_professional_invite_by_code: {
        Args: { _invite_code: string }
        Returns: {
          accepted_at: string | null
          accepted_by_user_id: string | null
          coach_profile_id: string
          created_at: string
          email: string | null
          expires_at: string
          id: string
          invite_code: string
          message: string | null
          status: string
        }[]
        SetofOptions: {
          from: "*"
          to: "professional_invites"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_coach_slots: { Args: never; Returns: undefined }
      is_challenge_coach: {
        Args: { _challenge_id: string; _user_id: string }
        Returns: boolean
      }
      is_coach_of_patient: {
        Args: { _coach_user_id: string; _patient_user_id: string }
        Returns: boolean
      }
      is_coach_user: { Args: { _user_id: string }; Returns: boolean }
      is_team_member: {
        Args: { _patient_id: string; _professional_id: string }
        Returns: boolean
      }
      my_challenge_ids: { Args: { _user_id: string }; Returns: string[] }
      record_protocol_adjustment: {
        Args: {
          _athlete_id: string
          _description: string
          _metadata?: Json
          _title: string
        }
        Returns: undefined
      }
      save_anamnesis_by_token: {
        Args: {
          _alerts: Json
          _payload: Json
          _sections_completed: number
          _status: string
          _token: string
        }
        Returns: {
          alerts: Json
          athlete_id: string | null
          athlete_name: string | null
          coach_id: string | null
          completed_at: string | null
          created_at: string
          diet_history: Json
          digestive: Json
          expires_at: string | null
          goals: Json
          health_history: Json
          hormonal: Json
          id: string
          invite_token: string | null
          lifestyle: Json
          mode: string
          personal: Json
          pharmacology: Json
          sections_completed: number
          status: string
          supplements: Json
          total_sections: number
          training: Json
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "anamnesis"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      team_role_of: {
        Args: { _patient_id: string; _professional_id: string }
        Returns: Database["public"]["Enums"]["professional_role"]
      }
      user_is_athlete_of_plan: {
        Args: { _plan_id: string; _user_id: string }
        Returns: boolean
      }
      user_owns_competition_plan: {
        Args: { _plan_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      age_group:
        | "JUNIOR"
        | "OPEN"
        | "MASTERS_35"
        | "MASTERS_40"
        | "MASTERS_45"
        | "MASTERS_50"
        | "MASTERS_55"
        | "MASTERS_60"
        | "MASTERS_65"
        | "MASTERS_70_PLUS"
      app_role: "admin" | "moderator" | "user" | "professional"
      athlete_track: "ENHANCED" | "NATURAL" | "LIFESTYLE"
      bia_device_type:
        | "INBODY_270"
        | "INBODY_370"
        | "INBODY_570"
        | "INBODY_770"
        | "INBODY_970"
        | "TANITA_BC601"
        | "TANITA_BC730"
        | "TANITA_MC780"
        | "SEC_SOLUTION"
        | "WISEUP"
        | "OMRON_HBF514"
        | "BIODYNAMICS_310"
        | "BIODYNAMICS_450"
        | "GENERIC_SINGLE_FREQUENCY"
        | "GENERIC_MULTI_FREQUENCY"
        | "OTHER"
      biological_sex: "MALE" | "FEMALE"
      bodybuilding_category:
        | "OPEN_BODYBUILDING"
        | "BODYBUILDING_212"
        | "CLASSIC_PHYSIQUE"
        | "MENS_PHYSIQUE"
        | "WHEELCHAIR_BODYBUILDING"
        | "WOMENS_BODYBUILDING"
        | "WOMENS_PHYSIQUE"
        | "FIGURE"
        | "FITNESS"
        | "WELLNESS"
        | "BIKINI"
      bone_diameter_site:
        | "BIACROMIAL"
        | "BIILIOCRESTAL"
        | "CHEST_TRANSVERSE"
        | "CHEST_ANTEROPOSTERIOR"
        | "HUMERUS_EPICONDYLES"
        | "FEMUR_EPICONDYLES"
        | "WRIST_STYLOID"
        | "ANKLE_MALLEOLI"
      girth_site:
        | "HEAD"
        | "NECK"
        | "CHEST_RELAXED"
        | "CHEST_INSPIRED"
        | "CHEST_EXPIRED"
        | "WAIST_MINIMAL"
        | "WAIST_UMBILICAL"
        | "HIP_MAXIMAL"
        | "GLUTEAL_MAXIMAL"
        | "THIGH_PROXIMAL"
        | "THIGH_MID"
        | "THIGH_DISTAL"
        | "CALF_MAXIMAL"
        | "ARM_RELAXED"
        | "ARM_FLEXED_TENSED"
        | "FOREARM_RELAXED"
        | "FOREARM_FLEXED"
        | "WRIST"
      menstrual_status:
        | "REGULAR"
        | "IRREGULAR"
        | "AMENORRHEA"
        | "PMS_AFFECTED"
        | "PILL"
        | "IUD_HORMONAL"
        | "IUD_COPPER"
        | "POST_MENOPAUSE"
        | "NOT_APPLICABLE"
      meridian_phase:
        | "OFF_SEASON"
        | "PRE_PREP"
        | "DIET_PRINCIPAL"
        | "HARD_CUT"
        | "FINAL_SHARPENING"
        | "PEAK_WEEK"
        | "POST_STAGE_RECOVERY"
      professional_role:
        | "nutricionista"
        | "personal_trainer"
        | "medico_esportivo"
        | "nutrologo"
        | "fisioterapeuta"
        | "psicologo"
        | "coach_esportivo"
        | "preparador_fisico"
      skinfold_protocol:
        | "JACKSON_POLLOCK_3"
        | "JACKSON_POLLOCK_4"
        | "JACKSON_POLLOCK_7"
        | "POLLOCK_7"
        | "PETROSKI_4"
        | "PETROSKI_7"
        | "GUEDES_3"
        | "FAULKNER"
        | "DURNIN_WOMERSLEY_4"
        | "SLAUGHTER_JUVENILE"
        | "LOHMAN_JUVENILE"
        | "ISAK_8"
      skinfold_site:
        | "TRICEPS"
        | "SUBSCAPULAR"
        | "BICEPS"
        | "ILIAC_CREST"
        | "SUPRASPINAL"
        | "ABDOMINAL"
        | "FRONT_THIGH"
        | "MEDIAL_CALF"
        | "CHEST_PECTORAL"
        | "AXILLARY_MID"
        | "SUPRAILIAC"
        | "MEDIAL_THIGH"
        | "SUPRAILIAC_OBLIQUE"
      tensor_assessment_mode:
        | "COACH_FULL"
        | "COACH_SKINFOLD_ONLY"
        | "COACH_BIA_ONLY"
        | "PATIENT_BIA_HOMECARE"
        | "IMPORT_FROM_DEVICE"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      age_group: [
        "JUNIOR",
        "OPEN",
        "MASTERS_35",
        "MASTERS_40",
        "MASTERS_45",
        "MASTERS_50",
        "MASTERS_55",
        "MASTERS_60",
        "MASTERS_65",
        "MASTERS_70_PLUS",
      ],
      app_role: ["admin", "moderator", "user", "professional"],
      athlete_track: ["ENHANCED", "NATURAL", "LIFESTYLE"],
      bia_device_type: [
        "INBODY_270",
        "INBODY_370",
        "INBODY_570",
        "INBODY_770",
        "INBODY_970",
        "TANITA_BC601",
        "TANITA_BC730",
        "TANITA_MC780",
        "SEC_SOLUTION",
        "WISEUP",
        "OMRON_HBF514",
        "BIODYNAMICS_310",
        "BIODYNAMICS_450",
        "GENERIC_SINGLE_FREQUENCY",
        "GENERIC_MULTI_FREQUENCY",
        "OTHER",
      ],
      biological_sex: ["MALE", "FEMALE"],
      bodybuilding_category: [
        "OPEN_BODYBUILDING",
        "BODYBUILDING_212",
        "CLASSIC_PHYSIQUE",
        "MENS_PHYSIQUE",
        "WHEELCHAIR_BODYBUILDING",
        "WOMENS_BODYBUILDING",
        "WOMENS_PHYSIQUE",
        "FIGURE",
        "FITNESS",
        "WELLNESS",
        "BIKINI",
      ],
      bone_diameter_site: [
        "BIACROMIAL",
        "BIILIOCRESTAL",
        "CHEST_TRANSVERSE",
        "CHEST_ANTEROPOSTERIOR",
        "HUMERUS_EPICONDYLES",
        "FEMUR_EPICONDYLES",
        "WRIST_STYLOID",
        "ANKLE_MALLEOLI",
      ],
      girth_site: [
        "HEAD",
        "NECK",
        "CHEST_RELAXED",
        "CHEST_INSPIRED",
        "CHEST_EXPIRED",
        "WAIST_MINIMAL",
        "WAIST_UMBILICAL",
        "HIP_MAXIMAL",
        "GLUTEAL_MAXIMAL",
        "THIGH_PROXIMAL",
        "THIGH_MID",
        "THIGH_DISTAL",
        "CALF_MAXIMAL",
        "ARM_RELAXED",
        "ARM_FLEXED_TENSED",
        "FOREARM_RELAXED",
        "FOREARM_FLEXED",
        "WRIST",
      ],
      menstrual_status: [
        "REGULAR",
        "IRREGULAR",
        "AMENORRHEA",
        "PMS_AFFECTED",
        "PILL",
        "IUD_HORMONAL",
        "IUD_COPPER",
        "POST_MENOPAUSE",
        "NOT_APPLICABLE",
      ],
      meridian_phase: [
        "OFF_SEASON",
        "PRE_PREP",
        "DIET_PRINCIPAL",
        "HARD_CUT",
        "FINAL_SHARPENING",
        "PEAK_WEEK",
        "POST_STAGE_RECOVERY",
      ],
      professional_role: [
        "nutricionista",
        "personal_trainer",
        "medico_esportivo",
        "nutrologo",
        "fisioterapeuta",
        "psicologo",
        "coach_esportivo",
        "preparador_fisico",
      ],
      skinfold_protocol: [
        "JACKSON_POLLOCK_3",
        "JACKSON_POLLOCK_4",
        "JACKSON_POLLOCK_7",
        "POLLOCK_7",
        "PETROSKI_4",
        "PETROSKI_7",
        "GUEDES_3",
        "FAULKNER",
        "DURNIN_WOMERSLEY_4",
        "SLAUGHTER_JUVENILE",
        "LOHMAN_JUVENILE",
        "ISAK_8",
      ],
      skinfold_site: [
        "TRICEPS",
        "SUBSCAPULAR",
        "BICEPS",
        "ILIAC_CREST",
        "SUPRASPINAL",
        "ABDOMINAL",
        "FRONT_THIGH",
        "MEDIAL_CALF",
        "CHEST_PECTORAL",
        "AXILLARY_MID",
        "SUPRAILIAC",
        "MEDIAL_THIGH",
        "SUPRAILIAC_OBLIQUE",
      ],
      tensor_assessment_mode: [
        "COACH_FULL",
        "COACH_SKINFOLD_ONLY",
        "COACH_BIA_ONLY",
        "PATIENT_BIA_HOMECARE",
        "IMPORT_FROM_DEVICE",
      ],
    },
  },
} as const
