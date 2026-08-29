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

const PROFILE_COLUMNS =
  "ig_user_id, username, full_name, biography, profile_picture_url, followers_count, follows_count, media_count, recent_media, synced_at, token_expires_at, connected_at, source";

/** Converte "12,3 mil" / "1.2K" / "45.678" em número. */
function parseCount(raw: unknown): number | null {
  if (typeof raw === "number" && isFinite(raw)) return Math.round(raw);
  const s = String(raw ?? "").trim().toLowerCase();
  if (!s) return null;
  const mult = /mil|k/.test(s) ? 1e3 : /mi\b|m\b|milh/.test(s) ? 1e6 : 1;
  const cleaned = s.replace(/[^\d.,]/g, "");
  if (!cleaned) return null;
  const normalized = mult > 1
    ? cleaned.replace(",", ".")
    : cleaned.replace(/[.,](?=\d{3}\b)/g, "").replace(",", ".");
  const n = Number(normalized);
  if (!isFinite(n)) return null;
  return Math.round(n * mult);
}

/** Lê um print do perfil do Instagram e extrai nome, @, bio e números. */
async function analyzeScreenshot(imageDataUrl: string) {
  const key = Deno.env.get("LOVABLE_API_KEY");
  if (!key) throw new Error("Serviço de leitura de imagem indisponível.");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3.7-flash",
      messages: [{
        role: "user",
        content: [
          {
            type: "text",
            text:
              "Analise este screenshot de perfil do Instagram e extraia as informações.\n" +
              "Responda SOMENTE JSON:\n" +
              '{\n  "nome": "nome exibido",\n  "username": "@handle",\n  "bio": "texto completo da bio",\n' +
              '  "seguidores": "número",\n  "seguindo": "número",\n  "posts": "número"\n}',
          },
          { type: "image_url", image_url: { url: imageDataUrl } },
        ],
      }],
    }),
  });
  if (res.status === 429) throw new Error("Muitas leituras seguidas. Aguarde alguns segundos e tente de novo.");
  if (res.status === 402) throw new Error("Créditos de IA esgotados no workspace. Adicione créditos para continuar.");
  if (!res.ok) throw new Error(`Falha ao ler o screenshot (${res.status})`);
  const data = await res.json();
  const text = String(data?.choices?.[0]?.message?.content ?? "");
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Não consegui ler os dados desse print. Envie um print da tela do perfil completo.");
  const parsed = JSON.parse(match[0]) as Record<string, unknown>;
  return {
    full_name: String(parsed.nome ?? "").trim() || null,
    username: String(parsed.username ?? "").trim().replace(/^@/, "") || null,
    biography: String(parsed.bio ?? "").trim() || null,
    followers_count: parseCount(parsed.seguidores),
    follows_count: parseCount(parsed.seguindo),
    media_count: parseCount(parsed.posts),
  };
}

