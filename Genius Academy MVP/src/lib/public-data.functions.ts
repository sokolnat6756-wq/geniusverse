import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getPublicCatalog = createServerFn({ method: "GET" }).handler(
  async () => {
    const [plansRes, geniusesRes, founderRes] = await Promise.all([
      supabaseAdmin
        .from("plans")
        .select("id,name,slug,price,description")
        .order("price"),
      supabaseAdmin
        .from("geniuses")
        .select("id,name,slug,emoji,category,short_description,image_url")
        .order("category")
        .order("name"),
      supabaseAdmin
        .from("site_settings")
        .select("value")
        .eq("key", "founder")
        .maybeSingle(),
    ]);
    const founderValue = (founderRes.data?.value ?? {}) as { image_url?: string | null };
    return {
      plans: plansRes.data ?? [],
      geniuses: geniusesRes.data ?? [],
      founder: { image_url: founderValue.image_url ?? null },
    };
  },
);
