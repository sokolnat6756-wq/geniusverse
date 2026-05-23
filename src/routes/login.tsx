import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Вход — Академия Гениев" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) navigate({ to: "/dashboard" });
  }, [session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Добро пожаловать!");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-soft px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border bg-card p-8 shadow-elegant">
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-hero text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </span>
        </Link>
        <h1 className="text-2xl font-bold text-center">С возвращением</h1>
        <p className="text-sm text-muted-foreground text-center mt-1">Войдите в свой кабинет</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="password">Пароль</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-hero text-primary-foreground shadow-soft">
            {loading ? "Входим..." : "Войти"}
          </Button>
        </form>

        <div className="mt-4 text-sm text-center">
          <Link to="/forgot-password" className="text-primary hover:underline">Забыли пароль?</Link>
        </div>
        <div className="mt-2 text-sm text-center text-muted-foreground">
          Нет аккаунта? <Link to="/register" className="text-primary hover:underline">Создать</Link>
        </div>
      </div>
    </div>
  );
}
