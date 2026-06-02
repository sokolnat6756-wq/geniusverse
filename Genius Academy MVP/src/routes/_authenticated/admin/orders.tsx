import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Ban } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { getIsAdmin, listAllOrders, updateOrderStatus } from "@/lib/admin.functions";
import { PLAN_LABELS } from "@/lib/access";

export const Route = createFileRoute("/_authenticated/admin/orders")({
  beforeLoad: async () => {
    try {
      const { isAdmin } = await getIsAdmin();
      if (!isAdmin) throw redirect({ to: "/dashboard" });
    } catch (e) {
      if (e && typeof e === "object" && "to" in e) throw e;
      throw redirect({ to: "/dashboard" });
    }
  },
  component: AdminOrdersPage,
});

type Order = {
  id: string;
  user_id: string;
  email: string;
  plan_slug: string;
  status: string;
  created_at: string;
  expires_at: string | null;
};

function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: "Активен", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    cancelled: { label: "Отменён", cls: "bg-rose-100 text-rose-700 border-rose-200" },
    pending: { label: "Ожидает", cls: "bg-amber-100 text-amber-700 border-amber-200" },
  };
  const v = map[status] ?? { label: status, cls: "bg-muted text-muted-foreground" };
  return <Badge variant="outline" className={v.cls}>{v.label}</Badge>;
}

function AdminOrdersPage() {
  const listFn = useServerFn(listAllOrders);
  const updateFn = useServerFn(updateOrderStatus);
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => listFn(),
  });

  const mutation = useMutation({
    mutationFn: (vars: { id: string; status: "active" | "cancelled" | "pending" }) =>
      updateFn({ data: vars }),
    onSuccess: () => {
      toast.success("Статус обновлён");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Ошибка"),
  });

  const filtered = useMemo(() => {
    const all = (data?.orders ?? []) as Order[];
    return all.filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      if (search && !o.email.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [data, filter, search]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Заказы</h1>
          <p className="mt-2 text-muted-foreground">
            Все подписки пользователей с возможностью отмены и активации.
          </p>
        </header>

        <div className="mb-4 flex flex-wrap gap-3">
          <Input
            placeholder="Поиск по email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="active">Активные</SelectItem>
              <SelectItem value="cancelled">Отменённые</SelectItem>
              <SelectItem value="pending">Ожидающие</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-soft">
          {isLoading ? (
            <div className="grid place-items-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Тариф</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Создан</TableHead>
                  <TableHead>Истекает</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      Заказов не найдено
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.email}</TableCell>
                      <TableCell>{PLAN_LABELS[o.plan_slug] ?? o.plan_slug}</TableCell>
                      <TableCell>{statusBadge(o.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(o.created_at).toLocaleDateString("ru-RU")}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {o.expires_at ? new Date(o.expires_at).toLocaleDateString("ru-RU") : "—"}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {o.status !== "active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={mutation.isPending}
                            onClick={() => mutation.mutate({ id: o.id, status: "active" })}
                          >
                            <CheckCircle2 className="mr-1 h-4 w-4" /> Активировать
                          </Button>
                        )}
                        {o.status !== "cancelled" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={mutation.isPending}
                            onClick={() => mutation.mutate({ id: o.id, status: "cancelled" })}
                          >
                            <Ban className="mr-1 h-4 w-4" /> Отменить
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
