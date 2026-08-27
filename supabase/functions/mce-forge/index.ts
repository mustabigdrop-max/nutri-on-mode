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
    const { mode, type, answers, streaks, rank, phase, doneCount, totalCount, incomplete, scores, hour, streak, done } = await req.json();
    const isMorning = type === "morning";

    let system: string;
    let userMsg: string;
    if (mode === "os_feedback") {
      system = `Você é o MCE OS — sistema operacional diário do nutriON, baseado no Método MCE (Mindset, Comportamento, Execução) do Coach Diogo Mello.
${MCE_DOCTRINE}

MCE Scores de hoje: M=${scores?.m ?? 5}/10, C=${scores?.c ?? 5}/10, E=${scores?.e ?? 5}/10
Ações completadas: ${doneCount ?? 0}/${totalCount ?? 0}
Hora atual: ${hour ?? 0}h · Streak: ${streak ?? 0} dias · Rank: ${rank ?? "Iniciante"}
Ações marcadas: ${(done ?? []).join(", ") || "nenhuma"}

Use referências científicas reais (Dweck, Kahneman, Bandura, Frankl, Rotter, Merzenich). Tom de comando suave, zero julgamento moral.
Responda SOMENTE com JSON válido neste formato exato:
{
  "day_verdict": "EXCEPCIONAL|BOM|MEDIANO|FRACO",
  "feedback": "feedback direto, 2-3 frases, com 1 referência científica",
  "correction": null | { "what": "o que corrigir", "how": "como corrigir agora", "science": "autor + conceito" },
  "tomorrow_focus": "1 frase sobre o foco de amanhã",
  "content_idea": "1 ideia de conteúdo MCE pra postar hoje",
  "mce_quote": "1 frase de impacto MCE baseada no dia"
}`;
      userMsg = "Feedback do dia";
    } else if (mode === "forge_tip") {
      system = `Você é o motor MCE FORGE GPS do nutriON, sistema do Coach Diogo Mello.
${MCE_DOCTRINE}

O usuário está na fase "${phase}" do GPS (${doneCount}/${totalCount} passos completos).
Passos incompletos: ${(incomplete ?? []).join(", ")}
Dê 1 dica tática específica pra desbloquear o próximo passo. Tom direto, militar suave. Máx 3 frases.
Responda SOMENTE com JSON válido neste formato exato:
{ "next_focus": "qual passo atacar agora", "tip": "dica específica e acionável", "mce_principle": "qual princípio MCE aplica aqui (1 frase)" }`;
      userMsg = "Próximo passo";
    } else {
      system = `Você é o motor MCE FORGE do nutriON, sistema do Coach Diogo Mello.
${MCE_DOCTRINE}

Analise o check-in ${isMorning ? "matinal" : "noturno"} e gere feedback.
Se detectar desvio do plano (respostas abaixo de "bom"), gere um PROTOCOLO DE CORREÇÃO imediato.
Contexto do usuário: streaks atuais ${JSON.stringify(streaks ?? {})}, rank ${rank ?? "Iniciante"}.
Responda SOMENTE com JSON válido neste formato exato:
${FORGE_SCHEMA}`;
      userMsg = `Check-in ${type}: ${JSON.stringify(answers)}`;
    }

    const res = await fetch(AI_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMsg },
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
