-- ─── APEX: Coach read access for their active patients ──────────────────────
-- Coaches can read (SELECT only) apex data belonging to their active patients

CREATE POLICY "apex_assessments_coach_read"
  ON apex_assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM coach_patients cp
      JOIN coach_profiles cpr ON cpr.id = cp.coach_id
      WHERE cp.patient_user_id = apex_assessments.user_id
        AND cpr.user_id = auth.uid()
        AND cp.status = 'active'
    )
  );

CREATE POLICY "apex_posture_coach_read"
  ON apex_posture_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM coach_patients cp
      JOIN coach_profiles cpr ON cpr.id = cp.coach_id
      WHERE cp.patient_user_id = apex_posture_data.user_id
        AND cpr.user_id = auth.uid()
        AND cp.status = 'active'
    )
  );

CREATE POLICY "apex_fms_coach_read"
  ON apex_fms_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM coach_patients cp
      JOIN coach_profiles cpr ON cpr.id = cp.coach_id
      WHERE cp.patient_user_id = apex_fms_scores.user_id
        AND cpr.user_id = auth.uid()
        AND cp.status = 'active'
    )
  );

CREATE POLICY "apex_pain_coach_read"
  ON apex_pain_entries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM coach_patients cp
      JOIN coach_profiles cpr ON cpr.id = cp.coach_id
      WHERE cp.patient_user_id = apex_pain_entries.user_id
        AND cpr.user_id = auth.uid()
        AND cp.status = 'active'
    )
  );

CREATE POLICY "apex_rom_coach_read"
  ON apex_rom_measurements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM coach_patients cp
      JOIN coach_profiles cpr ON cpr.id = cp.coach_id
      WHERE cp.patient_user_id = apex_rom_measurements.user_id
        AND cpr.user_id = auth.uid()
        AND cp.status = 'active'
    )
  );

CREATE POLICY "apex_muscle_coach_read"
  ON apex_muscle_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM coach_patients cp
      JOIN coach_profiles cpr ON cpr.id = cp.coach_id
      WHERE cp.patient_user_id = apex_muscle_scores.user_id
        AND cpr.user_id = auth.uid()
        AND cp.status = 'active'
    )
  );

CREATE POLICY "apex_corrective_coach_read"
  ON apex_corrective_protocols FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM coach_patients cp
      JOIN coach_profiles cpr ON cpr.id = cp.coach_id
      WHERE cp.patient_user_id = apex_corrective_protocols.user_id
        AND cpr.user_id = auth.uid()
        AND cp.status = 'active'
    )
  );
