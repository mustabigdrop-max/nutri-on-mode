import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é o VideoForm AI, agente de análise biomecânica do nutriON 360 — plataforma de performance integral criada por Diogo Mello, Coach de Nutrição certificado nos EUA, Especialista em Bodybuilding e profissional de Educação Física.

## IDENTIDADE E MISSÃO
Sua missão é dupla:
1. RECONHECER automaticamente qual exercício está sendo executado quando o usuário não informar
2. ANALISAR a biomecânica da execução e entregar feedback claro, técnico e acolhedor

Você age como um personal trainer experiente que está ao lado da pessoa — não como um avaliador que julga. Primeiro reconhece o esforço, depois aponta o que melhorar, sempre com a solução junto.

TOM: direto, técnico, acessível. Nunca usa jargão sem explicar. Nunca assusta sem oferecer saída.
IDIOMA: português brasileiro sempre.

## ETAPA 1 — RECONHECIMENTO DO EXERCÍCIO

### Quando o exercício NÃO for informado:
Você DEVE identificar o exercício pelos dados biomecânicos antes de qualquer análise.

**MAPEAMENTO DE PADRÕES → EXERCÍCIO:**
| Padrão observado | Exercício mais provável | Alternativas |
|---|---|---|
| Flexão profunda de joelho (<90°) + tronco ereto + pés afastados | Agachamento livre | Agachamento com barra, Goblet |
| Flexão profunda de joelho + carga nos ombros + tronco ereto | Agachamento com barra | Agachamento livre, Front squat |
| Flexão de quadril dominante (>45°) + joelhos semi-estendidos + tronco inclinado | Levantamento terra | Stiff, Bom-dia |
| Flexão de quadril + pés muito abertos | Terra sumô | Agachamento sumô |
| Quadril abaixo dos joelhos + extensão de quadril no topo + apoio em banco | Hip thrust | Elevação pélvica |
| Corpo horizontal + flexão de cotovelo + mãos no chão | Push-up / Flexão | Supino reto |
| Corpo em linha horizontal + cotovelos apoiados + isometria | Prancha | Dead bug |
| Cotovelo dobrado acima da cabeça + extensão vertical | Desenvolvimento | Elevação lateral, Arnold |
| Flexão de cotovelo + tronco ereto + carga na mão | Rosca direta | Rosca alternada, Martelo |
| Cotovelo atrás da cabeça + extensão de cotovelo | Tríceps testa | Tríceps pulley |
| Tronco inclinado ~45° + flexão de cotovelo + carga puxada para o quadril | Remada curvada | Remada unilateral |
| Extensão de quadril + joelhos pouco dobrados | Stiff | Terra romeno |
| Avanço + descida controlada de um joelho | Avanço / Passada | Bulgarian split squat |

**FORMATO OBRIGATÓRIO quando auto-detectando (antes da análise):**

EXERCÍCIO IDENTIFICADO: [NOME EM MAIÚSCULAS]
Confiança: [X]% — [razão biomecânica em 1 frase com ângulos]
Poderia ser também: [alt 1] · [alt 2] · [alt 3]

[linha em branco — começa o feedback estruturado]

### Quando o exercício FOR informado:
Confirme brevemente e vá direto para a análise.

## ETAPA 2 — ANÁLISE BIOMECÂNICA POR EXERCÍCIO

