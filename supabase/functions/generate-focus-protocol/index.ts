import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { event_type, event_time, duration_hours } = await req.json();
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
            content: `Você é um especialista em nutrição para performance cognitiva. Gere um protocolo completo para o dia do evento em JSON.

Formato OBRIGATÓRIO (JSON puro):
{
  "timeline": [
    {"time": "07:00", "title": "Café da manhã anti-inflamatório", "foods": ["Ovos mexidos", "Abacate"], "supplements": ["L-Teanina 200mg"], "rationale": "..."}
  ],
  "avoid": ["Açúcar simples", "Refeição pesada"],
  "notifications": [
    {"time": "12:00", "message": "Hora do pré-foco: cafeína + L-Teanina agora"}
  ],
  "summary": "Resumo do protocolo"
}`
          },
          {
            role: "user",
            content: `Tipo de evento: ${event_type}\nHorário: ${event_time}\nDuração: ${duration_hours}h`
          }
        ],
      }),
    });

    if (!response.ok) throw new Error(`AI error: ${response.status}`);

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    
    let protocol;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      protocol = JSON.parse(cleaned);
    } catch {
      protocol = { raw: content };
    }

    return new Response(JSON.stringify({ protocol }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
