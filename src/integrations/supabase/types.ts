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
      coach_profiles: {
        Row: {
          alert_channels: Json | null
          alert_frequency: string | null
          alunos_ativos: number | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          crn: string | null
          id: string
          max_alunos: number | null
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
          alunos_ativos?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          crn?: string | null
          id?: string
          max_alunos?: number | null
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
          alunos_ativos?: number | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          crn?: string | null
          id?: string
          max_alunos?: number | null
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
          musculo_primario: string
          musculos_secundarios: string[] | null
          nome: string
          prioridade: number | null
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
          musculo_primario: string
          musculos_secundarios?: string[] | null
          nome: string
          prioridade?: number | null
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
          musculo_primario?: string
          musculos_secundarios?: string[] | null
          nome?: string
          prioridade?: number | null
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
      fitoterapicos_lib: {
        Row: {
          ciclo: string | null
          contraindicoes: string[] | null
          created_at: string | null
          dose: string | null
          farmacocinetica: Json | null
          id: string
          indicacoes: string[] | null
          interacoes: string[] | null
          mecanismo: string | null
          nome: string
          origem: string | null
          timing: string | null
        }
        Insert: {
          ciclo?: string | null
          contraindicoes?: string[] | null
          created_at?: string | null
          dose?: string | null
          farmacocinetica?: Json | null
          id?: string
          indicacoes?: string[] | null
          interacoes?: string[] | null
          mecanismo?: string | null
          nome: string
          origem?: string | null
          timing?: string | null
        }
        Update: {
          ciclo?: string | null
          contraindicoes?: string[] | null
          created_at?: string | null
          dose?: string | null
          farmacocinetica?: Json | null
          id?: string
          indicacoes?: string[] | null
          interacoes?: string[] | null
          mecanismo?: string | null
          nome?: string
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
          temp_password: string | null
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
          temp_password?: string | null
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
          temp_password?: string | null
          user_id?: string | null
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
          features_override: Json | null
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
          role: string | null
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
          features_override?: Json | null
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
          role?: string | null
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
          features_override?: Json | null
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
          role?: string | null
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
          level: string | null
          muscles: string[] | null
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
          level?: string | null
          muscles?: string[] | null
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
          level?: string | null
          muscles?: string[] | null
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
