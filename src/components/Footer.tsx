import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-gradient-soft mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-hero text-primary-foreground">
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
            <li><Link to="/" className="hover:text-foreground">Главная</Link></li>
            <li><Link to="/pricing" className="hover:text-foreground">Тарифы</Link></li>
            <li><Link to="/login" className="hover:text-foreground">Войти</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Контакты</h4>
          <p className="text-sm text-muted-foreground">
            hello@academy-genius.ru
          </p>
        </div>
      </div>
      <div className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Академия Гениев. Все права защищены.
      </div>
    </footer>
  );
}
