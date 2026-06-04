
-- ============================================================
-- TENSOR — Módulo de Composição Corporal Multi-Compartimental
-- Bloco 1: Schema, RLS e Seed inicial
-- ============================================================

-- =========== TIPOS ENUMERADOS ===========

-- Protocolos antropométricos suportados
CREATE TYPE skinfold_protocol AS ENUM (
  'JACKSON_POLLOCK_3', 'JACKSON_POLLOCK_4', 'JACKSON_POLLOCK_7',
  'POLLOCK_7', 'PETROSKI_4', 'PETROSKI_7',
  'GUEDES_3', 'FAULKNER', 'DURNIN_WOMERSLEY_4',
  'SLAUGHTER_JUVENILE', 'LOHMAN_JUVENILE',
  'ISAK_8'
);

-- Aparelhos de bioimpedância suportados
CREATE TYPE bia_device_type AS ENUM (
  'INBODY_270', 'INBODY_370', 'INBODY_570', 'INBODY_770', 'INBODY_970',
  'TANITA_BC601', 'TANITA_BC730', 'TANITA_MC780',
  'SEC_SOLUTION', 'WISEUP', 'OMRON_HBF514',
  'BIODYNAMICS_310', 'BIODYNAMICS_450',
  'GENERIC_SINGLE_FREQUENCY', 'GENERIC_MULTI_FREQUENCY',
  'OTHER'
);

-- Sítios anatômicos de dobras cutâneas
CREATE TYPE skinfold_site AS ENUM (
  'TRICEPS', 'SUBSCAPULAR', 'BICEPS',
  'ILIAC_CREST', 'SUPRASPINAL', 'ABDOMINAL',
  'FRONT_THIGH', 'MEDIAL_CALF',
  'CHEST_PECTORAL', 'AXILLARY_MID', 'SUPRAILIAC',
  'MEDIAL_THIGH', 'SUPRAILIAC_OBLIQUE'
);

-- Sítios de perimetria
CREATE TYPE girth_site AS ENUM (
  'HEAD', 'NECK',
  'CHEST_RELAXED', 'CHEST_INSPIRED', 'CHEST_EXPIRED',
  'WAIST_MINIMAL', 'WAIST_UMBILICAL',
  'HIP_MAXIMAL', 'GLUTEAL_MAXIMAL',
  'THIGH_PROXIMAL', 'THIGH_MID', 'THIGH_DISTAL',
  'CALF_MAXIMAL',
  'ARM_RELAXED', 'ARM_FLEXED_TENSED',
  'FOREARM_RELAXED', 'FOREARM_FLEXED',
  'WRIST'
);

-- Sítios de diâmetro ósseo
CREATE TYPE bone_diameter_site AS ENUM (
  'BIACROMIAL', 'BIILIOCRESTAL',
  'CHEST_TRANSVERSE', 'CHEST_ANTEROPOSTERIOR',
  'HUMERUS_EPICONDYLES', 'FEMUR_EPICONDYLES',
  'WRIST_STYLOID', 'ANKLE_MALLEOLI'
);

-- Modo da avaliação (coleta presencial vs homecare)
CREATE TYPE tensor_assessment_mode AS ENUM (
  'COACH_FULL',
  'COACH_SKINFOLD_ONLY',
  'COACH_BIA_ONLY',
  'PATIENT_BIA_HOMECARE',
  'IMPORT_FROM_DEVICE'
);

