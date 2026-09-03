import { supabase } from "@/integrations/supabase/client";

export type FunnelStep = "view" | "quiz_start" | "quiz_complete" | "lead_submitted";

const KEY = "mce_diag_session";

export function funnelSessionId() {
  try {
    const existing = sessionStorage.getItem(KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem(KEY, id);
    return id;
  } catch {
    return "anon";
  }
}

export async function trackFunnel(step: FunnelStep) {
  try {
    const params = new URLSearchParams(window.location.search);
    await supabase.from("mce_funnel_events").insert({
      session_id: funnelSessionId(),
      step,
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
      device: window.innerWidth < 768 ? "mobile" : "desktop",
      referrer: document.referrer || null,
    });
  } catch {
    /* rastreamento nunca bloqueia a experiência */
  }
}
