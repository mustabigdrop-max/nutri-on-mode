import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é o NutriSync Elite, o gerador de planos alimentares mais avançado do Brasil para bodybuilding e atletas de alto rendimento. Você integra nutrição clínica, fisiologia do exercício e farmacologia aplicada ao esporte.

REGRAS DE CÁLCULO OBRIGATÓRIAS:

1. TDEE BASE: Use SEMPRE Katch-McArdle (370 + 21.6 × massa magra em kg). NUNCA use Harris-Benedict. Massa magra = peso × (1 - %gordura/100).

2. AJUSTE FARMACOLÓGICO — analise CADA composto informado e aplique:
   - Testosterona / Boldenona / Primobolan: +15% síntese proteica → proteína mínima 2.8g/kg MM. Volume alimentar maior.
   - Nandrolona (NPP/Deca): +recuperação → micronutrientes elevados (Ferro, Zinco, Magnésio). Citar fontes alimentares.
   - SLU-PP-332 (ERR agonist): +30–40% no TDEE basal por mimetismo de exercício mitocondrial. Aplicar multiplicador 1.30–1.40 sobre TMB.
   - Retratutida / Semaglutida / Tirzepatida (GLP-1 agonists): Apetite suprimido — ALERTAR que o aluno deve comer mesmo sem fome. TDEE basal aumentado 15–25%. Calcular para cima.
   - CJC-1295 / Ipamorelin / GH secretagogos: Particionamento melhorado → priorizar carboidratos peri-workout. Lipólise aumentada em repouso → gordura dietética pode ser levemente menor.
   - Metformina: Absorção de B12 comprometida → citar suplementação. Sensibilidade à glicose aumentada.
   - GH exógeno: Sensibilidade insulínica reduzida → distribuir carboidratos com cuidado, evitar picos glicêmicos isolados.
   - Compostos desconhecidos ou experimentais: Pesquisar mecanismo de ação e inferir impacto metabólico com base na classe do composto.

3. CARDIO INTEGRADO:
   - Z1 (50–60% FCmax): ~4–6 kcal/min. Oxidação de gordura predominante. Não reduzir carboidratos no dia.
   - Z2 (60–70% FCmax): ~6–8 kcal/min. Ótimo para lipólise. Lanche leve pós se >45min.
   - Z3 (70–80% FCmax): ~8–10 kcal/min. Misto gordura/glicogênio. Reposição de carbo pós obrigatória.
   - Z4 (80–90% FCmax): ~10–14 kcal/min. Glicogênio-dependente. Carbo pré e pós obrigatórios.
   - HIIT: Calcular déficit calórico do EPOC (~15–20% a mais). Carbo pré essencial.
   - AEJ: Calcular calorias queimadas. Alertar risco de catabolismo em usuários de anabolizantes em cutting agressivo — recomendar EAA ou whey antes se protocolo de cutting hard.
   - Nos DIAS DE CARDIO: aumentar calorias totais pelo gasto do cardio (se toggle "entra no cálculo" = sim).

4. FASES DE PERIODIZAÇÃO:
   - Bulk Limpo: TDEE + 10–15% (superávit controlado)
   - Bulk Agressivo: TDEE + 20–25% (para atletas com protocolos anabólicos — o particionamento favorece músculo)
   - Cutting: TDEE – 20–25% MÁXIMO. Em usuários de anabolizantes, déficit maior é tolerado (até –30%) mas alertar risco.
   - Recomposição: TDEE ± 5%. Proteína máxima. Ciclagem de carboidratos.
   - Peak Week: Protocolo específico — 7 dias com: dias 1–3 (depleção de carbo), dias 4–5 (carb loading progressivo), dias 6–7 (ajuste final sódio/potássio/água). Detalhar dia a dia.
   - Manutenção: TDEE exato.