-- ============================================================
-- TABELA PRINCIPAL: Avaliação composicional (sessão)
-- ============================================================
CREATE TABLE public.tensor_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_user_id UUID REFERENCES auth.users(id),

  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  assessment_mode tensor_assessment_mode NOT NULL,
  location TEXT,

  -- Snapshot biométrico do momento
  weight_kg DECIMAL(5,2) NOT NULL,
  height_cm DECIMAL(5,2) NOT NULL,
  age_years DECIMAL(4,1) NOT NULL,
  biological_sex TEXT NOT NULL,

  skinfold_protocol skinfold_protocol,
  bia_device bia_device_type,

  -- Condições clínicas de coleta
  is_fasting BOOLEAN,
  hours_since_last_meal INT,
  is_post_exercise BOOLEAN,
  hours_since_exercise INT,
  hydration_status TEXT,
  menstrual_phase TEXT,

  clinical_notes TEXT,
  patient_subjective_notes TEXT,

  consent_signed BOOLEAN DEFAULT false,
  consent_signed_at TIMESTAMPTZ,

  is_validated BOOLEAN DEFAULT false,
  validated_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tensor_assessments TO authenticated;
GRANT ALL ON public.tensor_assessments TO service_role;
ALTER TABLE public.tensor_assessments ENABLE ROW LEVEL SECURITY;

-- Paciente lê suas próprias avaliações
CREATE POLICY "tensor_assess_patient_select" ON public.tensor_assessments
FOR SELECT TO authenticated
USING (patient_user_id = auth.uid());

-- Coach lê avaliações de pacientes vinculados
CREATE POLICY "tensor_assess_coach_select" ON public.tensor_assessments
FOR SELECT TO authenticated
USING (public.is_coach_of_patient(auth.uid(), patient_user_id));

-- Coach cria avaliação para paciente vinculado
CREATE POLICY "tensor_assess_coach_insert" ON public.tensor_assessments
FOR INSERT TO authenticated
WITH CHECK (
  coach_user_id = auth.uid()
  AND public.is_coach_of_patient(auth.uid(), patient_user_id)
);

-- Paciente cria sua própria avaliação (homecare)
CREATE POLICY "tensor_assess_patient_insert" ON public.tensor_assessments
FOR INSERT TO authenticated
WITH CHECK (
  patient_user_id = auth.uid()
  AND assessment_mode IN ('PATIENT_BIA_HOMECARE', 'IMPORT_FROM_DEVICE')
);

-- Apenas o coach criador edita
CREATE POLICY "tensor_assess_coach_update" ON public.tensor_assessments
FOR UPDATE TO authenticated
USING (coach_user_id = auth.uid())
WITH CHECK (coach_user_id = auth.uid());

-- Apenas o coach criador deleta
CREATE POLICY "tensor_assess_coach_delete" ON public.tensor_assessments
FOR DELETE TO authenticated
USING (coach_user_id = auth.uid());

-- ============================================================
-- DOBRAS CUTÂNEAS (até 3 medidas para ETM)
-- ============================================================
CREATE TABLE public.tensor_skinfold_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.tensor_assessments(id) ON DELETE CASCADE,
  site skinfold_site NOT NULL,

  measure_1_mm DECIMAL(4,1) NOT NULL,
  measure_2_mm DECIMAL(4,1),
  measure_3_mm DECIMAL(4,1),

  final_value_mm DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE
      WHEN measure_3_mm IS NOT NULL THEN
        (measure_1_mm + measure_2_mm + measure_3_mm) / 3.0
      WHEN measure_2_mm IS NOT NULL THEN
        (measure_1_mm + measure_2_mm) / 2.0
      ELSE measure_1_mm
    END
  ) STORED,

  etm_intra DECIMAL(4,2),
  is_outlier BOOLEAN DEFAULT false,
  outlier_reason TEXT,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (assessment_id, site)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tensor_skinfold_measurements TO authenticated;
GRANT ALL ON public.tensor_skinfold_measurements TO service_role;
ALTER TABLE public.tensor_skinfold_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tensor_skinfold_select" ON public.tensor_skinfold_measurements
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tensor_assessments ta
    WHERE ta.id = assessment_id
      AND (ta.patient_user_id = auth.uid()
           OR public.is_coach_of_patient(auth.uid(), ta.patient_user_id))
  )
);

