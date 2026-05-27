import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";


interface RegisterSearch { plan?: string; genius?: string }

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Регистрация — Академия Гениев" }] }),
  validateSearch: (search: Record<string, unknown>): RegisterSearch => ({
    plan: typeof search.plan === "string" ? search.plan : undefined,
    genius: typeof search.genius === "string" ? search.genius : undefined,
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const search = Route.useSearch();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      if (search.plan) {
        const next: Record<string, string> = { plan: search.plan };
        if (search.genius) next.genius = search.genius;
        navigate({ to: "/checkout", search: next as never });
      } else navigate({ to: "/dashboard" });
    }
  }, [session, navigate, search.plan, search.genius]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Аккаунт создан!");
    // session may not be set yet if email confirmation is required; effect handles redirect when it is
  };

  return (
    <div className="relative min-h-screen grid place-items-center bg-gradient-mesh px-4 py-12 overflow-hidden">
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl -z-10" />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary-glow/20 blur-3xl -z-10" />

      <div className="w-full max-w-md glass-panel-strong rounded-3xl p-8 shadow-elegant">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-hero text-primary-foreground shadow-soft ring-1 ring-white/50">
            <Sparkles className="h-5 w-5" />
          </span>
        </Link>
        <h1 className="text-2xl font-bold text-center tracking-tight">Создайте аккаунт</h1>
        <p className="text-sm text-muted-foreground text-center mt-1">Начните учиться с Гением сегодня</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="name">Имя</Label>
            <Input id="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="password">Пароль</Label>
            <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-hero text-primary-foreground shadow-soft active:scale-[0.98] transition-transform">
            {loading ? "Создаём..." : "Создать аккаунт"}
          </Button>
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            Создавая аккаунт, вы соглашаетесь с{" "}
            <Link to="/privacy" className="text-primary hover:underline">Политикой конфиденциальности</Link>
            {" "}и{" "}
            <Link to="/offer" className="text-primary hover:underline">Публичной офертой</Link>.
          </p>
        </form>

        <div className="mt-4 text-sm text-center text-muted-foreground">
          Уже есть аккаунт? <Link to="/login" className="text-primary hover:underline">Войти</Link>
        </div>
      </div>
    </div>
  );
}
