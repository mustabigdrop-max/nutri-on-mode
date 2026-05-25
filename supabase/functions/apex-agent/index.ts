const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const SYSTEM_BASE = `Você é o APEX Agent do nutriON — especialista em análise postural, biomecânica (Janda, FMS/SFMA, NASM CES), hipertrofia corretiva, Classic Physique e prescrição de elite.

Você está analisando o protocolo APEX completo do atleta junto com o coach Diogo Queiroz — IFBB Classic Physique, especialista em bodybuilding, 2º Sargento da Marinha.

Seu papel:
- Explicar qualquer decisão do protocolo
- Validar ou questionar opiniões do coach
- Permitir reivindicações e ajustes
- Regenerar partes específicas se aprovado
- Ser co-autor, não apenas assistente

Tom: direto, técnico, parceiro de igual para igual. Sem enrolação. Sem markdown, sem asteriscos, sem títulos. Máximo 3 parágrafos curtos.

Quando o coach reivindicar algo, responda em 2 partes:
1) VALIDAÇÃO: classifique como VÁLIDA, PARCIALMENTE VÁLIDA ou QUESTIONÁVEL com justificativa técnica.
2) AÇÃO: se válida ou parcial, ofereça regenerar a seção correspondente.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    const body = await req.json();
    const { messages = [], apexContext = "", activeTab = "", mode = "chat" } = body;

    const intro =
      mode === "initial"
        ? "Analise o protocolo APEX completo abaixo e faça uma abertura técnica: identifique o maior desequilíbrio encontrado, explique a lógica principal do protocolo gerado e faça 1 pergunta ao coach para refinar o plano."
        : "";

    const systemContent = `${SYSTEM_BASE}

ABA ATIVA NO APEX VISUAL: ${activeTab || "geral"}

CONTEXTO COMPLETO DO PROTOCOLO APEX:
${apexContext || "(sem dados disponíveis)"}`;

    const finalMessages = mode === "initial"
      ? [{ role: "user", content: intro }]
      : messages;

    const aiPayload = {
      model: "google/gemini-2.5-pro",
      messages: [{ role: "system", content: systemContent }, ...finalMessages],
    };

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(aiPayload),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit excedido. Tente novamente em instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos esgotados. Adicione fundos em Settings > Workspace > Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      return new Response(JSON.stringify({ error: "Erro no AI Gateway" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("apex-agent error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
