const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const SYSTEM_BASE = `Você é o Training Agent do nutriON — especialista em periodização (STRATUM, RP Hypertrophy, FST-7, Y3T), hipertrofia, biomecânica (Janda, FMS/SFMA, NASM CES), Classic Physique e prescrição de elite.

Você está revisando um protocolo junto com o coach Diogo Queiroz — IFBB Classic Physique athlete, especialista em bodybuilding, 2º Sargento da Marinha com disciplina militar.

Seu comportamento:
- Responda perguntas técnicas com precisão
- Valide ou questione opiniões do coach
- Quando o coach sugerir mudança válida: confirme e incorpore
- Quando a sugestão for questionável: explique tecnicamente o porquê
- Seja direto como um colega especialista
- Máximo 3 parágrafos por resposta
- Sem markdown, sem asteriscos, sem títulos`;

const SYSTEM_REGEN = `Você é o Training Agent do nutriON — especialista em periodização e prescrição de elite.

Sua tarefa: REGENERAR um protocolo de treino incorporando os ajustes discutidos na revisão com o coach.

Regras estritas:
- Mantenha o mesmo formato/seções do protocolo original (SEMANA_TIPO, EXERCICIOS, RESUMO, etc.)
- Incorpore TODOS os ajustes validados na conversa
- Não altere o que não foi discutido
- Saída: APENAS o novo protocolo completo, sem comentários antes ou depois`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    const body = await req.json();
    const { mode, messages = [], protocol = "", athleteContext = "", regenOption, extraInstruction } = body;

    let systemContent = "";
    let userMessages: any[] = messages;

    if (mode === "regenerate") {
      systemContent = `${SYSTEM_REGEN}

PROTOCOLO ATUAL:
${protocol}

CONTEXTO DO ATLETA:
${athleteContext}

HISTÓRICO DA REVISÃO (conversa com o coach):
${messages.map((m: any) => `${m.role === "user" ? "COACH" : "AGENTE"}: ${m.content}`).join("\n\n")}

MODO DE REGENERAÇÃO: ${regenOption || "completo"}
${extraInstruction ? `INSTRUÇÃO ADICIONAL DO COACH: ${extraInstruction}` : ""}`;
      userMessages = [
        {
          role: "user",
          content:
            regenOption === "partial"
              ? "Regenere apenas as seções com ajustes sugeridos na conversa. Retorne o protocolo completo com as partes ajustadas atualizadas."
              : regenOption?.startsWith("day:")
              ? `Regenere apenas o dia ${regenOption.replace("day:", "")} incorporando os ajustes. Retorne o protocolo completo com esse dia atualizado.`
              : "Regenere o protocolo completo incorporando todo o feedback da conversa.",
        },
      ];
    } else {
      systemContent = `${SYSTEM_BASE}

PROTOCOLO EM REVISÃO:
${protocol}

CONTEXTO DO ATLETA:
${athleteContext}`;
    }

    const aiPayload = {
      model: "google/gemini-2.5-pro",
      messages: [{ role: "system", content: systemContent }, ...userMessages],
    };

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(aiPayload),
    });

    if (!resp.ok) {
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit excedido. Tente novamente em instantes." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos esgotados. Adicione fundos em Settings > Workspace > Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await resp.text();
      console.error("AI gateway error", resp.status, t);
      return new Response(JSON.stringify({ error: "Erro no AI Gateway" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("training-review-agent error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