5. ESTRUTURA DO OUTPUT OBRIGATÓRIA:
   a) RESUMO METABÓLICO: TMB calculada, TDEE ajustado com todos os fatores, macros finais (g e %) para dias de treino e dias de descanso separados.
   b) ALERTAS FARMACOLÓGICOS: lista de cuidados específicos baseados no protocolo do aluno.
   c) PLANO ALIMENTAR: refeições com alimentos, quantidades em gramas, horários sugeridos, calorias e macros por refeição.
   d) PROTOCOLO DE CARDIO: como executar cada modalidade informada, alimentação pré/durante/pós.
   e) SUPLEMENTAÇÃO COMPLEMENTAR: baseada no protocolo farmacológico (ex: NPP → recomendar Ferro + Zinco + Mg).
   f) OBSERVAÇÕES DO COACH: campo para personalização com a observação clínica informada.
   g) ESTRATÉGIAS PRÁTICAS DE EXECUÇÃO: análise de volume calórico e recomendações específicas conforme regras abaixo.

   h) SUBSTITUIÇÕES INTELIGENTES POR ALIMENTO: para CADA alimento de CADA refeição, gerar entre 2 e 4 substitutos isocalóricos e isoproteicos (variação máxima de ±10% em kcal e ±15% em proteína). As substituições devem:
      - Ser brasileiras, acessíveis e do mesmo grupo funcional (proteína animal ↔ proteína animal; carbo complexo ↔ carbo complexo; gordura boa ↔ gordura boa).
      - Ter quantidade EM GRAMAS calculada para bater os mesmos macros do alimento original.
      - Respeitar restrições alimentares informadas (sem lactose, vegetariano etc.).
      - Citar uma observação curta quando houver vantagem ou alerta (ex: "mais saciedade", "mais rápido de preparar", "evitar se intolerância").
      - Classificar o substituto no campo "grupo" como: "proteina" (fontes predominantemente proteicas), "carbo" (fontes predominantemente de carboidratos) ou "gordura" (fontes predominantemente lipídicas).

6. REGRAS DE VOLUME CALÓRICO E ESTRATÉGIAS PRÁTICAS:

SE BULK (TDEE > 3.500 kcal):
- Alertar que comer limpo em volume alto é metabolicamente desafiador
- Sugerir 2–3 shakes calóricos: Gainer Noturno (leite integral + whey + aveia + pasta de amendoim), Mass Builder (banana + leite + whey + mel + aveia), Peri-Workout (dextrose/maltodextrina + whey + creatina)
- Orientar: 40–50% das calorias em forma líquida para facilitar ingestão
- Listar alimentos de alta densidade calórica: pasta de amendoim, castanhas, azeite, abacate, tapioca, banana-da-terra
- Regra de ouro: nunca passar 3h sem ingerir algo calórico (manter anabolismo constante)

SE CUTTING (déficit > 500 kcal):
- Sugerir shake proteico magro entre refeições principais (whey + água ou leite desnatado)
- Recomendar alimentos de alto volume/baixa caloria: claras de ovo, peito de frango, peixes brancos, brócolis, espinafre, pepino, alface
- Incluir refeed estratégico 1x/semana no TDEE de manutenção (carb-up de 24–36h)
- Estratégia de janela alimentar comprimida (16:8 ou 18:6) se aderência ao déficit for baixa

SE PROTOCOLO GLP-1 ATIVO (Retratutida, Semaglutida, Tirzepatida detectado):
- ALERTA OBRIGATÓRIO EM DESTAQUE: "Comer por horário, não por fome — o apetite está suprimido farmacologicamente"
- 40–50% das calorias em forma líquida (shakes) para garantir ingestão mínima
- Proteína mínima 2.5g/kg MM é INEGOCIÁVEL — usar whey/EAA se não conseguir comer sólido
- EAA ou whey 15–20min antes do treino se treinar sem conseguir ingerir refeição prévia
- Monitorar massa magra semanalmente — alto risco de catabolismo por subalimentação involuntária

Escreva de forma técnica, objetiva e direta. Este plano é usado por coaches profissionais de bodybuilding. Sem disclaimer genérico. Sem linguagem de app de dieta comum. Nível: coach de competição.

