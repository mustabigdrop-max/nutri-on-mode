REVOKE EXECUTE ON FUNCTION public.is_challenge_coach(uuid, uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.my_challenge_ids(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_challenge_participant_fields() FROM anon, authenticated;