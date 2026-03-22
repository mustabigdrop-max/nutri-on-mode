import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { question, profileContext, history } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Step 1: Classify intent
    const q = question.toLowerCase();
    const isScientific = /estudo|pesquisa|evidência|ciência|pubmed|meta.?análise|creatina|whey|cafeína|suplemento|protocolo|dose|dosagem/.test(q);
    const isPersonal = /meu|minha|para mim|no meu caso|meu plano|meu perfil/.test(q);

    let perplexityResult = "";
    let citations: string[] = [];
    let perplexityUsed = false;

    // Step 2: If scientific, call Perplexity first
    if (isScientific && PERPLEXITY_API_KEY) {
      try {
        const pResp = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "sonar-pro",
            messages: [
              { role: "system", content: "Você é um pesquisador científico de elite. Busque os melhores estudos disponíveis mundialmente — PubMed, Cochrane, Nature, Lancet, JISSN, Cell, NEJM, Examine.com. Priorize meta-análises e RCTs recentes. Cite fontes completas. Responda em português BR." },
              { role: "user", content: `${question} 2023 2024 2025` },
            ],
            max_tokens: 2500,
            search_recency_filter: "year",
            search_mode: "academic",
          }),
        });
        if (pResp.ok) {
          const pData = await pResp.json();
          perplexityResult = pData.choices?.[0]?.message?.content || "";
          citations = pData.citations || [];
          perplexityUsed = true;
        }
      } catch (e) {
        console.error("Perplexity error:", e);
      }
    }

    // Step 3: Build APEX system prompt
    const profile = profileContext || {};
    const systemPrompt = `Você é APEX, agente científico especializado do nutriON.
Sua missão: transformar ciência complexa em orientação prática e personalizada.

PERFIL DO USUÁRIO:
- Nome: ${profile.nome || "Usuário"}
- Objetivo: ${profile.objetivo || "saúde geral"}
- Peso atual: ${profile.peso || "N/I"}kg | Meta: ${profile.peso_meta || "N/I"}kg
- Macros: ${profile.macros ? `${profile.macros.kcal}kcal, ${profile.macros.protein}g prot, ${profile.macros.carbs}g carb, ${profile.macros.fat}g fat` : "N/I"}
- Protocolo: ${profile.protocolo || "padrão"}
- Restrições: ${(profile.restricoes || []).join(", ") || "nenhuma"}
- Condições: ${(profile.condicoes || []).join(", ") || "nenhuma"}
- GLP-1: ${profile.glp1 ? "sim" : "não"}

${perplexityResult ? `ESTUDOS ENCONTRADOS PELO PERPLEXITY:
${perplexityResult}` : ""}

REGRAS DE RESPOSTA:
1. Sempre personalize para o perfil acima
2. Cite no mínimo 1 fonte científica quando disponível
3. Divida em: **Resposta direta** → **Explicação** → **Aplicação prática**
4. Linguagem direta, sem jargão desnecessário
5. Se a pergunta for fora de nutrição/saúde: redirecione educadamente
6. Nunca prescreva medicamentos ou substitua médico
7. Máximo 400 palavras por resposta
8. Finalize sempre com 1 ação prática que o usuário pode implementar hoje
9. Formate com markdown (listas, negrito, títulos)
10. Responda sempre em português brasileiro`;

    // Step 4: Call Lovable AI (Claude/Gemini)
    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []).map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: question },
    ];

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error("AI error:", aiResp.status, errText);
      throw new Error(`AI error: ${aiResp.status}`);
    }

    const aiData = await aiResp.json();
    const answer = aiData.choices?.[0]?.message?.content || "Sem resposta.";

    return new Response(JSON.stringify({
      answer,
      citations,
      perplexityUsed,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("apex-scientific error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
