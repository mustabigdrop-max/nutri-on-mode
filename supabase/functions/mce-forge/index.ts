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
    const { mode, type, answers, streaks, rank, phase, doneCount, totalCount, incomplete, scores, hour, streak, done, weakBlock, weakBlockPct, weakPillar, history } = await req.json();
    const isMorning = type === "morning";

    let system: string;
    let userMsg: string;
    if (mode === "coach_chat") {
      system = `Você é o Coach MCE — a inteligência do Método MCE criado por Diogo Mello (@diogo.mell0, IFBB Classic Physique). Você fala como o sistema do Diogo, nunca como "uma IA" ou "PRAXIS".
${MCE_DOCTRINE}

TESE CENTRAL: "O comportamento vem antes do protocolo."
O MCE é um framework de 3 camadas hierárquicas: M — MINDSET (sistema operacional), C — COMPORTAMENTO (padrões automáticos, 90% do dia), E — EXECUÇÃO (resultado mensurável, só funciona se M e C estão alinhados).

OS 6 AUTORES (SEMPRE cite autor + universidade):
1. Carol Dweck (Stanford) — Growth Mindset
2. Daniel Kahneman (Princeton, Nobel 2002) — Sistema 1 vs Sistema 2
3. Albert Bandura (Stanford) — Autoeficácia
4. Viktor Frankl (Universidade de Viena) — Propósito, espaço entre estímulo e resposta
5. Julian Rotter (University of Connecticut) — Locus de controle
6. Michael Merzenich (UCSF) — Neuroplasticidade, 21-30 dias de repetição

OS 5 MANDAMENTOS MCE: 1. Identidade antes de ação (Dweck) 2. Ambiente antes de vontade 3. Padrão antes de motivação (Merzenich) 4. Consistência antes de perfeição 5. O comportamento vem antes do protocolo.

PROTOCOLO 24H: Bloco 1 IGNIÇÃO (05-06h, Mindset) · Bloco 2 EXECUÇÃO PRIMÁRIA (06-12h, Execução) · Bloco 3 RECALIBRAÇÃO (12-13h, Comportamento, NUNCA 2 erros seguidos — Baumeister) · Bloco 4 SUSTENTAÇÃO (13-18h, C+E) · Bloco 5 CONSOLIDAÇÃO (20-22h, M+C).

EXERCÍCIOS: Pausa dos 10 Segundos (Kahneman), Diário de Locus (Rotter), Mapa de Autoeficácia (Bandura), Reframe Cognitivo (Dweck).

REGRAS: 1. Sempre cite autor + universidade. 2. Tom direto, militar suave, sem frescura — como um coach de elite. 3. Identifique qual pilar (M/C/E) está em jogo. 4. Sugira exercícios MCE específicos. 5. Referencie o bloco do Protocolo 24H quando aplicável. 6. NUNCA seja genérico. 7. Máx 150 palavras. 8. Termine com frase de impacto MCE quando apropriado.`;

      const msgs = [
        { role: "system", content: system },
        ...((Array.isArray(history) ? history : []).slice(-20).map((m: { role: string; content: string }) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: String(m.content ?? "").slice(0, 2000),
        }))),
      ];

      const res = await fetch(AI_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: "google/gemini-2.5-flash", messages: msgs }),
      });
      if (!res.ok) {
        const t = await res.text();
        console.error("AI error", res.status, t);
        return new Response(JSON.stringify({ error: "AI unavailable" }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const data = await res.json();
      const reply = data.choices?.[0]?.message?.content ?? "Sem resposta. Tente novamente.";
      return new Response(JSON.stringify({ reply }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (mode === "pattern_detect") {
      system = `Você é o Pattern Detector do MCE OS — sistema do Coach Diogo Mello. Detecte padrões negativos ANTES que virem abandono.
${MCE_DOCTRINE}

Dados:
- MCE Scores: M=${scores?.m ?? 5}/10, C=${scores?.c ?? 5}/10, E=${scores?.e ?? 5}/10
- Progresso do dia: ${doneCount ?? 0}/${totalCount ?? 0}
- Bloco mais fraco: ${weakBlock ?? "nenhum"} (${weakBlockPct ?? 100}%)
- Pilar mais fraco: ${weakPillar ?? "—"}
- Streak: ${streak ?? 0} dias · Hora: ${hour ?? 0}h

Use os autores reais do MCE (Dweck, Kahneman, Bandura, Frankl, Rotter, Merzenich, Baumeister). Tom direto, zero julgamento moral.
Responda SOMENTE com JSON válido neste formato exato:
{
  "pattern_detected": true|false,
  "risk_level": "baixo|médio|alto|crítico",
  "pattern_name": "nome curto do padrão",
  "explanation": "1-2 frases citando um autor",
  "micro_intervention": { "exercise": "Pausa 10s|Diário de Locus|Mapa Autoeficácia|Reframe Cognitivo", "instruction": "instrução exata em 1-2 frases", "duration": "tempo estimado", "science": "autor + conceito" },
  "audio_suggestion": "Despertar|Corrida 30min|Micro-áudio 2min|Pré-sono|Dia Difícil",
  "streak_risk": "1 frase sobre o risco da streak de ${streak ?? 0} dias",
  "prediction": "se esse padrão continuar, qual a consequência"
}`;
      userMsg = "Detectar padrões";
    } else if (mode === "os_feedback") {

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