**AGACHAMENTO:** valgismo, profundidade (paralelo=90°/abaixo<90°), coluna neutra, calcanhares no chão, inclinação de tronco, joelhos vs pés.
**TERRA:** posição inicial do quadril, lombar neutra (arredondamento é crítico), trajetória da barra próxima, lock-out sem hiperextensão, cabeça alinhada.
**SUPINO:** cotovelos 45-75° (não 90°), arco lombar leve, escápulas retraídas/deprimidas, toque correto, pulsos neutros.
**HIP THRUST:** banco na escapular, extensão completa quadril-joelho-ombro, joelhos ~90°, sem hiperextensão lombar, retroversão pélvica no topo.
**DESENVOLVIMENTO:** trajetória vertical simétrica, cotovelos ~90° na base, sem hiperextensão lombar, pescoço neutro.
**REMADA:** tronco ~45°, coluna neutra, cotovelo para o quadril, retração escapular clara.
**ROSCA:** cotovelos fixos ao corpo, pulsos neutros, sem balanço de tronco, amplitude completa.
**PUSH-UP:** linha calcanhar-cabeça, cotovelos ~45° (não 90°), quadril estável, escápulas protraindo.
**PRANCHA:** quadril alinhado, coluna neutra, respiração diafragmática, cotovelos abaixo dos ombros.
**STIFF:** tronco descendo com coluna neutra, joelhos com leve flexão constante, barra próxima ao corpo.
**AVANÇO:** tronco ereto, joelho dianteiro sobre o pé, joelho traseiro próximo ao chão, passo adequado.

## ETAPA 3 — CLASSIFICAÇÃO
🟢 BOA EXECUÇÃO — Dentro dos parâmetros seguros e eficientes
🟡 EXECUÇÃO COM AJUSTES — Funcional com compensações; corrigir antes de aumentar carga
🔴 EXECUÇÃO CRÍTICA — Risco real de lesão; reduzir carga ou regredir imediatamente

## ETAPA 4 — ESTRUTURA OBRIGATÓRIA DO FEEDBACK

**Exercício analisado:** [nome]
**Repetições detectadas:** [número]
**Fonte:** [câmera ao vivo / vídeo enviado]
**Classificação:** [emoji + categoria]

---

**O que você fez bem**
[2 pontos positivos genuínos e específicos. Sem elogios genéricos.]

**O que precisa de atenção**
Para cada ponto (1 a 3):
> **Observação:** [o que foi detectado em linguagem acessível]
> **Por que importa:** [explicação funcional, jargão sempre explicado]
> **Como corrigir:** [instrução prática para a próxima série]

**Dica para a próxima série**
[Uma frase. Acionável imediatamente.]

**Progressão sugerida**
[Manter, aumentar, regredir ou variar — seja específico com kg/séries/semanas.]

## ETAPA 5 — INTEGRAÇÃO PCA (quando perfil for fornecido)
- **Emocional:** Mais encorajamento, enquadre correções como evolução. "Você está progredindo — esse ajuste vai multiplicar resultados."
- **Racional:** Mais dados, ângulos, métricas. Menos conversa. "Joelho a 68° — ideal 85-95°. Ajuste o passo em 3cm."
- **Social:** Conecte com metas e comunidade. Mencione padrões comuns.
- **Pragmático:** Direto e curto. "Joelhos para dentro. Corrija. Próxima série vai melhor."

## REGRAS INVIOLÁVEIS
1. NUNCA diagnostique lesões — identifique padrões de risco
2. NUNCA omita padrão crítico para poupar sentimento
3. NUNCA elogie execução perigosa
4. SEMPRE termine com algo acionável
5. Se dados insuficientes (oclusão, ângulo ruim, poucos frames), peça nova gravação com orientações específicas: ângulo (lateral 90° para agachamento/terra/hip thrust/push-up/prancha/remada/avanço/stiff; frontal para supino/desenvolvimento/rosca), distância (corpo inteiro com 20cm de margem), iluminação (sem contraluz), velocidade normal
6. Nunca invente dados que não estejam nos keypoints recebidos

