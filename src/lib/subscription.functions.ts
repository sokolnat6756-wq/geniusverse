import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { geniusSlugsForPlan, isGeniusUnlocked, type PlanSlug } from "@/lib/access";

export const getDashboardData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const [profileRes, subRes, pendingRes, geniusesRes, accessRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      // Public catalog fields only — no chatgpt_url leak
      supabase
        .from("geniuses")
        .select("id,name,slug,emoji,category,short_description")
        .order("category")
        .order("name"),
      supabase
        .from("user_genius_access")
        .select("*")
        .eq("user_id", userId)
        .eq("access_status", "active")
        .limit(1)
        .maybeSingle(),
    ]);

    const planSlug = subRes.data?.plan_slug ?? null;
    const selectedOneGenius = accessRes.data?.genius_slug ?? null;
    const baseGeniuses = geniusesRes.data ?? [];

    // Fetch chatgpt_url ONLY for geniuses the user is entitled to
    const unlockedSlugs = baseGeniuses
      .filter((g) => isGeniusUnlocked(g, planSlug, selectedOneGenius))
      .map((g) => g.slug);

    let urlBySlug = new Map<string, string | null>();
    if (unlockedSlugs.length > 0) {
      const { data: urls } = await supabaseAdmin
        .from("geniuses")
        .select("slug,chatgpt_url")
        .in("slug", unlockedSlugs);
      urlBySlug = new Map((urls ?? []).map((u) => [u.slug, u.chatgpt_url]));
    }

    const geniuses = baseGeniuses.map((g) => ({
      ...g,
      chatgpt_url: urlBySlug.get(g.slug) ?? null,
    }));

    return {
      profile: profileRes.data,
      subscription: subRes.data,
      pendingSubscription: pendingRes.data,
      geniuses,
      selectedOneGenius,
    };
  });

export const getCurrentSubscription = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return { subscription: data };
  });

const ALLOWED_PLANS = ["one_genius", "school", "family", "full"] as const;

export const activateMockSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ planSlug: z.enum(ALLOWED_PLANS) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // Remove any previous pending request for this user (keep active untouched)
    await supabaseAdmin
      .from("subscriptions")
      .delete()
      .eq("user_id", userId)
      .eq("status", "pending");

    const { data: sub, error } = await supabaseAdmin
      .from("subscriptions")
      .insert({
        user_id: userId,
        plan_slug: data.planSlug,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { subscription: sub };
  });

export const selectOneGenius = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ geniusSlug: z.string().min(1).max(64) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;

    // Verify the user has an active subscription that entitles them to this genius
    const { data: sub, error: subErr } = await supabaseAdmin
      .from("subscriptions")
      .select("plan_slug")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (subErr) throw new Error(subErr.message);
    if (!sub) throw new Error("Нет активной подписки");

    const { data: geniuses, error: gErr } = await supabaseAdmin
      .from("geniuses")
      .select("slug,category");
    if (gErr) throw new Error(gErr.message);

    // Verify the requested slug actually exists
    if (!(geniuses ?? []).some((g) => g.slug === data.geniusSlug)) {
      throw new Error("Гений не найден");
    }

    if (sub.plan_slug === "one_genius") {
      // any genius is selectable, plan grants access to exactly one
    } else {
      const allowedSlugs = geniusSlugsForPlan(
        sub.plan_slug as PlanSlug,
        geniuses ?? [],
        null,
      );
      if (!allowedSlugs.includes(data.geniusSlug)) {
        throw new Error("Этот Гений недоступен на вашем тарифе");
      }
    }

    // deactivate previous selection
    await supabaseAdmin
      .from("user_genius_access")
      .update({ access_status: "cancelled" })
      .eq("user_id", userId);

    const { error } = await supabaseAdmin.from("user_genius_access").upsert(
      {
        user_id: userId,
        genius_slug: data.geniusSlug,
        access_status: "active",
      },
      { onConflict: "user_id,genius_slug" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });
