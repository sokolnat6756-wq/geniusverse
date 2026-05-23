import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

interface RegisterSearch { plan?: string }

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Регистрация — Академия Гениев" }] }),
  validateSearch: (search: Record<string, unknown>): RegisterSearch => ({
    plan: typeof search.plan === "string" ? search.plan : undefined,
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
      if (search.plan) navigate({ to: "/checkout", search: { plan: search.plan } as never });
      else navigate({ to: "/dashboard" });
    }
  }, [session, navigate, search.plan]);

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
    <div className="min-h-screen grid place-items-center bg-gradient-soft px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border bg-card p-8 shadow-elegant">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-hero text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </span>
        </Link>
        <h1 className="text-2xl font-bold text-center">Создайте аккаунт</h1>
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
          <Button type="submit" disabled={loading} className="w-full bg-gradient-hero text-primary-foreground shadow-soft">
            {loading ? "Создаём..." : "Создать аккаунт"}
          </Button>
        </form>

        <div className="mt-4 text-sm text-center text-muted-foreground">
          Уже есть аккаунт? <Link to="/login" className="text-primary hover:underline">Войти</Link>
        </div>
      </div>
    </div>
  );
}
