import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { Loader2, Save, Plus, Trash2, Upload, X } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  getIsAdmin,
  listAllGeniuses,
  updateGenius,
  createGenius,
  deleteGenius,
  uploadGeniusImage,
} from "@/lib/admin.functions";

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
  image_url: string | null;
};

async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  let bin = "";
  const bytes = new Uint8Array(buf);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
  }
  return btoa(bin);
}

function AdminGeniusesPage() {
  const listFn = useServerFn(listAllGeniuses);
  const updateFn = useServerFn(updateGenius);
  const createFn = useServerFn(createGenius);
  const deleteFn = useServerFn(deleteGenius);
  const uploadFn = useServerFn(uploadGeniusImage);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-geniuses"],
    queryFn: () => listFn(),
  });

  const categories = useMemo(() => {
    const set = new Set<string>();
    (data?.geniuses ?? []).forEach((g) => g.category && set.add(g.category));
    return Array.from(set).sort();
  }, [data]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-geniuses"] });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Управление Гениями</h1>
            <p className="mt-2 text-muted-foreground">
              Добавляйте, редактируйте и удаляйте Гениев. Загружайте фото с компьютера.
            </p>
          </div>
          <CreateGeniusDialog
            categories={categories}
            onUpload={async (file) => {
              const dataBase64 = await fileToBase64(file);
              const res = await uploadFn({
                data: {
                  fileName: file.name,
                  contentType: file.type || "image/png",
                  dataBase64,
                },
              });
              return res.url;
            }}
            onCreate={async (payload) => {
              await createFn({ data: payload });
              invalidate();
            }}
          />
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
                categories={categories}
                onSave={async (patch) => {
                  await updateFn({ data: patch });
                  await invalidate();
                }}
                onDelete={async () => {
                  await deleteFn({ data: { id: g.id } });
                  await invalidate();
                }}
                onUpload={async (file) => {
                  const dataBase64 = await fileToBase64(file);
                  const res = await uploadFn({
                    data: {
                      fileName: file.name,
                      contentType: file.type || "image/png",
                      dataBase64,
                    },
                  });
                  return res.url;
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
  categories,
  onSave,
  onDelete,
  onUpload,
}: {
  row: Row;
  categories: string[];
  onSave: (patch: {
    id: string;
    name: string;
    slug: string;
    emoji: string;
    category: string;
    short_description: string;
    chatgpt_url: string;
    image_url: string;
  }) => Promise<void>;
  onDelete: () => Promise<void>;
  onUpload: (file: File) => Promise<string>;
}) {
  const [name, setName] = useState(row.name);
  const [slug, setSlug] = useState(row.slug);
  const [emoji, setEmoji] = useState(row.emoji);
  const [category, setCategory] = useState(row.category);
  const [desc, setDesc] = useState(row.short_description);
  const [url, setUrl] = useState(row.chatgpt_url ?? "");
  const [imageUrl, setImageUrl] = useState(row.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(row.name);
    setSlug(row.slug);
    setEmoji(row.emoji);
    setCategory(row.category);
    setDesc(row.short_description);
    setUrl(row.chatgpt_url ?? "");
    setImageUrl(row.image_url ?? "");
  }, [row.id, row.name, row.slug, row.emoji, row.category, row.short_description, row.chatgpt_url, row.image_url]);

  const saveMutation = useMutation({
    mutationFn: () =>
      onSave({
        id: row.id,
        name,
        slug,
        emoji,
        category,
        short_description: desc,
        chatgpt_url: url,
        image_url: imageUrl,
      }),
    onSuccess: () => toast.success(`«${name}» сохранён`),
    onError: (e: Error) => toast.error(e.message ?? "Ошибка сохранения"),
  });

  const deleteMutation = useMutation({
    mutationFn: onDelete,
    onSuccess: () => toast.success("Гений удалён"),
    onError: (e: Error) => toast.error(e.message ?? "Ошибка удаления"),
  });

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const u = await onUpload(file);
      setImageUrl(u);
      toast.success("Фото загружено. Не забудьте сохранить.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-soft backdrop-blur-xl">
      <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <span>{row.category}</span>
        <span>·</span>
        <span className="font-mono">{row.slug}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-[120px_1fr]">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">Фото</label>
          <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-border bg-muted">
            {imageUrl ? (
              <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center text-3xl">{emoji}</div>
            )}
          </div>
          <div className="mt-2 flex flex-col gap-1">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="w-full"
            >
              {uploading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <Upload className="mr-1 h-3 w-3" /> Загрузить
                </>
              )}
            </Button>
            {imageUrl && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setImageUrl("")}
                className="w-full text-xs text-muted-foreground"
              >
                <X className="mr-1 h-3 w-3" /> Убрать
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-[80px_1fr]">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Эмодзи</label>
              <Input value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={16} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Имя</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={200} />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Slug</label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                maxLength={64}
                className="font-mono"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Категория</label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                maxLength={64}
                list={`cats-${row.id}`}
              />
              <datalist id={`cats-${row.id}`}>
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Краткое описание</label>
            <Textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              maxLength={500}
              rows={2}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Ссылка на ChatGPT</label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://chat.openai.com/g/..."
              maxLength={500}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-between gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
              <Trash2 className="mr-1 h-4 w-4" /> Удалить
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Удалить «{row.name}»?</AlertDialogTitle>
              <AlertDialogDescription>
                Это действие нельзя отменить. У всех пользователей будет отозван доступ к этому Гению.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteMutation.mutate()}>
                Удалить
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="bg-gradient-hero text-primary-foreground"
        >
          {saveMutation.isPending ? (
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

type CreateGeniusPayload = {
  name: string;
  slug: string;
  emoji: string;
  category: string;
  short_description: string;
  chatgpt_url: string;
  image_url: string;
};

function CreateGeniusDialog({
  categories,
  onUpload,
  onCreate,
}: {
  categories: string[];
  onUpload: (file: File) => Promise<string>;
  onCreate: (payload: CreateGeniusPayload) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [emoji, setEmoji] = useState("✨");
  const [category, setCategory] = useState(categories[0] ?? "school");
  const [desc, setDesc] = useState("");
  const [url, setUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setName("");
    setSlug("");
    setEmoji("✨");
    setCategory(categories[0] ?? "school");
    setDesc("");
    setUrl("");
    setImageUrl("");
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const u = await onUpload(file);
      setImageUrl(u);
      toast.success("Фото загружено");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const createMutation = useMutation({
    mutationFn: () =>
      onCreate({
        name,
        slug,
        emoji,
        category,
        short_description: desc,
        chatgpt_url: url,
        image_url: imageUrl,
      }),
    onSuccess: () => {
      toast.success("Гений добавлен");
      reset();
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message ?? "Ошибка"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-hero text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" /> Добавить Гения
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Новый Гений</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-[100px_1fr]">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Фото</label>
              <div className="h-20 w-20 overflow-hidden rounded-xl border border-border bg-muted">
                {imageUrl ? (
                  <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-2xl">{emoji}</div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={uploading}
                onClick={() => fileRef.current?.click()}
                className="mt-2 w-full"
              >
                {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
              </Button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-[80px_1fr] gap-2">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Эмодзи</label>
                  <Input value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={16} />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Имя</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={200} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Slug</label>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="my-genius"
                    className="font-mono"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Категория</label>
                  <Input
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    list="new-cats"
                  />
                  <datalist id="new-cats">
                    {categories.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Краткое описание</label>
            <Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} maxLength={500} />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Ссылка на ChatGPT</label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://chat.openai.com/g/..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
            className="bg-gradient-hero text-primary-foreground"
          >
            {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Создать"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
