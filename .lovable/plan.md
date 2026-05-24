## Plan: Update Genius catalog

Two surgical changes — DB data + one icon mapping. No layout, color, or styling changes.

### 1. Database migration (single migration)

```sql
-- Add МАКС Гений
INSERT INTO public.geniuses (name, slug, category, emoji, short_description, chatgpt_url)
VALUES (
  'МАКС Гений',
  'maxgeniy',
  'adult',
  '📣',
  'Помощь в создании каналов и привлечении подписчиков в MAX',
  NULL
);

-- Recategorize АстроГений: "Дети" → "Школа"
UPDATE public.geniuses SET category = 'school' WHERE slug = 'astrogeniy';
```

### 2. Code change — `src/lib/genius-icons.tsx`

Add one entry to `ICON_BY_SLUG`:

```ts
maxgeniy: Radio,
```

Import `Radio` from `lucide-react` (matches the "broadcast / channel" meaning of MAX channels, consistent with the existing icon style — line-art lucide icons like `Megaphone` used for BlogGeniy).

### What propagates automatically

- Catalog grid (`src/routes/index.tsx`) maps from DB → new card renders with the same glass-panel styling, gradient icon tile, and category badge.
- `CATEGORY_LABELS` already maps `adult` → "Взрослым" and `school` → "Школа", so both labels update with no code change.
- The "17 наставников" subtitle on the landing page becomes stale — update to "18 наставников".

### What is NOT changed

- No other Genius cards touched.
- No changes to colors, fonts, layout, spacing, hover effects, borders, shadows, animations.
- `geniusSlugsForPlan` / family plan logic untouched — `maxgeniy` (category `adult`, not in `FAMILY_ADULT_SLUGS`) will only unlock under `one_genius` or `full`, consistent with existing adult-Genius behavior.
- No admin panel changes.
