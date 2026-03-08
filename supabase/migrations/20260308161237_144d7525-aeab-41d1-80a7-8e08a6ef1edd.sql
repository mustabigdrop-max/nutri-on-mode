
-- 1. TABELA SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS subscriptions (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             UUID NOT NULL,
  email               TEXT NOT NULL,
  plano               TEXT NOT NULL DEFAULT 'free',
  periodo             TEXT DEFAULT 'mensal',
  status              TEXT NOT NULL DEFAULT 'active',
  kiwify_order_id     TEXT,
  kiwify_product_id   TEXT,
  activated_at        TIMESTAMPTZ DEFAULT now(),
  expires_at          TIMESTAMPTZ,
  canceled_at         TIMESTAMPTZ,
  updated_at          TIMESTAMPTZ DEFAULT now(),
  created_at          TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- 2. TABELA SUBSCRIPTIONS_PENDING
CREATE TABLE IF NOT EXISTS subscriptions_pending (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email             TEXT UNIQUE NOT NULL,
  plano             TEXT NOT NULL,
  periodo           TEXT DEFAULT 'mensal',
  kiwify_order_id   TEXT,
  expires_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- 3. TABELA COACH_SLOTS
CREATE TABLE IF NOT EXISTS coach_slots (
  id              INT DEFAULT 1 PRIMARY KEY,
  vagas_totais    INT DEFAULT 20,
  vagas_ocupadas  INT DEFAULT 0
);

INSERT INTO coach_slots (id, vagas_totais, vagas_ocupadas)
VALUES (1, 20, 0)
ON CONFLICT (id) DO NOTHING;

-- 4. COLUNA plano_atual e email NA TABELA PROFILES
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS plano_atual TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS email TEXT;

-- 5. FUNÇÕES RPC — incrementar/decrementar vagas
CREATE OR REPLACE FUNCTION increment_coach_slots()
RETURNS void AS $$
BEGIN
  UPDATE coach_slots
  SET vagas_ocupadas = vagas_ocupadas + 1
  WHERE id = 1 AND vagas_ocupadas < vagas_totais;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION decrement_coach_slots()
RETURNS void AS $$
BEGIN
  UPDATE coach_slots
  SET vagas_ocupadas = GREATEST(vagas_ocupadas - 1, 0)
  WHERE id = 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. FUNÇÃO para ativar plano pendente
CREATE OR REPLACE FUNCTION activate_pending_subscription()
RETURNS TRIGGER AS $$
DECLARE
  pending subscriptions_pending%ROWTYPE;
BEGIN
  SELECT * INTO pending
  FROM subscriptions_pending
  WHERE email = NEW.email
  LIMIT 1;

  IF FOUND THEN
    INSERT INTO subscriptions (
      user_id, email, plano, periodo,
      kiwify_order_id, expires_at, status, activated_at
    ) VALUES (
      NEW.id, NEW.email, pending.plano, pending.periodo,
      pending.kiwify_order_id, pending.expires_at, 'active', now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      plano = EXCLUDED.plano,
      status = 'active',
      updated_at = now();

    UPDATE profiles
    SET plano_atual = pending.plano, updated_at = now()
    WHERE user_id = NEW.id;

    DELETE FROM subscriptions_pending WHERE email = NEW.email;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions_pending ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_own_subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "coach_slots_public_read" ON coach_slots
  FOR SELECT USING (true);

-- 8. VIEW
CREATE OR REPLACE VIEW my_subscription AS
SELECT plano, periodo, status, expires_at, activated_at
FROM subscriptions
WHERE user_id = auth.uid();

-- 9. Realtime para coach_slots
ALTER PUBLICATION supabase_realtime ADD TABLE coach_slots;