CREATE POLICY "tensor_skinfold_write" ON public.tensor_skinfold_measurements
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tensor_assessments ta
    WHERE ta.id = assessment_id AND ta.coach_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tensor_assessments ta
    WHERE ta.id = assessment_id AND ta.coach_user_id = auth.uid()
  )
);

-- ============================================================
-- PERIMETRIAS
-- ============================================================
CREATE TABLE public.tensor_girth_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.tensor_assessments(id) ON DELETE CASCADE,
  site girth_site NOT NULL,

  measure_1_cm DECIMAL(5,2) NOT NULL,
  measure_2_cm DECIMAL(5,2),
  final_value_cm DECIMAL(6,3) GENERATED ALWAYS AS (
    CASE
      WHEN measure_2_cm IS NOT NULL THEN (measure_1_cm + measure_2_cm) / 2.0
      ELSE measure_1_cm
    END
  ) STORED,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (assessment_id, site)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tensor_girth_measurements TO authenticated;
GRANT ALL ON public.tensor_girth_measurements TO service_role;
ALTER TABLE public.tensor_girth_measurements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tensor_girth_select" ON public.tensor_girth_measurements
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tensor_assessments ta
    WHERE ta.id = assessment_id
      AND (ta.patient_user_id = auth.uid()
           OR public.is_coach_of_patient(auth.uid(), ta.patient_user_id))
  )
);

CREATE POLICY "tensor_girth_write" ON public.tensor_girth_measurements
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tensor_assessments ta
    WHERE ta.id = assessment_id AND ta.coach_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tensor_assessments ta
    WHERE ta.id = assessment_id AND ta.coach_user_id = auth.uid()
  )
);

-- ============================================================
-- DIÂMETROS ÓSSEOS
-- ============================================================
CREATE TABLE public.tensor_bone_diameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.tensor_assessments(id) ON DELETE CASCADE,
  site bone_diameter_site NOT NULL,
  value_cm DECIMAL(5,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (assessment_id, site)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tensor_bone_diameters TO authenticated;
GRANT ALL ON public.tensor_bone_diameters TO service_role;
ALTER TABLE public.tensor_bone_diameters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tensor_bone_select" ON public.tensor_bone_diameters
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tensor_assessments ta
    WHERE ta.id = assessment_id
      AND (ta.patient_user_id = auth.uid()
           OR public.is_coach_of_patient(auth.uid(), ta.patient_user_id))
  )
);

CREATE POLICY "tensor_bone_write" ON public.tensor_bone_diameters
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tensor_assessments ta
    WHERE ta.id = assessment_id AND ta.coach_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tensor_assessments ta
    WHERE ta.id = assessment_id AND ta.coach_user_id = auth.uid()
  )
);

-- ============================================================
-- BIOIMPEDÂNCIA
-- ============================================================
CREATE TABLE public.tensor_bia_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.tensor_assessments(id) ON DELETE CASCADE,

  body_fat_kg DECIMAL(5,2),
  body_fat_percent DECIMAL(4,2),
  lean_body_mass_kg DECIMAL(5,2),
  fat_free_mass_kg DECIMAL(5,2),
  skeletal_muscle_mass_kg DECIMAL(5,2),
  bone_mineral_content_kg DECIMAL(4,2),
  visceral_fat_level INT,
  visceral_fat_area_cm2 DECIMAL(5,2),

  total_body_water_l DECIMAL(4,2),
  intracellular_water_l DECIMAL(4,2),
  extracellular_water_l DECIMAL(4,2),
  ecw_tbw_ratio DECIMAL(4,3),
  icw_ecw_ratio DECIMAL(4,3),

  phase_angle_degrees DECIMAL(4,2),
  resistance_ohms DECIMAL(6,2),
  reactance_ohms DECIMAL(5,2),
  impedance_ohms DECIMAL(6,2),
  frequency_hz INT,

  segmental_lean_mass JSONB,
  segmental_fat_mass JSONB,
  segmental_water JSONB,

  protein_kg DECIMAL(4,2),
  mineral_kg DECIMAL(4,2),

  raw_device_output JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (assessment_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tensor_bia_results TO authenticated;
GRANT ALL ON public.tensor_bia_results TO service_role;
ALTER TABLE public.tensor_bia_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tensor_bia_select" ON public.tensor_bia_results
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tensor_assessments ta
    WHERE ta.id = assessment_id
      AND (ta.patient_user_id = auth.uid()
           OR public.is_coach_of_patient(auth.uid(), ta.patient_user_id))
  )
);

