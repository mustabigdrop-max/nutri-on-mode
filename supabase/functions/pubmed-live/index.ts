import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { searchTerm, area, recency, muscle } = await req.json();
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!PERPLEXITY_API_KEY) throw new Error("PERPLEXITY_API_KEY not configured");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const areaMap: Record<string, string> = {
      hipertrofia: "hypertrophy muscle growth",
      forca: "strength training maximal strength",
      biomecanica: "biomechanics kinematics kinetics",
      nutricao: "sports nutrition protein carbohydrate",
      suplementacao: "supplementation ergogenic aids",
      recuperacao: "recovery muscle damage DOMS",
      cardio: "cardiovascular exercise aerobic",
      composicao: "body composition fat loss lean mass",
    };

    const recencyMap: Record<string, string> = {
      mes: "month", trimestre: "month", ano: "year", todos: "year"
    };

    const query = `${searchTerm} ${areaMap[area] || ""} ${muscle || ""} PubMed study research evidence`;

    const ppxRes = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${PERPLEXITY_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          { role: "system", content: "Busque estudos científicos recentes sobre o tema. Para cada estudo encontrado, retorne: título completo, autores, ano, journal, achado principal, e DOI/link se disponível. Priorize PubMed, JSCR, Sports Medicine, IJSPP." },
          { role: "user", content: query }
        ],
        search_recency_filter: recencyMap[recency] || "year",
      })
    });

    const ppxData = await ppxRes.json();
    const rawScience = ppxData.choices?.[0]?.message?.content || "";
    const citations = ppxData.citations || [];

    // Lovable AI classifica relevância
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Analise os estudos encontrados e para cada um gere: implicação prática para bodybuilding (1 linha) e score de relevância (1-10). Responda em Português do Brasil. Nunca use * ou **." },
          { role: "user", content: `Estudos encontrados:\n${rawScience}\n\nClassifique relevância para bodybuilding/fitness e gere implicação prática para cada estudo.` }
        ],
        temperature: 0.3,
      })
    });

    const aiData = await aiRes.json();
    const analysis = aiData.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ rawStudies: rawScience, analysis, citations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("pubmed-live error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
