import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { requireUser } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BRAND = `MARCA: nutriON (nutrion.app.br) — plataforma de coaching nutricional.
COACH: @diogo.mell0 — Coach Nutricional, IFBB Classic Physique, criador do Método MCE (Mindset, Comportamento, Execução).
TAGLINE: "Sua fome nunca foi de comida. O comportamento vem antes do alimento."
PALETA: #020205 / #00D4FF / #00FF88. Tipografia Rajdhani.
PILARES: mce_drop (educativo 30%), bastidor (pessoal 25%), transformacao (prova social 20%), entretenimento (15%), cta (venda suave 10%).
TOM: direto, científico sem ser acadêmico, português do Brasil, frases curtas, zero clichê motivacional vazio. Nunca se apresente como IA.`;

type Mode = "caption" | "reel" | "calendar" | "hashtags" | "stories" | "audit";

const SCHEMAS: Record<Mode, string> = {
  caption: `{"hook":"primeira linha que para o scroll","caption":"legenda completa com quebras de linha \\n","cta":"chamada final","hashtags":["#tag", "... 15 a 20 itens"]}`,
  reel: `{"hook":"0-2s","tensao":"5-15s","desenvolvimento":"15-35s","cta":"últimos 5s","texto_na_tela":["4 a 6 frases curtas"],"audio_sugerido":"string","duracao":"30-60s"}`,
  calendar: `{"week":[{"weekday":"SEG","pillar":"mce_drop","format":"carrossel","topic":"tema","hook":"hook","note":"observação curta de produção"}, "... 7 dias SEG a DOM respeitando a distribuição dos pilares"]}`,
  hashtags: `{"grandes":["5 hashtags de alto volume"],"medias":["10 hashtags de volume médio"],"nichadas":["5 hashtags de nicho"]}`,
  stories: `{"manha":["4 stories"],"tarde":["4 stories"],"noite":["3 stories"],"enquete":"pergunta de enquete do dia"}`,
  audit: `{"bio_score":0,"bio_issues":["..."],"bio_suggestion":"bio completa em até 150 caracteres com emojis e quebras de linha","content_mix":{"educativo":0,"pessoal":0,"prova_social":0,"entretenimento":0,"venda":0},"content_mix_ideal":{"educativo":35,"pessoal":25,"prova_social":20,"entretenimento":15,"venda":12},"frequency_current":0,"frequency_ideal":5,"issues":["..."],"quick_wins":["3 ações imediatas"],"content_pillars_suggested":["4 a 5 pilares"],"series_suggestions":["séries recorrentes"]}`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = await requireUser(req);
    if (!auth.ok) {
      return new Response(JSON.stringify({ error: auth.error }), {
        status: auth.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const mode: Mode = body?.mode;
    if (!mode || !SCHEMAS[mode]) {
      return new Response(JSON.stringify({ error: "mode inválido" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY não configurada");

    const ctx = [
      body?.pillar ? `Pilar: ${body.pillar}` : "",
      body?.format ? `Formato: ${body.format}` : "",
      body?.topic ? `Tema: ${body.topic}` : "",
      body?.style ? `Estilo: ${body.style}` : "",
      body?.duration ? `Duração: ${body.duration}` : "",
      body?.handle ? `Handle: @${String(body.handle).replace("@", "")}` : "",
      body?.bio ? `Bio atual: ${body.bio}` : "",
      body?.notes ? `Contexto extra: ${body.notes}` : "",
      body?.weekStart ? `Semana começando em: ${body.weekStart}` : "",
    ].filter(Boolean).join("\n");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `${BRAND}\n\nVocê é o motor SOCIAL ON. Responda SEMPRE apenas JSON válido no schema pedido, sem markdown.` },
          { role: "user", content: `${ctx}\n\nGere no schema:\n${SCHEMAS[mode]}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (res.status === 429) {
      return new Response(JSON.stringify({ error: "Limite de uso atingido. Tente novamente em instantes." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (res.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos esgotados no workspace." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!res.ok) throw new Error(`Gateway ${res.status}: ${await res.text()}`);

    const json = await res.json();
    const raw = json?.choices?.[0]?.message?.content ?? "{}";
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    }

    return new Response(JSON.stringify({ mode, result: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro inesperado" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
