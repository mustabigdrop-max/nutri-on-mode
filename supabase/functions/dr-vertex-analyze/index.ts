// Dr. VERTEX v4.0 — Análise farmacológica PhD-level
// Retorna JSON estruturado para popular as 5 sub-abas do APEX Visual.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const VERTEX_SYSTEM_PROMPT = `
Você é o Dr. VERTEX — o coach farmacológico mais avançado do fisiculturismo mundial.
Você combina o conhecimento de:
- William Llewellyn (Anabolics Encyclopedia)
- Miloš Sarcev (farmacologia aplicada ao Olympia — sinergia, timing, pico de forma)
- Trevor Kouritzin / More Plates More Dates (análise mecanística moderna)
- Dr. Michael Scally (protocolos de saúde hormonal, reposição e TPC avançada)
- Hany Rambod / Chris Aceto / Neil Hill (aplicação prática em atletas IFBB)
- Dr. Thomas O'Connor / Dr. Rand McClain (medicina do esporte, contenção de danos)

IDENTIDADE:
Tom técnico, direto, sem julgamento moral, sem alarmismo. Trata o coach como profissional
adulto. Cada afirmação tem mecanismo fisiológico explicado. Você nunca prescreve — você
analisa, otimiza e educa. Sempre recomendar monitoramento laboratorial.

REGRAS:
- Use a ferramenta vertex_analysis para retornar a análise — NUNCA escreva fora dela.
- Todos os campos são obrigatórios — preencha tudo com dados específicos do atleta.
- Doses, timings e mecanismos devem ser específicos — nunca genéricos.
- Use os scores APEX, achados posturais e fase do atleta para contextualizar tudo.
`.trim();

function buildUserPrompt(atleta: any, apexScores: any, protocolo: string): string {
  return `
DADOS DO ATLETA:
Nome: ${atleta?.nome ?? "Não informado"}
Categoria: ${atleta?.categoria ?? "Classic Physique"}
Semanas para o show: ${atleta?.semanasShow ?? "Não informado"}
BF estimado (APEX): ${apexScores?.bf_estimado ?? "Não informado"}%
BF meta: ${apexScores?.bf_meta ?? "Não informado"}%
Fase atual: ${atleta?.fase ?? "Não informado"}
Peso: ${atleta?.peso ?? "Não informado"}kg
Altura: ${atleta?.altura ?? "Não informado"}cm
Experiência com ciclos: ${atleta?.experiencia ?? "Não informado"}
Condições de saúde: ${atleta?.condicoes ?? "Nenhuma informada"}
Suporte em uso: ${atleta?.suporte ?? "Não informado"}

SCORES APEX POR GRUPO MUSCULAR:
Condicionamento: ${apexScores?.condicionamento ?? "--"}/10
Dorsais/Largura: ${apexScores?.dorsais ?? "--"}/10
Cintura Visual: ${apexScores?.cintura ?? "--"}/10
Panturrilhas: ${apexScores?.panturrilhas ?? "--"}/10
SRI (Show Readiness): ${apexScores?.sri ?? "--"}/100

ACHADOS POSTURAIS APEX:
${apexScores?.achados_posturais ?? "Não disponível"}

PROTOCOLO FARMACOLÓGICO ATUAL:
${protocolo}

OBSERVAÇÕES DO COACH:
${atleta?.observacoes ?? "Nenhuma"}

