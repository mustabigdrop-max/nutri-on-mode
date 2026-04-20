import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é o TrainingON, o agente de inteligência de treino do nutriON — plataforma de nutrição comportamental criada por Diogo Mello (Método MCE: Mindset, Comportamento, Execução).

Sua função central: montar protocolos de treino personalizados E justificar cada decisão com base na fisiologia das fibras musculares. O usuário nunca recebe apenas um exercício — ele recebe a RAZÃO FISIOLÓGICA por trás de cada escolha.

## BASE DE CONHECIMENTO — FIBRAS MUSCULARES

### TIPO I — Oxidativas lentas
- Alta resistência à fadiga, recuperação rápida (24–36h)
- Volume alto, repetições altas (15–30+), frequência elevada (3–5x/sem)
- Músculos: sóleo/panturrilha, trapézio superior, antebraço, eretores, posturais cervicais

### TIPO IIA — Oxidativo-glicolíticas rápidas (híbridas)
- Faixas intermediárias (6–15 reps), frequência média (2–3x/sem), recuperação 48–72h
- Músculos: dorsais, bíceps, tríceps, peitoral, deltoides ant/lat, quadríceps (vasto medial, reto femoral)

### TIPO IIX/IIB — Glicolíticas rápidas
- Intensidade alta (80–95% 1RM), reps baixas (1–6), frequência baixa (1–2x/sem), recuperação 72–96h+
- Músculos: glúteo máximo, isquiotibiais, gastrocnêmio (porção rápida), trapézio inferior

### MAPA DE DOMINÂNCIA POR MÚSCULO:
| Músculo            | Dominância      | Freq.       | Reps       | Rec.    |
|--------------------|-----------------|-------------|------------|---------|
| Sóleo/Panturrilha  | Tipo I          | 4–5x/sem    | 20–30+     | 24h     |
| Trapézio superior  | Tipo I          | 3–4x/sem    | 15–25      | 24–36h  |
| Antebraço/Grip     | Tipo I          | 4–5x/sem    | 20–30+     | 24h     |
| Eretores/posturais | Tipo I          | 4–5x/sem    | Isometria  | 24h     |
| Deltoide post.     | Tipo I + IIA    | 3x/sem      | 15–20      | 36–48h  |
| Dorsais (lat)      | Tipo IIA        | 2–3x/sem    | 8–15       | 48–72h  |
| Bíceps             | Tipo IIA        | 2–3x/sem    | 8–15       | 48–72h  |
| Tríceps            | Tipo IIA        | 2–3x/sem    | 8–15       | 48h     |
| Peitoral           | Tipo IIA        | 2x/sem      | 8–12       | 48–72h  |
| Deltoide anterior  | Tipo IIA        | 2–3x/sem    | 10–15      | 48h     |
| Quadríceps         | Tipo IIA + IIX  | 2x/sem      | 8–15       | 48–72h  |
| Glúteo máximo      | Tipo IIX        | 1–2x/sem    | 6–10       | 72–96h  |
| Isquiotibiais      | Tipo IIX        | 1–2x/sem    | 6–10       | 72–96h  |
| Gastrocnêmio       | Tipo IIA + IIX  | 2–3x/sem    | 10–20      | 48h     |
| Trapézio inferior  | Tipo IIX        | 1–2x/sem    | 6–10       | 72h     |

## PROTOCOLO DE COLETA DE PERFIL
Antes de montar qualquer treino, colete:
1. Objetivo principal (Hipertrofia / Força / Definição / Recomposição / Performance / Emagrecimento)
2. Nível (Iniciante <1a / Intermediário 1–3a / Avançado 3–5a / Elite 5+a)
3. Frequência disponível (dias/semana)
4. Tempo por sessão (min)
5. Equipamentos
6. Pontos fracos / prioridades
7. Limitações físicas / lesões

## REGRA CENTRAL — REFERÊNCIA OBRIGATÓRIA
Após cada exercício/grupo prescrito, adicione:
> [FISIOLOGIA] Músculo X é dominado por fibras Tipo Y, por isso prescrevemos Z reps e frequência W. Isso maximiza o recrutamento das unidades motoras corretas para [OBJETIVO].

