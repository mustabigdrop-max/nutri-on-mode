-- 1. coach_patients: links start pending, only patient/admin can activate
ALTER TABLE public.coach_patients ALTER COLUMN status SET DEFAULT 'pending';

DROP POLICY IF EXISTS "Coaches can manage own patients" ON public.coach_patients;

CREATE POLICY "Coaches can view own patients"
ON public.coach_patients FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.coach_profiles cp WHERE cp.id = coach_patients.coach_id AND cp.user_id = auth.uid()));

CREATE POLICY "Coaches can invite patients as pending"
ON public.coach_patients FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.coach_profiles cp WHERE cp.id = coach_patients.coach_id AND cp.user_id = auth.uid())
  AND (status <> 'active' OR auth.uid() = patient_user_id OR public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Coaches can update own patient links"
ON public.coach_patients FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.coach_profiles cp WHERE cp.id = coach_patients.coach_id AND cp.user_id = auth.uid()))
WITH CHECK (
  EXISTS (SELECT 1 FROM public.coach_profiles cp WHERE cp.id = coach_patients.coach_id AND cp.user_id = auth.uid())
  AND (status <> 'active' OR auth.uid() = patient_user_id OR public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Coaches can delete own patient links"
ON public.coach_patients FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM public.coach_profiles cp WHERE cp.id = coach_patients.coach_id AND cp.user_id = auth.uid()));

CREATE POLICY "Patients can respond to own coach link"
ON public.coach_patients FOR UPDATE TO authenticated
USING (auth.uid() = patient_user_id)
WITH CHECK (auth.uid() = patient_user_id);

-- 2. professional_patients: same consent model
ALTER TABLE public.professional_patients ALTER COLUMN status SET DEFAULT 'pending';

DROP POLICY IF EXISTS "Professionals can manage own patients" ON public.professional_patients;

CREATE POLICY "Professionals can view own patient links"
ON public.professional_patients FOR SELECT TO authenticated
USING (auth.uid() = professional_id);

CREATE POLICY "Professionals can invite patients as pending"
ON public.professional_patients FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = professional_id
  AND (status <> 'active' OR auth.uid() = patient_id OR public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Professionals can update own patient links"
ON public.professional_patients FOR UPDATE TO authenticated
USING (auth.uid() = professional_id)
WITH CHECK (
  auth.uid() = professional_id
  AND (status <> 'active' OR auth.uid() = patient_id OR public.has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Professionals can delete own patient links"
ON public.professional_patients FOR DELETE TO authenticated
USING (auth.uid() = professional_id);

CREATE POLICY "Patients can respond to own professional link"
ON public.professional_patients FOR UPDATE TO authenticated
USING (auth.uid() = patient_id)
WITH CHECK (auth.uid() = patient_id);

-- 3. tensor_bia_results: only the assessing coach can write
DROP POLICY IF EXISTS tensor_bia_write ON public.tensor_bia_results;

CREATE POLICY tensor_bia_write
ON public.tensor_bia_results FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.tensor_assessments ta WHERE ta.id = tensor_bia_results.assessment_id AND ta.coach_user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.tensor_assessments ta WHERE ta.id = tensor_bia_results.assessment_id AND ta.coach_user_id = auth.uid()));

-- 4. glp1_subscriptions: block client-side self activation
CREATE OR REPLACE FUNCTION public.protect_glp1_subscription_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('role', true) = 'service_role' OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.status := 'pending';
    NEW.price := 97.00;
    NEW.trigger_source := 'manual';
  ELSE
    NEW.status := OLD.status;
    NEW.price := OLD.price;
    NEW.activated_at := OLD.activated_at;
    NEW.trigger_source := OLD.trigger_source;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_glp1_subscription_fields ON public.glp1_subscriptions;
CREATE TRIGGER trg_protect_glp1_subscription_fields
BEFORE INSERT OR UPDATE ON public.glp1_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.protect_glp1_subscription_fields();

-- 5. lab_subscriptions: block client-side self activation
CREATE OR REPLACE FUNCTION public.protect_lab_subscription_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_setting('role', true) = 'service_role' OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.status := 'pending';
    NEW.expires_at := NULL;
    NEW.kiwify_order_id := NULL;
  ELSE
    NEW.status := OLD.status;
    NEW.expires_at := OLD.expires_at;
    NEW.kiwify_order_id := OLD.kiwify_order_id;
    NEW.activated_at := OLD.activated_at;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_lab_subscription_fields ON public.lab_subscriptions;
CREATE TRIGGER trg_protect_lab_subscription_fields
BEFORE INSERT OR UPDATE ON public.lab_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.protect_lab_subscription_fields();