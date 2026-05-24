import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { geniusSlugsForPlan, type PlanSlug } from "@/lib/access";

export const getDashboardData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const [profileRes, subRes, geniusesRes, accessRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("geniuses").select("*").order("category").order("name"),
      supabase
        .from("user_genius_access")
        .select("*")
        .eq("user_id", userId)
        .eq("access_status", "active")
        .limit(1)
        .maybeSingle(),
    ]);

    return {
      profile: profileRes.data,
      subscription: subRes.data,
      geniuses: geniusesRes.data ?? [],
      selectedOneGenius: accessRes.data?.genius_slug ?? null,
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

    // Cancel any existing active subscriptions (admin client, scoped to this user)
    await supabaseAdmin
      .from("subscriptions")
      .update({ status: "cancelled" })
      .eq("user_id", userId)
      .eq("status", "active");

    const { data: sub, error } = await supabaseAdmin
      .from("subscriptions")
      .insert({
        user_id: userId,
        plan_slug: data.planSlug,
        status: "active",
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

    const allowedSlugs = geniusSlugsForPlan(
      sub.plan_slug as PlanSlug,
      geniuses ?? [],
      data.geniusSlug,
    );
    if (!allowedSlugs.includes(data.geniusSlug)) {
      throw new Error("Этот Гений недоступен на вашем тарифе");
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
