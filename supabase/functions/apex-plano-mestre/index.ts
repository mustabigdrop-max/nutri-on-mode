// APEX — Plano Mestre de Evolução
// Gera plano periodizado em 4 fases (Inibição → Elongação → Ativação → Integração)
// baseado nos achados da análise APEX (disfunções, mapa muscular, FCS, perfil, objetivo).
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SYSTEM_PROMPT = `Você é o APEX Master Planner — sistema que transforma achados de análise postural/clínica em um Plano Mestre de Evolução periodizado e EXECUTÁVEL pelo coach.

Retorne APENAS JSON válido no formato exato abaixo (sem markdown, sem texto fora do JSON):
{
  "plano_mestre": {
    "titulo": string,
    "duracao_total_semanas": number,
    "objetivo_principal": string,
    "objetivos_secundarios": string[],
    "premissa": string,
    "fases": [
      {
        "numero": number,
        "nome": string,
        "semanas": string,
        "duracao_semanas": number,
        "foco_principal": string,
        "descricao": string,
        "objetivo_da_fase": string,
        "criterio_de_avanco": string,
        "semanas_detalhadas": [
          {
            "semana": number,
            "titulo": string,
            "foco": string,
            "sessoes_por_semana": number,
            "duracao_sessao_minutos": number,
            "exercicios_prioritarios": [
              {
                "nome": string,
                "fase_corretiva": number,
                "series": string,
                "reps_ou_tempo": string,
                "cue_principal": string,
                "progressao_semana_seguinte": string
              }
            ],
            "o_que_evitar_essa_semana": string[],
            "marcador_de_progresso": string,
            "sinal_verde_para_avancar": string
          }
        ],
        "integracao_treino_principal": {
          "quando_iniciar": string,
          "como_integrar": string,
          "exercicios_liberados": string[],
          "exercicios_ainda_contraindicados": string[]
        },
        "metricas_de_sucesso": [
          { "metrica": string, "baseline": string, "meta_da_fase": string, "como_medir": string }
        ]
      }
    ],
    "cronograma_visual": {
      "semana_1_4": string, "semana_5_8": string, "semana_9_12": string, "semana_13_16": string
    },
    "regras_globais": string[],
    "sinais_de_alarme": [
      { "sinal": string, "acao": string, "urgencia": "baixa"|"media"|"alta" }
    ],
    "recheck_apex": {
      "quando": string,
      "o_que_avaliar": string[],
      "expectativa_de_melhora": string
    }
  }
}

DIRETRIZES OBRIGATÓRIAS:

Duração por severidade (FCS):
- 0-40 (crítico): 16 semanas
- 41-65 (atenção): 12 semanas
- 66-80 (adequado): 8 semanas
- 81-100 (ótimo): 4 semanas de manutenção

Estrutura padrão das fases:
FASE 1 (semanas 1-3): INIBIÇÃO PURA — liberar dominantes, sem ativação ainda, 3-4x/semana, 20-30min.
FASE 2 (semanas 4-6): ELONGAÇÃO — alongamentos pós-inibição, ganho de amplitude, 3-4x/sem, 30-40min.
FASE 3 (semanas 7-10): ATIVAÇÃO NEURAL — ativação dos inibidos, carga baixa, foco neuromuscular, 3-4x/sem, 40-50min.
FASE 4 (semanas 11-16): INTEGRAÇÃO — padrão corrigido no treino, progressão de carga, corretivos como aquecimento obrigatório.

Para FCS alto (81+) reduza para uma única fase de manutenção (4 semanas).
Para FCS médio (66-80) use 2 fases (Ativação + Integração, 4+4).
Para FCS atenção (41-65) use 3 fases (Inibição + Elongação + Ativação, 3+3+6).
Para FCS crítico (0-40) use as 4 fases completas (3+3+4+6 = 16).

Cada semana detalhada DEVE ter no mínimo 3 exercícios prioritários com TODAS as variáveis preenchidas.
Cada semana DEVE ter progressão clara em relação à anterior, marcador mensurável e sinal verde específico.

Para atletas de palco (presença de SRI/competição): inclua fase de manutenção pré-competição e alerte que peak week não pode coincidir com deload corretivo.

REGRAS DE CADEIA CINÉTICA (quando "cadeias_cineticas" estiver presente no payload):
- TRATAR A ORIGEM PRIMEIRO: se a cadeia detectada tem origem específica (ex: pé pronado em cadeia ascendente), os exercícios para o segmento de origem sobem para PRIORIDADE 1 do plano, independentemente da severidade local.
- NÃO TRATAR ELOS SEM TRATAR A ORIGEM: se a ativação de um elo (ex: glúteo médio) é limitada pela disfunção da origem (ex: pronação do pé), inclua nos exercicios_prioritarios da semana correspondente um aviso explícito em "cue_principal" ou em "o_que_evitar_essa_semana" do tipo: "Ativação do glúteo médio será limitada enquanto a pronação do pé não for corrigida. Tratar tornozelo nas semanas 1-3 antes de progredir."
- PROTOCOLO EM ONDA para cadeias longas (4+ elos): organize fases/semanas progressivamente — semanas 1-2 origem, 3-4 elo 2, 5-6 elo 3, 7-8 integração global; ajuste totais conforme severidade.
- Registre as cadeias usadas em "regras_globais" como: "Cadeia X (tipo): origem→...→último elo. Tratar origem primeiro."
- O ponto crítico da cadeia deve receber atenção reforçada na fase mais apropriada (geralmente Ativação ou Integração).

Seja EXTREMAMENTE detalhado. O coach deve executar o plano inteiro sem precisar de outra fonte.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const {
      dysfunctions = [],
      muscleMap = [],
      fcsScore = null,
      athleteProfile = {},
      goal = "",
      analysisRaw = "",
    } = body ?? {};

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY ausente" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPrompt =
`Com base nos achados abaixo, construa o PLANO MESTRE DE EVOLUÇÃO conforme schema.

DISFUNÇÕES DETECTADAS:
${JSON.stringify(dysfunctions, null, 2)}

MAPA MUSCULAR (encurtados/inibidos):
${JSON.stringify(muscleMap, null, 2)}

FCS SCORE: ${fcsScore ?? "—"}

PERFIL DO ATLETA:
${JSON.stringify(athleteProfile, null, 2)}

OBJETIVO PRINCIPAL: ${goal || "—"}

${analysisRaw ? `RESUMO DA ANÁLISE APEX:\n${String(analysisRaw).slice(0, 8000)}` : ""}

Retorne o JSON conforme schema, com cada semana detalhada e executável.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (aiRes.status === 429) {
      return new Response(JSON.stringify({ error: "Limite de requisições da IA atingido. Tente novamente em instantes." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiRes.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos da IA esgotados. Adicione saldo no workspace Lovable." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiRes.ok) {
      const t = await aiRes.text();
      return new Response(JSON.stringify({ error: `IA falhou: ${t}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiRes.json();
    const raw = aiJson?.choices?.[0]?.message?.content ?? "{}";
    let parsed: any;
    try {
      parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      const match = String(raw).match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : { plano_mestre: null, error: "Resposta inválida da IA" };
    }

    // Se a IA retornou o objeto direto sem o wrapper, normaliza
    if (parsed && !parsed.plano_mestre && parsed.titulo) {
      parsed = { plano_mestre: parsed };
    }

    return new Response(JSON.stringify(parsed), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as any)?.message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
