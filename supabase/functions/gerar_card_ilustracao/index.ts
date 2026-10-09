// Estúdio de Cards — ilustração gerada (modo 2). Bloqueios e limite diário no servidor; a imagem é só fundo, sem texto.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";

const MODEL = "openai/gpt-image-2.5-sunburst";
const GATEWAY = "https://ai.gateway.lovable.dev/v1/images/generations";
const CUSTO_ESTIMADO = 0.02;
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const BLOCKED: [RegExp, string][] = [
  [/\b(pessoa|homem|mulher|atleta|modelo|rosto|retrato|selfie|garot[oa]|crian[cç]a|humano|face|olhos|people|person)\b/i, "pessoa ou rosto"],
  [/\b(f[ií]sico|corpo|abd[oô]men|tanquinho|shape|silhueta|barriga|m[uú]sculo|body)\b/i, "corpo ou físico como resultado"],
  [/antes\s*(e|x|\/)\s*depois|before\s*(and|\/)\s*after/i, "antes e depois"],
  [/\b(logo|logotipo|marca de|nike|adidas|coca|mcdonald|disney|marvel|pok[eé]mon|personagem|celebridade|famos[oa])\b/i, "marca, logo ou personagem de terceiros"],
  [/\b(embalagem|r[oó]tulo|pote|frasco|whey|c[aá]psula)\b/i, "embalagem com alegação"],
  [/\b(raio-?x|tomografia|resson[aâ]ncia|cirurgia|ferida|[oó]rg[aã]o real|tumor|sangue)\b/i, "imagem médica realista"],
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const userClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } });
    const { data: u } = await userClient.auth.getUser();
    if (!u?.user) return json({ error: "Faça login novamente." }, 401);
    const uid = u.user.id;
    const db = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const body = await req.json().catch(() => ({}));
    const { action = "generate", card_id, descricao } = body ?? {};

    const { data: bk } = await db.from("brand_kit").select("limite_diario_gerada").eq("user_id", uid).maybeSingle();
    const limite = bk?.limite_diario_gerada ?? 5;
    const since = new Date(); since.setUTCHours(3, 0, 0, 0); if (since > new Date()) since.setUTCDate(since.getUTCDate() - 1);
    const { count } = await db.from("studio_cards").select("id", { count: "exact", head: true }).eq("user_id", uid).eq("ilustracao_origem", "gerada").gte("created_at", since.toISOString());
    const usadas = count ?? 0;
    const disponivel = !!Deno.env.get("LOVABLE_API_KEY");
    if (action === "quota") return json({ disponivel, limite, usadas, restantes: Math.max(0, limite - usadas), custo_estimado: CUSTO_ESTIMADO });

    if (!disponivel) return json({ error: "Indisponível neste projeto." }, 503);
    if (typeof card_id !== "string" || card_id.length > 64) return json({ error: "Card inválido." }, 400);
    if (typeof descricao !== "string" || descricao.trim().length < 3 || descricao.length > 300) return json({ error: "Descreva a ilustração (3 a 300 caracteres)." }, 400);
    for (const [re, why] of BLOCKED) if (re.test(descricao)) return json({ error: `Não gero ilustração com ${why}. Use uma cena conceitual em código.`, bloqueio: why }, 422);
    if (usadas >= limite) return json({ error: `Limite diário de ${limite} ilustrações atingido.` }, 429);

    const { data: card } = await db.from("studio_cards").select("id").eq("id", card_id).eq("user_id", uid).maybeSingle();
    if (!card) return json({ error: "Card não encontrado." }, 404);

    const prompt = `Abstract conceptual vector illustration representing: ${descricao.trim()}. Flat geometric shapes, dark near-black background, cyan and gold accents, ` +
      "lots of empty space for overlay text. Absolutely no people, no faces, no bodies, no text, no letters, no numbers, no logos, no products, no packaging, no medical imagery.";
    const r = await fetch(GATEWAY, { method: "POST", headers: { Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, prompt, size: "1024x1536", quality: "low" }) });
    if (!r.ok) { const t = await r.text(); let msg = "Falha ao gerar a ilustração."; try { msg = JSON.parse(t)?.error?.message ?? msg; } catch { /* keep */ }
      return json({ error: msg }, r.status === 402 || r.status === 429 ? r.status : 502); }
    const out = await r.json(); const b64 = out?.data?.[0]?.b64_json;
    if (!b64) return json({ error: "A geração não retornou imagem." }, 502);
    const path = `${uid}/ilustracao/card_${card_id}_${Date.now()}.png`;
    const up = await db.storage.from("cuts").upload(path, Uint8Array.from(atob(b64), c => c.charCodeAt(0)), { contentType: "image/png", upsert: true });
    if (up.error) return json({ error: "Falha ao salvar a imagem." }, 500);
    await db.from("studio_cards").update({ imagem_path: path, ilustracao_origem: "gerada", tipo: "C" }).eq("id", card_id).eq("user_id", uid);
    return json({ path });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Erro inesperado." }, 500);
  }
});
