REVOKE EXECUTE ON FUNCTION public.is_team_member(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.team_role_of(uuid, uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_team_member(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.team_role_of(uuid, uuid) TO authenticated, service_role;