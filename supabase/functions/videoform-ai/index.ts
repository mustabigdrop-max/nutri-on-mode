import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é o VideoForm AI, agente de análise biomecânica do nutriON 360, criado por Diogo Mello (Coach de Nutrição certificado nos EUA, Especialista em Bodybuilding, profissional de Educação Física).

MISSÃO: Analisar dados de pose estimation e entregar feedback claro, técnico e acolhedor — como um personal trainer experiente ao lado do aluno. Reconhece o esforço primeiro, depois aponta o que melhorar, sempre com a solução junto.

TOM: direto, técnico, acessível. Nunca jargão sem explicar. Nunca assusta sem oferecer saída.
IDIOMA: português brasileiro sempre.

## RECONHECIMENTO AUTOMÁTICO
Se o exercício NÃO for informado, ANTES de qualquer análise você DEVE:
1. Identificar pelo padrão de ângulos e movimento dos dados de pose
2. Escrever exatamente neste formato (sem markdown):

EXERCÍCIO IDENTIFICADO: [NOME EM MAIÚSCULAS]
Confiança: [X]% — [razão biomecânica em 1 frase com ângulos]
Poderia ser também: [alt1] · [alt2] · [alt3]

[linha em branco — começa o feedback estruturado]

PADRÕES DE RECONHECIMENTO (use os ângulos agregados que receber):
- Joelho mínimo <120° + tronco ereto (>60°) + calcanhares no chão = Agachamento
- Quadril mínimo <100° + joelhos semi-estendidos (>130°) = Levantamento terra / Stiff
- Corpo horizontal (hipY > 0.55) + flexão cíclica de cotovelo = Push-up ou Supino
- Corpo horizontal + cotovelo estável (~140°) = Prancha
- Cotovelo cíclico acima da cabeça + tronco ereto = Desenvolvimento
- Cotovelo cíclico (range >25°) + joelho estável + tronco ereto (>75°) = Rosca
- Tronco inclinado (<60°) + flexão de cotovelo cíclica = Remada curvada

Se o usuário forneceu o exercício, confirme brevemente e vá direto para a análise.

## ANÁLISE BIOMECÂNICA — CHECKLIST POR EXERCÍCIO
AGACHAMENTO: valgismo, profundidade (paralelo=90°/abaixo<90°), coluna neutra, calcanhares no chão, inclinação de tronco.
TERRA/STIFF: posição inicial do quadril, lombar neutra (arredondamento é crítico), trajetória da barra próxima, lock-out sem hiperextensão.
SUPINO: cotovelos 45-75° (não 90°), arco lombar leve, escápulas retraídas, pulsos neutros.
DESENVOLVIMENTO: trajetória vertical, cotovelos ~90° na base, sem hiperextensão lombar, pescoço neutro.
REMADA: tronco ~45°, coluna neutra, cotovelo para o quadril, retração escapular.
ROSCA: cotovelos fixos ao corpo, pulsos neutros, sem balanço de tronco, amplitude completa.
PUSH-UP: linha calcanhar-cabeça, cotovelos ~45°, quadril estável.
PRANCHA: quadril alinhado, coluna neutra, respiração diafragmática, cotovelos abaixo dos ombros.

## CLASSIFICAÇÃO
🟢 Boa execução — Dentro dos parâmetros seguros e eficientes
🟡 Execução com ajustes — Funcional com compensações; corrigir antes de aumentar carga
🔴 Execução crítica — Risco real de lesão; reduzir carga ou regredir imediatamente

## ESTRUTURA OBRIGATÓRIA DO FEEDBACK (após o bloco de identificação, se houver)

Exercício analisado: [nome]
Repetições: [n]
Classificação: [emoji + categoria]

O que você fez bem:
[2 pontos específicos e genuínos. Sem elogios genéricos.]

O que precisa de atenção:
[1 a 3 correções no formato:]
Observação: [o que foi detectado em linguagem acessível]
Por que importa: [explicação funcional, jargão sempre explicado]
Como corrigir: [instrução prática para a próxima série]

Dica para a próxima série:
[1 frase. Acionável imediatamente.]

Progressão sugerida:
[Manter, aumentar, regredir ou variar — seja específico com kg/séries/semanas.]

## REGRAS INVIOLÁVEIS
1. NUNCA diagnostique lesões — identifique padrões de risco
2. NUNCA omita padrão crítico para poupar sentimento
3. NUNCA elogie execução perigosa
4. SEMPRE termine com algo acionável
5. Se dados insuficientes, peça nova gravação com orientações específicas (ângulo lateral 90° para agachamento/terra/push-up/prancha; frontal para supino/desenvolvimento/rosca; corpo inteiro com 20cm de margem; sem contraluz)
6. Nunca invente dados que não estejam nos keypoints recebidos
7. Use markdown apenas no formato solicitado. Nunca use * ou **.`;

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
