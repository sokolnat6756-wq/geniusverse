import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { geniusSlugsForPlan, type PlanSlug } from "@/lib/access";

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

export const getIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data };
  });

export const listAllGeniuses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("geniuses")
      .select("id,name,slug,emoji,category,short_description,chatgpt_url")
      .order("category")
      .order("name");
    if (error) throw new Error(error.message);
    return { geniuses: data ?? [] };
  });

const updateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(200),
  emoji: z.string().trim().min(1).max(16),
  short_description: z.string().trim().min(1).max(500),
  chatgpt_url: z
    .string()
    .trim()
    .max(500)
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .refine(
      (v) => v === null || /^https?:\/\/.+/i.test(v),
      { message: "URL должен начинаться с http(s)://" },
    ),
});

export const updateGenius = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => updateSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { id, ...patch } = data;
    const { error } = await supabaseAdmin
      .from("geniuses")
      .update(patch)
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
