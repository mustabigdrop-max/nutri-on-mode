import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { MCE_DOCTRINE } from "../_shared/mceDoctrine.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { message, scores, history } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const m = scores?.m ?? 50, c = scores?.c ?? 50, e = scores?.e ?? 50;
    const systemPrompt = `Você é o MCE Intelligence do nutriON — coach comportamental de elite do Método MCE, criado por Diogo Mello (@diogo.mell0), IFBB Classic Physique, Nutrition Coach e analista comportamental.

${MCE_DOCTRINE}

Scores atuais do usuário: M=${m} C=${c} E=${e}. Use a dimensão mais baixa como foco da intervenção.
Seja cirúrgico e concreto. Máximo 2 parágrafos curtos — a resposta será lida em voz alta. Sem asteriscos, sem markdown, sem listas.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []).slice(-8),
      { role: "user", content: message },
    ];

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "google/gemini-2.5-flash", messages, stream: false }),
    });

    if (!res.ok) {
      if (res.status === 429) return new Response(JSON.stringify({ error: "Rate limit. Aguarde alguns segundos." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (res.status === 402) return new Response(JSON.stringify({ error: "Créditos insuficientes." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI gateway error");
    }
    const data = await res.json();
    const answer = data.choices?.[0]?.message?.content || "Sem resposta.";
    return new Response(JSON.stringify({ answer }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
