
-- 1. Fix profiles: admin SELECT policy scoped to authenticated; add own DELETE
DROP POLICY IF EXISTS "admins select all profiles" ON public.profiles;
CREATE POLICY "admins select all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "own profile delete"
ON public.profiles
FOR DELETE
TO authenticated
USING (auth.uid() = id);

-- 2. site_settings: restrict public read to known-public keys only
DROP POLICY IF EXISTS "site_settings public read" ON public.site_settings;
CREATE POLICY "site_settings public read"
ON public.site_settings
FOR SELECT
TO anon, authenticated
USING (key IN ('founder'));

-- 3. Storage: drop broad listing policy. Public bucket files remain accessible via CDN URL.
DROP POLICY IF EXISTS "genius-images public read" ON storage.objects;
