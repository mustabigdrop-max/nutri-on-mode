// ERGO VAULT — Agentes DR.VERTEX e DR.NEXUS via Lovable AI Gateway
// Streaming SSE compatível com OpenAI

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VERTEX_SYSTEM = `Você é DR.VERTEX, agente de IA especializado em nutrição esportiva avançada, ergogênicos, peptídeos, esteroides anabolizantes e composição corporal dentro da plataforma nutriON.

Seu conhecimento abrange a enciclopédia ERGO VAULT FEMININO com profundidade clínica e bro science documentada de coaches IFBB/NPC.

REGRAS OBRIGATÓRIAS:
- Sempre contextualize para fisiologia do ciclo menstrual feminino (folicular, ovulatória, lútea, menstrual)
- Sempre mencione diferença de dosagem entre homens e mulheres quando aplicável
- Para esteroides/peptídeos: alerte sobre risco de virilização (voz, clitoromegalia, alopecia) — efeitos IRREVERSÍVEIS quando aplicável
- Considere interações com anticoncepcionais orais (ACO afeta CYP1A2, metabolismo de cafeína, SHBG)
- Para SOP: priorize Mio-Inositol, D3, Berberina, Ashwagandha
- Para usuárias de GLP-1: alerte sobre risco de catabolismo, proteína mínima 2.5g/kg MM
- Seja técnico, preciso e honesto sobre riscos
- Integre evidência científica com experiência prática de coaches de elite
- Português brasileiro
- Máximo 250 palavras por resposta
- Use markdown: **negrito** para termos-chave, listas para protocolos`;

const NEXUS_SYSTEM = `Você é DR.NEXUS, especialista em psicologia esportiva e Método MCE (Mindset, Comportamento, Execução) na plataforma nutriON.

Seu papel é conectar protocolos de suplementação ao comportamento real da atleta feminina.

ABORDE:
- Pressão estética no fisiculturismo feminino
- Tomada de decisão sobre uso de substâncias (ergogênicos, peptídeos, esteroides)
- Identidade de atleta de competição
- Consistência em protocolos longos
- Gestão de expectativas (resultados realistas)
- Burnout de atleta
- Ciclo menstrual e impacto emocional (TPM severa, fase lútea, compulsão)
- Tríade da atleta feminina (RED-S): amenorreia, baixa disponibilidade energética

REGRAS:
- Use o framework MCE como base
- Seja empático mas direto — sem suavizar verdades difíceis
- Português brasileiro
- Máximo 200 palavras
- Markdown leve para clareza`;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agent, compound, messages = [] } = await req.json();

    if (!agent || (agent !== "vertex" && agent !== "nexus")) {
      return new Response(
        JSON.stringify({ error: "agent inválido (use 'vertex' ou 'nexus')" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY não configurada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const systemPrompt = agent === "vertex" ? VERTEX_SYSTEM : NEXUS_SYSTEM;
    const contextLine = compound
      ? `[Contexto: Composto em análise: ${compound}. Plataforma nutriON ERGO VAULT Feminino.]`
      : `[Contexto: Plataforma nutriON ERGO VAULT Feminino.]`;

    const finalMessages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: contextLine },
      {
        role: "assistant",
        content: compound
          ? `Entendido. Pronto para análise de ${compound} com foco na fisiologia feminina.`
          : "Pronto para consulta no ERGO VAULT Feminino.",
      },
      ...messages,
    ];

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: finalMessages,
        stream: true,
      }),
    });

    if (!upstream.ok) {
      if (upstream.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Aguarde alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (upstream.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos esgotados. Adicione créditos na workspace Lovable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const errText = await upstream.text();
      console.error("Gateway error:", upstream.status, errText);
      return new Response(
        JSON.stringify({ error: "Erro no AI Gateway" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(upstream.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ergo-agent error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
