GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.user_owns_competition_plan(uuid, uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.user_is_athlete_of_plan(uuid, uuid) TO anon, authenticated, service_role;