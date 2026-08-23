import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { adminClient } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GRAPH = "https://graph.facebook.com/v21.0";
const BATCH = 5;
const MAX_ATTEMPTS = 3;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function graph(path: string, params: Record<string, string>, method: "GET" | "POST" = "GET") {
  const qs = new URLSearchParams(params).toString();
  const url = method === "GET" ? `${GRAPH}${path}?${qs}` : `${GRAPH}${path}`;
  const res = await fetch(url, method === "GET" ? {} : {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: qs,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.error) throw new Error(data?.error?.message ?? `Instagram API error (${res.status})`);
  return data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const admin = adminClient();

  try {
    // --- paused-state guard + single-flight lease ---
    const nowIso = new Date().toISOString();
    const { data: state } = await admin
      .from("social_instagram_scheduler_state").select("*").eq("id", 1).maybeSingle();

    if (state?.paused) return json({ result: { skipped: "paused", reason: state.pause_reason } });
    if (state?.lease_until && state.lease_until > nowIso) return json({ result: { skipped: "locked" } });

    const leaseUntil = new Date(Date.now() + 4 * 60_000).toISOString();
    const q = admin
      .from("social_instagram_scheduler_state")
      .update({ lease_until: leaseUntil, last_run_at: nowIso, updated_at: nowIso })
      .eq("id", 1);
    const { data: leased, error: leaseErr } = await (
      state?.lease_until ? q.lt("lease_until", nowIso) : q.is("lease_until", null)
    ).select("id");
    if (leaseErr) throw new Error(leaseErr.message);
    if (!leased?.length) return json({ result: { skipped: "locked" } });

    // --- bounded batch of due posts ---
    const { data: due } = await admin
      .from("social_instagram_posts")
      .select("id, coach_id, calendar_id, kind, media_type, media_url, caption, attempts")
      .eq("status", "scheduled")
      .lte("next_attempt_at", nowIso)
      .order("next_attempt_at", { ascending: true })
      .limit(BATCH);

    let published = 0, failed = 0;

    for (const post of due ?? []) {
      // idempotent claim
      const { data: claimed } = await admin
        .from("social_instagram_posts")
        .update({ status: "publishing", attempts: (post.attempts ?? 0) + 1, updated_at: new Date().toISOString() })
        .eq("id", post.id).eq("status", "scheduled").select("id");
      if (!claimed?.length) continue;

      const fail = async (msg: string) => {
        const attempts = (post.attempts ?? 0) + 1;
        const retry = attempts < MAX_ATTEMPTS;
        await admin.from("social_instagram_posts").update({
          status: retry ? "scheduled" : "failed",
          error: msg,
          next_attempt_at: retry ? new Date(Date.now() + attempts * 10 * 60_000).toISOString() : null,
          updated_at: new Date().toISOString(),
        }).eq("id", post.id);
        failed++;
      };

      try {
        const { data: acc } = await admin
          .from("social_instagram_accounts").select("ig_user_id, access_token")
          .eq("coach_id", post.coach_id).maybeSingle();
        if (!acc) { await fail("Conta do Instagram não conectada"); continue; }

        const mt = post.media_type;
        const isVideo = mt === "REELS" || (mt === "STORIES" && /\.(mp4|mov)(\?|$)/i.test(post.media_url));
        const container = await graph(`/${acc.ig_user_id}/media`, {
          access_token: acc.access_token,
          ...(mt === "STORIES" ? {} : { caption: post.caption ?? "" }),
          ...(mt === "REELS" ? { media_type: "REELS", video_url: post.media_url } : {}),
          ...(mt === "STORIES"
            ? { media_type: "STORIES", ...(isVideo ? { video_url: post.media_url } : { image_url: post.media_url }) }
            : {}),
          ...(mt === "IMAGE" ? { image_url: post.media_url } : {}),
        }, "POST");

        if (isVideo) {
          for (let i = 0; i < 20; i++) {
            const st = await graph(`/${container.id}`, { fields: "status_code", access_token: acc.access_token });
            if (st.status_code === "FINISHED") break;
            if (st.status_code === "ERROR") throw new Error("Falha ao processar o vídeo no Instagram");
            await sleep(3000);
          }
        }

        const pub = await graph(`/${acc.ig_user_id}/media_publish`, {
          access_token: acc.access_token,
          creation_id: container.id,
        }, "POST");

        let permalink: string | null = null;
        try {
          const info = await graph(`/${pub.id}`, { fields: "permalink", access_token: acc.access_token });
          permalink = info?.permalink ?? null;
        } catch (_) { /* optional */ }

        await admin.from("social_instagram_posts").update({
          status: "published", ig_media_id: pub.id, permalink, error: null,
          updated_at: new Date().toISOString(),
        }).eq("id", post.id);

        if (post.calendar_id) {
          const mark = post.kind === "stories" ? { stories_done: true } : { reel_done: true };
          await admin.from("social_content_calendar").update({
            ...mark, status: "published", published_at: new Date().toISOString(),
          }).eq("id", post.calendar_id);
        }
        published++;
      } catch (e) {
        await fail(e instanceof Error ? e.message : "Falha ao publicar");
      }
    }

    await admin.from("social_instagram_scheduler_state")
      .update({ lease_until: null, updated_at: new Date().toISOString() }).eq("id", 1);

    return json({ result: { processed: due?.length ?? 0, published, failed } });
  } catch (e) {
    await admin.from("social_instagram_scheduler_state")
      .update({ lease_until: null, updated_at: new Date().toISOString() }).eq("id", 1);
    return json({ error: e instanceof Error ? e.message : "Erro inesperado" }, 500);
  }
});
