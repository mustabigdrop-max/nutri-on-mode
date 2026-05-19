// APEX Visual — Análise de teste clínico por foto (Gemini Vision via Lovable AI Gateway)
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

interface AthleteData {
  height?: number;
  weight?: number;
  sex?: "M" | "F";
  age?: number;
}

interface Payload {
  testId: string;
  testName?: string;
  testGroup?: string;
  aiPrompt: string;
  imageBase64: string; // data URL or raw base64
  athleteData?: AthleteData;
}

function stripDataUrl(b64: string): { data: string; mime: string } {
  const m = b64.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
  if (m) return { mime: m[1], data: m[2] };
  return { mime: "image/jpeg", data: b64 };
}

function extractJson(text: string): any {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  try { return JSON.parse(cleaned); } catch {}
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first >= 0 && last > first) {
    try { return JSON.parse(cleaned.slice(first, last + 1)); } catch {}
  }
  return { raw: text, parse_error: true };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY missing" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Payload;
    if (!body?.aiPrompt || !body?.imageBase64) {
      return new Response(JSON.stringify({ error: "aiPrompt e imageBase64 são obrigatórios" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: imgB64, mime } = stripDataUrl(body.imageBase64);
    const athlete = body.athleteData ?? {};

    const systemMsg = `Você é o APEX Visual Intelligence, sistema clínico de análise postural de última geração.
Dados do atleta:
- Altura: ${athlete.height ?? "?"}cm
- Peso: ${athlete.weight ?? "?"}kg
- Sexo: ${athlete.sex ?? "?"}
- Idade: ${athlete.age ?? "?"} anos
Use a altura como referência de escala para medições em cm.
IMPORTANTE: retorne APENAS o JSON especificado, sem texto antes ou depois.
Coordenadas x/y em porcentagem (0-100) da imagem. Nunca retorne null — sempre estimar.`;

    const userParts = [
      { type: "text", text: body.aiPrompt },
      { type: "image_url", image_url: { url: `data:${mime};base64,${imgB64}` } },
    ];

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemMsg },
          { role: "user", content: userParts },
        ],
        temperature: 0,
      }),
    });

    if (resp.status === 429) {
      return new Response(JSON.stringify({ error: "rate_limit", message: "Muitas requisições. Tente novamente em instantes." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (resp.status === 402) {
      return new Response(JSON.stringify({ error: "credits_exhausted", message: "Créditos de IA esgotados." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!resp.ok) {
      const t = await resp.text();
      return new Response(JSON.stringify({ error: "gateway_error", detail: t }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const text: string = data?.choices?.[0]?.message?.content ?? "";
    const parsed = extractJson(text);

    return new Response(JSON.stringify({
      ok: true,
      testId: body.testId,
      testName: body.testName ?? body.testId,
      testGroup: body.testGroup ?? null,
      result: parsed,
      rawText: text,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: "exception", message: String(err?.message ?? err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
