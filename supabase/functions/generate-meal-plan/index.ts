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
      // ═══ NutriPlan Elite — Dimensão 1: TDEE Farmacologicamente Ajustado ═══
      compostos_ativos,        // string[] — nomes de peptídeos/AAS/SARMs ativos do Dr. VERTEX
      perfil_pca,              // "AM" | "EI" | "SE" | "PP"
      body_fat_pct,            // number — % de gordura corporal (para Katch-McArdle)
      // ═══ NutriPlan Elite — Fase 4: Modos especiais ═══
      modo_especial,           // "padrao" | "competicao" | "glp1" | "feminino"
      fase_ciclo,              // (feminino) "folicular" | "ovulatoria" | "lutea" | "menstrual"
      dias_para_competicao,    // (competicao) number
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

    // ═══════════════════════════════════════════════════════════════
    // NUTRIPLAN ELITE — DIMENSÃO 1: TDEE FARMACOLOGICAMENTE AJUSTADO
    // Cálculo determinístico (Katch-McArdle ou Mifflin) + multiplicadores
    // por composto ativo do Dr. VERTEX.
    // ═══════════════════════════════════════════════════════════════
    const _compostos: string[] = Array.isArray(compostos_ativos)
      ? compostos_ativos.map((c: any) => String(c)).filter(Boolean)
      : [];
    const _perfilPca = String(perfil_pca || profile?.perfil_comportamental || "").toUpperCase();

    const _peso = Number(profile?.weight_kg) || 0;
    const _altura = Number(profile?.height_cm) || 0;
    const _idade = Number(profile?.age) || 30;
    const _sexo = String(profile?.sex || "").toLowerCase();
    const _bf = Number(body_fat_pct ?? profile?.body_fat_pct) || 0;

    let _tmb = 0;
    let _formulaUsada = "Mifflin-St Jeor";
    if (_peso > 0 && _bf > 0 && _bf < 60) {
      const massaMagra = _peso * (1 - _bf / 100);
      _tmb = Math.round(370 + 21.6 * massaMagra);
      _formulaUsada = "Katch-McArdle";
    } else if (_peso > 0 && _altura > 0) {
      _tmb = _sexo.startsWith("f")
        ? Math.round(10 * _peso + 6.25 * _altura - 5 * _idade - 161)
        : Math.round(10 * _peso + 6.25 * _altura - 5 * _idade + 5);
    }
    const _tdeeBruto = _tmb > 0 ? Math.round(_tmb * _fatorAtividade) : kcalAlvo;

    // Multiplicadores farmacológicos por composto
    const PHARMA_TABLE: Array<{ regex: RegExp; nome: string; mult: number; nota: string; macroHint?: string }> = [
      { regex: /(ipamorelin|cjc[-\s]?1295|mk[-\s]?677|ibutamoren|hexarelin|tesamorelin|sermorelin|ghrp)/i, nome: "GH Secretagogo", mult: 1.15, nota: "Lipólise + IGF-1 elevam TDEE 12–18%", macroHint: "Glicina 5g noite" },
      { regex: /(semaglut|tirzepat|retatru|liragl|dulagl|ozempic|mounjaro|wegovy)/i, nome: "GLP-1 Agonista", mult: 1.20, nota: "Termogênese central +15–25%; supressão apetite — fracionar em 6 refeições densas", macroHint: "PTN 1.8–2.2 g/kg, líquidas se necessário" },
      { regex: /(testoster|nandrolon|deca|trenbolon|oxandrolon|anavar|stanozol|winstrol|dianabol|metandiena|boldenona|primobolan|masteron)/i, nome: "AAS / Anabolizante", mult: 1.0, nota: "TDEE inalterado, mas PTN MÍNIMA 2.8–3.5 g/kg MM", macroHint: "Ômega-3 4g + tauro-ursodesoxicólico se oral" },
      { regex: /(slu[-\s]?pp[-\s]?332|sluppe|slu332)/i, nome: "SLU-PP-332", mult: 1.35, nota: "Ativador PPAR/ERR — mimetismo de exercício +30–40% basal", macroHint: "Carb cycling agressivo" },
      { regex: /(cardarine|gw[-\s]?501516|gw1516)/i, nome: "Cardarine GW-501516", mult: 1.10, nota: "+8–12% oxidação de ácidos graxos — gordura dietética 25–30%, reduzir CHO de repouso" },
      { regex: /(bpc[-\s]?157|tb[-\s]?500|tb500|thymosin)/i, nome: "BPC-157 / TB-500", mult: 1.0, nota: "Sem impacto TDEE — adicionar +15g glutamina + glicina/dia para reparo tecidual" },
      { regex: /(mk[-\s]?2866|ostarine|lgd[-\s]?4033|ligandrol|rad[-\s]?140|testolone|s4|andarine|s23|yk[-\s]?11)/i, nome: "SARM", mult: 1.05, nota: "Levemente termogênico; PTN 2.5–3.0 g/kg MM" },
      { regex: /(t3|liotironin|cytomel|t4|levotirox|clenbut|albuter|salbut|dnp|2,4)/i, nome: "Termogênico Tireoidiano/β2", mult: 1.25, nota: "TDEE +20–30%; monitorar K+ e taurina; evitar déficit + termogênico simultâneo" },
      { regex: /(insulin|humalog|novorapid|lantus)/i, nome: "Insulina exógena", mult: 1.0, nota: "Janela CHO peri-treino crítica (40–60g de carb por UI rápida)", macroHint: "ZERO gordura na refeição peri-injeção" },
      { regex: /(metformin|berberin)/i, nome: "Sensibilizador insulínico", mult: 0.98, nota: "Leve redução TDEE; melhora partição de nutrientes" },
    ];

    const _ajusteBreakdown: Array<{ composto: string; categoria: string; multiplicador: number; impacto_kcal: number; nota: string; macro_hint?: string }> = [];
    let _multAcumulado = 1.0;
    for (const c of _compostos) {
      for (const row of PHARMA_TABLE) {
        if (row.regex.test(c)) {
          _multAcumulado *= row.mult;
          _ajusteBreakdown.push({
            composto: c,
            categoria: row.nome,
            multiplicador: row.mult,
            impacto_kcal: Math.round(_tdeeBruto * (row.mult - 1)),
            nota: row.nota,
            ...(row.macroHint ? { macro_hint: row.macroHint } : {}),
          });
          break;
        }
      }
    }
    // Cap multiplicador combinado em 1.60 (segurança)
    const _multFinal = Math.min(_multAcumulado, 1.60);
    const _tdeeAjustado = Math.round(_tdeeBruto * _multFinal);

    const pharmaPrompt = (_compostos.length > 0 || _ajusteBreakdown.length > 0) ? `
═══════════════════════════════════════════════════════
💊 NUTRIPLAN ELITE — TDEE FARMACOLOGICAMENTE AJUSTADO
═══════════════════════════════════════════════════════
- Fórmula: ${_formulaUsada} | TMB: ${_tmb} kcal | Fator atividade: ${_fatorAtividade}
- TDEE BRUTO: ${_tdeeBruto} kcal
- Compostos ativos declarados: ${_compostos.join(", ") || "nenhum"}
- Multiplicador farmacológico combinado: ${_multFinal.toFixed(2)}x (cap 1.60)
- TDEE AJUSTADO: ${_tdeeAjustado} kcal

BREAKDOWN POR COMPOSTO:
${_ajusteBreakdown.map(b => `• ${b.composto} [${b.categoria}] × ${b.multiplicador} (${b.impacto_kcal >= 0 ? "+" : ""}${b.impacto_kcal} kcal) — ${b.nota}${b.macro_hint ? ` | ${b.macro_hint}` : ""}`).join("\n") || "• (sem ajustes)"}

REGRAS OBRIGATÓRIAS NA PRESCRIÇÃO:
1) Use ${_tdeeAjustado} kcal como meta calórica EFETIVA (sobrescreve ${kcalAlvo}).
2) Para usuário em GLP-1: refeições menores e mais densas em micronutrientes; 6 refeições/dia.
3) Para AAS/SARMs: PTN mínima absoluta 2.8 g/kg de massa magra.
4) Para Cardarine: deslocar gordura dietética para 25–30% e reduzir CHO em dias de repouso.
5) Para SLU-PP-332/T3/Clenbuterol: aumentar K+ (banana, batata), Mg 400mg noite e taurina 3g/dia.
6) Para BPC-157/TB-500: incluir 15g de glicina+glutamina distribuídos no dia.
7) Para insulina exógena: refeição peri-injeção SEM gordura, CHO de IG médio-alto.
═══════════════════════════════════════════════════════
` : "";

    const pcaPrompt = _perfilPca ? `
═══════════════════════════════════════════════════════
🧠 PERFIL COMPORTAMENTAL PCA: ${_perfilPca}
═══════════════════════════════════════════════════════
${_perfilPca === "AM" ? "Linguagem direta, técnica, sem rodeios. Refeições enxutas, métricas claras, foco em performance e número." : ""}
${_perfilPca === "EI" ? "Linguagem acolhedora, flexível. Sempre ofereça 2–3 substituições por refeição. Inclua 1 refeição de flexibilidade controlada por semana. Reforce conexão alimentação ↔ humor." : ""}
${_perfilPca === "SE" ? "Linguagem ultra-detalhada com justificativa fisiológica de cada escolha (mecanismo mTORC1, leucina, GLUT-4, etc). Tabelas precisas, progressão estruturada." : ""}
${_perfilPca === "PP" ? "Plano simplificado: 3–4 alimentos repetidos por refeição. Estratégia central = meal prep semanal em batch. Alertas proativos." : ""}
═══════════════════════════════════════════════════════
` : "";

    // ═══════════════════════════════════════════════════════════════
    // NUTRIPLAN ELITE — Fase 4: MODOS ESPECIAIS
    // ═══════════════════════════════════════════════════════════════
    const _modo = String(modo_especial || "padrao").toLowerCase();
    const modoEspecialPrompt = (() => {
      if (_modo === "competicao") {
        const dc = Number(dias_para_competicao) || 14;
        return `
═══════════════════════════════════════════════════════
🏆 MODO COMPETIÇÃO ATIVO (peak week — ${dc} dias até show)
═══════════════════════════════════════════════════════
- Cronograma de carb/sódio/água em peak week (D-7 → D-1).
- Cortar fibra insolúvel a partir de D-3, manter PTN ≥3 g/kg, gordura 0,8 g/kg.
- D-2/D-1: depleção controlada → super-compensação CHO (8–10 g/kg de massa magra).
- Sódio: alto até D-2, corte D-1, normaliza no show day; potássio +30%.
- Água: 5–7L até D-2, reduz progressivo, 250–500ml no show day.
- Refeições: 5–6 sólidas, evitar lactose/cruciferas/legumes na última semana.
` ;
      }
      if (_modo === "glp1") {
        return `
═══════════════════════════════════════════════════════
💉 MODO GLP-1 ATIVO (Semaglutida/Tirzepatida/Retatrutide)
═══════════════════════════════════════════════════════
- Apetite suprimido: priorizar densidade nutricional + refeições FRACIONADAS (6/dia, porções menores).
- Proteína OBRIGATÓRIA 1.8–2.2 g/kg (preservar massa magra).
- Hipoglicemia: alertar quando refeição >5h sem CHO; sugerir snack proteico+CHO médio IG.
- Líquidos calóricos (whey + leite + fruta) quando saciedade extrema.
- Náusea: evitar fritos, gordura alta concentrada e refeições muito grandes.
- Reforçar fibras solúveis suaves (aveia, chia hidratada) e água 35ml/kg.
`;
      }
      if (_modo === "feminino") {
        const f = String(fase_ciclo || "folicular").toLowerCase();
        return `
═══════════════════════════════════════════════════════
🌸 MODO FEMININO ATIVO (ciclagem por fase: ${f})
═══════════════════════════════════════════════════════
${f === "folicular" ? "- Folicular: sensibilidade insulínica ALTA — CHO mais alto (5 g/kg em treino), foco força/hipertrofia." : ""}
${f === "ovulatoria" ? "- Ovulatória: pico estrogênio — performance máxima, manter CHO alto, hidratação +20%." : ""}
${f === "lutea" ? "- Lútea: TDEE +5–10% — aumentar kcal +150–250, magnésio 400mg, B6 50mg, triptofano (peru, banana) à noite, gordura mod-alta." : ""}
${f === "menstrual" ? "- Menstrual: ferro heme (carne vermelha 2x/sem), vitamina C com ferro, foco anti-inflamatório (cúrcuma, ômega-3 4g)." : ""}
- Alerta RED-S: se kcal < 30 kcal/kg de massa magra → BLOQUEAR plano e exigir ajuste.
- NUNCA prescrever plano restritivo se houver sinal de amenorreia (>2 meses sem ciclo).
`;
      }
      return "";
    })();

    const systemPrompt = `Você é o NutriPlan Elite — módulo de prescrição nutricional clínico-esportiva do nutriON, com formação equivalente a PhD em Nutrição Esportiva e especialização em farmacologia do esporte.

Você integra 6 dimensões em cada plano:
1) TDEE FARMACOLOGICAMENTE AJUSTADO (multiplicadores por composto ativo do Dr. VERTEX)
2) CRONONUTRIÇÃO CIRCADIANA (cortisol matinal, pico insulínico diurno, GH noturno)
3) GLUT-4 SYNC peri-workout (pré 60–90min, intra se >60min, pós 0–30min)
4) DISTRIBUIÇÃO POR FASE STRATUM (acumulação/intensificação/realização/deload)
5) BANCO DE ALIMENTOS BRASILEIRO com medidas caseiras e função metabólica
6) ADAPTAÇÃO AO PERFIL PCA (AM/EI/SE/PP) na linguagem e estrutura

Você NUNCA gera planos genéricos, NUNCA usa linguagem de "dieta restritiva" (o nutriON prescreve PROTOCOLOS), NUNCA ignora o perfil PCA, NUNCA prescreve sem considerar treino e farmacologia ativa.
Cada refeição deve ter: alimentos com gramas + medida caseira brasileira + função metabólica + janela circadiana (cortisol/insulina/gh).

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
${pharmaPrompt}
${pcaPrompt}
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

    // ═══════════════════════════════════════════════════════════════
    // SINCRONIZAÇÃO TRAININGON ↔ NUTRION — pós-processamento determinístico
    // Garante que sincronizacao_trainingon SEMPRE saia completo quando o
    // payload do TrainingON estiver presente, mesmo que a IA omita.
    // ═══════════════════════════════════════════════════════════════
    try {
      if (_hasTrainingOn) {
        // Cycling de carb por músculo prioritário
        const cycleMap: Record<string, { pct: number; just: string }> = {
          pernas: { pct: 30, just: "Maior massa muscular → +glicogênio. Intra-treino + CHO rápido pós ≤30min." },
          quadriceps: { pct: 30, just: "Quadríceps demanda glicogênio elevado." },
          posterior: { pct: 30, just: "Cadeia posterior demanda glicogênio elevado." },
          gluteos: { pct: 30, just: "Glúteos: síntese lenta — CHO alto + colágeno + PTN ≥2,5 g/kg." },
          costas: { pct: 25, just: "Volume alto de sets → glutamina 10g pós." },
          peito: { pct: 20, just: "Push de alto volume — creatina pré." },
          triceps: { pct: 20, just: "Push acessório." },
          ombros: { pct: 15, just: "Volume moderado — gordura boa para articulação." },
          deltoide: { pct: 15, just: "Volume moderado." },
          biceps: { pct: 10, just: "Menor massa — BCAAs intra se déficit." },
          core: { pct: 0, just: "Baixa demanda — sem ajuste." },
          abdomen: { pct: 0, just: "Baixa demanda — sem ajuste." },
        };
        const cyclingPorMusculo = _musculos.map((m) => {
          const k = norm(m);
          const found = Object.keys(cycleMap).find((kk) => k.includes(kk)) || "core";
          return {
            dia: `Dia de ${m}`,
            musculo: m,
            cho_ajuste_pct: cycleMap[found].pct,
            justificativa: cycleMap[found].just,
          };
        });

        // Suplementação sincronizada determinística
        const sistemaLow = norm(sistema_treino);
        const fibraLow = norm(tipo_fibra);
        const stratumLow = stratum_fase ? norm(String(stratum_fase)) : "";
        const supSync: Array<{ suplemento: string; dose: string; timing: string; justificativa_treino: string }> = [];

        const creatinaDose = (sistemaLow.includes("heavy") || sistemaLow.includes("dc") || stratumLow.includes("realiza"))
          ? "10g/dia bipartida (pré + pós)"
          : "5g/dia pós-treino";
        supSync.push({ suplemento: "Creatina monohidratada", dose: creatinaDose, timing: "Pós-treino", justificativa_treino: "Suporte ATP-CP universal." });
        supSync.push({ suplemento: "Magnésio quelato", dose: "400mg", timing: "Noite", justificativa_treino: "Contração muscular e sono." });
        supSync.push({ suplemento: "Zinco", dose: "25mg", timing: "Noite", justificativa_treino: "Testosterona e recuperação." });
        supSync.push({ suplemento: "Vitamina D3", dose: "5000 UI", timing: "Manhã com gordura", justificativa_treino: "Função neuromuscular." });

        if (sistemaLow.includes("5/3/1") || sistemaLow.includes("531") || sistemaLow.includes("wendler")) supSync.push({ suplemento: "Beta-alanina", dose: "3,2g/dia bipartida", timing: "Manhã + pré-treino", justificativa_treino: "Tampona lactato (5/3/1 pesado)." });
        if (sistemaLow.includes("fst")) { supSync.push({ suplemento: "Glutamina", dose: "10g", timing: "Pós-treino", justificativa_treino: "Recuperação fascial (FST-7)." }); supSync.push({ suplemento: "Citrulina malato", dose: "6g", timing: "Pré-treino", justificativa_treino: "Pump fascial (FST-7)." }); }
        if (sistemaLow.includes("y3t")) supSync.push({ suplemento: "EAA + eletrólitos", dose: "10g + 600mg sódio/L", timing: "Intra (Y3T sem 3)", justificativa_treino: "Volume extremo na sem 3." });
        if (sistemaLow.includes("heavy")) { supSync.push({ suplemento: "EAA", dose: "10g", timing: "Pré-treino", justificativa_treino: "Falha absoluta (Heavy Duty)." }); supSync.push({ suplemento: "Citrulina malato", dose: "8g", timing: "Pré-treino", justificativa_treino: "Vasodilatação." }); }
        if (sistemaLow.includes("gvt") || sistemaLow.includes("german")) { supSync.push({ suplemento: "Glutamina", dose: "15g/dia", timing: "Distribuída", justificativa_treino: "Volume 10×10 (GVT)." }); supSync.push({ suplemento: "Vitamina C", dose: "2g/dia", timing: "Distribuída", justificativa_treino: "Antioxidante para volume extremo." }); supSync.push({ suplemento: "Taurina", dose: "3g/dia", timing: "Pré-treino", justificativa_treino: "Tampão de cálcio em GVT." }); }
        if (sistemaLow.startsWith("dc") || sistemaLow.includes(" dc") || sistemaLow.includes("dctraining") || sistemaLow.includes("dante")) { supSync.push({ suplemento: "Colágeno hidrolisado", dose: "10g/dia", timing: "Manhã", justificativa_treino: "Suporte tendíneo (DC)." }); supSync.push({ suplemento: "Glucosamina", dose: "1,5g/dia", timing: "Almoço", justificativa_treino: "Suporte articular." }); }

        if (fibraLow === "tipo_i" || fibraLow === "tipoi" || fibraLow === "i") { supSync.push({ suplemento: "Ômega-3 EPA+DHA", dose: "4g/dia", timing: "Refeições", justificativa_treino: "Eficiência mitocondrial (TIPO_I)." }); supSync.push({ suplemento: "CoQ10", dose: "200mg/dia", timing: "Manhã", justificativa_treino: "Bioenergética (TIPO_I)." }); }
        if (fibraLow.includes("iix") || fibraLow.includes("iib")) { supSync.push({ suplemento: "Beta-alanina", dose: "3,2g/dia", timing: "Bipartida", justificativa_treino: "Tampona lactato (TIPO_IIX)." }); supSync.push({ suplemento: "Cafeína", dose: "200mg", timing: "30–45min pré-treino", justificativa_treino: "CNS para fibras explosivas." }); }

        for (const m of _musculos) {
          const k = norm(m);
          if (k.includes("perna") || k.includes("quad") || k.includes("posterior")) { supSync.push({ suplemento: "Glutamina", dose: "10g", timing: "Pós dia de pernas", justificativa_treino: "Recuperação de grupo de alta demanda." }); supSync.push({ suplemento: "Arginina", dose: "6g", timing: "Pré dia de pernas", justificativa_treino: "Vasodilatação para pernas." }); }
          if (k.includes("gluteo")) { supSync.push({ suplemento: "Colágeno hidrolisado", dose: "10g/dia", timing: "Manhã", justificativa_treino: "Tendões/fascia (foco glúteos)." }); supSync.push({ suplemento: "Vitamina C", dose: "1g/dia", timing: "Manhã com colágeno", justificativa_treino: "Cofator de síntese de colágeno." }); }
          if (k.includes("ombro") || k.includes("deltoide")) supSync.push({ suplemento: "Ômega-3", dose: "4g/dia", timing: "Refeições", justificativa_treino: "Saúde articular do deltóide." });
          if (k.includes("costa")) supSync.push({ suplemento: "Citrulina malato", dose: "8g", timing: "Pré dia de costas", justificativa_treino: "Pump e endurance em costas." });
        }

        // Detecção de conflitos
        const conflitos: string[] = [];
        const alertas: string[] = [];
        const objetivoLow = String(objetivo || "").toLowerCase();
        const faseLow = String(training_phase || "").toLowerCase();
        const isBulkTreino = faseLow.includes("bulk");
        const isCutTreino = faseLow.includes("cut");
        const isCutNutri = objetivoLow.includes("emagrec") || objetivoLow.includes("perda") || objetivoLow.includes("cut");
        const isBulkNutri = objetivoLow.includes("hipertrofia") || objetivoLow.includes("massa") || objetivoLow.includes("bulk");
        if ((isBulkTreino && isCutNutri) || (isCutTreino && isBulkNutri)) {
          conflitos.push(`Conflito de fase: TrainingON em "${training_phase}" mas objetivo nutricional "${objetivo}". Usando fase do TrainingON.`);
          alertas.push(`⚠️ Ajuste o objetivo nutricional para coerência com TrainingON (${training_phase}).`);
        }

        const pesoN = Number(profile?.weight_kg) || 0;
        const tdeeEstimado = pesoN > 0 ? Math.round(pesoN * 22 * _fatorAtividade) : 0;
        if (_volume > 160 && kcalAlvo > 0 && tdeeEstimado > 0 && kcalAlvo < tdeeEstimado * 0.90) {
          conflitos.push(`Volume alto (${_volume} sets) com déficit > 10% (alvo ${kcalAlvo} kcal vs TDEE ~${tdeeEstimado}).`);
          alertas.push(`⚠️ Risco de catabolismo: aumentar kcal em ≥${Math.round(tdeeEstimado * 0.90 - kcalAlvo)} ou reduzir volume para <120 sets/sem.`);
        }
        if (_tempoSessao > 90) {
          alertas.push(`⚠️ Sessão > ${_tempoSessao}min: prescrever maltodextrina 40g (ou dextrose 30g) intra-treino.`);
        }
        if ((sistemaLow.includes("gvt") || sistemaLow.includes("german")) && isCutTreino) {
          conflitos.push("GVT em cutting é alto risco.");
          alertas.push("⚠️ Considere migrar para EDT ou Y3T sem 2. Se mantiver GVT: déficit máx -10% e PTN ≥3,0 g/kg.");
        }
        if (cardio_mesmo_dia && (_intensidade.includes("alta") || _intensidade.includes("muito"))) {
          alertas.push("⚠️ Cardio + força alta no mesmo dia: separar ≥6h ou cardio APÓS força. Adicionar 200–400 kcal extras.");
        }

        const recomendacoes: string[] = [];
        recomendacoes.push(`Aplicar fator de atividade ${_fatorAtividade} sobre o TMB para refletir o volume de ${_volume || "?"} sets/sem.`);
        if (_gastoKcalTreino > 0) recomendacoes.push(`Somar ~${_gastoKcalTreino} kcal nos dias de treino (sessão ${_tempoSessao}min, intensidade ${_intensidade}).`);
        if (cyclingPorMusculo.length > 0) recomendacoes.push(`Aplicar cycling de CHO nos dias de ${_musculos.join(", ")}.`);
        if (stratum_fase) recomendacoes.push(`STRATUM ATIVO (${stratum_fase}): sobrescrever fase nutricional pela demanda da fase.`);

        const existente: any = (plan as any).sincronizacao_trainingon && typeof (plan as any).sincronizacao_trainingon === "object"
          ? (plan as any).sincronizacao_trainingon
          : {};

        (plan as any).sincronizacao_trainingon = {
          fase_treino: existente.fase_treino || training_phase || "não informada",
          sistema_treino: existente.sistema_treino || sistema_treino || "não informado",
          volume_semanal_sets: Number.isFinite(existente.volume_semanal_sets) ? existente.volume_semanal_sets : _volume,
          gasto_kcal_treino_dia: Number.isFinite(existente.gasto_kcal_treino_dia) ? existente.gasto_kcal_treino_dia : _gastoKcalTreino,
          musculos_prioritarios: Array.isArray(existente.musculos_prioritarios) && existente.musculos_prioritarios.length ? existente.musculos_prioritarios : _musculos,
          tipo_fibra: existente.tipo_fibra || tipo_fibra || "MISTO",
          ajuste_tdee_volume: Number.isFinite(existente.ajuste_tdee_volume) ? existente.ajuste_tdee_volume : _fatorAtividade,
          cycling_por_musculo: Array.isArray(existente.cycling_por_musculo) && existente.cycling_por_musculo.length ? existente.cycling_por_musculo : cyclingPorMusculo,
          suplementacao_sincronizada: Array.isArray(existente.suplementacao_sincronizada) && existente.suplementacao_sincronizada.length ? existente.suplementacao_sincronizada : supSync,
          conflitos_detectados: Array.from(new Set([...(Array.isArray(existente.conflitos_detectados) ? existente.conflitos_detectados : []), ...conflitos])),
          alertas_sincronizacao: Array.from(new Set([...(Array.isArray(existente.alertas_sincronizacao) ? existente.alertas_sincronizacao : []), ...alertas])),
          recomendacoes_integracao: Array.from(new Set([...(Array.isArray(existente.recomendacoes_integracao) ? existente.recomendacoes_integracao : []), ...recomendacoes])),
          stratum_fase: stratum_fase || null,
          intensidade_treino: _intensidade,
          cardio_mesmo_dia: !!cardio_mesmo_dia,
        };
      }
    } catch (e) {
      console.warn("[sincronizacao_trainingon] falha ao montar bloco:", e);
    }

    // ═══════════════════════════════════════════════════════════════
    // NutriPlan Elite — anexar metadados ao response (não-destrutivo)
    // ═══════════════════════════════════════════════════════════════
    (plan as any).nutriplan_elite = {
      tdee_bruto: _tdeeBruto,
      tdee_ajustado: _tdeeAjustado,
      formula_tmb: _formulaUsada,
      tmb: _tmb,
      fator_atividade: _fatorAtividade,
      multiplicador_farmacologico: Number(_multFinal.toFixed(3)),
      compostos_ativos: _compostos,
      ajuste_farmacologico_breakdown: _ajusteBreakdown,
      perfil_pca: _perfilPca || null,
      kcal_meta_efetiva: _tdeeAjustado || kcalAlvo,
      versao: "elite-v1",
    };

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
