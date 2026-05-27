CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_settings public read"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "admins insert site_settings"
  ON public.site_settings FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins update site_settings"
  ON public.site_settings FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.site_settings (key, value)
VALUES ('founder', '{"image_url": null}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Allow admins to manage objects in the genius-images bucket (founder/ prefix and others)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'admins manage genius-images'
  ) THEN
    CREATE POLICY "admins manage genius-images"
      ON storage.objects FOR ALL
      TO authenticated
      USING (bucket_id = 'genius-images' AND has_role(auth.uid(), 'admin'::app_role))
      WITH CHECK (bucket_id = 'genius-images' AND has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;