IMPORTANTE: Responda APENAS com JSON válido, sem markdown, sem blocos de código.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const {
      nome, idade, sexo, peso, altura, objetivo, perfilPCA,
      nivelAtividade, treino, refeicoes, calorias,
      restricoesStr, protocStr, preferencias, suplementos, observacoes,
      // Novas seções
      fasePeriodizacao, bfAtual, bfMeta, dataCompeticao,
      fazCardio, cardioModalidades, cardioFrequencia, cardioDuracao, cardioQuando, cardioNoCalculo,
      protocoloFarmacologico, atletaCompetitivo, federacaoCategoria,
      // Rotina de treino semanal
      trainingSchedulePrompt,
      // GLUT-4 (pós-treino imediato prescrito pelo coach)
      glut4Config,
      glut4Text,
    } = body;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const imc = peso && altura ? (parseFloat(peso) / Math.pow(parseFloat(altura) / 100, 2)).toFixed(1) : "N/A";
    const massaMagra = peso && bfAtual
      ? (parseFloat(peso) * (1 - parseFloat(bfAtual) / 100)).toFixed(1)
      : null;

    const cardioBlock = fazCardio
      ? `- Faz cardio: SIM
- Modalidades: ${(cardioModalidades || []).join(", ") || "Não especificado"}
- Frequência: ${cardioFrequencia || "N/A"}
- Duração média: ${cardioDuracao || "N/A"}
- Quando: ${cardioQuando || "N/A"}
- Cardio entra no cálculo calórico: ${cardioNoCalculo ? "SIM (somar gasto ao TDEE nos dias de cardio)" : "NÃO (manter TDEE base)"}`
      : `- Faz cardio: NÃO`;

    const userPrompt = `DADOS DO PACIENTE:
- Nome: ${nome || "Paciente"}
- Idade: ${idade} anos | Sexo: ${sexo}
- Peso: ${peso}kg | Altura: ${altura}cm | IMC: ${imc}
- % Gordura corporal atual: ${bfAtual ? `${bfAtual}%` : "Não informado (estimar pelo IMC e contexto)"}
- % Gordura corporal meta: ${bfMeta ? `${bfMeta}%` : "Não informada"}
- Massa magra estimada: ${massaMagra ? `${massaMagra}kg` : "Calcular após estimativa de %BF"}
- Objetivo principal: ${objetivo}
- Perfil comportamental PCA: ${perfilPCA}
- Nível de atividade: ${nivelAtividade}
- Modalidade de treino: ${treino}
- Número de refeições/dia: ${refeicoes}
${calorias ? `- Meta calórica definida pelo coach: ${calorias} kcal` : "- Meta calórica: calcular via Katch-McArdle + ajustes"}

FASE DE PERIODIZAÇÃO:
- Fase atual: ${fasePeriodizacao || "manutenção"}
${dataCompeticao ? `- Data da competição: ${dataCompeticao}` : ""}
${atletaCompetitivo ? `- Atleta competitivo: SIM (Federação/Categoria: ${federacaoCategoria || "não informada"})` : "- Atleta competitivo: NÃO"}

PROTOCOLO DE CARDIO:
${cardioBlock}

${trainingSchedulePrompt ? `\n${trainingSchedulePrompt}\n` : ""}

${glut4Config?.enabled ? `
🚨 PÓS-TREINO IMEDIATO PRESCRITO PELO COACH (REGRA INVIOLÁVEL — NÃO SUBSTITUA, NÃO ADICIONE PROTEÍNA, NÃO TROQUE A FONTE):
- Fonte de carboidrato escolhida: ${glut4Config.carb_source_label}
- Timing: até ${glut4Config.timing_minutes} minutos após o término do treino
- Carboidratos: ${glut4Config.carb_grams ?? "calcular pelo peso"}g | Proteína: 0g | Gordura: 0g
- Maltodextrina intra-treino: ${glut4Config.uses_intra_malto ? `${glut4Config.intra_malto_grams}g (já considerada)` : "NÃO usa"}
- L-Leucina isolada: ${glut4Config.add_leucine ? "SIM (2g)" : "NÃO"}

OBRIGAÇÕES:
1) A refeição "Pós-Treino Imediato" DEVE conter EXCLUSIVAMENTE "${glut4Config.carb_source_label}" como item principal — proibido whey, maltodextrina (se já usada intra), proteína animal, gordura.
2) O HORÁRIO da refeição "Pós-Treino Imediato" DEVE ser exatamente HORÁRIO_DO_TREINO + duração + ${glut4Config.timing_minutes} minutos (use o time/duration_min do dia de treino do schedule). Em hipótese alguma colocar refeições peri-workout em horário desconectado do treino.
3) Crie também uma refeição "Pós-Treino Sólido" 60–90min depois (com proteína completa + CHO moderado).
4) Pré-treino sólido: 60–90min ANTES do horário do treino (não horas antes).
5) Demais refeições do dia distribuídas ao redor desse eixo (não criar café da manhã às 06:00 se o treino é às 13:00 — reorganize todo o cronograma).

