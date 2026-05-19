// APEX — Plano Mestre de Evolução (geração em etapas)
// Modo 1 (legado): single-shot, retorna { plano_mestre: {...} }
// Modo 2 (staged): body.step ∈ {1,2,3}, retorna apenas o fragmento da etapa
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const BASE_RULES = `DIRETRIZES:
Duração por FCS:
- 0-40 (crítico): 16 semanas (4 fases: 3+3+4+6)
- 41-65 (atenção): 12 semanas (3 fases: 3+3+6, sem Integração isolada)
- 66-80 (adequado): 8 semanas (2 fases: Ativação 4 + Integração 4)
- 81-100 (ótimo): 4 semanas (1 fase: Manutenção)

Estrutura padrão:
FASE 1: INIBIÇÃO PURA — liberar dominantes, 3-4x/sem, 20-30min.
FASE 2: ELONGAÇÃO — alongamentos pós-inibição, 3-4x/sem, 30-40min.
FASE 3: ATIVAÇÃO NEURAL — ativação dos inibidos, carga baixa, 3-4x/sem, 40-50min.
FASE 4: INTEGRAÇÃO — padrão corrigido no treino, progressão de carga.

Cada semana detalhada DEVE ter no mínimo 3 exercícios prioritários.
Cada semana DEVE ter progressão clara, marcador mensurável e sinal verde específico.

CADEIAS CINÉTICAS (quando informadas):
- TRATAR ORIGEM PRIMEIRO (prioridade 1 nos exercícios).
- Avisar em cue/o_que_evitar quando ativação de um elo depende de origem.
- Protocolo em onda para cadeias 4+ elos.`;

const TERSE = `Seja direto e objetivo. Retorne APENAS o JSON solicitado. Sem markdown, sem texto antes/depois do JSON, sem explicações. Se necessário, resuma exercícios para caber no limite de tokens.`;

const SCHEMA_FASE = `{
  "numero": number, "nome": string, "semanas": string, "duracao_semanas": number,
  "foco_principal": string, "descricao": string, "objetivo_da_fase": string, "criterio_de_avanco": string,
  "semanas_detalhadas": [{
    "semana": number, "titulo": string, "foco": string,
    "sessoes_por_semana": number, "duracao_sessao_minutos": number,
    "exercicios_prioritarios": [{ "nome": string, "fase_corretiva": number, "series": string, "reps_ou_tempo": string, "cue_principal": string, "progressao_semana_seguinte": string }],
    "o_que_evitar_essa_semana": [string], "marcador_de_progresso": string, "sinal_verde_para_avancar": string
  }],
  "integracao_treino_principal": { "quando_iniciar": string, "como_integrar": string, "exercicios_liberados": [string], "exercicios_ainda_contraindicados": [string] },
  "metricas_de_sucesso": [{ "metrica": string, "baseline": string, "meta_da_fase": string, "como_medir": string }]
}`;

const SCHEMA_STEPS: Record<number, string> = {
  1: `{
  "titulo": string, "duracao_total_semanas": number,
  "objetivo_principal": string, "objetivos_secundarios": [string], "premissa": string,
  "fase1": ${SCHEMA_FASE}
}`,
  2: `{ "fase2": ${SCHEMA_FASE}, "fase3": ${SCHEMA_FASE} }`,
  3: `{
  "fase4": ${SCHEMA_FASE},
  "cronograma_visual": { "semana_1_4": string, "semana_5_8": string, "semana_9_12": string, "semana_13_16": string },
  "regras_globais": [string],
  "sinais_de_alarme": [{ "sinal": string, "acao": string, "urgencia": "baixa"|"media"|"alta" }],
  "recheck_apex": { "quando": string, "o_que_avaliar": [string], "expectativa_de_melhora": string }
}`,
};

const STEP_INSTRUCTIONS: Record<number, string> = {
  1: `Gere apenas: cabeçalho (titulo/duracao/objetivos/premissa) + FASE 1 (Inibição) completa com semanas detalhadas. Se FCS ≥ 81 ou houver só 1 fase, retorne a única fase em "fase1" e marque duracao_total_semanas = duração dessa fase.`,
  2: `Gere apenas FASE 2 (Elongação) e FASE 3 (Ativação Neural) com semanas detalhadas. Se essas fases não existem para este FCS, retorne objetos vazios {"fase2":null,"fase3":null}.`,
  3: `Gere apenas FASE 4 (Integração) + cronograma_visual + regras_globais + sinais_de_alarme + recheck_apex. Se não houver FASE 4 para este FCS, retorne {"fase4":null,...} preenchendo o restante.`,
};

