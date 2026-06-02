
-- 1) image_url column on geniuses
ALTER TABLE public.geniuses ADD COLUMN IF NOT EXISTS image_url text;

-- 2) Allow admins to INSERT/DELETE geniuses (UPDATE policy already exists)
DROP POLICY IF EXISTS "admins can insert geniuses" ON public.geniuses;
CREATE POLICY "admins can insert geniuses"
ON public.geniuses
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "admins can delete geniuses" ON public.geniuses;
CREATE POLICY "admins can delete geniuses"
ON public.geniuses
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3) Storage bucket for genius images (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('genius-images', 'genius-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 4) Storage policies on storage.objects for this bucket
DROP POLICY IF EXISTS "genius-images public read" ON storage.objects;
CREATE POLICY "genius-images public read"
ON storage.objects
FOR SELECT
USING (bucket_id = 'genius-images');

DROP POLICY IF EXISTS "genius-images admin insert" ON storage.objects;
CREATE POLICY "genius-images admin insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'genius-images' AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "genius-images admin update" ON storage.objects;
CREATE POLICY "genius-images admin update"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'genius-images' AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "genius-images admin delete" ON storage.objects;
CREATE POLICY "genius-images admin delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'genius-images' AND has_role(auth.uid(), 'admin'::app_role));
