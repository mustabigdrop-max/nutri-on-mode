import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é o Dr. TrainingON — especialista em cinesiologia, biomecânica e bodybuilding científico, com base em Brad Schoenfeld, Bret Contreras, Greg Nuckols, Eric Helms, Mike Israetel e Charles Poliquin. Você é o melhor coach de treino do Brasil, diferenciado por profundidade científica absoluta e clareza prática. Responda sempre em Português do Brasil. Nunca use * ou ** para formatar. Use subtítulos claros e texto corrido profissional. Considere sempre lesões, equipamentos disponíveis e nível do cliente para personalizar ao máximo.`;

function buildUserPrompt(data: any): string {
  const { phase, muscles, level, weeks, days, clientName, equipment, injuries, sessionDuration, stressLevel, supplements, weakPoints, specificGoal, cardio, tab } = data;
  const muscleList = Array.isArray(muscles) ? muscles.join(", ") : muscles;

  if (tab === "protocolo") {
    return `Gere o PROTOCOLO DE TREINO COMPLETO e PERSONALIZADO para:
Cliente: ${clientName} | Fase: ${phase} | Músculos prioritários: ${muscleList}
Nível: ${level} | Duração: ${weeks} | Frequência: ${days}/semana
Equipamentos disponíveis: ${equipment || "Academia completa"} | Lesões/restrições: ${injuries || "Nenhuma"}
Tempo por sessão: ${sessionDuration || "60min"} | Cardio atual: ${cardio || "Não"}
Nível de estresse/sono: ${stressLevel || "Bom"} | Suplementos: ${supplements || "Nenhum"}
Pontos fracos: ${weakPoints || "Nenhum"} | Objetivo específico: ${specificGoal || phase}

Inclua obrigatoriamente:
1. Resumo executivo personalizado para este cliente (3-4 linhas)
2. Volume semanal por músculo com MEV/MAV/MRV (Mike Israetel) para o nível informado
3. Divisão completa dos dias de treino considerando os equipamentos disponíveis
4. Exercícios por sessão: nome | séries x reps | intensidade (RPE ou %1RM) | técnica especial
5. Técnicas avançadas adequadas à fase: drop sets, rest-pause, cluster sets, mechanical drop sets, supersets antagonistas
6. Progressão de carga semana a semana (modelo de dupla progressão ou percentual)
7. Adaptações específicas para as lesões/restrições informadas
8. Tabela resumo: Dia | Exercício | Séries | Reps | Intensidade | Técnica`;
  }

  if (tab === "anatomia") {
    return `Gere análise ANATÔMICA E BIOMECÂNICA PROFUNDA para os músculos: ${muscleList}
Considere os equipamentos disponíveis: ${equipment || "Academia completa"} e lesões: ${injuries || "Nenhuma"}

Para cada músculo:
- Nomenclatura anatômica completa (nome científico e popular)
- Origem e inserção (ossos e pontos específicos de ancoragem)
- Função primária: flexão, extensão, adução, abdução, rotação interna/externa, elevação, depressão
- Plano de movimento predominante (sagital, frontal, transverso) e eixo de rotação
- Músculos sinergistas primários e secundários
- Músculos antagonistas e sua importância para equilíbrio
- Ponto de máxima tensão mecânica no arco de movimento (posição alongada vs. encurtada)
- Implicações para seleção de exercícios: ângulo de ataque, comprimento muscular, vetor de força
- Inervação (nervo responsável)
- Desequilíbrios comuns e impacto postural
- Base científica: citar publicações de Schoenfeld, Contreras ou periódicos`;
  }

  if (tab === "tecnica") {
    return `Gere GUIA COMPLETO DE TÉCNICA DE EXECUÇÃO para os principais exercícios de: ${muscleList}
Fase: ${phase} | Equipamentos: ${equipment || "Academia completa"} | Lesões/restrições: ${injuries || "Nenhuma"}

