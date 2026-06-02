import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type FounderSettings = { image_url: string | null };

export const getFounderSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<FounderSettings> => {
    const { data } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "founder")
      .maybeSingle();
    const v = (data?.value ?? {}) as { image_url?: string | null };
    return { image_url: v.image_url ?? null };
  },
);

export const updateFounderImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({ image_url: z.string().url().max(2048).nullable() })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) throw new Error("Доступ запрещён");

    const { error } = await supabaseAdmin
      .from("site_settings")
      .upsert(
        { key: "founder", value: { image_url: data.image_url }, updated_at: new Date().toISOString() },
        { onConflict: "key" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });
