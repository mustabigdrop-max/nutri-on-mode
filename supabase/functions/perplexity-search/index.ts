import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query, category, userProfile } = await req.json();
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    
    // Fallback to Lovable AI if no Perplexity key
    if (!PERPLEXITY_API_KEY) {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) throw new Error("No API key configured");

      const systemPrompts: Record<string, string> = {
        nutrition: "Você é um especialista em nutrição e ciência dos alimentos. Responda com base em evidências científicas, citando estudos quando possível. Foque em: composição nutricional, efeitos metabólicos, recomendações baseadas em evidências. Responda em português BR.",
        nootropics: "Você é um especialista em nootrópicos e neurociência nutricional. Foque em: mecanismos de ação, dosagens baseadas em evidências, interações e segurança. Responda em português BR.",
        recipes: "Você é um especialista em nutrição e gastronomia saudável. Responda com receitas detalhadas incluindo informações nutricionais. Responda em português BR.",
        health: "Você é um especialista em saúde e medicina baseada em evidências. Foque em: condições de saúde, suplementos, protocolos baseados em evidências. Responda em português BR.",
        protocol: "Você é um especialista em protocolos nutricionais esportivos. Busque os protocolos mais recentes e eficazes baseados em evidências. Responda em português BR.",
        general: "Você é um assistente de pesquisa científica focado em nutrição, saúde e performance. Responda com base em evidências, citando fontes. Responda em português BR.",
      };

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompts[category] || systemPrompts.general },
            { role: "user", content: query },
          ],
        }),
      });

      if (!response.ok) throw new Error(`AI API error [${response.status}]`);
      const data = await response.json();
      const answer = data.choices?.[0]?.message?.content || "Sem resultado.";
      return new Response(JSON.stringify({ answer, citations: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // === PERPLEXITY API (primary) ===
    let userMessage = query;

    // If category is "protocol" and we have user profile, use the sport protocol prompt
    if (category === "protocol" && userProfile) {
      userMessage = `Busque os protocolos nutricionais mais recentes e eficazes para:
- Esporte/modalidade: ${userProfile.esporte || "geral"}
- Objetivo: ${userProfile.fase || "saúde"} (${userProfile.meta || "melhorar performance"})
- Perfil: atleta de ${userProfile.peso || 70}kg, treina ${userProfile.dias_treino || 3}x/semana

# INSTRUÇÃO OBRIGATÓRIA:
Inclua especificamente:
1. Distribuição de macros validada cientificamente para este objetivo
2. Timing de refeições pré e pós-treino com janelas de tempo
3. Protocolos usados por atletas de elite desta modalidade
4. Estudos recentes (2023-2025) de PubMed, ISSN, NSCA relevantes
5. Tendências ou protocolos inovadores dos últimos 12 meses
6. Suplementação com evidência científica para este objetivo

# FORMATO:
- Seja específico: use gramas, percentuais, horários exatos
- Cite as fontes de forma clara ao longo do texto
- Priorize: PubMed, NSCA, ISSN, atletas e coaches de elite
- Responda em português do Brasil
- Mínimo 400 palavras, máximo 600 palavras

# NÃO INCLUA:
- Avisos de que é apenas informação geral
- Recomendações para consultar médico (o coach vai adicionar se necessário)
- Introduções longas — vá direto aos protocolos`;
    }

    const systemPrompts: Record<string, string> = {
      nutrition: "Você é um especialista em nutrição e ciência dos alimentos. Responda com base em evidências científicas recentes. Responda em português BR.",
      nootropics: "Você é um especialista em nootrópicos e neurociência nutricional. Foque em mecanismos de ação, dosagens e segurança. Responda em português BR.",
      recipes: "Você é um especialista em nutrição e gastronomia saudável. Inclua informações nutricionais. Responda em português BR.",
      health: "Você é um especialista em saúde e medicina baseada em evidências. Responda em português BR.",
      protocol: "Você é um especialista em protocolos nutricionais esportivos de elite. Busque os dados mais recentes e cite fontes. Responda em português BR.",
      general: "Você é um assistente de pesquisa científica focado em nutrição, saúde e performance. Cite fontes. Responda em português BR.",
    };

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          { role: "system", content: systemPrompts[category] || systemPrompts.general },
          { role: "user", content: userMessage },
        ],
        max_tokens: 2000,
        search_recency_filter: "year",
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("Perplexity API error:", response.status, errBody);
      throw new Error(`Perplexity API error [${response.status}]: ${errBody}`);
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "Sem resultado.";
    const citations = data.citations || [];

    return new Response(JSON.stringify({ answer, citations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("perplexity-search error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
