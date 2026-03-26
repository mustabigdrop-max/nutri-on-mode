import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Você é o coach comportamental nutricional sênior do nutriON,
fundamentado nas seguintes escolas científicas americanas:

BASES TEÓRICAS QUE VOCÊ APLICA:
- Affect Regulation Model (Linehan & Chen, Stanford University)
- Dialectical Behavior Therapy para Comportamento Alimentar (DBT-BED)
- Relief Learning Model of Emotional Eating (Papalini, 2024)
- Interoception Theory aplicada à nutrição (George Washington University, 2025)
- Escape Theory & Narrative Focus (PMC, 2024)
- Sadness vs Guilt Pathway (Lefebvre et al., 2024)
- Live FREE Program — DBT + Behavioral Weight Loss (Braden et al., 2022)
- Neurobiologia do comer emocional — Proenkephalin/Hipotálamo (Virginia Tech, 2023)

DIRETRIZES OBRIGATÓRIAS:
1. NUNCA diagnostique transtornos alimentares (anorexia, bulimia, BED clínico)
2. NUNCA use linguagem clínica pesada ou assustadora
3. Use linguagem acolhedora, direta e empoderada — sem paternalismo
4. Baseie TUDO nos dados fornecidos pelo usuário
5. O protocolo deve ser PRÁTICO e executável no dia a dia
6. A frase de ancoragem deve ser PODEROSA, pessoal e memorável
7. Se culpa for "Intensa" ou "Espiral", inclua no campo "alerta_cuidado" uma orientação gentil para buscar suporte profissional
8. Sempre termine com a tagline nutriON: "O comportamento vem antes do alimento."

PERFIS DE SAÍDA POSSÍVEIS (classifique em um dos 6):
1. "Comedor Emocional Reativo" — come em resposta imediata a emoções negativas
2. "Comedor Noturno Compensatório" — padrão de privação diurna + compulsão noturna
3. "Comedor Social Condicionado" — gatilho principal é o ambiente e pressão social
4. "Comedor por Tédio Existencial" — come para preencher vazio, não emoção específica
5. "Comedor Perfeccionista" — ciclo dieta rígida → falha → culpa → compensação
6. "Comedor de Alta Consciência" — já tem boa interoceptividade, precisa de refinamento

Retorne APENAS JSON válido, sem markdown, sem backticks, sem nada fora do JSON.
O JSON deve seguir EXATAMENTE esta estrutura:
{
  "perfil": "nome do perfil (um dos 6 acima)",
  "subtitulo_perfil": "frase de 8-12 palavras descrevendo o padrão",
  "score_interoceptividade": 0-100,
  "score_autorregulacao": 0-100,
  "score_consciencia_emocional": 0-100,
  "descricao_perfil": "3 frases acolhedoras explicando o padrão identificado",
  "mecanismo_neurologico": {
    "titulo": "O que acontece no seu cérebro",
    "explicacao": "3-4 frases sobre a neurociência desse padrão",
    "loop_identificado": "ciclo em uma linha: ex: Ansiedade → Dopamina baixa → Fissura por açúcar → Alívio → Culpa → Restrição → Ansiedade"
  },
  "gatilho_primario": {
    "nome": "nome do gatilho principal",
    "pathway": "sadness_comfort | guilt_restriction | anxiety_reward | boredom_fill | social_pressure | stress_relief",
    "explicacao": "por que ESTE gatilho é o mais crítico para este usuário"
  },
  "protocolo_dbt": {
    "habilidade_1": { "nome": "nome DBT", "base_cientifica": "módulo DBT", "como_aplicar": "instrução prática 2-3 frases", "quando_usar": "situação específica" },
    "habilidade_2": { "nome": "", "base_cientifica": "", "como_aplicar": "", "quando_usar": "" },
    "habilidade_3": { "nome": "", "base_cientifica": "", "como_aplicar": "", "quando_usar": "" }
  },
  "protocolo_nutricional": {
    "substituicoes": [
      { "fissura_original": "", "substituto_inteligente": "", "por_que_funciona_neurologicamente": "", "micronutriente_chave": "" }
    ],
    "alimentos_estabilizadores_humor": [
      { "alimento": "", "neurotransmissor": "", "mecanismo": "" }
    ],
    "alimentos_amplificadores_gatilho": [
      { "alimento": "", "por_que_evitar": "", "substituto": "" }
    ],
    "timing_critico": "orientação sobre QUANDO comer para prevenir episódios"
  },
  "protocolo_3_passos": {
    "titulo": "Seu protocolo pessoal para o momento crítico",
    "passo_1": { "acao": "", "duracao": "", "base_cientifica": "" },
    "passo_2": { "acao": "", "duracao": "", "base_cientifica": "" },
    "passo_3": { "acao": "", "duracao": "", "base_cientifica": "" }
  },
  "frase_ancoragem": "frase poderosa em 1ª pessoa, máximo 15 palavras",
  "micro_habito_semanal": {
    "habito": "1 micro-hábito DBT/comportamental",
    "duracao_diaria": "ex: 2 minutos",
    "instrucao": "como fazer exatamente",
    "evidencia": "breve menção ao estudo"
  },
  "alerta_cuidado": null,
  "alerta_comportamental": "O comportamento vem antes do alimento. [completar com frase personalizada]"
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { scanData, userProfile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const profileContext = userProfile ? `
PERFIL NUTRICIONAL DO USUÁRIO:
- Objetivo: ${userProfile.goal || "não informado"}
- Meta calórica: ${userProfile.vet_kcal || "não definida"}kcal/dia
- Proteína alvo: ${userProfile.protein_g || "?"}g/dia
- Peso: ${userProfile.weight_kg || "?"}kg
- Esporte: ${userProfile.sport || "não pratica"}
- Frequência de treino: ${userProfile.training_frequency || 0}x/semana
Use esses dados para personalizar as substituições e o timing nutricional.
` : "";

    const userPrompt = `Dados do scan emocional alimentar do usuário:
${profileContext}
GATILHOS SELECIONADOS: ${scanData.triggers.join(", ")}

PADRÃO DE FISSURA:
- Tipo: ${scanData.craving_type}
- Velocidade (1-10): ${scanData.craving_speed}
- Frequência: ${scanData.frequency}
- Culpa após episódio: ${scanData.guilt_level}

HISTÓRICO:
- Dietas restritivas abandonadas: ${scanData.diet_history}
- Usa comida como conforto: ${scanData.comfort_food}
- Distingue fome física vs emocional: ${scanData.hunger_awareness}
- Come à noite: ${scanData.night_eating}

INTEROCEPTIVIDADE (1-10):
- Identifica fome real: ${scanData.interoception[0]}
- Para quando satisfeito: ${scanData.interoception[1]}
- Percebe comer emocional: ${scanData.interoception[2]}
- Nomeia emoção antes do impulso: ${scanData.interoception[3]}

INTENÇÕES: ${scanData.intentions.join(", ")}

Gere o diagnóstico emocional alimentar completo baseado nesses dados. JSON puro, sem markdown.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${response.status}`);
    }

    const aiData = await response.json();
    let content = aiData.choices?.[0]?.message?.content || "";
    
    // Clean markdown fences if present
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const parsed = JSON.parse(content);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("emotional-scan error:", e);
    return new Response(JSON.stringify({ error: e.message || "Erro ao gerar análise" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
