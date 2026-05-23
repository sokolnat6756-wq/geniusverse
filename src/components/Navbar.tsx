import { Link, useNavigate } from "@tanstack/react-router";
import { Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

export function Navbar() {
  const { session, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-hero text-primary-foreground shadow-soft">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-lg tracking-tight">Академия Гениев</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link to="/" className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
            Главная
          </Link>
          <Link to="/pricing" className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
            Тарифы
          </Link>
          {session ? (
            <>
              <Link to="/dashboard" className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
                Кабинет
              </Link>
              <Button variant="ghost" onClick={handleLogout}>Выйти</Button>
            </>
          ) : (
            <>
              {!loading && (
                <>
                  <Link to="/login"><Button variant="ghost">Войти</Button></Link>
                  <Link to="/register"><Button className="bg-gradient-hero text-primary-foreground shadow-soft">Начать</Button></Link>
                </>
              )}
            </>
          )}
        </nav>

        <button
          className="md:hidden p-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Меню"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/60 bg-background">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4">
            <Link to="/" onClick={() => setOpen(false)} className="py-2">Главная</Link>
            <Link to="/pricing" onClick={() => setOpen(false)} className="py-2">Тарифы</Link>
            {session ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)} className="py-2">Кабинет</Link>
                <Button variant="outline" onClick={() => { setOpen(false); handleLogout(); }}>Выйти</Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)}><Button variant="outline" className="w-full">Войти</Button></Link>
                <Link to="/register" onClick={() => setOpen(false)}>
                  <Button className="w-full bg-gradient-hero text-primary-foreground">Начать</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
