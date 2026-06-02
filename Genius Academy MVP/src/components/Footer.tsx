import { Link } from "@tanstack/react-router";
import { Sparkles, Send } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/40 mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-hero text-primary-foreground shadow-soft">
              <Sparkles className="h-5 w-5" />
            </span>
            <span>Академия Гениев</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-xs">
            AI-наставники для детей, школьников и взрослых.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Платформа</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground transition-colors">Главная</Link></li>
            <li><Link to="/pricing" className="hover:text-foreground transition-colors">Тарифы</Link></li>
            <li><Link to="/login" className="hover:text-foreground transition-colors">Войти</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Правовая информация</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/privacy" className="hover:text-foreground transition-colors">Политика конфиденциальности</Link></li>
            <li><Link to="/consent" className="hover:text-foreground transition-colors">Согласие на обработку персональных данных</Link></li>
            <li><Link to="/offer" className="hover:text-foreground transition-colors">Публичная оферта</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Контакты</h4>
          <a href="mailto:y-kopasova@inbox.ru" className="text-sm text-muted-foreground hover:text-foreground transition-colors">y-kopasova@inbox.ru</a>
          <a
            href="https://t.me/digital_izba"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-sm text-foreground/90 shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-hero text-primary-foreground shadow-soft">
              <Send className="h-3.5 w-3.5" />
            </span>
            <span>
              <span className="block text-xs text-muted-foreground leading-none">Поддержка</span>
              <span className="block font-medium leading-tight">Telegram</span>
            </span>
          </a>
        </div>
      </div>
      <div className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Академия Гениев. Все права защищены.
      </div>
    </footer>
  );
}
