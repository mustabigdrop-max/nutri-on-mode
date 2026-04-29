
-- ===== Tabelas =====
CREATE TABLE IF NOT EXISTS public.competition_athletes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL,
  patient_user_id UUID,
  nome TEXT NOT NULL,
  data_nascimento DATE,
  sexo TEXT CHECK (sexo IN ('masculino', 'feminino')),
  categoria TEXT NOT NULL,
  federacao TEXT DEFAULT 'IFBB',
  nivel TEXT DEFAULT 'avancado',
  peso_kg NUMERIC(5,1),
  altura_cm NUMERIC(5,1),
  bf_atual NUMERIC(4,1),
  massa_magra_kg NUMERIC(5,1),
  data_competicao DATE,
  nome_competicao TEXT,
  bf_meta_palco NUMERIC(4,1),
  peso_palco_meta NUMERIC(5,1),
  protocolo_farmacologico TEXT,
  historico_lesoes TEXT,
  pontos_fracos_conhecidos TEXT,
  fase_atual TEXT DEFAULT 'off_season',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.athlete_visual_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES public.competition_athletes(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL,
  semana_numero INTEGER NOT NULL,
  data_avaliacao DATE NOT NULL DEFAULT CURRENT_DATE,
  semanas_ate_palco INTEGER,
  fase TEXT NOT NULL,
  peso_kg NUMERIC(5,1),
  bf_estimado NUMERIC(4,1),
  massa_magra_kg NUMERIC(5,1),
  foto_url TEXT,
  foto_frontal_url TEXT,
  foto_lateral_url TEXT,
  foto_posterior_url TEXT,
  analise_ia JSONB,
  score_geral INTEGER CHECK (score_geral BETWEEN 0 AND 100),
  score_ombros NUMERIC(3,1),
  score_peito NUMERIC(3,1),
  score_costas_largura NUMERIC(3,1),
  score_costas_espessura NUMERIC(3,1),
  score_bracos NUMERIC(3,1),
  score_abdomen NUMERIC(3,1),
  score_cintura NUMERIC(3,1),
  score_pernas NUMERIC(3,1),
  score_simetria NUMERIC(3,1),
  score_proporcoes NUMERIC(3,1),
  score_condicionamento NUMERIC(3,1),
  observacoes_coach TEXT,
  ajustes_plano TEXT,
  meta_proxima_semana TEXT,
  alertas JSONB,
  progresso_status TEXT DEFAULT 'on_track' CHECK (
    progresso_status IN ('on_track', 'ahead', 'behind', 'critical')
  ),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.athlete_weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES public.competition_athletes(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.athlete_visual_assessments(id),
  coach_id UUID NOT NULL,
  semana_numero INTEGER NOT NULL,
  data_envio TIMESTAMPTZ DEFAULT NOW(),
  titulo TEXT,
  resumo_executivo TEXT,
  pontos_positivos JSONB,
  pontos_atencao JSONB,
  ajustes_treino TEXT,
  ajustes_nutricao TEXT,
  meta_proxima_semana TEXT,
  mensagem_motivacional TEXT,
  variacao_peso NUMERIC(4,1),
  variacao_bf NUMERIC(3,1),
  variacao_score INTEGER,
  enviado_whatsapp BOOLEAN DEFAULT false,
  enviado_email BOOLEAN DEFAULT false,
  visualizado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.athlete_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID NOT NULL REFERENCES public.competition_athletes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  valor_numerico NUMERIC(6,2),
  data_marco DATE DEFAULT CURRENT_DATE,
  semana_numero INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== Índices =====
CREATE INDEX IF NOT EXISTS idx_assessments_athlete ON public.athlete_visual_assessments(athlete_id, data_avaliacao DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_coach ON public.athlete_visual_assessments(coach_id);
CREATE INDEX IF NOT EXISTS idx_athletes_coach ON public.competition_athletes(coach_id);
CREATE INDEX IF NOT EXISTS idx_reports_athlete ON public.athlete_weekly_reports(athlete_id, data_envio DESC);

-- ===== Trigger updated_at =====
CREATE TRIGGER update_competition_athletes_updated_at
BEFORE UPDATE ON public.competition_athletes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== RLS =====
ALTER TABLE public.competition_athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_visual_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coach acessa próprios atletas" ON public.competition_athletes
  FOR ALL USING (coach_id = auth.uid()) WITH CHECK (coach_id = auth.uid());

CREATE POLICY "Coach acessa avaliações dos próprios atletas" ON public.athlete_visual_assessments
  FOR ALL USING (coach_id = auth.uid()) WITH CHECK (coach_id = auth.uid());

CREATE POLICY "Coach acessa relatórios dos próprios atletas" ON public.athlete_weekly_reports
  FOR ALL USING (coach_id = auth.uid()) WITH CHECK (coach_id = auth.uid());

CREATE POLICY "Coach acessa marcos dos próprios atletas" ON public.athlete_milestones
  FOR ALL USING (
    athlete_id IN (SELECT id FROM public.competition_athletes WHERE coach_id = auth.uid())
  ) WITH CHECK (
    athlete_id IN (SELECT id FROM public.competition_athletes WHERE coach_id = auth.uid())
  );

-- ===== Storage bucket =====
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('athlete-photos', 'athlete-photos', false, 10485760, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Coach lê próprias fotos de atletas"
ON storage.objects FOR SELECT
USING (bucket_id = 'athlete-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Coach envia fotos de atletas"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'athlete-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Coach atualiza próprias fotos de atletas"
ON storage.objects FOR UPDATE
USING (bucket_id = 'athlete-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Coach apaga próprias fotos de atletas"
ON storage.objects FOR DELETE
USING (bucket_id = 'athlete-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ===== View resumo (security_invoker para herdar RLS) =====
CREATE OR REPLACE VIEW public.athlete_progress_summary
WITH (security_invoker = true) AS
SELECT
  a.id,
  a.coach_id,
  a.nome,
  a.categoria,
  a.data_competicao,
  a.fase_atual,
  a.peso_kg AS peso_atual,
  a.bf_atual,
  CURRENT_DATE - a.created_at::date AS dias_acompanhamento,
  GREATEST(0, a.data_competicao - CURRENT_DATE) AS dias_ate_palco,
  CEIL(GREATEST(0, a.data_competicao - CURRENT_DATE) / 7.0) AS semanas_ate_palco,
  COUNT(av.id) AS total_avaliacoes,
  MAX(av.score_geral) AS melhor_score,
  (SELECT score_geral FROM public.athlete_visual_assessments
   WHERE athlete_id = a.id ORDER BY data_avaliacao DESC LIMIT 1) AS ultimo_score,
  (SELECT peso_kg FROM public.athlete_visual_assessments
   WHERE athlete_id = a.id ORDER BY data_avaliacao DESC LIMIT 1) AS ultimo_peso,
  (SELECT bf_estimado FROM public.athlete_visual_assessments
   WHERE athlete_id = a.id ORDER BY data_avaliacao DESC LIMIT 1) AS ultimo_bf
FROM public.competition_athletes a
LEFT JOIN public.athlete_visual_assessments av ON av.athlete_id = a.id
WHERE a.ativo = true
GROUP BY a.id, a.coach_id, a.nome, a.categoria, a.data_competicao,
         a.fase_atual, a.peso_kg, a.bf_atual, a.created_at;
