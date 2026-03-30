import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é um pesquisador científico especialista em peptídeos, metabolismo energético e fisiologia do exercício. Analise o tema solicitado e estruture sua resposta OBRIGATORIAMENTE assim:

# ANÁLISE CIENTÍFICA: [TEMA]

## Estado Atual da Ciência
[Resumo do que a ciência sabe hoje, com dados e percentuais]

## Estudos Chave
[Liste 3-5 estudos reais: Autor, Journal, Ano, Achado principal com número]

## Mecanismo Molecular Profundo
[Explique a bioquímica em nível de receptor, cascata de sinalização e efeito downstream]

## Aplicação Prática para Atletas
[Como isso se traduz em treino, dieta, timing, dosagem]

## O Que Ainda Não Sabemos
[Lacunas na pesquisa, questões em aberto, trials em andamento]

## INSIGHT NEXUS-BIO
[Uma revelação que sintetiza tudo de forma única — o que ninguém está falando]

Use dados reais, seja específico com percentuais e não invente estudos. Responda em português brasileiro.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, type } = await req.json();
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_API_KEY) throw new Error("PERPLEXITY_API_KEY is not configured");

    const isAlertCheck = type === "alerts";

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          {
            role: "system",
            content: isAlertCheck
              ? "Você é um rastreador de estudos científicos sobre peptídeos. Liste os estudos mais recentes publicados sobre peptídeos terapêuticos, incluindo: data, journal, peptídeo, descoberta principal e nível de impacto (CRÍTICO/ALTO/MÉDIO). Formate cada alerta em uma linha. Responda em português brasileiro."
              : SYSTEM_PROMPT,
          },
          { role: "user", content: query },
        ],
        search_recency_filter: isAlertCheck ? "week" : "month",
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("Perplexity error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro na pesquisa" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const citations = data.citations || [];

    return new Response(JSON.stringify({ content, citations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("peptide-research error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