Para cada exercício principal e sua variação mais importante:
- Posição inicial: alinhamento articular, pegada/apoio, ativação do core
- Fase excêntrica: tempo (ex: 3 segundos), arco de movimento, pontos de controle, onde focar
- Fase concêntrica: intenção (ex: "empurre o chão"), pico de contração, velocidade
- Padrão respiratório: quando inspirar, quando expirar, uso do Valsalva quando aplicável
- Pontos críticos de segurança articular (joelho, ombro, coluna)
- Erros mais comuns + correção imediata
- Cueing verbal de alto impacto
- Regressão (versão para iniciante ou com limitação)
- Progressão (versão mais avançada ou com maior demanda)
- Adaptação para as lesões informadas: ${injuries || "Nenhuma"}`;
  }

  if (tab === "periodizacao") {
    return `Gere PLANO DE PERIODIZAÇÃO CIENTÍFICO COMPLETO para ${weeks}, fase ${phase}, nível ${level}
Músculos: ${muscleList} | Estresse/sono: ${stressLevel || "Bom"} | Cardio: ${cardio || "Não"}

Inclua:
1. Modelo de periodização recomendado (DUP, Block, Linear ou Ondulatória) com justificativa baseada em evidências
2. Estrutura detalhada semana a semana: volume, intensidade, RPE alvo, métodos principais
3. Deload: semana exata, como reduzir (volume vs. intensidade), justificativa SRA
4. Volume landmarks por músculo semana a semana (série/semana)
5. Métricas de acompanhamento: o que medir, quando e como interpretar
6. Janela de recuperação (SRA) ideal para cada grupo muscular trabalhado
7. Estratégia de pico nas últimas 2 semanas (se aplicável à fase)
8. Ajuste para nível de estresse ${stressLevel || "Bom"} (volume e intensidade adaptados)
9. Referências: Schoenfeld 2010/2017, Helms 2015, Israetel 2019, Nuckols, Zourdos`;
  }

  if (tab === "reels") {
    const exercise = data.exercise || muscleList;
    return `Crie um roteiro completo de Reels de 45-60 segundos para o coach ${clientName} sobre: ${muscleList} na fase de ${phase}, com foco no exercício ${exercise}.

Estrutura obrigatória:
- Gancho (primeiros 3 segundos): frase de impacto que pare o scroll
- Problema ou mito comum: algo que a maioria faz errado
- Solução técnica: dica baseada em ciência (citar Schoenfeld ou conceito biomecânico)
- Demonstração verbal: como executar corretamente em 2-3 passos
- CTA final: o que o seguidor deve fazer agora

Inclua também:
- Sugestão de legenda com hashtags relevantes
- 3 opções de thumbnail (descrição do frame ideal)
- Texto para Story de divulgação do Reels`;
  }

  if (tab === "volume") {
    const currentSets = data.currentSets || 0;
    return `Analise o volume atual do cliente para o músculo ${muscleList}, nível ${level}.
O cliente está fazendo ${currentSets} séries por semana.
Informe se está no MEV, MAV ou acima do MRV.
Dê recomendação prática de 150 palavras sobre o que fazer na próxima fase e quando programar deload.`;
  }

  if (tab === "stagnation") {
    return `O cliente está estagnado no exercício: ${data.exercise}.
Histórico recente de progressão: ${JSON.stringify(data.progressHistory || [])}
Protocolo atual: fase ${phase}, nível ${level}.

Retorne 3 estratégias práticas e imediatas para destravar a progressão de carga neste exercício, com justificativa científica para cada uma.`;
  }

  return `Gere um protocolo de treino para: ${clientName}, fase ${phase}, músculos ${muscleList}, nível ${level}.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const data = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const userPrompt = buildUserPrompt(data);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit excedido. Tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      throw new Error(`AI API error: ${response.status} - ${errText}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("generate-training-protocol error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
