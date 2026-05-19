// APEX Visual — Análise por step (foto guiada) via Lovable AI Gateway (Gemini 2.5 Pro vision)
// Resposta JSON estruturada: measurements, findings_text, overlay, muscle_updates, red_flags
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

interface StepRequest {
  stepId: string;
  imageBase64: string; // data URL ou base64 puro
  athleteData?: {
    height?: number;
    weight?: number;
    sex?: "M" | "F";
    age?: number;
    sport?: string;
  };
  previousFindings?: unknown[];
  instruction?: string; // texto do que é a posição
  aiPrompt?: string;    // prompt específico do step
}

const SYSTEM_PROMPT = `Você é APEX Visual Intelligence — sistema de avaliação postural por análise visual.
Sua função é analisar uma foto postural específica do atleta e devolver achados ESTRUTURADOS em JSON estrito.

PRIMEIRA TAREFA — VERIFICAR ENQUADRAMENTO:
Analise se o atleta ocupa pelo menos 60% da altura da imagem.
- Se o atleta ocupa MENOS de 60% da altura: retorne framing_check.enquadramento_adequado=false com percentual_estimado e aviso pedindo refazer a foto.
- Se ocupa 60% ou mais: framing_check.enquadramento_adequado=true e prossiga com a análise normal.
Quando enquadramento_adequado=false, ainda assim posicione os landmarks com a máxima precisão possível usando referências anatômicas relativas — priorize landmarks claramente visíveis e estime os demais por proporção anatômica padrão.

REGRAS DE POSICIONAMENTO DE LANDMARKS:
1. Todos os landmarks devem estar SOBRE O CORPO do atleta, nunca fora dos contornos corporais visíveis.
2. Se um landmark não estiver claramente visível, estimá-lo por proporção anatômica usando os landmarks vizinhos como referência. NUNCA posicionar fora do corpo.
3. Para foto posterior (costas):
   - Trago não é visível — estimar pela posição lateral da cabeça.
   - EIAS não é visível — estimar pelo contorno lateral do quadril.
   - Use a largura dos ombros como referência de escala principal.
4. Coordenadas x/y em porcentagem (0-100%) da largura/altura da imagem. O centro é 50/50.
5. Prioridade de precisão:
   - Alta: acrômios, EIAS, joelhos, tornozelos (pontos ósseos claramente visíveis)
   - Média: C7, escápulas, trocânteres
   - Estimada: trago, suboccipital, landmarks faciais

REGRAS GERAIS:
1. Responda SOMENTE com JSON válido, sem markdown, sem texto adicional.
2. Use sistema métrico (graus °, centímetros cm).
3. Estime medições com base em referências corporais quando não houver régua.
4. Classifique cada achado: normal | mild | moderate | severe.
5. landmarks.x e landmarks.y devem ser % (0-100) da imagem.
6. Seja conservador: se a foto não permite medir, marque measurement com value=0 e classification="normal" e mencione no findings_text.
7. NÃO prescreva medicamentos. Apenas achados visuais e musculares.

ESQUEMA DE RESPOSTA OBRIGATÓRIO:
{
  "stepId": "string",
  "framing_check": {
    "enquadramento_adequado": boolean,
    "percentual_estimado": number,
    "aviso": "string?"
  },
  "measurements": [
    {
      "label": "string",
      "value": number,
      "unit": "°" | "cm" | "",
      "normal_range": "string",
      "classification": "normal" | "mild" | "moderate" | "severe",
      "muscle": "string",
      "status": "shortened" | "inhibited" | "normal"
    }
  ],
  "findings_text": "string curta com os principais achados",
  "overlay": {
    "landmarks": [{ "id": "string", "x": number, "y": number }],
    "lines": [{ "from": "string", "to": "string", "color": "string", "label": "string?" }],
    "angles": [{ "value": number, "x": number, "y": number, "label": "string" }]
  },
  "muscle_updates": [
    { "muscle": "string", "side": "L" | "R" | "C", "status": "shortened" | "inhibited" | "normal", "severity": "normal" | "mild" | "moderate" | "severe" }
  ],
  "red_flags": ["string"]
}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as StepRequest;
    if (!body?.stepId || !body?.imageBase64) {
      return new Response(JSON.stringify({ error: "stepId e imageBase64 são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY não configurado" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Normaliza data URL
    const imageUrl = body.imageBase64.startsWith("data:")
      ? body.imageBase64
      : `data:image/jpeg;base64,${body.imageBase64}`;

    const athleteCtx = body.athleteData
      ? `Atleta: ${body.athleteData.sex || "?"}, ${body.athleteData.age || "?"} anos, ${body.athleteData.height || "?"}cm, ${body.athleteData.weight || "?"}kg, esporte: ${body.athleteData.sport || "?"}.`
      : "";

    const userText = `STEP: ${body.stepId}
${body.instruction ? `POSIÇÃO: ${body.instruction}` : ""}
${athleteCtx}

INSTRUÇÃO DE ANÁLISE:
${body.aiPrompt || "Analise a foto postural e devolva achados estruturados conforme o esquema."}

Retorne JSON estrito (sem markdown).`;

    const aiResp = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [
              { type: "text", text: userText },
              { type: "image_url", image_url: { url: imageUrl } },
            ],
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!aiResp.ok) {
      const errTxt = await aiResp.text();
      const status = aiResp.status === 429 || aiResp.status === 402 ? aiResp.status : 502;
      return new Response(
        JSON.stringify({
          error:
            aiResp.status === 429
              ? "Limite de requisições atingido. Tente novamente em alguns segundos."
              : aiResp.status === 402
              ? "Créditos de IA esgotados. Adicione créditos no workspace."
              : "Falha na análise da IA",
          detail: errTxt.slice(0, 500),
        }),
        { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const aiJson = await aiResp.json();
    const raw = aiJson?.choices?.[0]?.message?.content || "";

    // Extrai bloco JSON (tolerante a fences ```json)
    let parsed: any = null;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const m = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (m) {
        try {
          parsed = JSON.parse(m[1]);
        } catch {/* noop */}
      }
      if (!parsed) {
        const first = raw.indexOf("{");
        const last = raw.lastIndexOf("}");
        if (first >= 0 && last > first) {
          try {
            parsed = JSON.parse(raw.slice(first, last + 1));
          } catch {/* noop */}
        }
      }
    }

    if (!parsed) {
      return new Response(
        JSON.stringify({
          stepId: body.stepId,
          measurements: [],
          findings_text: raw?.slice(0, 400) || "Não foi possível interpretar a resposta da IA.",
          overlay: { landmarks: [], lines: [], angles: [] },
          muscle_updates: [],
          red_flags: [],
          _warning: "raw_response_unparsed",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    parsed.stepId = body.stepId;
    parsed.measurements = parsed.measurements || [];
    parsed.overlay = parsed.overlay || { landmarks: [], lines: [], angles: [] };
    parsed.muscle_updates = parsed.muscle_updates || [];
    parsed.red_flags = parsed.red_flags || [];

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "Erro interno", detail: String(e?.message || e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
