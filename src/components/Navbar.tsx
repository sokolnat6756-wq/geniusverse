import { Link, useNavigate } from "@tanstack/react-router";
import { Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { getIsAdmin } from "@/lib/admin.functions";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Navbar() {
  const { session, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const isAdminFn = useServerFn(getIsAdmin);
  const { data: adminData } = useQuery({
    queryKey: ["is-admin", session?.user?.id],
    queryFn: () => isAdminFn(),
    enabled: !!session,
  });
  const isAdmin = !!adminData?.isAdmin;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-[0_1px_0_0_rgba(255,255,255,0.6)]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/" className="group flex items-center gap-2 font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-hero text-primary-foreground shadow-soft transition-transform duration-300 group-hover:scale-105">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="text-lg tracking-tight">Академия Гениев</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          <Link to="/" className="px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            Главная
          </Link>
          <Link to="/pricing" className="px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            Тарифы
          </Link>
          {session ? (
            <>
              <Link to="/dashboard" className="px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                Кабинет
              </Link>
              {isAdmin && (
                <>
                  <Link to="/admin/geniuses" className="px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                    Гении
                  </Link>
                  <Link to="/admin/users" className="px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                    Пользователи
                  </Link>
                  <Link to="/admin/orders" className="px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                    Заказы
                  </Link>
                </>
              )}
              <Button variant="ghost" onClick={handleLogout}>Выйти</Button>
            </>
          ) : (
            <>
              {!loading && (
                <>
                  <Link to="/login"><Button variant="ghost">Войти</Button></Link>
                  <Link to="/register"><Button className="bg-gradient-hero text-primary-foreground shadow-soft active:scale-[0.98] transition-transform">Начать</Button></Link>
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
        <div className="md:hidden glass-panel border-t border-white/50 rounded-b-3xl">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4">
            <Link to="/" onClick={() => setOpen(false)} className="py-2">Главная</Link>
            <Link to="/pricing" onClick={() => setOpen(false)} className="py-2">Тарифы</Link>
            {session ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)} className="py-2">Кабинет</Link>
                {isAdmin && (
                  <>
                    <Link to="/admin/geniuses" onClick={() => setOpen(false)} className="py-2">Админка · Гении</Link>
                    <Link to="/admin/users" onClick={() => setOpen(false)} className="py-2">Админка · Пользователи</Link>
                  </>
                )}
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
