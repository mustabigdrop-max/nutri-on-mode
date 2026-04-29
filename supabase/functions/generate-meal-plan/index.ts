import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const {
      profile, weekStart, budgetMode, workoutSchedule,
      // ═══ Sincronização TrainingON ↔ NutriON ═══
      training_phase,          // "Bulking" | "Cutting" | "Recomposição" | "Performance"
      sistema_treino,          // "5/3/1" | "FST-7" | "Y3T" | "Heavy Duty" | "DC" | "GVT" | "PPL"
      volume_sets_semana,      // number — total de sets na semana
      musculos_prioritarios,   // string[] — grupos prioritários
      tipo_fibra,              // "TIPO_I" | "TIPO_IIA" | "TIPO_IIX" | "MISTO"
      tempo_sessao_min,        // number — duração real da sessão
      stratum_fase,            // "acumulacao" | "intensificacao" | "realizacao" | "deload"
      cardio_mesmo_dia,        // boolean
      intensidade_treino,      // "leve" | "moderada" | "alta" | "muito_alta"
    } = body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Detecta presença de payload do TrainingON
    const _hasTrainingOn = !!(
      training_phase || sistema_treino || volume_sets_semana ||
      (Array.isArray(musculos_prioritarios) && musculos_prioritarios.length) ||
      tipo_fibra || tempo_sessao_min || stratum_fase
    );

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
    }

    // ═══════════════════════════════════════════════════════════════
    // BLOCO TRAININGON ↔ NUTRION — PROTOCOLO ELITE
    // (injetado entre Protocolos Avançados e Banco de Alimentos)
    // ═══════════════════════════════════════════════════════════════
    const norm = (s: string) => String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const _musculos: string[] = Array.isArray(musculos_prioritarios)
      ? musculos_prioritarios.map((m: any) => String(m))
      : (musculos_prioritarios ? [String(musculos_prioritarios)] : []);
    const _intensidade = String(intensidade_treino || "alta").toLowerCase();
    const _volume = Number(volume_sets_semana || 0);
    const _tempoSessao = Number(tempo_sessao_min || 0);

    let _fatorAtividade = 1.55;
    if (_volume > 200) _fatorAtividade = 1.90;
    else if (_volume > 160) _fatorAtividade = 1.80;
    else if (_volume >= 120) _fatorAtividade = 1.725;
    else if (_volume >= 80) _fatorAtividade = 1.65;

    const _fatorIntensidade = _intensidade.includes("muito") ? 1.4
      : _intensidade.includes("alta") ? 1.2
      : _intensidade.includes("mod") ? 1.0
      : _intensidade.includes("leve") ? 0.7
      : 1.2;
    const _gastoKcalTreino = _tempoSessao > 0
      ? Math.round((_tempoSessao / 60) * 400 * _fatorIntensidade)
      : 0;

    const trainingOnPrompt = _hasTrainingOn ? `
═══════════════════════════════════════════════════════
🔗 SINCRONIZAÇÃO TRAININGON ↔ NUTRION — PROTOCOLO ELITE (OBRIGATÓRIA)
═══════════════════════════════════════════════════════
DADOS DO TRAININGON:
- Fase de treino: ${training_phase || "não informada"}
- Sistema de treino: ${sistema_treino || "não informado"}
- Volume semanal (sets): ${_volume || "não informado"}
- Tempo de sessão: ${_tempoSessao || "?"} min | Intensidade: ${_intensidade}
- Músculos prioritários: ${_musculos.length ? _musculos.join(", ") : "nenhum"}
- Tipo de fibra muscular: ${tipo_fibra || "não informado"}
${stratum_fase ? `- STRATUM ATIVO — Fase: ${stratum_fase}` : ""}
- Cardio no mesmo dia do treino de força: ${cardio_mesmo_dia ? "SIM" : "NÃO"}

⛔ REGRA SUPREMA: Se a fase do TrainingON conflitar com o objetivo nutricional,
a fase do TrainingON é PRIORITÁRIA — o treino define a nutrição.

═══ BLOCO 1 — FASE DE TREINO → FASE NUTRICIONAL ═══
- Bulking → Bulk Limpo: superávit +10% TDEE | PTN 2,2–2,5 g/kg | CHO 50–55% | GORD 25–28%.
- Cutting → Cutting: déficit -20 a -25% TDEE | PTN 2,8–3,2 g/kg (mínimo absoluto) | CHO ciclado por intensidade do dia. Refeed 1×/sem se ≥4 sem em déficit.
- Recomposição → Recomp: TDEE ±3% | PTN 2,5–3,0 g/kg com leucina ≥3g/refeição | 2 perfis (treino pesado vs descanso) | Ômega-3 4 g/dia.
- Performance → Manutenção+performance: kcal manutenção ou +5% | CHO ALTO em treino (5–6 g/kg) | timing peri-treino agressivo | creatina+beta-alanina integrados.

═══ BLOCO 2 — SISTEMA DE TREINO → AJUSTE NUTRICIONAL ═══
APLIQUE rigorosamente conforme "${sistema_treino || "—"}":
- 5/3/1: dias pesados +30% CHO, deload -30% CHO; PTN 2,2 g/kg; creatina 5g; cafeína 200mg pré pesado.
- FST-7: +25% CHO no dia FST; hidratação intra obrigatória; glutamina 10g pós; ômega-3 4g.
- Y3T: sem 1 (força) CHO mod; sem 2 (hipertrofia) CHO alto; sem 3 (volume) CHO MÁXIMO + eletrólitos + +500ml/dia.
- Heavy Duty: CHO pré crítico; pós carb rápido + proteína imediato; recuperação 48–72h (mais dias de CHO baixo).
- DC: PTN 3 g/kg; CHO 60–80g 90 min antes; creatina 10g/dia bipartida; sono 8h+.
- GVT: +40% CHO no dia GVT; eletrólitos intra (sódio 600mg/L); cúrcuma 1g + ômega-3 4g; descanso 48h antes do próximo GVT.
- PPL: CHO uniforme; PTN a cada 3h; ciclagem Push=mod, Pull=alto, Legs=MÁXIMO.

═══ BLOCO 3 — VOLUME SEMANAL → AJUSTE TDEE ═══
Fator de atividade pelo volume_sets_semana:
- <80 = 1.55 | 80–120 = 1.65 | 120–160 = 1.725 | >160 = 1.80 | >200 (GVT/Arnold) = 1.90
APLICAR fator: ${_fatorAtividade}.
Cálculo de gasto: kcal_treino = (tempo_sessao_min ÷ 60) × 400 × fator_intensidade.
Fator intensidade: Leve=0.7 | Moderada=1.0 | Alta=1.2 | Muito Alta=1.4.
GASTO REAL ESTIMADO POR SESSÃO: ${_gastoKcalTreino} kcal — SOMAR ao TDEE base nos dias de treino.

═══ BLOCO 4 — MÚSCULOS PRIORITÁRIOS → CYCLING DE CARB ═══
Aplicar APENAS no(s) dia(s) do(s) músculo(s) prioritário(s) [${_musculos.join(", ") || "nenhum"}]:
- Pernas/Quadríceps/Posterior: +30% CHO + maltodextrina 40g intra + carb rápido pós em ≤30min.
- Costas: +25% CHO + glutamina 10g pós.
- Peito+Tríceps: +20% CHO + creatina pré.
- Ombros: +15% CHO + foco em gordura boa (ômega-3, azeite).
- Bíceps/Tríceps isolado: +10% CHO; BCAAs intra se déficit.
- Core/Abdômen: sem ajuste.
- Glúteos prioritário: +30% CHO + colágeno 10g + PTN ≥2,5 g/kg.

═══ BLOCO 5 — TIPO DE FIBRA (${tipo_fibra || "—"}) ═══
- TIPO_I: CHO baixo IG, GORD até 30%, PTN 2,0–2,2 g/kg, ômega-3 4g, CoQ10 200mg.
- TIPO_IIA: CHO mod-alto em treino, PTN 2,2–2,5 g/kg, creatina 5g, timing peri-treino crítico.
- TIPO_IIX: CHO ALTO sempre que treina, PTN 2,5–3,0 g/kg, creatina 10g bipartida, carb rápido pré 30–45min, janela pós <20min, beta-alanina 3,2g.
- MISTO: protocolo padrão com cycling de carb.

${stratum_fase ? `═══ BLOCO 6 — STRATUM (${stratum_fase}) — SOBREPÕE A FASE NUTRICIONAL ═══
- acumulacao: CHO MÁX 5–6 g/kg, PTN 2,5 g/kg em 6+ refeições, +10% kcal, anti-inflamatório alto.
- intensificacao: CHO mod com timing preciso (pré+pós obrigatório), PTN 2,8 g/kg, kcal manut/+5%, creatina 10g bipartida.
- realizacao: CHO pré 1,5 g/kg 2h antes, PTN 3,0 g/kg, kcal manutenção, EAA intra+creatina+beta-alanina.
- deload: CHO -20%, PTN ≥2,0 g/kg, foco micros (Mg+Zn+VitD), anti-inflamatório máx.
` : ""}
═══ BLOCO 7 — CONFLITOS A DETECTAR ═══
1) Fase TrainingON ≠ objetivo nutricional → usar fase TrainingON.
2) volume_sets_semana > 160 e meta_kcal < TDEE × 0,90 → risco catabolismo.
3) tempo_sessao_min > 90 sem intra-treino → prescrever malto 40g ou dextrose 30g.
4) GVT em cutting → preferir EDT/Y3T sem 2; se manter, déficit máx -10% e PTN ≥3,0 g/kg.
5) Cardio no mesmo dia que treino de alta intensidade → separar 6h ou cardio APÓS força; +200–400 kcal.

═══ BLOCO 8 — SUPLEMENTAÇÃO SINCRONIZADA (mencionar nas observações do plano) ═══
UNIVERSAL: Creatina 5g/dia (10g bipartida se Heavy Duty/DC/STRATUM realizacao) | Mg quelato 400mg noite | Zn 25mg noite | VitD3 5000UI manhã c/ gordura.
POR SISTEMA: 5/3/1→Beta-alanina 3,2g | FST-7→Glutamina 10g pós + Citrulina 6g pré | Y3T sem 3→EAA 10g intra + eletrólitos | Heavy Duty→EAA 10g pré + Citrulina 8g | GVT→Glutamina 15g + VitC 2g + Taurina 3g | DC→Colágeno 10g + VitC 1g + Glucosamina 1,5g.
POR FIBRA: TIPO_I→Ômega-3 4g + CoQ10 200mg | TIPO_IIX→Beta-alanina 3,2g + Cafeína 200mg pré.
POR MÚSCULO PRIORITÁRIO: Pernas→Glutamina 10g + Arginina 6g pré | Glúteos→Colágeno 10g + VitC | Ombros→Ômega-3 4g | Costas→Citrulina 8g pré.

INSTRUÇÕES FINAIS:
1) NUNCA contradizer a fase do TrainingON.
2) SEMPRE ajustar CHO pelo sistema "${sistema_treino || "—"}".
3) SEMPRE somar ${_gastoKcalTreino} kcal nos dias de treino ao TDEE base.
4) Se houver músculo prioritário: cycling automático naqueles dias.
${stratum_fase ? `5) STRATUM ATIVO (${stratum_fase}) — sobrescrever fase nutricional pela demanda da fase.` : ""}
═══════════════════════════════════════════════════════
` : "";

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
${trainingOnPrompt}
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
