import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { supplementName } = await req.json();
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!PERPLEXITY_API_KEY) throw new Error("PERPLEXITY_API_KEY not configured");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Perplexity busca evidências
    const ppxRes = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${PERPLEXITY_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          { role: "system", content: "Busque evidências científicas completas sobre suplementos esportivos. Inclua metanálises, dosagens, segurança, mecanismo de ação, interações e status regulatório. Cite autor, ano, journal e achado principal." },
          { role: "user", content: `Análise científica completa do suplemento: ${supplementName}. Inclua: eficácia (estudos favoráveis e desfavoráveis), dosagem baseada em evidências (mínima, ótima, máxima), mecanismo de ação, perfil de segurança, interações, contraindicações, aplicação prática para bodybuilding, custo-benefício e alternativas.` }
        ],
        search_recency_filter: "year",
      })
    });

    const ppxData = await ppxRes.json();
    const rawScience = ppxData.choices?.[0]?.message?.content || "";
    const citations = ppxData.citations || [];

    // Lovable AI formata
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Você é um farmacologista esportivo. Analise suplementos com rigor científico e gere análise estruturada para coaches. Responda em Português do Brasil. Nunca use * ou **." },
          { role: "user", content: `Dados científicos sobre ${supplementName}:\n\n${rawScience}\n\nCitações: ${JSON.stringify(citations)}\n\nGere análise estruturada com: Nível de evidência (A/B/C/D), Dosagem (mínima/ótima/máxima), Mecanismo de ação, Segurança e interações, Aplicação prática, Custo-benefício, Alternativas, Referências.` }
        ],
        temperature: 0.4,
      })
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) return new Response(JSON.stringify({ error: "Rate limit." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiRes.status === 402) return new Response(JSON.stringify({ error: "Créditos insuficientes." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI error: ${aiRes.status}`);
    }

    const aiData = await aiRes.json();
    const analysis = aiData.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ analysis, citations, supplementName }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("analyze-supplement error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
