CREATE TABLE public.reel_factory_settings (
  user_id uuid PRIMARY KEY,
  n_ideias smallint NOT NULL DEFAULT 100 CHECK (n_ideias BETWEEN 5 AND 100),
  limite_roteiros_dia smallint NOT NULL DEFAULT 100 CHECK (limite_roteiros_dia BETWEEN 5 AND 200),
  hora smallint NOT NULL DEFAULT 6 CHECK (hora BETWEEN 0 AND 23),
  pausado boolean NOT NULL DEFAULT false,
  automatico boolean NOT NULL DEFAULT false,
  limite_agendados_dia smallint NOT NULL DEFAULT 1 CHECK (limite_agendados_dia BETWEEN 1 AND 10),
  ritmo_semana smallint NOT NULL DEFAULT 5 CHECK (ritmo_semana BETWEEN 1 AND 70),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.reel_factory_settings TO authenticated;
GRANT ALL ON public.reel_factory_settings TO service_role;
ALTER TABLE public.reel_factory_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own factory settings" ON public.reel_factory_settings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.reel_factory_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  data date NOT NULL,
  origem text NOT NULL DEFAULT 'manual' CHECK (origem IN ('manual','agendado')),
  status text NOT NULL DEFAULT 'fila' CHECK (status IN ('fila','rodando','concluido','erro','pausado')),
  etapa text NOT NULL DEFAULT 'ideias',
  n_ideias smallint NOT NULL,
  ideias jsonb NOT NULL DEFAULT '[]'::jsonb,
  cursor int NOT NULL DEFAULT 0,
  aprovados int NOT NULL DEFAULT 0,
  descartados int NOT NULL DEFAULT 0,
  chamadas int NOT NULL DEFAULT 0,
  estimativa_chamadas int,
  tentativas smallint NOT NULL DEFAULT 0,
  erro text,
  lease_until timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.reel_factory_batches (user_id, created_at DESC);
CREATE UNIQUE INDEX reel_factory_one_per_day ON public.reel_factory_batches (user_id, data) WHERE status <> 'erro';
GRANT SELECT ON public.reel_factory_batches TO authenticated;
GRANT ALL ON public.reel_factory_batches TO service_role;
ALTER TABLE public.reel_factory_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own batches" ON public.reel_factory_batches FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.reel_bank (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  batch_id uuid,
  idx int,
  pilar text,
  formula_id int,
  formula_nome text,
  tema text NOT NULL,
  abertura text,
  duracao_seg int,
  nota numeric,
  estrutura jsonb,
  roteiro jsonb,
  notas jsonb,
  status text NOT NULL DEFAULT 'novo' CHECK (status IN ('novo','escolhido','guardado','gravado','postado','descartado','reprovado')),
  motivo_descarte text,
  agendado_para date,
  script_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX ON public.reel_bank (user_id, created_at DESC);
CREATE UNIQUE INDEX reel_bank_batch_idx ON public.reel_bank (batch_id, idx);
GRANT SELECT, UPDATE ON public.reel_bank TO authenticated;
GRANT ALL ON public.reel_bank TO service_role;
ALTER TABLE public.reel_bank ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own bank" ON public.reel_bank FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "update own bank" ON public.reel_bank FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Users may only change status (not to 'escolhido', which goes through the server limit check).
CREATE OR REPLACE FUNCTION public.protect_reel_bank_fields() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF current_setting('request.jwt.claim.role', true) = 'authenticated' THEN
    IF NEW.status NOT IN ('guardado','gravado','postado','descartado','novo') AND NEW.status <> OLD.status THEN NEW.status := OLD.status; END IF;
    NEW.nota := OLD.nota; NEW.roteiro := OLD.roteiro; NEW.notas := OLD.notas; NEW.estrutura := OLD.estrutura;
    NEW.script_id := OLD.script_id; NEW.agendado_para := OLD.agendado_para; NEW.user_id := OLD.user_id;
    NEW.motivo_descarte := OLD.motivo_descarte;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER reel_bank_protect BEFORE UPDATE ON public.reel_bank FOR EACH ROW EXECUTE FUNCTION public.protect_reel_bank_fields();

ALTER TABLE public.cc_automation_runs DROP CONSTRAINT IF EXISTS cc_automation_runs_tipo_check;
ALTER TABLE public.cc_automation_runs ADD CONSTRAINT cc_automation_runs_tipo_check CHECK (tipo IN ('diario','semanal','calibracao','fabrica'));