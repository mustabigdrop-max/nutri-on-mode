import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { scores } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Analise os dados de energia do usuário e gere insights em JSON.

Formato OBRIGATÓRIO (JSON puro):
{
  "insights": [
    {"text": "🔍 Insight...", "type": "pattern|alert|nootropic_effect|recovery"}
  ],
  "weekly_avg": 0,
  "classification": "high_performance|solid|attention|critical",
  "recovery_protocol": null
}

Se classificação for "critical", gere recovery_protocol com ações específicas.`
          },
          {
            role: "user",
            content: `Dados de energia dos últimos dias:\n${JSON.stringify(scores)}`
          }
        ],
      }),
    });

    if (!response.ok) throw new Error(`AI error: ${response.status}`);

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    
    let insights;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      insights = JSON.parse(cleaned);
    } catch {
      insights = { raw: content };
    }

    return new Response(JSON.stringify(insights), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
