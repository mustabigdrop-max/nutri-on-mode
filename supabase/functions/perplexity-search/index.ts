import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query, category } = await req.json();
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    if (!PERPLEXITY_API_KEY) throw new Error("PERPLEXITY_API_KEY not configured");

    const systemPrompts: Record<string, string> = {
      nutrition: "Você é um especialista em nutrição e ciência dos alimentos. Responda com base em evidências científicas, citando estudos quando possível. Foque em: composição nutricional, efeitos metabólicos, recomendações baseadas em evidências. Responda em português BR.",
      nootropics: "Você é um especialista em nootrópicos e neurociência nutricional. Foque em: mecanismos de ação, dosagens baseadas em evidências, interações e segurança. Responda em português BR.",
      recipes: "Você é um especialista em nutrição e gastronomia saudável. Responda com receitas detalhadas incluindo informações nutricionais. Responda em português BR.",
      health: "Você é um especialista em saúde e medicina baseada em evidências. Foque em: condições de saúde, suplementos, protocolos baseados em evidências. Responda em português BR.",
      general: "Você é um assistente de pesquisa científica focado em nutrição, saúde e performance. Responda com base em evidências, citando fontes. Responda em português BR.",
    };

    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [
          { role: "system", content: systemPrompts[category] || systemPrompts.general },
          { role: "user", content: query },
        ],
        search_recency_filter: "month",
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Perplexity API error [${response.status}]: ${errBody}`);
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "Sem resultado.";
    const citations = data.citations || [];

    return new Response(JSON.stringify({ answer, citations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
