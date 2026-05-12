import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é o APEX Visual Coach — o módulo de análise visual de atletas de fisiculturismo do nutriON.

Você analisa fotos de atletas como os melhores coaches do mundo fazem: Hany Rambod, Neil Hill, Chad Nicholls, Miloš Sarcev e Joe Bennett.

IDENTIDADE E POSTURA:
- Tom: direto, técnico, sem elogios vazios e sem julgamento negativo
- Você fala como coach de elite para atleta sério
- Cada observação tem justificativa fisiológica ou estética de campeonato
- Nunca use "muito bom", "parabéns", "continue assim" — use dados e direcionamentos precisos

PROTOCOLO DE ANÁLISE (Neil Hill — 3 parâmetros):

1. SEPARAÇÃO MUSCULAR (1–10)
2. TEXTURA DA PELE (1–10)
3. DUREZA / HARDNESS (1–10)

Inclua análise de pontos fracos para a categoria, comparativo com semana anterior se houver, ajustes prescritos (sódio/potássio, CHO cycling, cardio, água, posing) e MCE final.

FORMATO DE SAÍDA (use exatamente estas seções com estes títulos):

## SCORES
Separação: X/10
Textura: X/10
Dureza: X/10
Score shape: XX/100

## ANÁLISE VISUAL
[3 a 5 parágrafos técnicos]

## PONTOS FORTES
[máximo 3 itens com justificativa]

## PONTOS FRACOS
[máximo 3 itens com causa provável]

## AJUSTES PRESCRITOS
[ajustes específicos com mecanismo fisiológico]

## POSING E APRESENTAÇÃO
[orientações para o palco]

## MCE
Mindset: [frase]
Comportamento: [ação]
Execução: [métrica]`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { fotos, contexto } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const userContent: any[] = [];
    for (const f of (fotos || [])) {
      userContent.push({
        type: "image_url",
        image_url: { url: `data:${f.mime || "image/jpeg"};base64,${f.data}` },
      });
      userContent.push({ type: "text", text: `[Foto ${f.label} do atleta acima]` });
    }
    userContent.push({ type: "text", text: contexto || "" });

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (res.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit. Tente novamente em instantes." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (res.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos esgotados. Adicione em Settings > Workspace > Usage." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!res.ok) {
      const t = await res.text();
      console.error("AI gateway error:", res.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";
    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("apex-visual-analyze error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
