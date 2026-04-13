import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function routeQuery(query: string): "ai" | "perplexity" | "both" {
  const lower = query.toLowerCase();

  const bothTriggers = ["otimizar", "melhor estratégia", "protocolo baseado em evidências", "o que a ciência diz sobre meu caso", "evidência para meu"];
  const perplexityTriggers = ["estudo", "pesquisa", "evidência", "recente", "publicado", "ciência diz", "comprovado", "artigo", "meta-análise", "literatura"];

  if (bothTriggers.some((t) => lower.includes(t))) return "both";
  if (perplexityTriggers.some((t) => lower.includes(t))) return "perplexity";
  return "ai";
}

function buildSystemPrompt(profile: any, perplexityContext: string | null): string {
  const leanMass = profile?.lean_mass || (profile?.weight ? (profile.weight * (1 - (profile.body_fat_percent || 20) / 100)).toFixed(1) : "N/A");

  return `Você é o MetabolicON, especialista em metabolismo energético e nutrição clínica aplicada do app nutriON.

══════════════════════════════════════════
PERFIL DO USUÁRIO
══════════════════════════════════════════
Nome: ${profile?.full_name || "Usuário"}
Peso: ${profile?.weight || "N/A"}kg | Altura: ${profile?.height || "N/A"}cm
Idade: ${profile?.age || "N/A"} anos | Sexo: ${profile?.sex || "N/A"}
% Gordura: ${profile?.body_fat_percent || "N/A"}%
Massa magra: ${leanMass}kg
TDEE estimado: ${profile?.tdee || "N/A"} kcal/dia
Objetivo: ${profile?.goal || "N/A"}
Nível atividade: ${profile?.activity_level || "N/A"}
Horário treino: ${profile?.train_time || "N/A"}
Faz AEJ: ${profile?.does_aej ? "Sim" : "Não"}
Cardio pós-treino: ${profile?.post_cardio ? "Sim" : "Não"}
Restrições: ${(profile?.restrictions || []).join(", ") || "Nenhuma"}
Condições saúde: ${(profile?.health_conditions || []).join(", ") || "Nenhuma"}
Orçamento: ${profile?.budget_level || "médio"}
${perplexityContext ? `\nEvidências Perplexity disponíveis:\n${perplexityContext}` : ""}

══════════════════════════════════════════
SEU PAPEL CLÍNICO
══════════════════════════════════════════
Você raciocina como um especialista com PhD em Fisiologia do Exercício e Nutrição Clínica.
Fala com autoridade científica, clareza clínica e acolhimento humano.

SEMPRE:
1. Personaliza pelo perfil completo acima
2. Calcula com base em massa magra (não peso total)
3. Mapeia por janela temporal (AEJ → manhã → pré-treino → pós-treino → tarde → noite)
4. Integra TODOS os substratos energéticos
5. Sugere alimentos de baixo custo e alta densidade nutricional
6. Explica o PORQUÊ (mecanismo fisiológico)
7. Integra evidências do Perplexity quando disponíveis

FRAMEWORK MACROS POR OBJETIVO:
Emagrecimento: CHO 1.5-2.5g/kgMM | PTN 2.4-3.0g/kgMM | LIP 0.8-1.0g/kgMM | Deficit 300-500kcal
Recomposição: CHO 2.5-3.5g/kgMM | PTN 2.2-2.8g/kgMM | LIP 1.0-1.2g/kgMM | TDEE ±0
Bulking: CHO 4.0-6.0g/kgMM | PTN 1.8-2.5g/kgMM | LIP 1.2-1.5g/kgMM | Surplus 300-500kcal
Cutting: CHO 1.0-2.0g/kgMM | PTN 3.0-3.5g/kgMM | LIP 0.8-1.0g/kgMM | Deficit 200-400kcal
Performance: CHO 5.0-8.0g/kgMM | PTN 2.0-3.0g/kgMM | LIP 1.0-1.5g/kgMM | Surplus 10-20%
Saúde: CHO 3.0-4.0g/kgMM | PTN 1.6-2.0g/kgMM | LIP 1.0-1.3g/kgMM | TDEE

JANELA GLUT-4: Pós-treino 30-45min, GLUT-4 transloca insulino-independente via AMPK.
CHO pós-treino = 0.8-1.2g x massa magra (kg) nos primeiros 30 min + 25-35g PTN.

FORMATO: Responda em português BR. Nunca use * ou **. Use subtítulos claros e emojis moderados.
Inclua sempre 1 ação prática imediata ao final.
Nunca presceva dieta formalmente — oriente e eduque.`;
}

async function fetchWithTimeout(url: string, options: RequestInit, ms = 25000): Promise<Response> {
  const c = new AbortController();
  const id = setTimeout(() => c.abort(), ms);
  try { return await fetch(url, { ...options, signal: c.signal }); }
  finally { clearTimeout(id); }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { message, userProfile, conversationHistory } = await req.json();
    if (!message) return new Response(JSON.stringify({ error: "message é obrigatório" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const route = routeQuery(message);
    let perplexityContent: string | null = null;
    let citations: string[] = [];

    // Step 1: Perplexity search if needed
    if ((route === "perplexity" || route === "both") && PERPLEXITY_API_KEY) {
      try {
        const ppxRes = await fetchWithTimeout("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${PERPLEXITY_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "sonar-pro",
            messages: [
              { role: "system", content: `Você é um pesquisador especializado em nutrição esportiva e metabolismo. Busque evidências científicas recentes (2020-2025). Foco em: PubMed, JISSN, AJCN, Sports Medicine, Nutrients. Responda em português brasileiro. Cite ano e tipo de estudo. Contexto do usuário: objetivo ${userProfile?.goal || "geral"}, ${userProfile?.weight || ""}kg` },
              { role: "user", content: message }
            ],
            search_recency_filter: "year",
            return_citations: true,
            max_tokens: 800,
          }),
        });
        const ppxData = await ppxRes.json();
        perplexityContent = ppxData.choices?.[0]?.message?.content || null;
        citations = ppxData.citations || [];
      } catch (e) {
        console.error("Perplexity error (continuing):", e);
      }
    }

    // Step 2: AI Gateway (Gemini) for clinical reasoning
    const systemPrompt = buildSystemPrompt(userProfile || {}, perplexityContent);
    const history = (conversationHistory || []).slice(-10).map((m: any) => ({ role: m.role, content: m.content }));

    const aiRes = await fetchWithTimeout("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...history,
          { role: "user", content: message },
        ],
        temperature: 0.5,
      }),
    }, 30000);

    if (!aiRes.ok) {
      if (aiRes.status === 429) return new Response(JSON.stringify({ error: "Rate limit. Tente novamente em alguns segundos." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiRes.status === 402) return new Response(JSON.stringify({ error: "Créditos insuficientes." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI error: ${aiRes.status}`);
    }

    const aiData = await aiRes.json();
    const response = aiData.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({
      response,
      citations,
      ai_source: route === "both" ? "dual" : route === "perplexity" ? "perplexity" : "ai",
      route,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("metabolicon error:", e);
    return new Response(JSON.stringify({ error: e.message || "Erro interno" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
