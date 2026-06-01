// MERIDIAN — Telemetry helper. Fire-and-forget event logging.
import { supabase } from "@/integrations/supabase/client";

export type MeridianEventType =
  | "dashboard_viewed"
  | "plan_calculated"
  | "phase_transition"
  | "handoff_sent"
  | "handoff_applied"
  | "handoff_discarded"
  | "checkpoint_submitted"
  | "narrative_generated"
  | "competition_created"
  | "bridge_module_opened";

export interface TrackOpts {
  planId?: string | null;
  data?: Record<string, unknown>;
}

let lastKey = "";
let lastTs = 0;

export async function trackMeridianEvent(
  event: MeridianEventType,
  opts: TrackOpts = {},
): Promise<void> {
  try {
    // Cheap dedup: skip identical event within 1s window.
    const key = `${event}:${opts.planId ?? ""}:${JSON.stringify(opts.data ?? {})}`;
    const now = Date.now();
    if (key === lastKey && now - lastTs < 1000) return;
    lastKey = key;
    lastTs = now;

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;

    await supabase.from("meridian_telemetry" as any).insert({
      user_id: auth.user.id,
      plan_id: opts.planId ?? null,
      event_type: event,
      event_data: opts.data ?? {},
    });
  } catch (e) {
    // never throw from telemetry
    console.warn("[meridian-telemetry]", e);
  }
}
