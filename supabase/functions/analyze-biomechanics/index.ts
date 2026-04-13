import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const tabQueries: Record<string, (ex: string, mg: string) => string> = {
  anatomia: (ex, mg) => `${ex} ${mg} EMG electromyography anatomy muscle activation study 2023 2024 2025 PubMed`,
  biomecanica: (ex, mg) => `${ex} biomechanics kinetics kinematics joint forces torque research study recent`,
  recrutamento: (ex, mg) => `${ex} ${mg} muscle activation EMG comparison variations study percentage MVIC`,
  execucao: (ex, mg) => `${ex} technique form execution safety NSCA ACSM evidence-based review`,
  ciencia: (ex, mg) => `${ex} hypertrophy strength research meta-analysis systematic review 2024 2025`,
};

const tabSystemPrompts: Record<string, string> = {
  anatomia: "Gere análise anatômica e EMG profunda para o exercício e músculo informados. Inclua: nomenclatura anatômica, origem/inserção, função primária, plano de movimento, sinergistas, antagonistas, ponto de máxima tensão, inervação, desequilíbrios comuns. Cite os estudos encontrados.",
  biomecanica: "Gere análise biomecânica completa: vetores de força, momentos articulares, curva de resistência vs. curva de força muscular, ângulo de máxima tensão, variações de ângulo e seus efeitos. Cite estudos.",
  recrutamento: "Gere análise de recrutamento muscular máximo baseada em EMG. Compare variações do exercício em termos de % MVIC. Tabela comparativa de ativação. Cite estudos de EMG.",
  execucao: "Gere guia de execução perfeita: setup, fase excêntrica, fase concêntrica, respiração, segurança articular, erros comuns, cueings verbais, regressão e progressão. Cite revisões técnicas.",
  ciencia: "Compile todos os estudos recentes sobre este exercício. Para cada estudo: título, autores, ano, journal, achado principal, implicação prática. Ordene por relevância para bodybuilding.",
};

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 25000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { exerciseName, muscleGroup, tab } = await req.json();
    if (!exerciseName || !muscleGroup) {
      return new Response(JSON.stringify({ error: "exerciseName e muscleGroup são obrigatórios" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!PERPLEXITY_API_KEY) throw new Error("PERPLEXITY_API_KEY not configured");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const queryFn = tabQueries[tab] || tabQueries.ciencia;
    const searchQuery = queryFn(exerciseName, muscleGroup);

    // Perplexity
    let rawScience = "";
    let citations: string[] = [];
    try {
      const ppxRes = await fetchWithTimeout("https://api.perplexity.ai/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${PERPLEXITY_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "sonar-pro",
          messages: [
            { role: "system", content: "Pesquisador em biomecânica e fisiologia do exercício. Busque estudos recentes, dados de EMG, análises cinemáticas e cinéticas. Cite autor, ano e achado principal." },
            { role: "user", content: searchQuery }
          ],
          search_recency_filter: "year",
        })
      });

      const ppxData = await ppxRes.json();
      rawScience = ppxData.choices?.[0]?.message?.content || "";
      citations = ppxData.citations || [];
    } catch (ppxErr) {
      console.error("Perplexity error (continuing with AI only):", ppxErr);
      rawScience = "Dados da Perplexity indisponíveis no momento. Gere análise com base no seu conhecimento.";
    }

    // Lovable AI
    const systemPrompt = tabSystemPrompts[tab] || tabSystemPrompts.ciencia;
    const aiRes = await fetchWithTimeout("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: `Você é o Dr. BioMech — especialista em biomecânica e cinesiologia aplicada ao bodybuilding. ${systemPrompt} Responda em Português do Brasil. Nunca use * ou **.` },
          { role: "user", content: `Exercício: ${exerciseName}\nGrupo muscular: ${muscleGroup}\n\nDados científicos atuais:\n${rawScience}\n\nCitações: ${JSON.stringify(citations)}` }
        ],
        temperature: 0.5,
      })
    }, 30000);

    if (!aiRes.ok) {
      if (aiRes.status === 429) return new Response(JSON.stringify({ error: "Rate limit. Tente novamente em alguns segundos." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiRes.status === 402) return new Response(JSON.stringify({ error: "Créditos insuficientes." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const errBody = await aiRes.text();
      console.error("AI error body:", errBody);
      throw new Error(`AI error: ${aiRes.status}`);
    }

    const aiData = await aiRes.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ content, citations, rawScience }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("analyze-biomechanics error:", e);
    return new Response(JSON.stringify({ error: e.message || "Erro interno" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