CREATE POLICY "tensor_bia_write" ON public.tensor_bia_results
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tensor_assessments ta
    WHERE ta.id = assessment_id
      AND (ta.coach_user_id = auth.uid() OR ta.patient_user_id = auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tensor_assessments ta
    WHERE ta.id = assessment_id
      AND (ta.coach_user_id = auth.uid() OR ta.patient_user_id = auth.uid())
  )
);

-- ============================================================
-- RESULTADOS CALCULADOS
-- ============================================================
CREATE TABLE public.tensor_calculated_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.tensor_assessments(id) ON DELETE CASCADE,

  bf_percent_skinfold DECIMAL(4,2),
  bf_kg_skinfold DECIMAL(5,2),
  lbm_kg_skinfold DECIMAL(5,2),
  body_density_g_ml DECIMAL(6,4),

  smm_kg_lee DECIMAL(5,2),

  bf_percent_bia DECIMAL(4,2),
  lbm_kg_bia DECIMAL(5,2),

  bf_percent_consensus DECIMAL(4,2),
  lbm_kg_consensus DECIMAL(5,2),
  consensus_method TEXT,

  inter_protocol_delta_bf DECIMAL(4,2),
  inter_protocol_alert BOOLEAN DEFAULT false,
  inter_protocol_alert_message TEXT,

  waist_hip_ratio DECIMAL(4,3),
  waist_height_ratio DECIMAL(4,3),
  conicity_index DECIMAL(4,3),
  bmi DECIMAL(4,2),
  body_adiposity_index DECIMAL(4,2),

  endomorphy DECIMAL(3,1),
  mesomorphy DECIMAL(3,1),
  ectomorphy DECIMAL(3,1),
  somatotype_classification TEXT,

  sport_specific_metrics JSONB,

  phase_angle_prognosis TEXT,
  catabolism_risk TEXT,

  warnings TEXT[],

  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  calculation_engine_version TEXT,

  UNIQUE (assessment_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tensor_calculated_results TO authenticated;
GRANT ALL ON public.tensor_calculated_results TO service_role;
ALTER TABLE public.tensor_calculated_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tensor_calc_select" ON public.tensor_calculated_results
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tensor_assessments ta
    WHERE ta.id = assessment_id
      AND (ta.patient_user_id = auth.uid()
           OR public.is_coach_of_patient(auth.uid(), ta.patient_user_id))
  )
);

CREATE POLICY "tensor_calc_write" ON public.tensor_calculated_results
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tensor_assessments ta
    WHERE ta.id = assessment_id AND ta.coach_user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tensor_assessments ta
    WHERE ta.id = assessment_id AND ta.coach_user_id = auth.uid()
  )
);

