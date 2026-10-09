import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { blockReason, buildPrompt, sha256 } from "./rules.ts";

const MODEL = "openai/gpt-image-2.5-sunburst";
const GATEWAY = "https://ai.gateway.lovable.dev/v1/images/generations";
const MAX_REGEN = 2;
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const auth = req.headers.get("Authorization") ?? "";
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: u } = await userClient.auth.getUser();
    if (!u?.user) return json({ error: "Faça login novamente." }, 401);
    const uid = u.user.id;
    const db = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const body = await req.json().catch(() => ({}));
    const { action = "generate", script_id, bloco, tempo, descricao, texto_tela, cut_id } = body ?? {};
    if (typeof script_id !== "string" || script_id.length > 64) return json({ error: "Reel inválido." }, 400);

    const { data: chosen } = await db.from("reel_bank").select("id").eq("user_id", uid).eq("script_id", script_id)
      .in("status", ["escolhido", "gravado", "postado"]).limit(1);
    if (!chosen?.length) return json({ error: "Cortes só para reels marcados em \"Escolher pra hoje\"." }, 403);

    const { data: st } = await db.from("cut_settings").select("limite_diario_ilustracao").eq("user_id", uid).maybeSingle();
    const limite = st?.limite_diario_ilustracao ?? 30;
    const since = new Date(); since.setUTCHours(3, 0, 0, 0); if (since > new Date()) since.setUTCDate(since.getUTCDate() - 1); // 00:00 Brasília
    const { count } = await db.from("cut_assets").select("id", { count: "exact", head: true }).eq("user_id", uid).eq("tipo", "ilustracao")
      .neq("modelo", "cache").gte("created_at", since.toISOString());
    const usadas = count ?? 0;
    if (action === "quota") return json({ limite, usadas, restantes: Math.max(0, limite - usadas) });

    if (typeof descricao !== "string" || descricao.trim().length < 3 || descricao.length > 400) return json({ error: "Descreva a ilustração (3 a 400 caracteres)." }, 400);
    if (typeof bloco !== "string" || bloco.length > 20) return json({ error: "Bloco inválido." }, 400);
    const why = blockReason(descricao);
    if (why) return json({ error: `Bloqueado: ${why}.`, bloqueio: why }, 422);

    let existing: any = null;
    if (cut_id) {
      const { data } = await db.from("cut_assets").select("*").eq("id", cut_id).eq("user_id", uid).maybeSingle();
      if (!data) return json({ error: "Corte não encontrado." }, 404);
      if (data.regeneracoes >= MAX_REGEN) return json({ error: "Limite de 2 regerações atingido." }, 429);
      existing = data;
    }

    const prompt = buildPrompt(descricao) + (existing ? ` Variation ${existing.regeneracoes + 1}.` : "");
    const hash = await sha256(prompt);
    const { data: cached } = await db.from("cut_image_cache").select("path").eq("user_id", uid).eq("prompt_hash", hash).maybeSingle();
    let path = cached?.path as string | undefined;
    let modelo = "cache", custo: number | null = 0;

    if (!path) {
      if (usadas >= limite) return json({ error: `Limite diário de ${limite} ilustrações atingido.` }, 429);
      const key = Deno.env.get("LOVABLE_API_KEY");
      if (!key) return json({ error: "Configuração ausente." }, 500);
      const r = await fetch(GATEWAY, { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: MODEL, prompt, size: "1024x1536", quality: "low" }) });
      if (!r.ok) {
        const t = await r.text(); let msg = "Falha ao gerar a imagem.";
        try { msg = JSON.parse(t)?.error?.message ?? JSON.parse(t)?.message ?? msg; } catch { /* keep */ }
        return json({ error: msg }, r.status === 402 || r.status === 403 || r.status === 429 ? r.status : 502);
      }
      const out = await r.json();
      const b64 = out?.data?.[0]?.b64_json;
      if (!b64) return json({ error: "A geração não retornou imagem." }, 502);
      const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
      path = `${uid}/ilustracao/${hash}.png`;
      const up = await db.storage.from("cuts").upload(path, bytes, { contentType: "image/png", upsert: true });
      if (up.error) return json({ error: "Falha ao salvar a imagem." }, 500);
      await db.from("cut_image_cache").upsert({ user_id: uid, prompt_hash: hash, path, modelo: MODEL });
      modelo = MODEL; custo = typeof out?.usage?.total_cost === "number" ? out.usage.total_cost : (typeof out?.usage?.cost === "number" ? out.usage.cost : null);
    }

    const row = { user_id: uid, script_id, bloco, tempo: typeof tempo === "string" ? tempo.slice(0, 20) : null, tipo: "ilustracao",
      descricao: descricao.slice(0, 400), texto_tela: typeof texto_tela === "string" ? texto_tela.slice(0, 200) : null,
      url: path, modelo, custo, prompt_hash: hash, status: "novo" };
    const q = existing
      ? db.from("cut_assets").update({ ...row, regeneracoes: existing.regeneracoes + 1 }).eq("id", existing.id).select("*").single()
      : db.from("cut_assets").insert(row).select("*").single();
    const { data: saved, error } = await q;
    if (error) return json({ error: "Falha ao registrar o corte." }, 500);
    return json({ cut: saved, cache: modelo === "cache" });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Erro inesperado." }, 500);
  }
});