const SINGLE_SYSTEM_PROMPT = `Você é o APEX Master Planner. Retorne APENAS JSON válido { "plano_mestre": {...} } com fases periodizadas executáveis.
${BASE_RULES}`;

function buildUserPrompt(payload: any, step?: number, prev?: any, simplified?: boolean): string {
  const { dysfunctions = [], muscleMap = [], fcsScore = null, athleteProfile = {}, goal = "", analysisRaw = "", kineticChains = [] } = payload ?? {};
  const ctx = `DISFUNÇÕES:\n${JSON.stringify(dysfunctions)}\nMAPA MUSCULAR:\n${JSON.stringify(muscleMap)}\nFCS: ${fcsScore ?? "—"}\nPERFIL: ${JSON.stringify(athleteProfile)}\nOBJETIVO: ${goal || "—"}\n${Array.isArray(kineticChains) && kineticChains.length ? `CADEIAS CINÉTICAS:\n${JSON.stringify(kineticChains)}\n` : ""}${analysisRaw ? `RESUMO APEX:\n${String(analysisRaw).slice(0, 4000)}` : ""}`;

  if (!step) {
    return `${ctx}\n\nRetorne o JSON conforme schema completo.`;
  }

  const prevCtx = prev ? `\nCONTEXTO JÁ GERADO (mantenha coerência, NÃO repita):\n${JSON.stringify(prev).slice(0, 3000)}\n` : "";
  const simp = simplified ? `\nMODO RESUMIDO: máximo 3 semanas detalhadas por fase. Priorize clareza.\n` : "";

  return `${TERSE}\n\n${ctx}\n${prevCtx}${simp}\nETAPA ${step}: ${STEP_INSTRUCTIONS[step]}\n\nRetorne EXATAMENTE o JSON neste schema:\n${SCHEMA_STEPS[step]}`;
}

async function callAI(systemPrompt: string, userPrompt: string, maxTokens: number, apiKey: string, signal?: AbortSignal) {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    signal,
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      response_format: { type: "json_object" },
      temperature: 0,
      max_tokens: maxTokens,
    }),
  });
  return res;
}

function parseJson(raw: any): any {
  try { return typeof raw === "string" ? JSON.parse(raw) : raw; }
  catch {
    const m = String(raw).match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : null;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const step: number | undefined = body?.step;
    const prev = body?.prev;
    const simplified = !!body?.simplified;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY ausente" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Modo staged
    if (step && [1, 2, 3].includes(step)) {
      const sysPrompt = `Você é o APEX Master Planner — gera plano corretivo periodizado em etapas.\n${BASE_RULES}\n${TERSE}`;
      const userPrompt = buildUserPrompt(body, step, prev, simplified);
      const maxTokens = step === 3 ? 1500 : 1800;

      const aiRes = await callAI(sysPrompt, userPrompt, maxTokens, LOVABLE_API_KEY);
      if (aiRes.status === 429) return new Response(JSON.stringify({ error: "Limite de IA atingido." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiRes.status === 402) return new Response(JSON.stringify({ error: "Créditos da IA esgotados." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (!aiRes.ok) {
        const t = await aiRes.text();
        return new Response(JSON.stringify({ error: `IA falhou: ${t}` }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const aiJson = await aiRes.json();
      const raw = aiJson?.choices?.[0]?.message?.content ?? "{}";
      const parsed = parseJson(raw) ?? {};
      return new Response(JSON.stringify({ step, data: parsed }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Modo legado (single-shot) — mantém compatibilidade
    const userPrompt = buildUserPrompt(body);
    const aiRes = await callAI(SINGLE_SYSTEM_PROMPT, userPrompt, 4000, LOVABLE_API_KEY);
    if (aiRes.status === 429) return new Response(JSON.stringify({ error: "Limite de IA atingido." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (aiRes.status === 402) return new Response(JSON.stringify({ error: "Créditos da IA esgotados." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!aiRes.ok) {
      const t = await aiRes.text();
      return new Response(JSON.stringify({ error: `IA falhou: ${t}` }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const aiJson = await aiRes.json();
    const raw = aiJson?.choices?.[0]?.message?.content ?? "{}";
    let parsed: any = parseJson(raw) ?? {};
    if (parsed && !parsed.plano_mestre && parsed.titulo) parsed = { plano_mestre: parsed };
    return new Response(JSON.stringify(parsed), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as any)?.message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
