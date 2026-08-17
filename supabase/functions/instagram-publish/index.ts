import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { requireUser, adminClient } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GRAPH = "https://graph.facebook.com/v21.0";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

async function graph(path: string, params: Record<string, string>, method: "GET" | "POST" = "GET") {
  const qs = new URLSearchParams(params).toString();
  const url = method === "GET" ? `${GRAPH}${path}?${qs}` : `${GRAPH}${path}`;
  const res = await fetch(url, method === "GET" ? {} : {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: qs,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.error) {
    throw new Error(data?.error?.message ?? `Instagram API error (${res.status})`);
  }
  return data;
}

/** Resolves the IG business account reachable with this token. */
async function resolveAccount(token: string) {
  // 1. Direct: token already belongs to an IG business account
  try {
    const me = await graph("/me", { fields: "id,username", access_token: token });
    if (me?.username && me?.id) {
      return { ig_user_id: String(me.id), username: String(me.username), page_id: null as string | null };
    }
  } catch (_) { /* fall through */ }

  // 2. Facebook Page → linked Instagram business account
  const pages = await graph("/me/accounts", {
    fields: "id,name,instagram_business_account{id,username}",
    access_token: token,
  });
  const page = (pages?.data ?? []).find((p: Record<string, any>) => p?.instagram_business_account?.id);
  if (!page) {
    throw new Error("Nenhuma conta Instagram Business/Creator vinculada a uma Página do Facebook foi encontrada para este token.");
  }
  return {
    ig_user_id: String(page.instagram_business_account.id),
    username: page.instagram_business_account.username ?? null,
    page_id: String(page.id),
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = await requireUser(req);
    if (!auth.ok) return json({ error: auth.error }, auth.status);
    const coachId = auth.userId;
    const admin = adminClient();

    const body = await req.json().catch(() => ({}));
    const action: string = body?.action ?? "status";

    if (action === "status") {
      const { data } = await admin
        .from("social_instagram_accounts")
        .select("ig_user_id, username, token_expires_at, connected_at")
        .eq("coach_id", coachId)
        .maybeSingle();
      return json({ result: { connected: !!data, account: data ?? null } });
    }

    if (action === "connect") {
      const token = String(body?.access_token ?? "").trim();
      if (token.length < 20) return json({ error: "Token inválido" }, 400);
      const account = await resolveAccount(token);
      const expires = body?.expires_in ? new Date(Date.now() + Number(body.expires_in) * 1000).toISOString() : null;
      const { error } = await admin.from("social_instagram_accounts").upsert({
        coach_id: coachId,
        ig_user_id: account.ig_user_id,
        username: account.username,
        page_id: account.page_id,
        access_token: token,
        token_expires_at: expires,
        updated_at: new Date().toISOString(),
      });
      if (error) throw new Error(error.message);
      return json({ result: { connected: true, account: { ...account, access_token: undefined } } });
    }

    if (action === "disconnect") {
      await admin.from("social_instagram_accounts").delete().eq("coach_id", coachId);
      return json({ result: { connected: false } });
    }

    if (action === "publish") {
      const mediaUrl = String(body?.media_url ?? "").trim();
      const caption = String(body?.caption ?? "").slice(0, 2200);
      const mediaType: string = body?.media_type === "REELS" ? "REELS" : "IMAGE";
      const calendarId: string | null = body?.calendar_id ?? null;

      if (!/^https:\/\/.+/i.test(mediaUrl)) {
        return json({ error: "Informe uma URL pública https da imagem ou do vídeo" }, 400);
      }

      const { data: acc } = await admin
        .from("social_instagram_accounts")
        .select("ig_user_id, access_token, username")
        .eq("coach_id", coachId)
        .maybeSingle();
      if (!acc) return json({ error: "Conecte sua conta do Instagram antes de publicar" }, 400);

      try {
        // 1) container
        const container = await graph(`/${acc.ig_user_id}/media`, {
          access_token: acc.access_token,
          caption,
          ...(mediaType === "REELS"
            ? { media_type: "REELS", video_url: mediaUrl }
            : { image_url: mediaUrl }),
        }, "POST");

        // 2) wait for processing (videos)
        if (mediaType === "REELS") {
          for (let i = 0; i < 20; i++) {
            const st = await graph(`/${container.id}`, {
              fields: "status_code",
              access_token: acc.access_token,
            });
            if (st.status_code === "FINISHED") break;
            if (st.status_code === "ERROR") throw new Error("Falha ao processar o vídeo no Instagram");
            await sleep(3000);
          }
        }

        // 3) publish
        const published = await graph(`/${acc.ig_user_id}/media_publish`, {
          access_token: acc.access_token,
          creation_id: container.id,
        }, "POST");

        let permalink: string | null = null;
        try {
          const info = await graph(`/${published.id}`, { fields: "permalink", access_token: acc.access_token });
          permalink = info?.permalink ?? null;
        } catch (_) { /* optional */ }

        await admin.from("social_instagram_posts").insert({
          coach_id: coachId,
          calendar_id: calendarId,
          media_type: mediaType,
          media_url: mediaUrl,
          caption,
          ig_media_id: published.id,
          permalink,
          status: "published",
        });

        if (calendarId) {
          await admin.from("social_content_calendar")
            .update({ status: "published", published_at: new Date().toISOString() })
            .eq("id", calendarId).eq("coach_id", coachId);
        }

        return json({ result: { ig_media_id: published.id, permalink } });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Falha ao publicar";
        await admin.from("social_instagram_posts").insert({
          coach_id: coachId,
          calendar_id: calendarId,
          media_type: mediaType,
          media_url: mediaUrl,
          caption,
          status: "failed",
          error: msg,
        });
        return json({ error: msg }, 400);
      }
    }

    return json({ error: "Ação inválida" }, 400);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Erro inesperado" }, 500);
  }
});