-- ============================================================
-- TRAJETÓRIA LONGITUDINAL
-- ============================================================
CREATE TABLE public.tensor_trajectory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_assessment_id UUID NOT NULL REFERENCES public.tensor_assessments(id) ON DELETE CASCADE,
  to_assessment_id UUID NOT NULL REFERENCES public.tensor_assessments(id) ON DELETE CASCADE,

  days_between INT NOT NULL,

  weight_delta_kg DECIMAL(5,2),
  fat_delta_kg DECIMAL(5,2),
  lean_delta_kg DECIMAL(5,2),
  water_delta_l DECIMAL(4,2),
  smm_delta_kg DECIMAL(5,2),

  bf_percent_delta DECIMAL(4,2),
  phase_angle_delta DECIMAL(4,2),

  trajectory_quality TEXT,
  insights TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE (from_assessment_id, to_assessment_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tensor_trajectory TO authenticated;
GRANT ALL ON public.tensor_trajectory TO service_role;
ALTER TABLE public.tensor_trajectory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tensor_traj_select" ON public.tensor_trajectory
FOR SELECT TO authenticated
USING (
  patient_user_id = auth.uid()
  OR public.is_coach_of_patient(auth.uid(), patient_user_id)
);

CREATE POLICY "tensor_traj_coach_write" ON public.tensor_trajectory
FOR ALL TO authenticated
USING (public.is_coach_of_patient(auth.uid(), patient_user_id))
WITH CHECK (public.is_coach_of_patient(auth.uid(), patient_user_id));

-- ============================================================
-- LIBRARY DE EQUAÇÕES (lookup público para autenticados)
-- ============================================================
CREATE TABLE public.tensor_equations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol skinfold_protocol NOT NULL,
  population_sex TEXT,
  age_min_years DECIMAL(4,1),
  age_max_years DECIMAL(4,1),
  ethnicity TEXT,

  density_formula TEXT NOT NULL,
  required_sites TEXT[] NOT NULL,

  bf_conversion_method TEXT NOT NULL,

  reference_citation TEXT,
  notes TEXT
);

GRANT SELECT ON public.tensor_equations TO authenticated;
GRANT ALL ON public.tensor_equations TO service_role;
ALTER TABLE public.tensor_equations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tensor_eq_public_read" ON public.tensor_equations
FOR SELECT TO authenticated
USING (true);

-- ============================================================
-- LOG DE CONSENTIMENTO (LGPD)
-- ============================================================
CREATE TABLE public.tensor_consent_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES public.tensor_assessments(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  consent_text TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  signed_at TIMESTAMPTZ DEFAULT NOW()
);

GRANT SELECT, INSERT ON public.tensor_consent_log TO authenticated;
GRANT ALL ON public.tensor_consent_log TO service_role;
ALTER TABLE public.tensor_consent_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tensor_consent_select" ON public.tensor_consent_log
FOR SELECT TO authenticated
USING (
  patient_user_id = auth.uid()
  OR public.is_coach_of_patient(auth.uid(), patient_user_id)
);

CREATE POLICY "tensor_consent_insert" ON public.tensor_consent_log
FOR INSERT TO authenticated
WITH CHECK (
  patient_user_id = auth.uid()
  OR public.is_coach_of_patient(auth.uid(), patient_user_id)
);

-- ============================================================
-- TRIGGER updated_at
-- ============================================================
CREATE TRIGGER tensor_assessments_updated_at
  BEFORE UPDATE ON public.tensor_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX idx_tensor_assess_patient ON public.tensor_assessments(patient_user_id, assessment_date DESC);
CREATE INDEX idx_tensor_assess_coach ON public.tensor_assessments(coach_user_id, assessment_date DESC);
CREATE INDEX idx_tensor_skinfold_assess ON public.tensor_skinfold_measurements(assessment_id);
CREATE INDEX idx_tensor_girth_assess ON public.tensor_girth_measurements(assessment_id);
CREATE INDEX idx_tensor_bone_assess ON public.tensor_bone_diameters(assessment_id);
CREATE INDEX idx_tensor_traj_patient ON public.tensor_trajectory(patient_user_id, created_at DESC);