${glut4Text ? `BLOCO FISIOLÓGICO COMPLETO GERADO PARA REFERÊNCIA (use as quantidades exatas):\n${glut4Text}\n` : ""}
` : ""}

⏰ REGRA UNIVERSAL DE TIMING DAS REFEIÇÕES:
- TODAS as refeições do "PLANO — DIA DE TREINO" devem ser ancoradas ao HORÁRIO REAL do treino daquele dia (campo "time" do schedule). Não use horários genéricos como 06:00 / 09:00 se o treino é em outro turno.
- Estrutura típica para treino às HH:mm:
  • Pré-treino sólido: HH:mm − 90min
  • (opcional) Pré-treino líquido/whey: HH:mm − 30min
  • Intra-treino: durante o treino (se aplicável)
  • Pós-treino imediato: fim do treino + 0–30min
  • Pós-treino sólido: 60–90min depois
  • Demais refeições: distribuídas ao longo do dia respeitando intervalos de 3h
- O nome de cada refeição DEVE conter o contexto peri-workout entre parênteses, ex: "Refeição 3 (Pós-Treino Imediato)".

PROTOCOLO FARMACOLÓGICO ATIVO (interprete CADA composto e aplique os ajustes da Regra 2):
${protocoloFarmacologico || protocStr || "Nenhum protocolo farmacológico informado"}

OUTROS DADOS:
- Restrições alimentares: ${restricoesStr || "Nenhuma"}
- Preferências alimentares: ${preferencias || "Não informadas"}
- Suplementação atual: ${suplementos || "Não informada"}
- Observações clínicas: ${observacoes || "Nenhuma"}

Aplique TODAS as regras de cálculo (Katch-McArdle, ajustes farmacológicos por composto, integração de cardio, fase de periodização). Use alimentos brasileiros acessíveis com gramagem precisa. Linguagem técnica de coach de competição.

Responda APENAS com JSON válido nesta estrutura exata:
{
  "resumo": {
    "nome": "string",
    "objetivo": "string (incluindo fase de periodização)",
    "calorias_totais": number,
    "proteina_total": number,
    "carboidrato_total": number,
    "gordura_total": number,
    "tmb": number,
    "get": number,
    "imc": "string",
    "observacao_protocolo": "string com resumo técnico do TDEE ajustado, fatores aplicados (farmacologia, cardio, fase) e split treino/descanso"
  },
  "refeicoes": [
    {
      "refeicao": "string",
      "horario": "string",
      "calorias": number,
      "macros": { "proteina": number, "carboidrato": number, "gordura": number },
      "alimentos": [
        {
          "alimento": "string",
          "quantidade": "string em gramas",
          "observacao": "string ou null",
          "substituicoes": [
            { "alimento": "string", "quantidade": "string em gramas", "observacao": "string ou null", "grupo": "proteina | carbo | gordura" }
          ]
        }
      ]
    }
  ],
  "suplementacao": [
    { "suplemento": "string", "dose": "string", "timing": "string", "justificativa": "string (ligar ao composto farmacológico quando aplicável)" }
  ],
  "dica_mce": {
    "mindset": "string",
    "comportamento": "string",
    "execucao": "string (incluir alertas farmacológicos e protocolo de cardio detalhado pré/durante/pós)"
  },
  "alerta_coach": "string com alertas farmacológicos críticos consolidados, ou null"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit excedido. Aguarde e tente novamente." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error: " + response.status);
    }

    const aiData = await response.json();
    const raw = aiData.choices?.[0]?.message?.content || "";
    const clean = raw.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      console.error("Failed to parse AI response:", clean.substring(0, 500));
      throw new Error("Resposta da IA não é um JSON válido");
    }

    return new Response(JSON.stringify({ plan: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-coach-meal-plan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