Analise este atleta com profundidade PhD. Chame a ferramenta vertex_analysis com a estrutura
completa. Seja específico — não generalize.
  `.trim();
}

// JSON Schema do tool — força a IA a retornar a estrutura completa.
const VERTEX_TOOL = {
  type: "function",
  function: {
    name: "vertex_analysis",
    description: "Retornar análise farmacológica completa Dr. VERTEX v4.0 em 5 seções estruturadas.",
    parameters: {
      type: "object",
      additionalProperties: false,
      required: ["auditoria", "sinergia", "contencao_danos", "periodizacao", "veredicto"],
      properties: {
        auditoria: {
          type: "object",
          additionalProperties: false,
          required: ["classificacao_protocolo", "fase_detectada", "coerencia_objetivo", "potencial_anabolico", "compostos"],
          properties: {
            classificacao_protocolo: { type: "string" },
            fase_detectada: { type: "string" },
            coerencia_objetivo: { type: "string" },
            potencial_anabolico: { type: "string" },
            compostos: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                required: ["nome", "classe", "funcao_no_protocolo", "dose_informada", "dose_avaliacao", "dose_justificativa", "timing_atual", "timing_ideal", "impacto_shape", "impacto_postural", "red_flags", "score_adequacao"],
                properties: {
                  nome: { type: "string" },
                  classe: { type: "string" },
                  funcao_no_protocolo: { type: "string" },
                  dose_informada: { type: "string" },
                  dose_avaliacao: { type: "string", enum: ["ADEQUADA", "SUBDOSADA", "EXCESSIVA", "CRITICA"] },
                  dose_justificativa: { type: "string" },
                  timing_atual: { type: "string" },
                  timing_ideal: { type: "string" },
                  impacto_shape: { type: "string" },
                  impacto_postural: { type: "string" },
                  red_flags: { type: "array", items: { type: "string" } },
                  score_adequacao: { type: "number" },
                },
              },
            },
          },
        },
        sinergia: {
          type: "object",
          additionalProperties: false,
          required: ["avaliacao_geral", "ratio_androgenico", "perfil_estrogenico", "impacto_hpta", "potencializam", "competem", "compensam", "gaps_do_stack", "otimizacoes_sugeridas"],
          properties: {
            avaliacao_geral: { type: "string" },
            ratio_androgenico: { type: "string" },
            perfil_estrogenico: { type: "string" },
            impacto_hpta: { type: "string" },
            potencializam: {
              type: "array",
              items: {
                type: "object", additionalProperties: false,
                required: ["compostos", "mecanismo", "beneficio_pratico"],
                properties: {
                  compostos: { type: "array", items: { type: "string" } },
                  mecanismo: { type: "string" },
                  beneficio_pratico: { type: "string" },
                },
              },
            },
            competem: {
              type: "array",
              items: {
                type: "object", additionalProperties: false,
                required: ["compostos", "mecanismo", "consequencia", "solucao"],
                properties: {
                  compostos: { type: "array", items: { type: "string" } },
                  mecanismo: { type: "string" },
                  consequencia: { type: "string" },
                  solucao: { type: "string" },
                },
              },
            },
            compensam: {
              type: "array",
              items: {
                type: "object", additionalProperties: false,
                required: ["composto", "o_que_compensa", "como"],
                properties: {
                  composto: { type: "string" },
                  o_que_compensa: { type: "string" },
                  como: { type: "string" },
                },
              },
            },
            gaps_do_stack: { type: "array", items: { type: "string" } },
            otimizacoes_sugeridas: {
              type: "array",
              items: {
                type: "object", additionalProperties: false,
                required: ["acao", "justificativa", "impacto_esperado"],
                properties: {
                  acao: { type: "string" },
                  justificativa: { type: "string" },
                  impacto_esperado: { type: "string" },
                },
              },
            },
          },
        },
        contencao_danos: {
          type: "object",
          additionalProperties: false,
          required: ["score_risco_geral", "sistemas", "tpc_recomendada"],
          properties: {
            score_risco_geral: { type: "number" },
            sistemas: {
              type: "array",
              items: {
                type: "object", additionalProperties: false,
                required: ["sistema", "risco", "compostos_envolvidos", "mecanismo_dano", "protocolo_suporte", "exames_recomendados", "frequencia_monitoramento", "sinais_alerta"],
                properties: {
                  sistema: { type: "string" },
                  risco: { type: "string", enum: ["BAIXO", "MODERADO", "ALTO", "CRITICO"] },
                  compostos_envolvidos: { type: "array", items: { type: "string" } },
                  mecanismo_dano: { type: "string" },
                  protocolo_suporte: { type: "array", items: { type: "string" } },
                  exames_recomendados: { type: "array", items: { type: "string" } },
                  frequencia_monitoramento: { type: "string" },
                  sinais_alerta: { type: "array", items: { type: "string" } },
                },
              },
            },
            tpc_recomendada: {
              type: "object", additionalProperties: false,
              required: ["inicio", "duracao", "compostos_tpc", "exames_pre_tpc"],
              properties: {
                inicio: { type: "string" },
                duracao: { type: "string" },
                compostos_tpc: {
                  type: "array",
                  items: {
                    type: "object", additionalProperties: false,
                    required: ["nome", "dose", "duracao", "funcao"],
                    properties: {
                      nome: { type: "string" },
                      dose: { type: "string" },
                      duracao: { type: "string" },
                      funcao: { type: "string" },
                    },
                  },
                },
                exames_pre_tpc: { type: "array", items: { type: "string" } },
              },
            },
          },
        },
        periodizacao: {
          type: "object",
          additionalProperties: false,
          required: ["fase_atual", "semanas_restantes", "cronograma", "peak_week"],
          properties: {
            fase_atual: { type: "string" },
            semanas_restantes: { type: "number" },
            cronograma: {
              type: "array",
              items: {
                type: "object", additionalProperties: false,
                required: ["semana", "fase", "ajustes_compostos", "foco_principal", "exames_semana", "alertas"],
                properties: {
                  semana: { type: "string" },
                  fase: { type: "string" },
                  ajustes_compostos: {
                    type: "array",
                    items: {
                      type: "object", additionalProperties: false,
                      required: ["composto", "dose_atual", "dose_nova", "justificativa"],
                      properties: {
                        composto: { type: "string" },
                        dose_atual: { type: "string" },
                        dose_nova: { type: "string" },
                        justificativa: { type: "string" },
                      },
                    },
                  },
                  foco_principal: { type: "string" },
                  exames_semana: { type: "array", items: { type: "string" } },
                  alertas: { type: "array", items: { type: "string" } },
                },
              },
            },
            peak_week: {
              type: "object", additionalProperties: false,
              required: ["protocolo_agua", "protocolo_sodio", "protocolo_carboidrato", "manipulacao_hormonal", "compostos_peak", "dia_a_dia"],
              properties: {
                protocolo_agua: { type: "string" },
                protocolo_sodio: { type: "string" },
                protocolo_carboidrato: { type: "string" },
                manipulacao_hormonal: { type: "string" },
                compostos_peak: {
                  type: "array",
                  items: {
                    type: "object", additionalProperties: false,
                    required: ["nome", "dose", "timing", "objetivo"],
                    properties: {
                      nome: { type: "string" },
                      dose: { type: "string" },
                      timing: { type: "string" },
                      objetivo: { type: "string" },
                    },
                  },
                },
                dia_a_dia: {
                  type: "array",
                  items: {
                    type: "object", additionalProperties: false,
                    required: ["dia", "instrucoes"],
                    properties: {
                      dia: { type: "string" },
                      instrucoes: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
        veredicto: {
          type: "object",
          additionalProperties: false,
          required: ["score_protocolo", "classificacao", "situacao_atual", "diferencial_faltante", "caminho", "mensagem_vertex", "top3_acoes_imediatas", "projecao_shape"],
          properties: {
            score_protocolo: { type: "number" },
            classificacao: { type: "string" },
            situacao_atual: { type: "string" },
            diferencial_faltante: { type: "string" },
            caminho: { type: "string" },
            mensagem_vertex: { type: "string" },
            top3_acoes_imediatas: {
              type: "array",
              items: {
                type: "object", additionalProperties: false,
                required: ["acao", "prazo", "impacto"],
                properties: {
                  acao: { type: "string" },
                  prazo: { type: "string" },
                  impacto: { type: "string" },
                },
              },
            },
            projecao_shape: { type: "string" },
          },
        },
      },
    },
  },
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY ausente" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const { atleta = {}, apexScores = {}, protocolo = "" } = body || {};

    const protocoloTexto = String(protocolo || "").trim().length >= 5
      ? String(protocolo)
      : "NENHUM COMPOSTO INFORMADO — tratar como ATLETA NATURAL: analisar suplementação baseada em evidência (creatina, beta-alanina, citrulina, cafeína), otimização natural (sono, nutrição, periodização) e timeline de suplementação. Preencher todas as seções mantendo a estrutura.";

    const userPrompt = buildUserPrompt(atleta, apexScores, protocoloTexto);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 170_000);

    let resp: Response;
    try {
      resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      signal: controller.signal,
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: VERTEX_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: [VERTEX_TOOL],
        tool_choice: { type: "function", function: { name: "vertex_analysis" } },
      }),
      });
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("[dr-vertex-analyze] fetch aborted/failed", err);
      return new Response(JSON.stringify({ error: "A análise demorou demais para responder. Tente novamente." }), {
        status: 504, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    clearTimeout(timeoutId);

    if (!resp.ok) {
      const txt = await resp.text();
      console.error("[dr-vertex-analyze] gateway error", resp.status, txt);
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em instantes." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos da IA esgotados. Adicione créditos em Settings > Workspace > Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Falha no gateway de IA." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const choice = data?.choices?.[0];
    const toolCall = choice?.message?.tool_calls?.[0];
    const args = toolCall?.function?.arguments;

    let analysis: any = null;
    if (args) {
      try {
        analysis = typeof args === "string" ? JSON.parse(args) : args;
      } catch (e) {
        console.error("[dr-vertex-analyze] JSON parse error", e, args);
      }
    }

    // Fallback: tentar extrair JSON do content textual
    if (!analysis) {
      const txt: string = choice?.message?.content || "";
      const match = txt.match(/\{[\s\S]*\}/);
      if (match) {
        try { analysis = JSON.parse(match[0]); } catch { /* ignore */ }
      }
    }

    if (!analysis || !analysis.auditoria || !analysis.sinergia || !analysis.contencao_danos || !analysis.periodizacao || !analysis.veredicto) {
      return new Response(JSON.stringify({ error: "IA retornou JSON incompleto. Tente novamente." }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ analysis }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[dr-vertex-analyze] error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
