import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function routeQuery(query: string): "gateway" | "perplexity" | "both" {
  const lower = query.toLowerCase();
  const bothTriggers = [
    "melhor probiótico", "protocolo baseado em evidências", "o que a ciência diz",
    "otimizar microbioma", "curar intestino permeável", "eliminar sibo",
  ];
  const ppxTriggers = [
    "estudo", "pesquisa", "evidência", "ciência", "recente", "publicado",
    "meta-análise", "cepa", "probiótico específico", "l. reuteri", "bifidobacterium",
    "butirato", "akkermansia", "scfas", "artigo",
  ];
  if (bothTriggers.some((t) => lower.includes(t))) return "both";
  if (ppxTriggers.some((t) => lower.includes(t))) return "perplexity";
  return "gateway";
}

async function fetchWithTimeout(url: string, opts: RequestInit, ms: number) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

function buildSystemPrompt(profile: any, ppxContext: string | null): string {
  const profileBlock = profile
    ? `Perfil do usuário:
- Sexo: ${profile.sexo || "não informado"}
- Idade: ${profile.idade || "não informada"} anos
- Peso: ${profile.peso || "não informado"} kg
- Objetivo: ${profile.objetivo || "não informado"}
- Nível de estresse: ${profile.stressLevel || "não informado"}
- Qualidade do sono: ${profile.sleepQuality || "não informada"}
- Antibióticos no último ano: ${profile.antibioticLastYear ? "Sim" : "Não informado"}
- Restrições alimentares: ${profile.restrictions || "nenhuma informada"}
- Orçamento: ${profile.budget || "não informado"}`
    : "Perfil não disponível.";

  const ppxBlock = ppxContext
    ? `\n\n══ EVIDÊNCIAS CIENTÍFICAS (Perplexity Sonar Pro) ══\n${ppxContext}\nIntegre essas evidências de forma natural na sua resposta, citando tipo de estudo e ano.`
    : "";

  return `Você é o GutON 2.0, especialista em saúde intestinal clínica avançada do app nutriON.

Especialista no eixo intestino–cérebro–comportamento alimentar com domínio em:
- Microbiologia intestinal, disbiose, Leaky Gut, SIBO, SII
- Protocolo de reintrodução alimentar (Low-FODMAP)
- Prebióticos, probióticos e psicobióticos acessíveis
- Nutrição anti-inflamatória de baixo custo
- Eixo intestino-cérebro: como microbioma afeta humor, fome emocional e comportamento

Filosofia: "Sua fome nunca foi de comida. O comportamento vem antes do alimento. E antes do comportamento, está o intestino."

${profileBlock}

REGRAS:
- Responda SEMPRE em português brasileiro
- Classifique padrões intestinais: A (disbiose simples), B (leaky gut), C (SIBO), D (SII), E (constipação), F (diarreia)
- Sinais de alarme (sangramento, perda de peso inexplicada, dor noturna, febre) → encaminhar ao médico
- Nunca diagnostique doenças (CID) — apenas avaliação funcional
- Explique o mecanismo fisiológico por trás de cada recomendação
- Priorize alimentos acessíveis ao brasileiro (preço baixo + alta eficácia)
- Conecte intestino com humor, energia e comportamento alimentar (eixo intestino-cérebro)
- Framework 4R: Remove → Replace → Reinoculate → Repair
- Use frases de impacto com parcimônia: "90% da serotonina está no intestino"
- Feche sempre com 1 ação prática imediata
${ppxBlock}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message, userProfile, conversationHistory } = await req.json();
    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Mensagem inválida" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY não configurada" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const route = routeQuery(message);
    let ppxContext: string | null = null;

    // Perplexity search for scientific evidence
    if (route === "perplexity" || route === "both") {
      const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
      if (PERPLEXITY_API_KEY) {
        try {
          const ppxRes = await fetchWithTimeout(
            "https://api.perplexity.ai/chat/completions",
            {
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
                    content: `Pesquisador especializado em microbioma intestinal e gastroenterologia funcional.
Busque estudos peer-reviewed 2020–2025. Responda em português.
Cite: nome do estudo, ano, tipo (RCT/meta-análise/revisão), resultado principal.
Foco: PubMed, Gut, Nature Microbiology, Cell Host & Microbe, Nutrients.`,
                  },
                  { role: "user", content: message },
                ],
                search_recency_filter: "year",
                return_citations: true,
                max_tokens: 600,
              }),
            },
            25000
          );
          if (ppxRes.ok) {
            const pData = await ppxRes.json();
            ppxContext = pData.choices?.[0]?.message?.content || null;
          }
        } catch (e) {
          console.error("Perplexity error (continuing):", e);
        }
      }
    }

    const systemPrompt = buildSystemPrompt(userProfile, ppxContext);
    const history = Array.isArray(conversationHistory)
      ? conversationHistory.slice(-10)
      : [];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...history,
          { role: "user", content: message },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit. Tente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      return new Response(JSON.stringify({ error: "Erro na API de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "X-GutON-Source": ppxContext ? "gateway+perplexity" : "gateway",
      },
    });
  } catch (error) {
    console.error("guton error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
