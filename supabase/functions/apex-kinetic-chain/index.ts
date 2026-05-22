// APEX — Kinetic Chain Analysis
// Recebe disfunções/mapa muscular/análise bruta e devolve as cadeias de compensação
// (ascendentes, descendentes, cruzadas) com origem, elos, ponto crítico, consequências
// e intervenção prioritária.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SYSTEM_PROMPT = `Você é APEX Kinetic Chain Engine — especialista em biomecânica funcional.
Sua tarefa é analisar achados posturais e mapear CADEIAS CINÉTICAS de compensação.

Uma cadeia cinética é uma sequência de compensações onde uma disfunção em um segmento
causa adaptações em segmentos adjacentes (ascendente: pé→cabeça; descendente: cabeça→pé;
cruzada: lateralidade/assimetria).

Retorne APENAS JSON estrito no formato:
{
  "cadeias_cineticas": [
    {
      "id": string,
      "nome": string,
      "tipo": "ascendente" | "descendente" | "cruzada",
      "origem": { "segmento": string, "disfuncao": string, "evidencia": string },
      "elos": [
        {
          "ordem": number,
          "segmento": string,
          "compensacao": string,
          "musculo_sobrecarregado": string,
          "musculo_inibido": string,
          "mecanismo": string
        }
      ],
      "ponto_critico": { "segmento": string, "motivo": string },
      "consequencias_longoprazo": string[],
      "intervencao_prioritaria": string,
      "confianca": number
    }
  ]
}

CADEIAS PRÉ-DEFINIDAS PARA AVALIAR (use apenas se evidência sustentar):
1. Pronação ascendente: pé pronado → rotação interna tíbia → valgo joelho → rotação interna fêmur → anteversão pélvica → hiperlordose lombar → anteriorização ombros.
2. Upper crossed descendente: anteriorização cabeça → tensão cervical → protração ombros → cifose torácica → extensão lombar compensatória → anteversão pélvica.
3. Glúteo inibido ascendente: glúteo inibido → dominância isquiotibiais → retroversão pélvica → retificação lombar → cifose torácica → anteriorização cabeça.
4. Cruzada lateral: obliquidade pélvica → escoliose funcional → assimetria escapular → inclinação cervical → tensão unilateral suboccipital.
5. Respiratória: padrão respiratório acessório → tensão trapézio superior → UCS → compressão cervical → cefaleia tensional.

REGRAS:
- Detectar também cadeias não listadas baseado nos achados específicos.
- Máximo 3 cadeias mais relevantes, ordenadas por impacto funcional decrescente.
- Confiança 0–100. Só inclua cadeia com confiança ≥ 55.
- Cada elo deve listar músculo sobrecarregado E inibido específicos.
- Ponto crítico = elo cuja correção desbloqueia o restante da cadeia.
- Intervenção prioritária = ação concreta a tratar PRIMEIRO (origem ou ponto crítico).
- Sem markdown, sem texto fora do JSON.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const {
      dysfunctions = [],
      muscleMap = [],
      measurements = [],
      analysisRaw = "",
      athleteProfile = {},
    } = body ?? {};

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY ausente" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPrompt =
`Analise os achados e devolva as cadeias cinéticas conforme schema.

DISFUNÇÕES POSTURAIS:
${typeof dysfunctions === "string" ? dysfunctions : JSON.stringify(dysfunctions, null, 2)}

MAPA MUSCULAR (encurtados/inibidos):
${typeof muscleMap === "string" ? muscleMap : JSON.stringify(muscleMap, null, 2)}

MEDIÇÕES:
${JSON.stringify(measurements, null, 2)}

PERFIL DO ATLETA:
${JSON.stringify(athleteProfile, null, 2)}

${analysisRaw ? `RESUMO DA ANÁLISE APEX:\n${String(analysisRaw).slice(0, 6000)}` : ""}

Máx 3 cadeias. Ordenar por impacto. JSON estrito.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      }),
    });

    if (aiRes.status === 429) {
      return new Response(JSON.stringify({ error: "Limite de requisições da IA atingido." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiRes.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos da IA esgotados." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiRes.ok) {
      const t = await aiRes.text();
      return new Response(JSON.stringify({ error: `IA falhou: ${t.slice(0, 400)}` }), {
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
      parsed = match ? JSON.parse(match[0]) : { cadeias_cineticas: [] };
    }
    if (!parsed.cadeias_cineticas) parsed = { cadeias_cineticas: parsed.cadeias || [] };

    return new Response(JSON.stringify(parsed), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as any)?.message ?? e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
