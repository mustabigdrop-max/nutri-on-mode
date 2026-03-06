
-- Allow professionals to read profiles of their linked patients
CREATE POLICY "Professionals can view patient profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.professional_patients
      WHERE professional_id = auth.uid()
        AND patient_id = profiles.user_id
        AND status = 'active'
    )
  );

-- Allow professionals to read patient meal_logs
CREATE POLICY "Professionals can view patient meal logs"
  ON public.meal_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.professional_patients
      WHERE professional_id = auth.uid()
        AND patient_id = meal_logs.user_id
        AND status = 'active'
    )
  );

-- Allow professionals to read patient weight_logs
CREATE POLICY "Professionals can view patient weight logs"
  ON public.weight_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.professional_patients
      WHERE professional_id = auth.uid()
        AND patient_id = weight_logs.user_id
        AND status = 'active'
    )
  );