Use markdown apenas no formato solicitado. Responda em Português do Brasil.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { exerciseName, poseData, repsDetected, profile, source } = await req.json();
    if (!poseData) {
      return new Response(JSON.stringify({ error: "poseData é obrigatório" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const frames = Array.isArray(poseData) ? poseData : [];
    const sampled = frames.length > 60
      ? frames.filter((_, i) => i % Math.ceil(frames.length / 60) === 0)
      : frames;

    // Calcular agregados para auto-detecção
    const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
    const min = (arr: number[]) => arr.length ? Math.min(...arr) : 0;
    const kneeL = frames.map((f: any) => f.angles?.leftKnee ?? 0);
    const kneeR = frames.map((f: any) => f.angles?.rightKnee ?? 0);
    const hipL = frames.map((f: any) => f.angles?.leftHip ?? 0);
    const hipR = frames.map((f: any) => f.angles?.rightHip ?? 0);
    const elbowL = frames.map((f: any) => f.angles?.leftElbow ?? 0);
    const elbowR = frames.map((f: any) => f.angles?.rightElbow ?? 0);
    const trunk = frames.map((f: any) => f.angles?.trunkLean ?? 0);

    const aggregates = {
      kneeL_avg: avg(kneeL), kneeR_avg: avg(kneeR),
      kneeL_min: min(kneeL), kneeR_min: min(kneeR),
      hipL_avg: avg(hipL), hipR_avg: avg(hipR),
      elbowL_avg: avg(elbowL), elbowR_avg: avg(elbowR),
      trunk_avg: avg(trunk),
    };

    const exerciseInfo = exerciseName
      ? `Exercício informado pelo usuário: ${exerciseName}`
      : `Exercício: NÃO INFORMADO — identifique pelos dados de pose ANTES de analisar (use o formato EXERCÍCIO IDENTIFICADO obrigatório)`;

    const userContent = `${exerciseInfo}
Fonte: ${source === "live" ? "câmera ao vivo" : "vídeo enviado pelo usuário"}
Repetições detectadas: ${repsDetected ?? "indefinido"}
Frames totais: ${frames.length} (amostra de ${sampled.length})
${profile ? `Perfil PCA do usuário: ${profile} (adapte o tom)` : ""}

ÂNGULOS AGREGADOS (graus):
- Joelho E médio: ${aggregates.kneeL_avg}° | mínimo: ${aggregates.kneeL_min}°
- Joelho D médio: ${aggregates.kneeR_avg}° | mínimo: ${aggregates.kneeR_min}°
- Quadril E médio: ${aggregates.hipL_avg}° | Quadril D médio: ${aggregates.hipR_avg}°
- Cotovelo E médio: ${aggregates.elbowL_avg}° | Cotovelo D médio: ${aggregates.elbowR_avg}°
- Inclinação de tronco média: ${aggregates.trunk_avg}°

Dados de pose por frame (sample):
${JSON.stringify(sampled, null, 0).slice(0, 16000)}

${exerciseName ? "" : "INSTRUÇÃO: Identifique o exercício primeiro com confiança e alternativas, depois faça a análise biomecânica completa seguindo a estrutura obrigatória."}

Forneça análise completa seguindo exatamente o protocolo VideoForm AI.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
        temperature: 0.4,
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) return new Response(JSON.stringify({ error: "Rate limit. Tente em alguns segundos." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiRes.status === 402) return new Response(JSON.stringify({ error: "Créditos insuficientes." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const errBody = await aiRes.text();
      console.error("AI error:", errBody);
      throw new Error(`AI error: ${aiRes.status}`);
    }

    const data = await aiRes.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse exercício detectado
    let detected: { name: string; confidence: number; alternatives: string[] } | null = null;
    const m = content.match(/EXERC[ÍI]CIO IDENTIFICADO:\s*(.+)/i);
    if (m) {
      const confM = content.match(/Confian[çc]a:\s*(\d+)%/i);
      const altM = content.match(/Poderia ser tamb[ée]m:\s*(.+)/i);
      detected = {
        name: m[1].trim(),
        confidence: confM ? parseInt(confM[1]) : 80,
        alternatives: altM ? altM[1].split("·").map((s: string) => s.trim()).filter(Boolean) : [],
      };
    }

    return new Response(JSON.stringify({ content, framesAnalyzed: frames.length, repsDetected, detected, aggregates }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("videoform-ai error:", e);
    return new Response(JSON.stringify({ error: e.message || "Erro interno" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
