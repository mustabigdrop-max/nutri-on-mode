import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { requireUser } from "../_shared/auth.ts";
import { MCE_DOCTRINE } from "../_shared/mceDoctrine.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const FORGE_SCHEMA = `{
  "mce_scores": { "mindset": 0-100, "comportamento": 0-100, "execucao": 0-100 },
  "streak_impact": "manteve|perdeu|fortaleceu",
  "feedback": "feedback direto e motivacional (2-3 frases, tom militar suave)",
  "deviation_detected": true|false,
  "correction_protocol": null | {
    "what_failed": "o que saiu do plano",
    "immediate_action": "o que fazer AGORA (1 frase)",
    "tomorrow_adjustment": "ajuste pra amanhã (1 frase)",
    "mindset_reset": "frase MCE pra resetar o mindset"
  },
  "compound_message": "mensagem sobre o efeito composto — o que você ganha mantendo, ou perde quebrando"
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const auth = await requireUser(req);
  if (!auth.ok) {
    return new Response(JSON.stringify({ error: auth.error }), { status: auth.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }

  try {
    const { type, answers, streaks, rank } = await req.json();
    const isMorning = type === "morning";

    const system = `Você é o motor MCE FORGE do nutriON, sistema do Coach Diogo Mello.
${MCE_DOCTRINE}

Analise o check-in ${isMorning ? "matinal" : "noturno"} e gere feedback.
Se detectar desvio do plano (respostas abaixo de "bom"), gere um PROTOCOLO DE CORREÇÃO imediato.
Contexto do usuário: streaks atuais ${JSON.stringify(streaks ?? {})}, rank ${rank ?? "Iniciante"}.
Responda SOMENTE com JSON válido neste formato exato:
${FORGE_SCHEMA}`;

    const res = await fetch(AI_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: `Check-in ${type}: ${JSON.stringify(answers)}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      console.error("AI error", res.status, t);
      return new Response(JSON.stringify({ error: "AI unavailable" }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: "Bad request" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
