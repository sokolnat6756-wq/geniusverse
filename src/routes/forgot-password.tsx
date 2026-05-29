import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Восстановление пароля — Академия Гениев" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== "undefined" ? `${window.location.origin}/login` : undefined,
    });
    setLoading(false);
    if (error) { toast.error(translateAuthError(error)); return; }
    setSent(true);
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
        <h1 className="text-2xl font-bold text-center tracking-tight">Восстановление пароля</h1>
        <p className="text-sm text-muted-foreground text-center mt-1 leading-relaxed">
          Мы отправим ссылку для сброса пароля на ваш email.
        </p>

        {sent ? (
          <div className="mt-6 rounded-2xl glass-panel p-4 text-sm text-center">
            Письмо отправлено! Проверьте почту.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-hero text-primary-foreground shadow-soft active:scale-[0.98] transition-transform">
              {loading ? "Отправляем..." : "Отправить ссылку"}
            </Button>
          </form>
        )}

        <div className="mt-4 text-sm text-center text-muted-foreground">
          <Link to="/login" className="text-primary hover:underline">Вернуться ко входу</Link>
        </div>
      </div>
    </div>
  );
}