-- ============================================================
-- SEED INICIAL DE EQUAÇÕES (4 protocolos mais usados no Brasil)
-- ============================================================
INSERT INTO public.tensor_equations (protocol, population_sex, age_min_years, age_max_years, ethnicity, density_formula, required_sites, bf_conversion_method, reference_citation, notes) VALUES
(
  'JACKSON_POLLOCK_3', 'MALE', 18, 61, 'GENERIC',
  'D = 1.10938 - 0.0008267 * SUM + 0.0000016 * SUM^2 - 0.0002574 * AGE',
  ARRAY['CHEST_PECTORAL','ABDOMINAL','FRONT_THIGH'],
  'SIRI',
  'Jackson AS, Pollock ML (1978). Generalized equations for predicting body density of men.',
  'Equação genérica mais usada para homens adultos.'
),
(
  'JACKSON_POLLOCK_3', 'FEMALE', 18, 55, 'GENERIC',
  'D = 1.0994921 - 0.0009929 * SUM + 0.0000023 * SUM^2 - 0.0001392 * AGE',
  ARRAY['TRICEPS','SUPRAILIAC','FRONT_THIGH'],
  'SIRI',
  'Jackson AS, Pollock ML, Ward A (1980). Generalized equations for predicting body density of women.',
  'Equação genérica mais usada para mulheres adultas.'
),
(
  'JACKSON_POLLOCK_7', 'MALE', 18, 61, 'GENERIC',
  'D = 1.112 - 0.00043499 * SUM + 0.00000055 * SUM^2 - 0.00028826 * AGE',
  ARRAY['CHEST_PECTORAL','AXILLARY_MID','TRICEPS','SUBSCAPULAR','ABDOMINAL','SUPRAILIAC','FRONT_THIGH'],
  'SIRI',
  'Jackson AS, Pollock ML (1978).',
  'Versão de 7 dobras — maior precisão.'
),
(
  'JACKSON_POLLOCK_7', 'FEMALE', 18, 55, 'GENERIC',
  'D = 1.097 - 0.00046971 * SUM + 0.00000056 * SUM^2 - 0.00012828 * AGE',
  ARRAY['CHEST_PECTORAL','AXILLARY_MID','TRICEPS','SUBSCAPULAR','ABDOMINAL','SUPRAILIAC','FRONT_THIGH'],
  'SIRI',
  'Jackson AS, Pollock ML, Ward A (1980).',
  'Versão de 7 dobras — maior precisão.'
),
(
  'PETROSKI_4', 'MALE', 18, 51, 'BRAZILIAN',
  'D = 1.10726863 - 0.00081201 * SUM + 0.00000212 * SUM^2 - 0.00041761 * AGE',
  ARRAY['SUBSCAPULAR','TRICEPS','SUPRAILIAC','MEDIAL_CALF'],
  'SIRI',
  'Petroski EL (1995). Desenvolvimento e validação de equações generalizadas.',
  'Validada para população brasileira — preferida no BR.'
),
(
  'PETROSKI_4', 'FEMALE', 18, 51, 'BRAZILIAN',
  'D = 1.03 - 0.00126 * SUM',
  ARRAY['AXILLARY_MID','SUPRAILIAC','FRONT_THIGH','MEDIAL_CALF'],
  'SIRI',
  'Petroski EL (1995).',
  'Validada para mulheres brasileiras. Fórmula simplificada (versão completa requer CQuadril + DUmero).'
),
(
  'GUEDES_3', 'MALE', 18, 60, 'BRAZILIAN',
  'D = 1.17136 - 0.06706 * LOG10(SUM)',
  ARRAY['TRICEPS','ABDOMINAL','SUPRAILIAC'],
  'SIRI',
  'Guedes DP (1985). Estudo da gordura corporal através da mensuração de dobras cutâneas.',
  'Equação brasileira de 3 dobras — uso clínico amplo no BR.'
),
(
  'GUEDES_3', 'FEMALE', 18, 51, 'BRAZILIAN',
  'D = 1.16650 - 0.07063 * LOG10(SUM)',
  ARRAY['SUBSCAPULAR','SUPRAILIAC','FRONT_THIGH'],
  'SIRI',
  'Guedes DP (1985).',
  'Equação brasileira de 3 dobras para mulheres.'
);
