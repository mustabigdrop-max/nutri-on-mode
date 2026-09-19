import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { question, clientContext } = await req.json();
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // PASSO 1 — Perplexity busca estudos recentes (com fallback se falhar/quota)
    let rawScience = "";
    let citations: unknown[] = [];
    let liveSearch = !!PERPLEXITY_API_KEY;

    if (!PERPLEXITY_API_KEY) console.error("PERPLEXITY_API_KEY não configurada — usando fallback.");

    try {
      if (!PERPLEXITY_API_KEY) throw new Error("sem chave");
      const perplexityResponse = await fetch("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${PERPLEXITY_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "sonar-pro",
          messages: [
            { role: "system", content: "Você é um pesquisador científico especializado em fisiologia do exercício, biomecânica e nutrição esportiva. Busque informações atualizadas, estudos recentes do PubMed, Journal of Strength and Conditioning Research, Sports Medicine e outras fontes científicas de alto impacto. Sempre cite autor, ano e achado principal. Retorne dados brutos e referências completas." },
            { role: "user", content: `${question} - estudos científicos recentes, PubMed, Journal of Strength and Conditioning Research, Sports Medicine, fisiologia do exercício, bodybuilding, hipertrofia` }
          ],
          search_recency_filter: "month",
        })
      });

      if (!perplexityResponse.ok) {
        const errText = await perplexityResponse.text();
        console.error(`Perplexity indisponível (${perplexityResponse.status}), usando fallback: ${errText.slice(0, 200)}`);
        liveSearch = false;
      } else {
        const perplexityData = await perplexityResponse.json();
        rawScience = perplexityData.choices?.[0]?.message?.content || "";
        citations = perplexityData.citations || [];
      }
    } catch (perpErr) {
      console.error("Perplexity falhou, usando fallback:", perpErr);
      liveSearch = false;
    }

    // PASSO 2 — Lovable AI (Gemini) formata e personaliza
    const systemPrompt = liveSearch
      ? "Você é o Dr. Evidence — especialista em ciência do exercício, biomecânica e bodybuilding científico. Recebe dados brutos de pesquisa científica atual e transforma em análise prática, clara e aplicável para coaches brasileiros de alto nível. Sempre cite as fontes recebidas. Responda em Português do Brasil. Nunca use * ou **. Use subtítulos claros e texto corrido profissional."
      : "Você é o Dr. Evidence — especialista em ciência do exercício, biomecânica e bodybuilding científico. A busca em tempo real está temporariamente indisponível, então responda com base no consenso científico consolidado (revisões sistemáticas e metanálises clássicas de hipertrofia, volume, frequência e nutrição esportiva). NÃO invente números, autores, anos ou estudos que você não tem certeza que existem. Avise na primeira linha: 'Pesquisa ao vivo indisponível no momento — resposta baseada no consenso científico consolidado.' Responda em Português do Brasil. Nunca use * ou **. Use subtítulos claros e texto corrido profissional.";

    const userPrompt = liveSearch
      ? `Dados científicos atuais coletados em tempo real:\n\n${rawScience}\n\nCitações: ${JSON.stringify(citations)}\n\nPergunta do coach: ${question}\nContexto do cliente: ${clientContext || "Nenhum"}\n\nTransforme em análise profunda e prática. Estruture em:\n1. Resposta direta (2-3 linhas)\n2. O que a ciência atual diz (dados dos estudos)\n3. Implicação prática para o coach\n4. Como aplicar com o cliente\n5. Referências (lista formatada)`
      : `Pergunta do coach: ${question}\nContexto do cliente: ${clientContext || "Nenhum"}\n\nResponda em análise profunda e prática. Estruture em:\n1. Resposta direta (2-3 linhas)\n2. O que o consenso científico diz\n3. Implicação prática para o coach\n4. Como aplicar com o cliente\n5. Leituras recomendadas (somente revisões/metanálises que você tem certeza que existem — ex.: Schoenfeld et al., sem inventar anos ou números)`;

    const claudeResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.5,
      })
    });

    if (!claudeResponse.ok) {
      if (claudeResponse.status === 429) return new Response(JSON.stringify({ error: "Rate limit excedido." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (claudeResponse.status === 402) return new Response(JSON.stringify({ error: "Créditos insuficientes." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI error: ${claudeResponse.status}`);
    }

    const aiData = await claudeResponse.json();
    const answer = aiData.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ answer, rawScience, citations, liveSearch }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("dr-evidence error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
