import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, KeyRound, Ban } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getIsAdmin,
  listAllUsers,
  listAllGeniuses,
  grantAccess,
  revokeAccess,
} from "@/lib/admin.functions";
import { PLAN_LABELS } from "@/lib/access";

export const Route = createFileRoute("/_authenticated/admin/users")({
  beforeLoad: async () => {
    try {
      const { isAdmin } = await getIsAdmin();
      if (!isAdmin) throw redirect({ to: "/dashboard" });
    } catch (e) {
      if (e && typeof e === "object" && "to" in e) throw e;
      throw redirect({ to: "/dashboard" });
    }
  },
  component: AdminUsersPage,
});

type PlanChoice = "no_access" | "one_genius" | "school" | "family" | "full";

type UserRow = {
  user_id: string;
  email: string;
  created_at: string;
  plan_slug: string | null;
  status: string | null;
  geniuses_count: number;
  one_genius_slug: string | null;
};

function AdminUsersPage() {
  const listUsersFn = useServerFn(listAllUsers);
  const listGeniusesFn = useServerFn(listAllGeniuses);
  const qc = useQueryClient();

  const usersQ = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => listUsersFn(),
  });
  const geniusesQ = useQuery({
    queryKey: ["admin-geniuses"],
    queryFn: () => listGeniusesFn(),
  });

  const refetch = () => {
    qc.invalidateQueries({ queryKey: ["admin-users"] });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Управление пользователями</h1>
          <p className="mt-2 text-muted-foreground">
            Назначайте и отзывайте доступ к Гениям вручную.
          </p>
        </header>

        {usersQ.isLoading || geniusesQ.isLoading ? (
          <div className="grid place-items-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="rounded-2xl border border-white/60 bg-white/70 p-2 shadow-soft backdrop-blur-xl">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Регистрация</TableHead>
                  <TableHead>План</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-center">Гении</TableHead>
                  <TableHead className="min-w-[420px]">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersQ.data?.users.map((u) => (
                  <UserActionsRow
                    key={u.user_id}
                    user={u as UserRow}
                    geniuses={geniusesQ.data?.geniuses ?? []}
                    onChanged={refetch}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function UserActionsRow({
  user,
  geniuses,
  onChanged,
}: {
  user: UserRow;
  geniuses: Array<{ slug: string; name: string; emoji: string; category: string }>;
  onChanged: () => void;
}) {
  const grantFn = useServerFn(grantAccess);
  const revokeFn = useServerFn(revokeAccess);

  const initialPlan: PlanChoice =
    user.status === "active" && user.plan_slug
      ? (user.plan_slug as PlanChoice)
      : "no_access";

  const [plan, setPlan] = useState<PlanChoice>(initialPlan);
  const [geniusSlug, setGeniusSlug] = useState<string>(user.one_genius_slug ?? "");

  const grantMut = useMutation({
    mutationFn: async () => {
      if (plan === "no_access") {
        await revokeFn({ data: { userId: user.user_id } });
        return;
      }
      await grantFn({
        data: {
          userId: user.user_id,
          plan,
          geniusSlug: plan === "one_genius" ? geniusSlug : null,
        },
      });
    },
    onSuccess: () => {
      toast.success(`Доступ обновлён для ${user.email}`);
      onChanged();
    },
    onError: (e: Error) => toast.error(e.message ?? "Ошибка"),
  });

  const revokeMut = useMutation({
    mutationFn: () => revokeFn({ data: { userId: user.user_id } }),
    onSuccess: () => {
      toast.success(`Доступ закрыт для ${user.email}`);
      setPlan("no_access");
      onChanged();
    },
    onError: (e: Error) => toast.error(e.message ?? "Ошибка"),
  });

  const pending = grantMut.isPending || revokeMut.isPending;
  const showGeniusPicker = plan === "one_genius";
  const canGrant =
    !pending && (plan !== "one_genius" || !!geniusSlug);

  return (
    <TableRow>
      <TableCell className="font-medium">{user.email || "—"}</TableCell>
      <TableCell className="text-sm text-muted-foreground">
        {new Date(user.created_at).toLocaleDateString("ru-RU")}
      </TableCell>
      <TableCell className="text-sm">
        {user.status === "active" && user.plan_slug
          ? PLAN_LABELS[user.plan_slug] ?? user.plan_slug
          : "—"}
      </TableCell>
      <TableCell className="text-sm">
        {user.status === "active" ? (
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
            активна
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            нет
          </span>
        )}
      </TableCell>
      <TableCell className="text-center text-sm">{user.geniuses_count}</TableCell>
      <TableCell>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={plan} onValueChange={(v) => setPlan(v as PlanChoice)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no_access">Нет доступа</SelectItem>
              <SelectItem value="one_genius">Один Гений</SelectItem>
              <SelectItem value="school">Школьный</SelectItem>
              <SelectItem value="family">Семейный</SelectItem>
              <SelectItem value="full">Полный</SelectItem>
            </SelectContent>
          </Select>

          {showGeniusPicker && (
            <Select value={geniusSlug} onValueChange={setGeniusSlug}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Выберите Гения" />
              </SelectTrigger>
              <SelectContent>
                {geniuses.map((g) => (
                  <SelectItem key={g.slug} value={g.slug}>
                    {g.emoji} {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            size="sm"
            onClick={() => grantMut.mutate()}
            disabled={!canGrant}
            className="bg-gradient-hero text-primary-foreground"
          >
            {grantMut.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <KeyRound className="mr-1 h-4 w-4" /> Открыть
              </>
            )}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => revokeMut.mutate()}
            disabled={pending || user.status !== "active"}
          >
            {revokeMut.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Ban className="mr-1 h-4 w-4" /> Закрыть
              </>
            )}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
