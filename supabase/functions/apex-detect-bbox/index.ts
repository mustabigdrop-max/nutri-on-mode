// APEX Visual — detecção rápida de bounding box do atleta (Gemini 2.5 Flash, max_tokens 200)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64 } = (await req.json()) as { imageBase64?: string };
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "imageBase64 é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY ausente" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageUrl = imageBase64.startsWith("data:")
      ? imageBase64
      : `data:image/jpeg;base64,${imageBase64}`;

    const prompt = `Nesta imagem, identifique o bounding box da pessoa principal e retorne APENAS JSON:
{"x_min": number, "y_min": number, "x_max": number, "y_max": number}
Os valores são porcentagem (0-100) da largura/altura da imagem. x_min/y_min = canto superior-esquerdo, x_max/y_max = canto inferior-direito. Sem markdown, sem texto extra.`;

    const aiResp = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        max_tokens: 200,
        temperature: 0,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
      }),
    });

    if (!aiResp.ok) {
      const detail = await aiResp.text();
      const status = aiResp.status === 429 || aiResp.status === 402 ? aiResp.status : 502;
      return new Response(JSON.stringify({ error: "bbox_failed", detail: detail.slice(0, 300) }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiResp.json();
    const raw: string = aiJson?.choices?.[0]?.message?.content || "";
    let bbox: any = null;
    try {
      bbox = JSON.parse(raw);
    } catch {
      const first = raw.indexOf("{");
      const last = raw.lastIndexOf("}");
      if (first >= 0 && last > first) {
        try { bbox = JSON.parse(raw.slice(first, last + 1)); } catch { /* noop */ }
      }
    }

    if (
      !bbox ||
      typeof bbox.x_min !== "number" ||
      typeof bbox.y_min !== "number" ||
      typeof bbox.x_max !== "number" ||
      typeof bbox.y_max !== "number"
    ) {
      return new Response(JSON.stringify({ bbox: null, raw }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ bbox }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "exception", detail: String((e as any)?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
