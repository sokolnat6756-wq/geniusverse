## Что меняем
В hero-секции `src/routes/index.tsx` заменяем два CTA («Выбрать Гения» и «Посмотреть тарифы») на одну мягкую кнопку **«Узнать больше»**, которая плавно скроллит к следующей секции «Для кого Академия». Кнопка стилизована с голубым фоном `bg-sky-500`.

## Реализация
- Добавить `id="about"` на секцию `{/* ДЛЯ КОГО */}`.
- В hero убрать оба `<Link>`-блока с кнопками.
- Вставить одну кнопку:
  ```tsx
  <Button
    size="lg"
    className="glass-panel border-white/50 bg-sky-500 text-white hover:bg-sky-400"
    onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
  >
    Узнать больше <ArrowRight className="ml-2 h-4 w-4" />
  </Button>
  ```
- Контейнер `flex flex-wrap items-center justify-center gap-3` остаётся — центрирует единственную кнопку.

## Что не трогаем
Фон, градиенты, заголовок, подзаголовок, бейдж, отступы, glassmorphism, адаптив, остальные секции — без изменений.
