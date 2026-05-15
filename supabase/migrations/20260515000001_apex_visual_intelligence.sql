-- ─── APEX VISUAL INTELLIGENCE ─────────────────────────────────────────────
-- PhD-level kinesiology: posture, FMS, pain, ROM, muscle development, corrective protocols

-- Main assessment record (one per session)
CREATE TABLE IF NOT EXISTS apex_assessments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT now(),
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  overall_score SMALLINT CHECK (overall_score BETWEEN 0 AND 100),
  posture_score SMALLINT CHECK (posture_score BETWEEN 0 AND 100),
  mobility_score SMALLINT CHECK (mobility_score BETWEEN 0 AND 100),
  symmetry_score SMALLINT CHECK (symmetry_score BETWEEN 0 AND 100),
  fms_total     SMALLINT CHECK (fms_total BETWEEN 0 AND 21),
  notes         TEXT
);

-- Static postural assessment (3-plane analysis)
CREATE TABLE IF NOT EXISTS apex_posture_data (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id    UUID REFERENCES apex_assessments(id) ON DELETE CASCADE NOT NULL,
  user_id          UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT now(),
  -- Sagittal plane
  forward_head     TEXT CHECK (forward_head IN ('none','mild','moderate','severe')) DEFAULT 'none',
  thoracic_kyphosis TEXT CHECK (thoracic_kyphosis IN ('normal','mild','moderate','severe')) DEFAULT 'normal',
  lumbar_lordosis  TEXT CHECK (lumbar_lordosis IN ('normal','increased','decreased')) DEFAULT 'normal',
  pelvic_tilt      TEXT CHECK (pelvic_tilt IN ('neutral','anterior','posterior')) DEFAULT 'neutral',
  -- Frontal plane
  shoulder_asym    TEXT CHECK (shoulder_asym IN ('none','mild','moderate')) DEFAULT 'none',
  hip_asym         TEXT CHECK (hip_asym IN ('none','mild','moderate')) DEFAULT 'none',
  scoliosis        TEXT CHECK (scoliosis IN ('none','functional','structural')) DEFAULT 'none',
  -- Janda syndromes (auto-computed)
  upper_crossed    TEXT CHECK (upper_crossed IN ('none','mild','moderate','severe')) DEFAULT 'none',
  lower_crossed    TEXT CHECK (lower_crossed IN ('none','mild','moderate','severe')) DEFAULT 'none',
  pronation_dist   TEXT CHECK (pronation_dist IN ('none','mild','moderate','severe')) DEFAULT 'none'
);

-- FMS (Functional Movement Screen) — 7 tests, score 0-3 each
CREATE TABLE IF NOT EXISTS apex_fms_scores (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id  UUID REFERENCES apex_assessments(id) ON DELETE CASCADE NOT NULL,
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT now(),
  deep_squat     SMALLINT CHECK (deep_squat BETWEEN 0 AND 3),
  hurdle_step_l  SMALLINT CHECK (hurdle_step_l BETWEEN 0 AND 3),
  hurdle_step_r  SMALLINT CHECK (hurdle_step_r BETWEEN 0 AND 3),
  inline_lunge_l SMALLINT CHECK (inline_lunge_l BETWEEN 0 AND 3),
  inline_lunge_r SMALLINT CHECK (inline_lunge_r BETWEEN 0 AND 3),
  shoulder_mob_l SMALLINT CHECK (shoulder_mob_l BETWEEN 0 AND 3),
  shoulder_mob_r SMALLINT CHECK (shoulder_mob_r BETWEEN 0 AND 3),
  active_slr_l   SMALLINT CHECK (active_slr_l BETWEEN 0 AND 3),
  active_slr_r   SMALLINT CHECK (active_slr_r BETWEEN 0 AND 3),
  trunk_stability SMALLINT CHECK (trunk_stability BETWEEN 0 AND 3),
  rotary_stab_l  SMALLINT CHECK (rotary_stab_l BETWEEN 0 AND 3),
  rotary_stab_r  SMALLINT CHECK (rotary_stab_r BETWEEN 0 AND 3)
);

-- Pain mapping with clinical metadata
CREATE TABLE IF NOT EXISTS apex_pain_entries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now(),
  body_region  TEXT NOT NULL,
  side         TEXT CHECK (side IN ('left','right','bilateral','central')) DEFAULT 'central',
  pain_type    TEXT CHECK (pain_type IN ('local','referred','radicular','myofascial')) DEFAULT 'local',
  quality      TEXT[] DEFAULT '{}',
  intensity    SMALLINT CHECK (intensity BETWEEN 0 AND 10),
  behavior     TEXT CHECK (behavior IN ('mechanical','inflammatory','constant')) DEFAULT 'mechanical',
  onset_pattern TEXT CHECK (onset_pattern IN ('morning','post_workout','end_of_day','constant','intermittent')),
  notes        TEXT,
  red_flag     BOOLEAN DEFAULT false,
  resolved_at  TIMESTAMPTZ
);

