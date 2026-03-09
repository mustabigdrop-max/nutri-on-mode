import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { eventType, eventDate, intention, daysUntil, kcalTarget, proteinTarget, objetivo } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const intentionMap: Record<string, string> = {
      aproveitar: "quer aproveitar sem culpa",
      equilibrio: "quer aproveitar com equilíbrio",
      manter: "quer manter o plano mesmo no evento",
    };

    const prompt = `Você é um nutricionista comportamental brasileiro. O usuário tem um evento tipo "${eventType}" em ${daysUntil} dia(s) (data: ${eventDate}).
Objetivo: ${objetivo}. Meta: ${kcalTarget} kcal/dia, ${proteinTarget}g proteína/dia.
Intenção: ${intentionMap[intention] || intention}.

Gere estratégia em 3 fases usando JSON com tool calling. Cada fase em português brasileiro informal, direto, com emojis.
- pre_strategy: preparação nos dias antes (se daysUntil > 0, senão vazio)
- day_strategy: estratégia para o dia do evento com dicas práticas
- post_strategy: recuperação nas 48h seguintes

Seja específico com porções, sugestões de alimentos e horários.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Você é um nutricionista comportamental brasileiro. Responda usando tool calling." },
          { role: "user", content: prompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "event_strategy",
            description: "Return the 3-phase event strategy",
            parameters: {
              type: "object",
              properties: {
                pre_strategy: { type: "string", description: "Pre-event strategy text" },
                day_strategy: { type: "string", description: "Event day strategy text" },
                post_strategy: { type: "string", description: "Post-event recovery text" },
              },
              required: ["pre_strategy", "day_strategy", "post_strategy"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "event_strategy" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      throw new Error(`AI error: ${response.status}`);
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    let strategy = { pre_strategy: "", day_strategy: "", post_strategy: "" };

    if (toolCall?.function?.arguments) {
      strategy = JSON.parse(toolCall.function.arguments);
    }

    return new Response(JSON.stringify(strategy), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Event strategy error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
