
-- Subscriptions: remove self-write policies
DROP POLICY IF EXISTS "own sub insert" ON public.subscriptions;
DROP POLICY IF EXISTS "own sub update" ON public.subscriptions;

-- user_genius_access: remove self-write policies
DROP POLICY IF EXISTS "own access insert" ON public.user_genius_access;
DROP POLICY IF EXISTS "own access update" ON public.user_genius_access;
DROP POLICY IF EXISTS "own access delete" ON public.user_genius_access;

-- Lock down SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
