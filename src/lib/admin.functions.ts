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
      .select("id,name,slug,emoji,category,short_description,chatgpt_url,image_url")
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

export const listAllUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);

    const { data: usersData, error: usersErr } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (usersErr) throw new Error(usersErr.message);

    const [subsRes, accessRes] = await Promise.all([
      supabaseAdmin
        .from("subscriptions")
        .select("user_id,plan_slug,status,created_at")
        .eq("status", "active"),
      supabaseAdmin
        .from("user_genius_access")
        .select("user_id,genius_slug,access_status")
        .eq("access_status", "active"),
    ]);
    if (subsRes.error) throw new Error(subsRes.error.message);
    if (accessRes.error) throw new Error(accessRes.error.message);

    const subsByUser = new Map<string, { plan_slug: string; status: string }>();
    for (const s of subsRes.data ?? []) subsByUser.set(s.user_id, s);

    const accessByUser = new Map<string, string[]>();
    for (const a of accessRes.data ?? []) {
      const arr = accessByUser.get(a.user_id) ?? [];
      arr.push(a.genius_slug);
      accessByUser.set(a.user_id, arr);
    }

    const users = usersData.users.map((u) => {
      const sub = subsByUser.get(u.id);
      const slugs = accessByUser.get(u.id) ?? [];
      return {
        user_id: u.id,
        email: u.email ?? "",
        created_at: u.created_at,
        plan_slug: sub?.plan_slug ?? null,
        status: sub?.status ?? null,
        geniuses_count: slugs.length,
        one_genius_slug: sub?.plan_slug === "one_genius" ? slugs[0] ?? null : null,
      };
    });

    users.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    return { users };
  });

const grantSchema = z.object({
  userId: z.string().uuid(),
  plan: z.enum(["one_genius", "school", "family", "full"]),
  geniusSlug: z.string().min(1).max(64).nullable().optional(),
});

export const grantAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => grantSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);

    if (data.plan === "one_genius" && !data.geniusSlug) {
      throw new Error("Для плана «Один Гений» нужно выбрать Гения");
    }

    const { data: geniuses, error: gErr } = await supabaseAdmin
      .from("geniuses")
      .select("slug,category");
    if (gErr) throw new Error(gErr.message);

    if (data.plan === "one_genius") {
      if (!geniuses?.some((g) => g.slug === data.geniusSlug)) {
        throw new Error("Выбранный Гений не найден");
      }
    }

    const slugs = geniusSlugsForPlan(
      data.plan as PlanSlug,
      geniuses ?? [],
      data.geniusSlug,
    );

    // cancel previous active subscriptions
    await supabaseAdmin
      .from("subscriptions")
      .update({ status: "cancelled" })
      .eq("user_id", data.userId)
      .eq("status", "active");

    const { error: subErr } = await supabaseAdmin.from("subscriptions").insert({
      user_id: data.userId,
      plan_slug: data.plan,
      status: "active",
    });
    if (subErr) throw new Error(subErr.message);

    // reset access
    await supabaseAdmin
      .from("user_genius_access")
      .update({ access_status: "cancelled" })
      .eq("user_id", data.userId);

    if (slugs.length > 0) {
      const rows = slugs.map((slug) => ({
        user_id: data.userId,
        genius_slug: slug,
        access_status: "active",
      }));
      const { error: accErr } = await supabaseAdmin
        .from("user_genius_access")
        .insert(rows);
      if (accErr) throw new Error(accErr.message);
    }

    return { ok: true, granted: slugs.length };
  });

export const revokeAccess = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ userId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);

    await supabaseAdmin
      .from("subscriptions")
      .update({ status: "cancelled" })
      .eq("user_id", data.userId)
      .eq("status", "active");

    await supabaseAdmin
      .from("user_genius_access")
      .update({ access_status: "cancelled" })
      .eq("user_id", data.userId);

    return { ok: true };
  });
