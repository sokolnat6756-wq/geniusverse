ALTER TABLE public.geniuses ADD COLUMN chatgpt_url text;
UPDATE public.geniuses SET chatgpt_url = 'https://chat.openai.com/g/g-placeholder' WHERE chatgpt_url IS NULL;