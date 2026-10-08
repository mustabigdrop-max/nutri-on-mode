CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE public.cc_automation_settings (
  user_id uuid PRIMARY KEY,
  hora smallint NOT NULL DEFAULT 7 CHECK (hora BETWEEN 0 AND 23),
  pausado boolean NOT NULL DEFAULT false,
  limite_diario smallint NOT NULL DEFAULT 1 CHECK (limite_diario BETWEEN 1 AND 5),
  ultimo_diario date,
  ultima_semanal date,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.cc_automation_settings TO authenticated;
GRANT ALL ON public.cc_automation_settings TO service_role;
ALTER TABLE public.cc_automation_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own settings" ON public.cc_automation_settings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- users can't fake run markers
CREATE OR REPLACE FUNCTION public.protect_cc_settings_markers() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF current_setting('request.jwt.claim.role', true) = 'authenticated' THEN
    IF TG_OP = 'INSERT' THEN NEW.ultimo_diario := NULL; NEW.ultima_semanal := NULL;
    ELSE NEW.ultimo_diario := OLD.ultimo_diario; NEW.ultima_semanal := OLD.ultima_semanal; END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER cc_settings_markers BEFORE INSERT OR UPDATE ON public.cc_automation_settings FOR EACH ROW EXECUTE FUNCTION public.protect_cc_settings_markers();

CREATE TABLE public.cc_automation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('diario','semanal','calibracao')),
  status text NOT NULL CHECK (status IN ('ok','erro','pulado')),
  erro text,
  tentativas smallint NOT NULL DEFAULT 1,
  detalhes jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.cc_automation_runs (user_id, created_at DESC);
GRANT SELECT ON public.cc_automation_runs TO authenticated;
GRANT ALL ON public.cc_automation_runs TO service_role;
ALTER TABLE public.cc_automation_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own runs" ON public.cc_automation_runs FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.cc_briefings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  data date NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('diario','semanal')),
  conteudo jsonb NOT NULL DEFAULT '{}'::jsonb,
  script_id uuid,
  status text NOT NULL DEFAULT 'pronto_para_revisar' CHECK (status IN ('pronto_para_revisar','aprovado','descartado')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, data, tipo)
);
GRANT SELECT, UPDATE ON public.cc_briefings TO authenticated;
GRANT ALL ON public.cc_briefings TO service_role;
ALTER TABLE public.cc_briefings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own briefings" ON public.cc_briefings FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "review own briefings" ON public.cc_briefings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.retention_scripts ADD COLUMN IF NOT EXISTS origem text NOT NULL DEFAULT 'manual';
ALTER TABLE public.retention_scripts ADD COLUMN IF NOT EXISTS revisao text NOT NULL DEFAULT 'pronto_para_revisar';

CREATE TABLE public.cc_job_state (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  cron_key text NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  lease_until timestamptz,
  last_run_at timestamptz
);
INSERT INTO public.cc_job_state (id) VALUES (1) ON CONFLICT DO NOTHING;
GRANT ALL ON public.cc_job_state TO service_role;
ALTER TABLE public.cc_job_state ENABLE ROW LEVEL SECURITY;