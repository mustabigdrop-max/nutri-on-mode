import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { profile, weekStart, budgetMode, workoutSchedule } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const objetivo = profile?.goal || profile?.objetivo_principal || "saúde geral";
    const kcalAlvo = profile?.vet_kcal || profile?.get_kcal || 2000;
    const protAlvo = profile?.protein_g || 120;
    const carbAlvo = profile?.carbs_g || 200;
    const fatAlvo = profile?.fat_g || 60;

    // Build workout context per day
    const dayNames = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
    let workoutContext = "";
    if (workoutSchedule && workoutSchedule.length > 0) {
      const byDay: Record<number, any[]> = {};
      for (const ws of workoutSchedule) {
        if (!byDay[ws.day_of_week]) byDay[ws.day_of_week] = [];
        byDay[ws.day_of_week].push(ws);
      }
      workoutContext = `\n═══════════════════════════════════════════
ROTINA DE TREINO DO USUÁRIO (ADAPTAR CADA DIA)
═══════════════════════════════════════════\n`;
      for (let d = 0; d < 7; d++) {
        const sessions = byDay[d];
        if (sessions && sessions.length > 0) {
          const descs = sessions.map((s: any) => `${s.workout_type} (${s.workout_time}, ${s.duration_minutes}min)`).join(" + ");
          workoutContext += `${dayNames[d]}: ${descs}\n`;
        } else {
          workoutContext += `${dayNames[d]}: DESCANSO\n`;
        }
      }
      workoutContext += `
REGRAS DE ADAPTAÇÃO POR DIA DE TREINO:
- Dias de LEGS/lower: +10-15% carboidratos, refeição pós-treino robusta
- Dias de PUSH/PULL/upper: distribuição padrão com proteína alta pós-treino
- Dias de CARDIO: mais carboidratos pré-treino, refeição pós mais leve
- Dias de DESCANSO: reduzir carboidratos em 15-20%, aumentar gorduras boas
- TREINO MANHÃ: café da manhã mais leve + lanche pré-treino, almoço robusto pós-treino
- TREINO TARDE: almoço como pré-treino, lanche PM robusto pós-treino
- TREINO NOITE: jantar como pós-treino principal, ceia com caseína
- TREINO DUPLO: distribuir 40% AM, 35% peri-treino PM, 25% pós
- A meta calórica diária (${kcalAlvo}kcal) deve ser mantida, apenas REDISTRIBUIR ao longo do dia
`;

    const systemPrompt = `Você é um nutricionista IA especialista em planejamento alimentar brasileiro.
Gere um plano semanal de refeições (7 dias, 6 refeições/dia) RIGOROSAMENTE PERSONALIZADO.

═══════════════════════════════════════════
PERFIL DO USUÁRIO
═══════════════════════════════════════════
- Objetivo principal: ${objetivo}
- Meta calórica diária: ${kcalAlvo} kcal/dia
- Proteína alvo: ${protAlvo}g/dia
- Carboidrato alvo: ${carbAlvo}g/dia
- Gordura alvo: ${fatAlvo}g/dia
- Sexo: ${profile?.sex || "não informado"}
- Idade: ${profile?.age || "?"}
- Peso: ${profile?.weight_kg || "?"}kg
- Altura: ${profile?.height_cm || "?"}cm
- Restrições alimentares: ${profile?.dietary_restrictions?.join(", ") || "nenhuma"}
- Condições de saúde: ${profile?.health_conditions?.join(", ") || "nenhuma"}
- Usa GLP-1: ${profile?.uses_glp1 ? "SIM (priorizar proteína alta, frações menores, mais refeições líquidas)" : "não"}
- Esporte praticado: ${profile?.sport || "não pratica"}
- Frequência treino: ${profile?.training_frequency || 0}x/semana
- Nível de atividade: ${profile?.activity_level || "moderado"}

═══════════════════════════════════════════
REGRAS DE OBJETIVO
═══════════════════════════════════════════
${objetivo?.toLowerCase().includes("emagrec") || objetivo?.toLowerCase().includes("perda") ? `
EMAGRECIMENTO:
- Manter déficit calórico: cada dia DEVE ter total próximo a ${kcalAlvo}kcal (não ultrapassar)
- Proteína ALTA: mínimo ${protAlvo}g/dia (preservar massa magra)
- Fibras: mínimo 25g/dia (saciedade)
- Priorizar: proteínas magras, vegetais, frutas com baixo IG
- Evitar: ultra-processados, açúcares simples, frituras
- Jantar mais leve que almoço
- Ceia: proteína lenta (caseína, cottage) + fibra
` : ""}
${objetivo?.toLowerCase().includes("hipertrofia") || objetivo?.toLowerCase().includes("massa") || objetivo?.toLowerCase().includes("bulk") ? `
HIPERTROFIA:
- Superávit calórico controlado: cada dia DEVE ter total próximo a ${kcalAlvo}kcal
- Proteína MÁXIMA: mínimo ${protAlvo}g/dia distribuída em todas refeições
- Carboidratos complexos priorizados pré e pós-treino
- Incluir: arroz, batata doce, aveia, frango, carne, ovos, whey
- Refeição pós-treino: alta proteína + carboidrato rápido
- Jantar robusto em dia de treino
` : ""}
${objetivo?.toLowerCase().includes("saúde") || objetivo?.toLowerCase().includes("manutenção") ? `
SAÚDE/MANUTENÇÃO:
- Manter equilíbrio calórico: cada dia DEVE ter total próximo a ${kcalAlvo}kcal
- Variedade máxima de cores e grupos alimentares
- Anti-inflamatório: ômega-3, cúrcuma, gengibre
- Fibras: 30g+ por dia
- Minimizar ultra-processados
 ` : ""}
${workoutContext}
═══════════════════════════════════════════
MICRONUTRIENTES OBRIGATÓRIOS
═══════════════════════════════════════════
Garanta diversidade de micronutrientes ao longo da semana:
- Vitamina A: cenoura, abóbora, manga, espinafre
- Vitamina C: laranja, acerola, kiwi, brócolis, pimentão
- Ferro: carne vermelha 2-3x/sem, feijão, lentilha, espinafre
- Cálcio: leite, iogurte, queijo, brócolis, couve
- Zinco: carne, ostras, castanhas, sementes
- Magnésio: castanhas, espinafre, abacate, chocolate amargo
- Potássio: banana, abacate, batata, feijão
- Fibras: aveia, feijão, lentilha, vegetais, frutas com casca
- Ômega-3: salmão/sardinha 2x/sem (se não modo orçamento), chia, linhaça
- B12: carnes, ovos, laticínios
- Vitamina D: ovo (gema), sardinha, cogumelos
- Selênio: castanha-do-pará (1-2 unidades/dia)

${budgetMode ? `
═══════════════════════════════════════════
⚠️ MODO ORÇAMENTO ATIVO
═══════════════════════════════════════════
PRIORIZAR alimentos baratos e acessíveis:
- Proteínas: ovo (R$0,80/un), frango coxa/sobrecoxa (R$13/kg), carne moída (R$25/kg), sardinha lata (R$5)
- Carboidratos: arroz (R$5/kg), feijão (R$7/kg), batata (R$4/kg), macarrão (R$3/500g), aveia (R$6/kg)
- Frutas: banana (R$3/kg), maçã (R$6/kg), laranja (R$4/kg), mamão (R$5/kg)
- Vegetais: repolho (R$3/un), cenoura (R$4/kg), chuchu (R$3/kg), abóbora (R$3/kg)
- Laticínios: leite (R$5/L), iogurte natural (R$4/un)
EVITAR: salmão, quinoa, açaí, whey importado, frutas caras (morango, mirtilo)
Substituir por: sardinha, arroz integral, banana congelada, albumina
` : ""}

═══════════════════════════════════════════
REGRAS TÉCNICAS
═══════════════════════════════════════════
1. Use APENAS alimentos brasileiros comuns (base TACO/IBGE)
2. Varie bastante entre os dias — NÃO repita o mesmo prato em dias consecutivos
3. Cada dia DEVE totalizar próximo a ${kcalAlvo}kcal (tolerância ±100kcal)
4. A soma de proteína de cada dia DEVE ser próxima a ${protAlvo}g (tolerância ±10g)
5. Distribua proteína em TODAS as refeições (não concentrar apenas no almoço)
6. Tipos de refeição: cafe_manha, lanche_manha, almoco, lanche_tarde, jantar, ceia
7. Porções em medidas práticas (1 filé médio, 2 colheres de sopa, 1 xícara, etc)
8. Os valores de kcal/macros devem ser REALISTAS e precisos

RETORNE usando a ferramenta generate_plan.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Gere o plano semanal completo para a semana iniciando em ${weekStart}. Objetivo: ${objetivo}. Meta: ${kcalAlvo}kcal, ${protAlvo}g proteína, ${carbAlvo}g carb, ${fatAlvo}g gordura por dia.${budgetMode ? " MODO ORÇAMENTO ATIVO — use alimentos mais baratos possíveis sem comprometer proteína." : ""}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_plan",
              description: "Gera o plano alimentar semanal com 7 dias e 6 refeições por dia, respeitando metas calóricas e de macros",
              parameters: {
                type: "object",
                properties: {
                  days: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        day_index: { type: "number", description: "0=Seg, 1=Ter, 2=Qua, 3=Qui, 4=Sex, 5=Sáb, 6=Dom" },
                        meals: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              meal_type: { type: "string", enum: ["cafe_manha", "lanche_manha", "almoco", "lanche_tarde", "jantar", "ceia"] },
                              food_name: { type: "string", description: "Nome do prato ou alimento principal" },
                              portion: { type: "string", description: "Porção em medida prática" },
                              kcal: { type: "number" },
                              protein_g: { type: "number" },
                              carbs_g: { type: "number" },
                              fat_g: { type: "number" },
                            },
                            required: ["meal_type", "food_name", "portion", "kcal", "protein_g", "carbs_g", "fat_g"],
                            additionalProperties: false,
                          },
                        },
                      },
                      required: ["day_index", "meals"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["days"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_plan" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const plan = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(plan), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-meal-plan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