/** Fetches name, bio, photo and recent media for the connected IG business account. */
async function fetchProfileSnapshot(igUserId: string, token: string) {
  const profile = await graph(`/${igUserId}`, {
    fields: "id,username,name,biography,profile_picture_url,followers_count,follows_count,media_count",
    access_token: token,
  });

  let recent: unknown[] = [];
  try {
    const media = await graph(`/${igUserId}/media`, {
      fields: "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count",
      limit: "12",
      access_token: token,
    });
    recent = (media?.data ?? []).map((m: Record<string, any>) => ({
      id: m.id,
      caption: m.caption ?? null,
      media_type: m.media_type ?? null,
      media_url: m.media_type === "VIDEO" ? (m.thumbnail_url ?? m.media_url) : m.media_url,
      permalink: m.permalink ?? null,
      timestamp: m.timestamp ?? null,
      like_count: m.like_count ?? null,
      comments_count: m.comments_count ?? null,
    }));
  } catch (_) { /* media permission optional */ }

  return {
    username: profile?.username ?? null,
    full_name: profile?.name ?? null,
    biography: profile?.biography ?? null,
    profile_picture_url: profile?.profile_picture_url ?? null,
    followers_count: profile?.followers_count ?? null,
    follows_count: profile?.follows_count ?? null,
    media_count: profile?.media_count ?? null,
    recent_media: recent,
    synced_at: new Date().toISOString(),
  };
}

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
        .select(PROFILE_COLUMNS)
        .eq("coach_id", coachId)
        .maybeSingle();
      return json({ result: { connected: !!data, account: data ?? null } });
    }

    if (action === "connect") {
      const token = String(body?.access_token ?? "").trim();
      if (token.length < 20) return json({ error: "Token inválido" }, 400);
      const account = await resolveAccount(token);
      const expires = body?.expires_in ? new Date(Date.now() + Number(body.expires_in) * 1000).toISOString() : null;
      let snapshot: Record<string, unknown> = {};
      try {
        snapshot = await fetchProfileSnapshot(account.ig_user_id, token);
      } catch (_) { /* profile fields optional at connect time */ }
      const { error } = await admin.from("social_instagram_accounts").upsert({
        coach_id: coachId,
        ig_user_id: account.ig_user_id,
        username: account.username,
        page_id: account.page_id,
        access_token: token,
        token_expires_at: expires,
        source: "token",
        ...snapshot,
        updated_at: new Date().toISOString(),
      });
      if (error) throw new Error(error.message);
      const { data: saved } = await admin
        .from("social_instagram_accounts")
        .select(PROFILE_COLUMNS)
        .eq("coach_id", coachId)
        .maybeSingle();
      return json({ result: { connected: true, account: saved } });
    }

    if (action === "analyze_screenshot") {
      const image = String(body?.image ?? "");
      if (!/^data:image\/(png|jpe?g|webp|heic);base64,/i.test(image)) {
        return json({ error: "Envie um print em PNG, JPG ou WEBP." }, 400);
      }
      if (image.length > 12_000_000) return json({ error: "Imagem muito grande (máx. ~8MB)." }, 400);
      const extracted = await analyzeScreenshot(image);
      return json({ result: { extracted } });
    }

    if (action === "connect_manual") {
      const username = String(body?.username ?? "").trim().replace(/^@/, "").slice(0, 60);
      if (username.length < 1) return json({ error: "Informe o @ do perfil" }, 400);
      const { error } = await admin.from("social_instagram_accounts").upsert({
        coach_id: coachId,
        ig_user_id: `manual:${username.toLowerCase()}`,
        username,
        full_name: String(body?.full_name ?? "").trim().slice(0, 120) || null,
        biography: String(body?.biography ?? "").trim().slice(0, 1000) || null,
        followers_count: Number.isFinite(Number(body?.followers_count)) ? Number(body?.followers_count) : null,
        follows_count: Number.isFinite(Number(body?.follows_count)) ? Number(body?.follows_count) : null,
        media_count: Number.isFinite(Number(body?.media_count)) ? Number(body?.media_count) : null,
        access_token: "",
        page_id: null,
        token_expires_at: null,
        recent_media: [],
        source: "screenshot",
        synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      if (error) throw new Error(error.message);
      const { data: saved } = await admin
        .from("social_instagram_accounts")
        .select(PROFILE_COLUMNS)
        .eq("coach_id", coachId)
        .maybeSingle();
      return json({ result: { connected: true, account: saved } });
    }

    if (action === "sync_profile") {
      const { data: acc } = await admin
        .from("social_instagram_accounts")
        .select("ig_user_id, access_token, source")
        .eq("coach_id", coachId)
        .maybeSingle();
      if (!acc) return json({ error: "Conecte sua conta do Instagram primeiro" }, 400);
      if (acc.source === "screenshot" || !acc.access_token) {
        return json({ error: "Conta conectada por screenshot: envie um novo print para atualizar os dados." }, 400);
      }

      const snapshot = await fetchProfileSnapshot(acc.ig_user_id, acc.access_token);
      const { error } = await admin
        .from("social_instagram_accounts")
        .update({ ...snapshot, updated_at: new Date().toISOString() })
        .eq("coach_id", coachId);
      if (error) throw new Error(error.message);

      const { data: saved } = await admin
        .from("social_instagram_accounts")
        .select(PROFILE_COLUMNS)
        .eq("coach_id", coachId)
        .maybeSingle();
      return json({ result: { connected: true, account: saved } });
    }

    if (action === "disconnect") {
      await admin.from("social_instagram_accounts").delete().eq("coach_id", coachId);
      return json({ result: { connected: false } });
    }

    if (action === "schedule") {
      const mediaUrl = String(body?.media_url ?? "").trim();
      const caption = String(body?.caption ?? "").slice(0, 2200);
      const selfComment = String(body?.self_comment ?? "").trim().slice(0, 2200);
      const kind: string = body?.kind === "stories" ? "stories" : "reel";
      const mediaType = kind === "stories" ? "STORIES" : (body?.media_type === "IMAGE" ? "IMAGE" : "REELS");
      const calendarId: string | null = body?.calendar_id ?? null;
      const scheduledAt = new Date(String(body?.scheduled_at ?? ""));

      if (!/^https:\/\/.+/i.test(mediaUrl)) {
        return json({ error: "Informe uma URL pública https da imagem ou do vídeo" }, 400);
      }
      if (isNaN(scheduledAt.getTime())) return json({ error: "Data/hora do agendamento inválida" }, 400);
      if (scheduledAt.getTime() < Date.now() - 60_000) return json({ error: "Escolha um horário no futuro" }, 400);

      const { data: acc } = await admin
        .from("social_instagram_accounts").select("ig_user_id, source")
        .eq("coach_id", coachId).maybeSingle();
      if (!acc) return json({ error: "Conecte sua conta do Instagram antes de agendar" }, 400);
      if (acc.source === "screenshot") {
        return json({ error: "Agendamento automático exige conexão com token da Meta (opção avançada)." }, 400);
      }

      const { data: row, error } = await admin.from("social_instagram_posts").insert({
        coach_id: coachId,
        calendar_id: calendarId,
        kind,
        media_type: mediaType,
        media_url: mediaUrl,
        caption,
        self_comment: selfComment || null,
        status: "scheduled",
        scheduled_at: scheduledAt.toISOString(),
        next_attempt_at: scheduledAt.toISOString(),
      }).select("id, kind, media_type, status, scheduled_at, calendar_id").single();
      if (error) throw new Error(error.message);
      return json({ result: { post: row } });
    }

    if (action === "list_scheduled") {
      const { data, error } = await admin
        .from("social_instagram_posts")
        .select("id, calendar_id, kind, media_type, media_url, caption, status, scheduled_at, permalink, error, attempts")
        .eq("coach_id", coachId)
        .in("status", ["scheduled", "publishing", "failed", "published"])
        .order("scheduled_at", { ascending: true, nullsFirst: false })
        .limit(120);
      if (error) throw new Error(error.message);
      return json({ result: { posts: data ?? [] } });
    }

    if (action === "cancel_scheduled") {
      const id = String(body?.id ?? "");
      if (!id) return json({ error: "Informe o agendamento" }, 400);
      const { error } = await admin.from("social_instagram_posts")
        .delete().eq("id", id).eq("coach_id", coachId).in("status", ["scheduled", "failed"]);
      if (error) throw new Error(error.message);
      return json({ result: { canceled: true } });
    }

    if (action === "publish") {
      const caption = String(body?.caption ?? "").slice(0, 2200);
      const mediaType: string = body?.media_type === "REELS" ? "REELS"
        : body?.media_type === "STORIES" ? "STORIES"
        : body?.media_type === "CAROUSEL" ? "CAROUSEL" : "IMAGE";
      const calendarId: string | null = body?.calendar_id ?? null;
      const selfComment = String(body?.self_comment ?? "").trim().slice(0, 2200);

      const mediaUrls: string[] = mediaType === "CAROUSEL"
        ? (Array.isArray(body?.media_urls) ? body.media_urls.map((u: unknown) => String(u).trim()) : [])
        : [];
      const mediaUrl = mediaType === "CAROUSEL" ? mediaUrls.join(",") : String(body?.media_url ?? "").trim();

      if (mediaType === "CAROUSEL") {
        if (mediaUrls.length < 2 || mediaUrls.length > 10) {
          return json({ error: "Carrossel precisa de 2 a 10 imagens" }, 400);
        }
        if (mediaUrls.some((u) => !/^https:\/\/.+/i.test(u))) {
          return json({ error: "Todas as imagens do carrossel precisam de URL pública https" }, 400);
        }
      } else if (!/^https:\/\/.+/i.test(mediaUrl)) {
        return json({ error: "Informe uma URL pública https da imagem ou do vídeo" }, 400);
      }

      const { data: acc } = await admin
        .from("social_instagram_accounts")
        .select("ig_user_id, access_token, username, source")
        .eq("coach_id", coachId)
        .maybeSingle();
      if (!acc) return json({ error: "Conecte sua conta do Instagram antes de publicar" }, 400);
      if (acc.source === "screenshot" || !acc.access_token) {
        return json({ error: "Publicação automática exige conexão com token da Meta (opção avançada)." }, 400);
      }

      try {
        let containerId: string;

        if (mediaType === "CAROUSEL") {
          // 1) um container "filho" por imagem, depois o container "pai" do carrossel
          const childIds: string[] = [];
          for (const url of mediaUrls) {
            const child = await graph(`/${acc.ig_user_id}/media`, {
              access_token: acc.access_token,
              image_url: url,
              is_carousel_item: "true",
            }, "POST");
            childIds.push(child.id);
          }
          const parent = await graph(`/${acc.ig_user_id}/media`, {
            access_token: acc.access_token,
            media_type: "CAROUSEL",
            caption,
            children: childIds.join(","),
          }, "POST");
          containerId = parent.id;
        } else {
          // 1) container
          const isVideo = mediaType === "REELS" || (mediaType === "STORIES" && /\.(mp4|mov)(\?|$)/i.test(mediaUrl));
          const container = await graph(`/${acc.ig_user_id}/media`, {
            access_token: acc.access_token,
            ...(mediaType === "STORIES" ? {} : { caption }),
            ...(mediaType === "REELS" ? { media_type: "REELS", video_url: mediaUrl } : {}),
            ...(mediaType === "STORIES"
              ? { media_type: "STORIES", ...(isVideo ? { video_url: mediaUrl } : { image_url: mediaUrl }) }
              : {}),
            ...(mediaType === "IMAGE" ? { image_url: mediaUrl } : {}),
          }, "POST");

          // 2) wait for processing (videos)
          if (isVideo) {
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
          containerId = container.id;
        }

        // 3) publish
        const published = await graph(`/${acc.ig_user_id}/media_publish`, {
          access_token: acc.access_token,
          creation_id: containerId,
        }, "POST");

        let permalink: string | null = null;
        try {
          const info = await graph(`/${published.id}`, { fields: "permalink", access_token: acc.access_token });
          permalink = info?.permalink ?? null;
        } catch (_) { /* optional */ }

        // Comentário automático (self-comment) — puxa DM/engajamento. Não bloqueia
        // a publicação se falhar: o post já saiu, o comentário é um bônus.
        if (selfComment) {
          try {
            await graph(`/${published.id}/comments`, { access_token: acc.access_token, message: selfComment }, "POST");
          } catch (_) { /* opcional */ }
        }

        await admin.from("social_instagram_posts").insert({
          coach_id: coachId,
          calendar_id: calendarId,
          media_type: mediaType,
          media_url: mediaUrl,
          caption,
          self_comment: selfComment || null,
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