-- Range of motion measurements vs AAOS norms
CREATE TABLE IF NOT EXISTS apex_rom_measurements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id   UUID REFERENCES apex_assessments(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now(),
  -- Ankle
  ankle_df_l      SMALLINT, ankle_df_r SMALLINT,
  -- Hip
  hip_flex_l      SMALLINT, hip_flex_r SMALLINT,
  hip_ext_l       SMALLINT, hip_ext_r SMALLINT,
  hip_ir_l        SMALLINT, hip_ir_r SMALLINT,
  hip_er_l        SMALLINT, hip_er_r SMALLINT,
  -- Shoulder
  shoulder_flex_l SMALLINT, shoulder_flex_r SMALLINT,
  shoulder_er_l   SMALLINT, shoulder_er_r SMALLINT,
  -- Thoracic spine
  thoracic_rot_l  SMALLINT, thoracic_rot_r SMALLINT,
  -- Cervical spine
  cervical_flex   SMALLINT,
  cervical_ext    SMALLINT,
  cervical_rot_l  SMALLINT,
  cervical_rot_r  SMALLINT
);

-- Muscle development scores (0-10 per group) for shape analysis
CREATE TABLE IF NOT EXISTS apex_muscle_scores (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT now(),
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  -- Upper anterior
  chest_upper     NUMERIC(3,1) DEFAULT 5,
  chest_lower     NUMERIC(3,1) DEFAULT 5,
  shoulder_ant    NUMERIC(3,1) DEFAULT 5,
  shoulder_lat    NUMERIC(3,1) DEFAULT 5,
  shoulder_post   NUMERIC(3,1) DEFAULT 5,
  biceps_l        NUMERIC(3,1) DEFAULT 5, biceps_r NUMERIC(3,1) DEFAULT 5,
  triceps_l       NUMERIC(3,1) DEFAULT 5, triceps_r NUMERIC(3,1) DEFAULT 5,
  forearms_l      NUMERIC(3,1) DEFAULT 5, forearms_r NUMERIC(3,1) DEFAULT 5,
  -- Upper posterior
  traps_upper     NUMERIC(3,1) DEFAULT 5,
  traps_mid       NUMERIC(3,1) DEFAULT 5,
  traps_lower     NUMERIC(3,1) DEFAULT 5,
  lats            NUMERIC(3,1) DEFAULT 5,
  rhomboids       NUMERIC(3,1) DEFAULT 5,
  -- Core
  abs_rectus      NUMERIC(3,1) DEFAULT 5,
  abs_obliques    NUMERIC(3,1) DEFAULT 5,
  erectors        NUMERIC(3,1) DEFAULT 5,
  -- Lower
  glute_max       NUMERIC(3,1) DEFAULT 5,
  glute_med       NUMERIC(3,1) DEFAULT 5,
  quads_l         NUMERIC(3,1) DEFAULT 5, quads_r NUMERIC(3,1) DEFAULT 5,
  hams_l          NUMERIC(3,1) DEFAULT 5, hams_r NUMERIC(3,1) DEFAULT 5,
  calves_l        NUMERIC(3,1) DEFAULT 5, calves_r NUMERIC(3,1) DEFAULT 5,
  adductors       NUMERIC(3,1) DEFAULT 5,
  shape_goal      TEXT DEFAULT 'physique'
    CHECK (shape_goal IN ('v_taper','x_frame','physique','strength','rehabilitation'))
);

-- Generated corrective protocols (persisted for history)
CREATE TABLE IF NOT EXISTS apex_corrective_protocols (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assessment_id  UUID REFERENCES apex_assessments(id) ON DELETE CASCADE NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT now(),
  protocol_data  JSONB NOT NULL DEFAULT '{}',
  priority       TEXT CHECK (priority IN ('critical','high','medium','low')) DEFAULT 'medium',
  completed_at   TIMESTAMPTZ
);

-- ─── RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE apex_assessments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE apex_posture_data       ENABLE ROW LEVEL SECURITY;
ALTER TABLE apex_fms_scores         ENABLE ROW LEVEL SECURITY;
ALTER TABLE apex_pain_entries       ENABLE ROW LEVEL SECURITY;
ALTER TABLE apex_rom_measurements   ENABLE ROW LEVEL SECURITY;
ALTER TABLE apex_muscle_scores      ENABLE ROW LEVEL SECURITY;
ALTER TABLE apex_corrective_protocols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "apex_assessments_own"        ON apex_assessments        FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "apex_posture_own"            ON apex_posture_data       FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "apex_fms_own"                ON apex_fms_scores         FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "apex_pain_own"               ON apex_pain_entries       FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "apex_rom_own"                ON apex_rom_measurements   FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "apex_muscle_own"             ON apex_muscle_scores      FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "apex_corrective_own"         ON apex_corrective_protocols FOR ALL USING (auth.uid() = user_id);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX idx_apex_assess_user    ON apex_assessments(user_id, assessment_date DESC);
CREATE INDEX idx_apex_pain_user      ON apex_pain_entries(user_id, created_at DESC);
CREATE INDEX idx_apex_muscle_user    ON apex_muscle_scores(user_id, assessment_date DESC);
CREATE INDEX idx_apex_rom_user       ON apex_rom_measurements(user_id, created_at DESC);
