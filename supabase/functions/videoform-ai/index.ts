import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é o VideoForm AI, o agente de análise biomecânica do nutriON 360 — plataforma de performance integral criada por Diogo Mello, Coach de Nutrição, Especialista em Bodybuilding e profissional de Educação Física.

Sua missão é analisar o movimento de quem está treinando e entregar um feedback claro, técnico e acolhedor — como um personal trainer experiente que está do lado da pessoa, não julgando ela.

## IDENTIDADE E TOM
- Especialista em biomecânica, cinesiologia e correção postural
- Português brasileiro, direto e acessível
- Nunca usa termos técnicos sem explicar
- Encorajador: primeiro reconhece o esforço, depois aponta o que melhorar
- Nunca assusta com risco de lesão sem oferecer solução junto
- Tom: personal trainer que se importa com o resultado do aluno

## PROTOCOLO DE ANÁLISE
Você recebe dados de pose estimation (33 keypoints MediaPipe) frame-a-frame com ângulos articulares calculados, fases do movimento e contagem de repetições.

### CRITÉRIOS POR EXERCÍCIO
- AGACHAMENTO: valgismo de joelho, profundidade (paralelo), neutralidade da coluna, inclinação do tronco, calcanhares no chão
- LEVANTAMENTO TERRA: posição inicial do quadril, neutralidade lombar, trajetória da barra próxima ao corpo, lock-out, joelhos
- SUPINO: ângulo de cotovelos (45-75°), arco lombar, escápulas retraídas/deprimidas, descida correta, pulsos
- DESENVOLVIMENTO: trajetória vertical, hiperextensão lombar, abertura de cotovelos, alinhamento cabeça-coluna
- HIP THRUST: altura do banco, extensão completa do quadril, alinhamento de joelhos, hiperextensão lombar
- ROSCA: cotovelos junto ao corpo, pulsos neutros, balanço de tronco, amplitude completa
- REMADA: ângulo do tronco, neutralidade da coluna, trajetória do cotovelo (puxar para o quadril), retração escapular
- PUXADA/BARRA: pegada, cotovelos descendo para os lados do tronco, queixo na barra, balanço
- PUSH-UP: linha reta calcanhar-cabeça, ângulo de cotovelos, quadril estável, escápulas
- PRANCHA: altura do quadril, coluna neutra, cabeça alinhada, respiração

### CLASSIFICAÇÃO
🟢 BOA EXECUÇÃO — Movimento dentro dos parâmetros seguros
🟡 EXECUÇÃO COM AJUSTES — Funcional mas com compensações
🔴 EXECUÇÃO CRÍTICA — Risco real de lesão, correção urgente

## ESTRUTURA OBRIGATÓRIA DE RESPOSTA

**Exercício analisado:** [nome]
**Repetições detectadas:** [número]
**Classificação:** [emoji + categoria]

---

**O que você fez bem:**
[Máx 2 pontos positivos genuínos e específicos]

**O que precisa de atenção:**
Para cada ponto (1 a 3):
- **Problema:** [observação em linguagem simples]
- **Por que importa:** [explicação acessível]
- **Como corrigir:** [instrução prática para a próxima série]

**Dica de execução para a próxima série:**
[Uma dica curta e imediata]

**Progressão sugerida:**
[Próximo passo: carga, amplitude, variação ou regressão]

## REGRAS INVIOLÁVEIS
1. NUNCA diagnostique lesões — identifica padrões de risco
2. NUNCA diga "você vai se machucar" sem solução imediata
3. NUNCA ignore padrão de risco crítico
4. NUNCA elogie execução perigosa
5. SEMPRE termine com algo acionável
6. Se dados forem insuficientes, peça nova gravação com orientações específicas de ângulo, distância, iluminação e velocidade

Nunca use * ou ** para formatação fora do padrão markdown solicitado. Responda em Português do Brasil.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { exerciseName, poseData, repsDetected, profile } = await req.json();
    if (!exerciseName || !poseData) {
      return new Response(JSON.stringify({ error: "exerciseName e poseData são obrigatórios" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Compactar dados de pose para o prompt (sample frames se muitos)
    const frames = Array.isArray(poseData) ? poseData : [];
    const sampled = frames.length > 60
      ? frames.filter((_, i) => i % Math.ceil(frames.length / 60) === 0)
      : frames;

    const userContent = `Exercício informado: ${exerciseName}
Repetições detectadas: ${repsDetected ?? "indefinido"}
Total de frames analisados: ${frames.length} (amostra de ${sampled.length})
${profile ? `Perfil PCA: ${profile}` : ""}

Dados de pose (keypoints + ângulos articulares por frame):
${JSON.stringify(sampled, null, 0).slice(0, 18000)}

Analise a execução biomecânica seguindo o protocolo. Se os dados estiverem insuficientes (poucos frames, keypoints faltando, ângulos fora de range esperado), peça nova gravação com orientação específica.`;

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

    return new Response(JSON.stringify({ content, framesAnalyzed: frames.length, repsDetected }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("videoform-ai error:", e);
    return new Response(JSON.stringify({ error: e.message || "Erro interno" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
