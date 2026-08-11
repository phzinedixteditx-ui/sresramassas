REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
REVOKE EXECUTE ON FUNCTION public.track_order(integer, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_order(integer, text) TO anon, authenticated;