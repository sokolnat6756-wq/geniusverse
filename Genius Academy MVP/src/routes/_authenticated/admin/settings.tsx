import { createFileRoute, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getIsAdmin } from "@/lib/admin.functions";
import { getFounderSettings, updateFounderImage } from "@/lib/site-settings.functions";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  beforeLoad: async () => {
    try {
      const { isAdmin } = await getIsAdmin();
      if (!isAdmin) throw redirect({ to: "/dashboard" });
    } catch (e) {
      if (e && typeof e === "object" && "to" in e) throw e;
      throw redirect({ to: "/dashboard" });
    }
  },
  component: AdminSettingsPage,
});

async function uploadFounderImage(file: File): Promise<string> {
  if (file.size > 10 * 1024 * 1024) throw new Error("Файл слишком большой (макс. 10 МБ)");
  if (!/^image\//.test(file.type)) throw new Error("Поддерживаются только изображения");
  const ext = (file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) || "bin";
  const path = `founder/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("genius-images").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from("genius-images").getPublicUrl(path);
  return data.publicUrl;
}

function AdminSettingsPage() {
  const getFn = useServerFn(getFounderSettings);
  const updateFn = useServerFn(updateFounderImage);
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-founder-settings"],
    queryFn: () => getFn(),
  });

  const updateMutation = useMutation({
    mutationFn: (image_url: string | null) => updateFn({ data: { image_url } }),
    onSuccess: () => {
      toast.success("Сохранено");
      qc.invalidateQueries({ queryKey: ["admin-founder-settings"] });
      qc.invalidateQueries({ queryKey: ["public-catalog"] });
    },
    onError: (e: Error) => toast.error(e.message ?? "Ошибка"),
  });

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFounderImage(file);
      await updateMutation.mutateAsync(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const imageUrl = data?.image_url ?? null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Настройки сайта</h1>
          <p className="mt-2 text-muted-foreground">
            Управляйте контентом главной страницы.
          </p>
        </header>

        <section className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-soft backdrop-blur-xl">
          <h2 className="text-lg font-semibold tracking-tight">Фото основателя</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Используется в разделе «Идея, которая стала Академией Гениев». Рекомендуем вертикальное фото (соотношение 4:5).
          </p>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="relative aspect-[4/5] w-40 overflow-hidden rounded-2xl border border-border bg-muted shadow-soft ring-1 ring-white/50">
              {isLoading ? (
                <div className="grid h-full w-full place-items-center">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : imageUrl ? (
                <img src={imageUrl} alt="Основатель" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center bg-gradient-hero text-5xl font-bold text-white/90">
                  ЮК
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
              />
              <Button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading || updateMutation.isPending}
                className="bg-gradient-hero text-primary-foreground sm:w-fit"
              >
                {uploading || updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" /> Загрузить фото
                  </>
                )}
              </Button>
              {imageUrl && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => updateMutation.mutate(null)}
                  disabled={uploading || updateMutation.isPending}
                  className="sm:w-fit"
                >
                  <X className="mr-2 h-4 w-4" /> Удалить фото
                </Button>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                PNG или JPG до 10 МБ. Лучший результат — портрет с равномерным освещением.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
