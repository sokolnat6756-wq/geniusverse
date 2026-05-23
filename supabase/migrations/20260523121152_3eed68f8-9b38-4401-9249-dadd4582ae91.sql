
-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- plans
CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  price INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "plans public read" ON public.plans FOR SELECT USING (true);

-- subscriptions
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);
CREATE INDEX subscriptions_user_id_idx ON public.subscriptions(user_id);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sub select" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own sub insert" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own sub update" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- geniuses
CREATE TABLE public.geniuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  emoji TEXT NOT NULL,
  category TEXT NOT NULL,
  short_description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.geniuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "geniuses public read" ON public.geniuses FOR SELECT USING (true);

-- user_genius_access
CREATE TABLE public.user_genius_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  genius_slug TEXT NOT NULL,
  access_status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, genius_slug)
);
ALTER TABLE public.user_genius_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own access select" ON public.user_genius_access FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own access insert" ON public.user_genius_access FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own access update" ON public.user_genius_access FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own access delete" ON public.user_genius_access FOR DELETE USING (auth.uid() = user_id);

-- seed plans
INSERT INTO public.plans (name, slug, price, description) VALUES
('Один Гений', 'one_genius', 990, 'Для точечной помощи по одному направлению.'),
('Школьный пакет', 'school', 2990, 'Все ключевые школьные предметы в одном доступе.'),
('Семейный пакет', 'family', 4990, 'Для семьи с детьми разного возраста.'),
('Полный доступ', 'full', 7990, 'Вся экосистема Гениев и будущие обновления.');

-- seed geniuses
INSERT INTO public.geniuses (name, slug, emoji, category, short_description) VALUES
('МатГений','matgeniy','🧠','school','Математика, задачи, формулы, логика и подготовка к экзаменам.'),
('РусГений','rusgeniy','📚','school','Русский язык, правила, пунктуация, сочинения и грамотность.'),
('АнглоГений','anglogeniy','🇬🇧','school','Английский, грамматика, разговорная практика и произношение.'),
('ГеоГений','geogeniy','🌍','school','География, карты, климат, страны, природа и подготовка к экзаменам.'),
('БиоГений','biogeniy','🧬','school','Биология, человек, растения, животные, генетика и экология.'),
('ИстоГений','istogeniy','🏛️','school','История, даты, события, личности и причинно-следственные связи.'),
('ХимГений','himgeniy','⚗️','school','Химия, реакции, формулы, вещества, задачи и экзамены.'),
('ФизГений','fizgeniy','⚡','school','Физика, законы, формулы, задачи и объяснение через жизнь.'),
('ОбществоГений','obshestvogeniy','👔','school','Обществознание, право, экономика, политика, ОГЭ и ЕГЭ.'),
('ЛитГений','litgeniy','📖','school','Литература, анализ произведений, герои, темы и сочинения.'),
('ИнфоГений','infogeniy','💻','school','Информатика, логика, алгоритмы, Python и экзаменационные задачи.'),
('АстроГений','astrogeniy','🌌','kids','Космос, планеты, звёзды, астрономия и научное любопытство.'),
('ДошкоГений','doshkogeniy','🧸','kids','Развитие малышей 3–7 лет через игру, буквы, цифры и речь.'),
('ЛогоГений','logogeniy','🗣️','kids','Речь, дикция, произношение и голосовая практика для детей и взрослых.'),
('БлогГений','bloggeniy','🚀','adult','Блогинг, контент, личный бренд, Reels, сторителлинг и продажи.'),
('ФинГений','fingeniy','💸','adult','Финансовая грамотность, бюджет, накопления и разумное управление деньгами.'),
('БизнесГений','biznesgeniy','👑','adult','Бизнес, стратегия, офферы, продажи, система, рост и масштабирование.');
