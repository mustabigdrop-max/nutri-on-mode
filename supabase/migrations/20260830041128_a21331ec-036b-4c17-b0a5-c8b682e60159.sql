CREATE OR REPLACE FUNCTION public.record_protocol_adjustment(
  _athlete_id uuid,
  _title text,
  _description text,
  _metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor uuid := auth.uid();
BEGIN
  IF v_actor IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF NOT (
    v_actor = _athlete_id
    OR public.is_coach_of_patient(v_actor, _athlete_id)
    OR public.is_team_member(_athlete_id, v_actor)
    OR public.has_role(v_actor, 'admin'::app_role)
  ) THEN
    RAISE EXCEPTION 'not allowed to adjust this athlete';
  END IF;

  INSERT INTO public.notifications (user_id, type, title, body, action_url, metadata)
  VALUES (_athlete_id, 'protocol_adjusted', 'Seu protocolo foi ajustado', _description, '/meu-plano', COALESCE(_metadata, '{}'::jsonb));

  INSERT INTO public.patient_timeline (patient_id, actor_id, event_type, title, description, data_category, metadata)
  VALUES (_athlete_id, v_actor, 'protocol_adjusted', _title, _description, 'protocolo', COALESCE(_metadata, '{}'::jsonb));
END;
$$;

REVOKE ALL ON FUNCTION public.record_protocol_adjustment(uuid, text, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_protocol_adjustment(uuid, text, text, jsonb) TO authenticated;