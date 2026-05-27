## Проблема

В финальной CTA-секции «Готовы найти своего Гения?» кнопка «К тарифам»:

```tsx
<Button size="lg" variant="outline" className="glass-panel-dark border-white/30 text-white hover:bg-white/20 hover:text-white">
  К тарифам
</Button>
```

`variant="outline"` из shadcn задаёт `bg-background` — в светлой теме это белый. Класс `glass-panel-dark` ставит лишь полупрозрачную белую плёнку поверх, не перекрывая базовый белый фон. Итог: белый текст на белой кнопке — невидим, пока hover не закрасит фон в `white/20`.

## Исправление

Файл: `src/routes/index.tsx`, секция «ФИНАЛЬНЫЙ CTA».

Заменить `variant="outline"` на `variant="ghost"` у кнопки «К тарифам», чтобы убрать белый базовый фон. Стеклянный вид сохраняем через существующий `glass-panel-dark`, белый текст и бордер уже заданы.

Было:
```tsx
<Button size="lg" variant="outline" className="glass-panel-dark border-white/30 text-white hover:bg-white/20 hover:text-white">
  К тарифам
</Button>
```

Станет:
```tsx
<Button size="lg" variant="ghost" className="glass-panel-dark border border-white/30 text-white hover:bg-white/20 hover:text-white">
  К тарифам
</Button>
```

Никаких других изменений: вёрстка, отступы, размеры, остальные кнопки и тёмная тема не затрагиваются.
