import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query, category, userProfile, filters } = await req.json();
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Build search query with optional filters
    const searchMode = filters?.searchMode || "academic"; // default to academic for LAB
    const recency = filters?.recency || "year";
    const domainFilter = filters?.domains || []; // empty = search everywhere
    const lang = filters?.lang || "pt-BR";

    const systemPrompts: Record<string, string> = {
      nutrition: `Você é um pesquisador científico de elite em nutrição. Busque os melhores artigos e meta-análises disponíveis mundialmente. Inclua estudos de: PubMed, Cochrane, JISSN, Nature, The Lancet, Cell Metabolism, AJCN, BMJ, NEJM. Priorize meta-análises e RCTs. Classifique cada estudo encontrado. Responda em ${lang === "en" ? "English" : "português BR"}.`,
      supplements: `Você é um pesquisador especialista em suplementação baseada em evidências. Busque estudos clínicos, meta-análises e revisões sistemáticas sobre eficácia, dosagem e segurança. Fontes prioritárias: PubMed, Examine.com, JISSN, Cochrane. Responda em ${lang === "en" ? "English" : "português BR"}.`,
      performance: `Você é um cientista do esporte. Busque protocolos e estudos sobre performance atlética, periodização nutricional e ergogênicos. Fontes: NSCA, ACSM, JISSN, Sports Medicine, BJSM. Responda em ${lang === "en" ? "English" : "português BR"}.`,
      longevity: `Você é um pesquisador em longevidade e envelhecimento. Busque estudos sobre restrição calórica, autofagia, senescência, NAD+, sirtuínas. Fontes: Nature Aging, Cell, Science, The Lancet. Responda em ${lang === "en" ? "English" : "português BR"}.`,
      microbiome: `Você é um especialista em microbioma intestinal. Busque estudos sobre probióticos, prebióticos, eixo intestino-cérebro. Fontes: Gut, Nature Microbiology, Cell Host & Microbe. Responda em ${lang === "en" ? "English" : "português BR"}.`,
      protocol: `Você é um especialista em protocolos nutricionais esportivos de elite. Busque os dados mais recentes e cite fontes. Responda em ${lang === "en" ? "English" : "português BR"}.`,
      general: `Você é um assistente de pesquisa científica de nível PhD. Busque os melhores artigos científicos disponíveis mundialmente, sem restrição de idioma ou região. Priorize meta-análises, revisões sistemáticas e RCTs. Cite fontes completas. Responda em ${lang === "en" ? "English" : "português BR"}.`,
    };

    // Enhanced query builder
    let enhancedQuery = query;
    if (filters?.yearRange) {
      enhancedQuery += ` ${filters.yearRange}`;
    } else {
      enhancedQuery += " 2023 2024 2025";
    }

    // Add study type preference
    if (filters?.studyType === "meta-analysis") {
      enhancedQuery += " meta-analysis OR systematic review";
    } else if (filters?.studyType === "rct") {
      enhancedQuery += " randomized controlled trial";
    }

    // Sport protocol handling
    if (category === "protocol" && userProfile) {
      enhancedQuery = `Busque os protocolos nutricionais mais recentes e eficazes para:
- Esporte/modalidade: ${userProfile.esporte || "geral"}
- Objetivo: ${userProfile.fase || "saúde"} (${userProfile.meta || "melhorar performance"})
- Perfil: atleta de ${userProfile.peso || 70}kg, treina ${userProfile.dias_treino || 3}x/semana

Inclua: distribuição de macros, timing pré/pós-treino, suplementação com evidência, estudos recentes.
Seja específico com gramas, percentuais e horários. Cite fontes.`;
    }

    // Try Perplexity first (better for academic search)
    if (PERPLEXITY_API_KEY) {
      try {
        const perplexityBody: any = {
          model: "sonar-pro", // upgraded for multi-step reasoning + 2x citations
          messages: [
            { role: "system", content: systemPrompts[category] || systemPrompts.general },
            { role: "user", content: enhancedQuery },
          ],
          max_tokens: 3000,
          search_recency_filter: recency,
        };

        // Apply domain filter if specified
        if (domainFilter.length > 0) {
          perplexityBody.search_domain_filter = domainFilter;
        }

        // Use academic search mode when available
        if (searchMode === "academic") {
          perplexityBody.search_mode = "academic";
        }

        const response = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(perplexityBody),
        });

        if (!response.ok) {
          const errBody = await response.text();
          console.error("Perplexity API error:", response.status, errBody);
          throw new Error(`Perplexity API error [${response.status}]`);
        }

        const data = await response.json();
        const answer = data.choices?.[0]?.message?.content || "Sem resultado.";
        const citations = data.citations || [];

        // Now use Lovable AI to structure the results into study cards
        const structureResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: `Você recebe um texto com resultados de pesquisa científica e uma lista de URLs de citação.
Extraia os estudos individuais mencionados e retorne um JSON array com os estudos.
Cada estudo deve ter:
- "title": título do estudo ou descrição clara (em português)
- "authors": autores se mencionados, senão ""
- "year": ano se mencionado, senão ""
- "journal": revista/jornal se mencionado, senão ""
- "summary": resumo de 2-3 frases do achado principal
- "badge": "favorable" se o resultado é positivo/suporta, "inconclusive" se inconclusivo/misto, "refutes" se refuta/negativo
- "relevance": número de 1-10 indicando relevância para a query original
- "citation_index": índice da citação correspondente na lista (0-based), ou -1 se não há correspondência

Retorne APENAS o JSON array, sem markdown, sem explicação. Máximo 8 estudos. Ordene por relevância.`,
              },
              {
                role: "user",
                content: `Query original: "${query}"\n\nTexto dos resultados:\n${answer}\n\nCitações:\n${citations.map((c: string, i: number) => `[${i}] ${c}`).join("\n")}`,
              },
            ],
          }),
        });

        let studies = [];
        if (structureResp.ok) {
          const structData = await structureResp.json();
          const structText = structData.choices?.[0]?.message?.content || "[]";
          try {
            // Clean possible markdown wrapper
            const cleaned = structText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
            studies = JSON.parse(cleaned);
          } catch {
            console.error("Failed to parse structured studies");
          }
        }

        // Map citation URLs to studies
        const enrichedStudies = studies.map((s: any) => ({
          ...s,
          source: s.citation_index >= 0 && s.citation_index < citations.length
            ? citations[s.citation_index]
            : undefined,
        }));

        return new Response(JSON.stringify({
          answer,
          citations,
          studies: enrichedStudies,
          searchMode,
          model: "sonar-pro",
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        console.error("Perplexity failed, falling back to Lovable AI:", e);
      }
    }

    // Fallback to Lovable AI
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
          { role: "user", content: enhancedQuery },
        ],
      }),
    });

    if (!response.ok) throw new Error(`AI API error [${response.status}]`);
    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "Sem resultado.";
    return new Response(JSON.stringify({ answer, citations: [], studies: [] }), {
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
