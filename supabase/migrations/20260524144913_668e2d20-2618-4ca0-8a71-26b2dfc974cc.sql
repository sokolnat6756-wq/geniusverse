INSERT INTO public.geniuses (name, slug, category, emoji, short_description, chatgpt_url)
VALUES (
  'МАКС Гений',
  'maxgeniy',
  'adult',
  '📣',
  'Помощь в создании каналов и привлечении подписчиков в MAX',
  NULL
);

UPDATE public.geniuses SET category = 'school' WHERE slug = 'astrogeniy';