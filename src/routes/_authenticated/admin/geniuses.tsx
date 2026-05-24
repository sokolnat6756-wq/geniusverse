import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getIsAdmin, listAllGeniuses, updateGenius } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/geniuses")({
  beforeLoad: async () => {
    try {
      const { isAdmin } = await getIsAdmin();
      if (!isAdmin) throw redirect({ to: "/dashboard" });
    } catch (e) {
      if (e && typeof e === "object" && "to" in e) throw e;
      throw redirect({ to: "/dashboard" });
    }
  },
  component: AdminGeniusesPage,
});

type Row = {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  category: string;
  short_description: string;
  chatgpt_url: string | null;
};

function AdminGeniusesPage() {
  const listFn = useServerFn(listAllGeniuses);
  const updateFn = useServerFn(updateGenius);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-geniuses"],
    queryFn: () => listFn(),
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Управление Гениями</h1>
          <p className="mt-2 text-muted-foreground">
            Редактируйте имя, эмодзи, описание и ссылку на ChatGPT.
          </p>
        </header>

        {isLoading ? (
          <div className="grid place-items-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {data?.geniuses.map((g) => (
              <GeniusRow
                key={g.id}
                row={g as Row}
                onSave={async (patch) => {
                  await updateFn({ data: patch });
                  await qc.invalidateQueries({ queryKey: ["admin-geniuses"] });
                }}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function GeniusRow({
  row,
  onSave,
}: {
  row: Row;
  onSave: (patch: {
    id: string;
    name: string;
    emoji: string;
    short_description: string;
    chatgpt_url: string;
  }) => Promise<void>;
}) {
  const [name, setName] = useState(row.name);
  const [emoji, setEmoji] = useState(row.emoji);
  const [desc, setDesc] = useState(row.short_description);
  const [url, setUrl] = useState(row.chatgpt_url ?? "");

  useEffect(() => {
    setName(row.name);
    setEmoji(row.emoji);
    setDesc(row.short_description);
    setUrl(row.chatgpt_url ?? "");
  }, [row.id, row.name, row.emoji, row.short_description, row.chatgpt_url]);

  const mutation = useMutation({
    mutationFn: () =>
      onSave({ id: row.id, name, emoji, short_description: desc, chatgpt_url: url }),
    onSuccess: () => toast.success(`«${name}» сохранён`),
    onError: (e: Error) => toast.error(e.message ?? "Ошибка сохранения"),
  });

  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-soft backdrop-blur-xl">
      <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <span>{row.category}</span>
        <span>·</span>
        <span className="font-mono">{row.slug}</span>
      </div>
      <div className="grid gap-3 md:grid-cols-[80px_1fr]">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Эмодзи</label>
          <Input value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={16} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Имя</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={200} />
        </div>
      </div>
      <div className="mt-3">
        <label className="mb-1 block text-xs text-muted-foreground">Краткое описание</label>
        <Textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          maxLength={500}
          rows={2}
        />
      </div>
      <div className="mt-3">
        <label className="mb-1 block text-xs text-muted-foreground">Ссылка на ChatGPT</label>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://chat.openai.com/g/..."
          maxLength={500}
        />
      </div>
      <div className="mt-4 flex justify-end">
        <Button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="bg-gradient-hero text-primary-foreground"
        >
          {mutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Сохранить
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
