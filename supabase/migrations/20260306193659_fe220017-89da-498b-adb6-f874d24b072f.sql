
-- Family members table
CREATE TABLE public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  profile_type TEXT NOT NULL DEFAULT 'adult' CHECK (profile_type IN ('adult', 'child', 'elderly')),
  avatar_emoji TEXT DEFAULT '👤',
  age INTEGER,
  weight_kg NUMERIC(5,1),
  height_cm NUMERIC(5,1),
  dietary_restrictions TEXT[] DEFAULT '{}',
  health_notes TEXT,
  hydration_goal_ml INTEGER DEFAULT 2000,
  medications TEXT[] DEFAULT '{}',
  parental_lock BOOLEAN DEFAULT false,
  xp INTEGER DEFAULT 0,
  stars INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own family members"
  ON public.family_members FOR SELECT TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own family members"
  ON public.family_members FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own family members"
  ON public.family_members FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own family members"
  ON public.family_members FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);

-- Family meal logs to track per-member meals
CREATE TABLE public.family_meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.family_members(id) ON DELETE CASCADE,
  meal_date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type TEXT NOT NULL,
  description TEXT,
  quality_score INTEGER,
  hydration_ml INTEGER DEFAULT 0,
  fruits_eaten INTEGER DEFAULT 0,
  veggies_eaten INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.family_meal_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own family meal logs"
  ON public.family_meal_logs FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);
