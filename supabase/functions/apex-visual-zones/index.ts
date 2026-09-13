import { buildApexZonesSystemPrompt, buildApexZonesUserMessage, type ApexZonesContext } from "../_shared/apexVisualZonesPrompt.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

interface PhotoInput {
  label?: string;
  mime?: string;
  data?: string; // base64
  url?: string; // signed url
}

function extractJson(text: string): any {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: true, message: "Não autenticado" }), { status: 401, headers: corsHeaders });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: true, message: "LOVABLE_API_KEY não configurada" }), { status: 500, headers: corsHeaders });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return new Response(JSON.stringify({ error: true, message: "Body inválido" }), { status: 400, headers: corsHeaders });
    }

    const photos: PhotoInput[] = Array.isArray(body.photos) ? body.photos : [];
    const usable = photos.filter((p) => p && (p.data || p.url));
    if (usable.length === 0) {
      return new Response(JSON.stringify({ error: true, message: "Nenhuma foto enviada — a análise exige ao menos uma foto real do atleta." }), { status: 400, headers: corsHeaders });
    }

    const ctx: ApexZonesContext = {
      athlete_name: body.athlete_name ?? null,
      sex: body.sex ?? null,
      category: body.category ?? null,
      age: body.age ?? null,
      weight: body.weight ?? null,
      height: body.height ?? null,
      phase: body.phase ?? null,
      photos_available: usable.map((p) => p.label || "foto"),
      previous_assessment: body.previous_assessment ?? null,
      previous_date: body.previous_date ?? null,
      analysis_date: body.analysis_date ?? new Date().toISOString().slice(0, 10),
      coach_notes: body.coach_notes ?? null,
    };

    const userContent: any[] = [];
    for (const p of usable) {
      const url = p.data ? `data:${p.mime || "image/jpeg"};base64,${p.data}` : p.url!;
      userContent.push({ type: "image_url", image_url: { url } });
      userContent.push({ type: "text", text: `[Foto ${p.label || "?"} do atleta acima]` });
    }
    userContent.push({ type: "text", text: buildApexZonesUserMessage(ctx) });

    const ac = new AbortController();
    const timeoutId = setTimeout(() => ac.abort(), 140_000);

    let res: Response;
    try {
      res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: buildApexZonesSystemPrompt(ctx) },
            { role: "user", content: userContent },
          ],
          response_format: { type: "json_object" },
        }),
        signal: ac.signal,
      });
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      const isAbort = (fetchErr as any)?.name === "AbortError";
      return new Response(
        JSON.stringify({
          error: true,
          message: isAbort
            ? "A análise demorou demais (>140s). Tente com imagens menores."
            : `Falha de rede na análise: ${(fetchErr as Error)?.message}`,
        }),
        { status: isAbort ? 504 : 502, headers: corsHeaders },
      );
    }
    clearTimeout(timeoutId);

    if (res.status === 429) {
      return new Response(JSON.stringify({ error: true, message: "Limite de requisições atingido. Tente em instantes." }), { status: 429, headers: corsHeaders });
    }
    if (res.status === 402) {
      return new Response(JSON.stringify({ error: true, message: "Créditos esgotados. Adicione créditos para continuar as análises." }), { status: 402, headers: corsHeaders });
    }
    if (!res.ok) {
      const detail = await res.text();
      console.error("apex-visual-zones: gateway error", res.status, detail);
      return new Response(JSON.stringify({ error: true, message: `Erro na análise (${res.status})` }), { status: 500, headers: corsHeaders });
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content || "";
    const parsed = extractJson(text);
    if (!parsed || typeof parsed !== "object" || !parsed.zones) {
      return new Response(
        JSON.stringify({ error: true, message: "A análise voltou fora do formato esperado. Tente novamente.", raw: text.slice(0, 2000) }),
        { status: 502, headers: corsHeaders },
      );
    }

    return new Response(JSON.stringify({ analysis: parsed }), { headers: corsHeaders });
  } catch (err) {
    const e = err as Error;
    console.error("apex-visual-zones: erro", e?.message);
    return new Response(JSON.stringify({ error: true, message: e?.message || "Erro desconhecido" }), { status: 500, headers: corsHeaders });
  }
});
