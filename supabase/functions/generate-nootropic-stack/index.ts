import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { challenge, caffeine_tolerance, health_conditions, objective } = await req.json();
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
            content: `Você é um especialista em nootrópicos e nutrição cognitiva. Gere um stack nootrópico personalizado em JSON.

Formato de resposta OBRIGATÓRIO (JSON puro, sem markdown):
{
  "morning": [{"name": "...", "dose": "...", "timing": "...", "mechanism": "...", "evidence": "high|moderate|low", "onset": "...", "interactions": "...", "cost_brl": "...", "icon": "💊"}],
  "pre_workout": [...],
  "afternoon": [...],
  "evening": [...],
  "summary": "Resumo do protocolo em 2 frases",
  "warnings": ["Aviso 1", "Aviso 2"]
}

Considere:
- Condições de saúde para CONTRAINDICAÇÕES
- Tolerância à cafeína para dosagens
- Evidências científicas reais
- Preços médios no Brasil
- Interações medicamentosas`
          },
          {
            role: "user",
            content: `Desafio cognitivo: ${challenge}\nTolerância a cafeína: ${caffeine_tolerance}\nCondições de saúde: ${(health_conditions || []).join(", ") || "Nenhuma"}\nObjetivo: ${objective}`
          }
        ],
      }),
    });

    if (!response.ok) throw new Error(`AI error: ${response.status}`);

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    
    let stack;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      stack = JSON.parse(cleaned);
    } catch {
      stack = { raw: content };
    }

    return new Response(JSON.stringify({ stack }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