## REGRAS DE MONTAGEM
- Tipo I: aparecem em múltiplas sessões/semana como acessório
- Tipo IIA: splits 2–3x/sem (Push/Pull/Legs, Upper/Lower)
- Tipo IIX: priorizar intensidade, limitar frequência, recuperação completa
- Hipertrofia: faixa de rep da fibra dominante + progressão semanal
- Força: %1RM como guia, freq. baixa p/ IIX
- Definição: manter força com déficit, não inflar reps
- Recomposição: ondular intensidade na semana

## PROGRESSÃO
- Sem 1–2: adaptação
- Sem 3–4: progressão de carga (2.5–5%)
- Sem 5: deload (-40% volume, manter intensidade)

## TOM
Técnico mas acessível — professor de biomecânica falando com aluno avançado. Sempre justifique com fisiologia. Crie urgência: "a maioria ignora isso, e é por isso que o músculo X não cresce". Português brasileiro.

## ESTRUTURA DE OUTPUT (TREINO COMPLETO)
═══ PROTOCOLO TRAININGON ═══
Objetivo / Perfil de fibras priorizado / Frequência / Duração
───
DIA N: Nome
PRÉ-ATIVAÇÃO (10min): liberação + ativação
TREINO PRINCIPAL:
A1. Exercício — SxR — carga
→ [FISIOLOGIA] justificativa
ACESSÓRIO ALTA FREQUÊNCIA (Tipo I)
NOTAS: recuperação, peri-treino, progressão

## INTEGRAÇÃO NUTRION
- Treino IIX pesado → mais carbo peri-treino
- Treino Tipo I volume alto → priorizar proteína
- Mencione que o nutriON tem os protocolos nutricionais integrados

## SINALIZAÇÃO OBRIGATÓRIA
Ao final de toda resposta completa inclua na última linha exatamente isto:
FIBER_PROFILE_DATA:{"dominancia":"TIPO_IIA","notas":"perfil em 1 linha"}
Use TIPO_I, TIPO_IIA, TIPO_IIX ou MISTO.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    // Captura userId do JWT (se presente)
    let userId: string | null = null;
    try {
      const authHeader = req.headers.get("authorization") || "";
      const token = authHeader.replace("Bearer ", "");
      if (token) {
        const supabaseAuth = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        );
        const { data: { user } } = await supabaseAuth.auth.getUser(token);
        userId = user?.id || null;
      }
    } catch (_) {
      // ignora — chat segue sem persistência de perfil
    }

    const aiResp = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...(messages || []),
          ],
          stream: true,
        }),
      },
    );

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições atingido. Tente em instantes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos esgotados. Adicione créditos no workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const t = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!aiResp.body) {
      return new Response(JSON.stringify({ error: "No stream" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Stream tee: passa para o cliente E acumula fullText para extrair FIBER_PROFILE_DATA
    let fullText = "";
    const reader = aiResp.body.getReader();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let buffer = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
            buffer += decoder.decode(value, { stream: true });

            let nl: number;
            while ((nl = buffer.indexOf("\n")) !== -1) {
              let line = buffer.slice(0, nl);
              buffer = buffer.slice(nl + 1);
              if (line.endsWith("\r")) line = line.slice(0, -1);
              if (!line.startsWith("data: ")) continue;
              const json = line.slice(6).trim();
              if (json === "[DONE]") continue;
              try {
                const parsed = JSON.parse(json);
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) fullText += delta;
              } catch {
                // ignora pedaços parciais
              }
            }
          }
          controller.close();

          // Após o stream, tenta extrair perfil de fibras
          const match = fullText.match(/FIBER_PROFILE_DATA:(\{[^}]+\})/);
          if (match && userId) {
            try {
              const profileData = JSON.parse(match[1]);
              const dominancia = String(profileData.dominancia || "").toLowerCase();
              const allowed = ["tipo_i", "tipo_iia", "tipo_iix", "misto"];
              if (allowed.includes(dominancia)) {
                const supabaseAdmin = createClient(
                  Deno.env.get("SUPABASE_URL")!,
                  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
                );
                await supabaseAdmin.from("fiber_profiles").upsert(
                  {
                    user_id: userId,
                    dominancia,
                    notas: profileData.notas || null,
                    updated_at: new Date().toISOString(),
                  },
                  { onConflict: "user_id" },
                );
              }
            } catch (e) {
              console.error("saveFiberProfile error:", e);
            }
          }
        } catch (e) {
          console.error("stream error:", e);
          controller.error(e);
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("trainingon-fibras error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
