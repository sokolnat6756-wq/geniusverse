import { Buffer } from "node:buffer";
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

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9_-]+$/, "Slug: только a-z, 0-9, _ и -");

const urlSchema = z
  .string()
  .trim()
  .max(1000)
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .refine(
    (v) => v === null || /^https?:\/\/.+/i.test(v),
    { message: "URL должен начинаться с http(s)://" },
  );

const geniusFields = {
  name: z.string().trim().min(1).max(200),
  slug: slugSchema,
  emoji: z.string().trim().min(1).max(16),
  category: z.string().trim().min(1).max(64),
  short_description: z.string().trim().min(1).max(500),
  chatgpt_url: urlSchema,
  image_url: urlSchema,
};

const updateSchema = z.object({
  id: z.string().uuid(),
  ...geniusFields,
});

const createSchema = z.object(geniusFields);

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

export const createGenius = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => createSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("geniuses").insert(data);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteGenius = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { data: g } = await supabaseAdmin
      .from("geniuses")
      .select("slug")
      .eq("id", data.id)
      .maybeSingle();
    if (g?.slug) {
      await supabaseAdmin
        .from("user_genius_access")
        .update({ access_status: "cancelled" })
        .eq("genius_slug", g.slug);
    }
    const { error } = await supabaseAdmin
      .from("geniuses")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const uploadSchema = z.object({
  fileName: z.string().min(1).max(200),
  contentType: z.string().min(1).max(100),
  dataBase64: z.string().min(1).max(8_000_000), // ~6MB binary
});

export const uploadGeniusImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => uploadSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    if (!/^image\/(png|jpe?g|webp|gif|svg\+xml)$/i.test(data.contentType)) {
      throw new Error("Поддерживаются только изображения (png, jpg, webp, gif, svg)");
    }
    const ext = (data.fileName.split(".").pop() ?? "bin")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 8) || "bin";
    const path = `${crypto.randomUUID()}.${ext}`;
    const buffer = Buffer.from(data.dataBase64, "base64");
    const { error: upErr } = await supabaseAdmin.storage
      .from("genius-images")
      .upload(path, buffer, {
        contentType: data.contentType,
        upsert: false,
      });
    if (upErr) throw new Error(upErr.message);
    const { data: pub } = supabaseAdmin.storage
      .from("genius-images")
      .getPublicUrl(path);
    return { url: pub.publicUrl };
  });

export const listAllOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);

    const { data: subs, error } = await supabaseAdmin
      .from("subscriptions")
      .select("id,user_id,plan_slug,status,created_at,expires_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);

    const { data: usersData, error: usersErr } =
      await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (usersErr) throw new Error(usersErr.message);
    const emailByUser = new Map(usersData.users.map((u) => [u.id, u.email ?? ""]));

    const orders = (subs ?? []).map((s) => ({
      id: s.id,
      user_id: s.user_id,
      email: emailByUser.get(s.user_id) ?? "—",
      plan_slug: s.plan_slug,
      status: s.status,
      created_at: s.created_at,
      expires_at: s.expires_at,
    }));
    return { orders };
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["active", "cancelled", "pending"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("subscriptions")
      .update({ status: data.status })
      .eq("id", data.id);
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

    const [subsRes, pendingRes, accessRes] = await Promise.all([
      supabaseAdmin
        .from("subscriptions")
        .select("user_id,plan_slug,status,created_at")
        .eq("status", "active"),
      supabaseAdmin
        .from("subscriptions")
        .select("user_id,plan_slug,status,created_at")
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("user_genius_access")
        .select("user_id,genius_slug,access_status")
        .eq("access_status", "active"),
    ]);
    if (subsRes.error) throw new Error(subsRes.error.message);
    if (pendingRes.error) throw new Error(pendingRes.error.message);
    if (accessRes.error) throw new Error(accessRes.error.message);

    const subsByUser = new Map<string, { plan_slug: string; status: string }>();
    for (const s of subsRes.data ?? []) subsByUser.set(s.user_id, s);

    // pendingRes is already ordered DESC; keep first (latest) per user
    const pendingByUser = new Map<string, { plan_slug: string; created_at: string }>();
    for (const s of pendingRes.data ?? []) {
      if (!pendingByUser.has(s.user_id)) {
        pendingByUser.set(s.user_id, { plan_slug: s.plan_slug, created_at: s.created_at });
      }
    }

    const accessByUser = new Map<string, string[]>();
    for (const a of accessRes.data ?? []) {
      const arr = accessByUser.get(a.user_id) ?? [];
      arr.push(a.genius_slug);
      accessByUser.set(a.user_id, arr);
    }

    const users = usersData.users.map((u) => {
      const sub = subsByUser.get(u.id);
      const pending = pendingByUser.get(u.id);
      const slugs = accessByUser.get(u.id) ?? [];
      return {
        user_id: u.id,
        email: u.email ?? "",
        created_at: u.created_at,
        plan_slug: sub?.plan_slug ?? null,
        status: sub?.status ?? null,
        pending_plan_slug: pending?.plan_slug ?? null,
        pending_created_at: pending?.created_at ?? null,
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
