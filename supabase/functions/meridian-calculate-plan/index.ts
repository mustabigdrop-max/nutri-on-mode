// MERIDIAN — Edge Function v2: cálculo reverso determinístico com suporte a CUT, BUILD e MAINTENANCE.
// Inclui validação categoria × sexo e bloqueio clínico obrigatório p/ atleta feminina BF < 14%.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AthleteOverride {
  biological_sex?: "MALE" | "FEMALE";
  athlete_track?: "ENHANCED" | "NATURAL" | "LIFESTYLE";
  height_cm?: number;
  current_weight_kg?: number;
  current_bf_percent?: number;
  menstrual_status?: string | null;
  months_since_menstruation?: number | null;
}

interface CalculatePlanBody {
  competition_id: string;
  athlete_params_override?: AthleteOverride;
  patient_user_id?: string;
}

// Categorias válidas por sexo
const FEMALE_CATEGORIES = [
  "BIKINI", "WELLNESS", "FIGURE", "FITNESS",
  "WOMENS_PHYSIQUE", "WOMENS_BODYBUILDING",
];
const MALE_CATEGORIES = [
  "OPEN_BODYBUILDING", "BODYBUILDING_212",
  "CLASSIC_PHYSIQUE", "MENS_PHYSIQUE", "WHEELCHAIR_BODYBUILDING",
];

function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function diffWeeks(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / (7 * 24 * 60 * 60 * 1000));
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function resolveWeightCapKg(capTable: any, heightCm: number): number | null {
  if (!capTable) return null;
  if (typeof capTable.global_cap_kg === "number") return capTable.global_cap_kg;
  if (Array.isArray(capTable.by_height_cm)) {
    for (const row of capTable.by_height_cm) {
      if (heightCm <= row.max) return row.cap_kg;
    }
  }
  return null;
}

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace("Bearer ", "");

    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser(jwt);
    if (userErr || !userData?.user) {
      return jsonResponse({ error: "Não autenticado." }, 401);
    }
    const callerId = userData.user.id;

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const body = (await req.json()) as CalculatePlanBody;
    if (!body.competition_id) {
      return jsonResponse({ error: "competition_id obrigatório." }, 400);
    }

    // Resolve userId alvo (coach mode)
    let userId = callerId;
    if (body.patient_user_id && body.patient_user_id !== callerId) {
      const { data: isCoach } = await admin.rpc("is_coach_of_patient", {
        _coach_user_id: callerId,
        _patient_user_id: body.patient_user_id,
      });
      if (!isCoach) {
        return jsonResponse({ error: "Sem vínculo coach-aluno ativo." }, 403);
      }
      userId = body.patient_user_id;
    }

    // 1. Competição
    const { data: comp, error: compErr } = await admin
      .from("meridian_competitions")
      .select("*")
      .eq("id", body.competition_id)
      .eq("user_id", userId)
      .single();
    if (compErr || !comp) {
      return jsonResponse({ error: "Competição não encontrada." }, 404);
    }

    // 2. Perfil do atleta (com override opcional)
    const { data: athleteRow } = await admin
      .from("meridian_athlete_parameters")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    const ov = body.athlete_params_override ?? {};
    const athlete = {
      biological_sex: ov.biological_sex ?? athleteRow?.biological_sex,
      athlete_track: ov.athlete_track ?? athleteRow?.athlete_track,
      height_cm: ov.height_cm ?? athleteRow?.height_cm,
      current_weight_kg: ov.current_weight_kg ?? athleteRow?.current_weight_kg,
      current_bf_percent: ov.current_bf_percent ?? athleteRow?.current_bf_percent,
    };
    const menstrualStatus: string | null =
      (ov.menstrual_status ?? athleteRow?.menstrual_status ?? null) as any;
    const monthsSinceMenstruation: number | null =
      (ov.months_since_menstruation ?? null) as any;

    for (const [k, v] of Object.entries(athlete)) {
      if (v === undefined || v === null) {
        return jsonResponse({ error: `Parâmetro do atleta ausente: ${k}` }, 400);
      }
    }

    // 2b. Validação categoria × biological_sex
    if (FEMALE_CATEGORIES.includes(comp.category) && athlete.biological_sex !== "FEMALE") {
      return jsonResponse(
        { error: `Categoria ${comp.category} é exclusiva feminina. Atleta cadastrado como ${athlete.biological_sex}.` },
        400,
      );
    }
    if (MALE_CATEGORIES.includes(comp.category) && athlete.biological_sex !== "MALE") {
      return jsonResponse(
        { error: `Categoria ${comp.category} é exclusiva masculina. Atleta cadastrado como ${athlete.biological_sex}.` },
        400,
      );
    }

    // 2c. Bloqueio clínico obrigatório — atleta feminina BF < 14% sem exames recentes
    if (athlete.biological_sex === "FEMALE" && Number(athlete.current_bf_percent) < 14) {
      const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();
      let hasRecentExams = false;
      try {
        const { data: recentExams } = await admin
          .from("athlete_health_markers" as any)
          .select("id, collected_at")
          .eq("user_id", userId)
          .gte("collected_at", sixMonthsAgo)
          .limit(1);
        hasRecentExams = !!(recentExams && (recentExams as any).length > 0);
      } catch (_) {
        // Tabela ainda não existe — degrada graciosamente (será criada em rodada futura).
      }

      if (!hasRecentExams) {
        return jsonResponse({
          error: "BLOQUEIO_CLINICO_OBRIGATORIO",
          message: `Atleta feminina com BF ${athlete.current_bf_percent}% requer painel hormonal recente (últimos 6 meses) antes de prep. Risco de RED-S/Tríade da Atleta sem avaliação clínica é inaceitável.`,
          required_markers: [
            "estradiol", "progesterona", "lh", "fsh", "prolactina",
            "tsh", "t3_livre", "t4_livre",
            "ferritina", "vitamina_d_25oh",
            "cortisol_matinal", "hemograma_completo",
          ],
          next_steps: [
            "Solicitar exames com endocrinologista ou ginecologista esportivo",
            "Aguardar resultado (7-14 dias típico)",
            "Cadastrar exames em /athlete/health-markers",
            "Retornar ao MERIDIAN após registro",
          ],
        }, 422);
      }
    }

    // 3. Default parameters
    const { data: defaults, error: defErr } = await admin
      .from("meridian_default_parameters")
      .select("*")
      .eq("biological_sex", athlete.biological_sex)
      .eq("athlete_track", athlete.athlete_track)
      .eq("category", comp.category)
      .eq("age_group", comp.age_group)
      .single();

    if (defErr || !defaults) {
      return jsonResponse({
        error: `Sem parâmetros padrão para ${athlete.biological_sex}/${athlete.athlete_track}/${comp.category}/${comp.age_group}. Esta combinação ainda não foi liberada no MERIDIAN.`,
      }, 422);
    }

    // 4. Stage target weight
    const heightCm = Number(athlete.height_cm);
    const currentWeight = Number(athlete.current_weight_kg);
    const currentBf = Number(athlete.current_bf_percent);
    const stageBfMin = Number(defaults.stage_bf_min);
    const stageBfMax = Number(defaults.stage_bf_max);
    const stageBfTarget = (stageBfMin + stageBfMax) / 2;

    const currentLbm = currentWeight * (1 - currentBf / 100);
    let stageTargetWeight = currentLbm / (1 - stageBfTarget / 100);

    let weightCapApplied: number | null = null;
    if (defaults.has_weight_cap && defaults.weight_cap_table) {
      const cap = resolveWeightCapKg(defaults.weight_cap_table, heightCm);
      if (cap !== null) {
        weightCapApplied = cap;
        if (stageTargetWeight > cap) stageTargetWeight = cap;
      }
    }

    // 5. Detecção de estratégia: CUT, BUILD ou MAINTENANCE
    const lossKg = Math.max(currentWeight - stageTargetWeight, 0);
    const gainKg = Math.max(stageTargetWeight - currentWeight, 0);

    let planStrategy: "CUT" | "BUILD" | "MAINTENANCE";
    if (athlete.athlete_track === "LIFESTYLE") {
      planStrategy = "MAINTENANCE";
    } else if (gainKg > 0.5) {
      planStrategy = "BUILD";
    } else if (lossKg > 0.5) {
      planStrategy = "CUT";
    } else {
      planStrategy = "MAINTENANCE";
    }

    // Variáveis de fase
    let dietWeeks = 0;
    let hardCutWeeks = 0;
    let buildWeeks = 0;
    let refineWeeks = 0;
    let projectedLeanGainKg = 0;
    let projectedFatLossKg = 0;

    const finalSharpeningWeeks = defaults.final_sharpening_weeks_default;
    const peakWeekWeeks = 1;
    const prePrepWeeks = defaults.pre_prep_weeks_default;
    const bufferWeeks = defaults.buffer_weeks_recommended;
    const recoveryWeeks = defaults.reverse_diet_weeks_recommended;

    const dietLossRate =
      (Number(defaults.diet_phase_loss_min) + Number(defaults.diet_phase_loss_max)) / 2;
    const hardCutLossRate =
      (Number(defaults.hard_cut_loss_min) + Number(defaults.hard_cut_loss_max)) / 2;

    const isLifestyle = athlete.athlete_track === "LIFESTYLE";

    if (planStrategy === "CUT") {
      const hardCutWeeksTarget = isLifestyle ? 3 : 5;
      const hardCutMaxFraction = isLifestyle ? 0.25 : 0.45;
      const hardCutLossKg = Math.min(
        currentWeight * (hardCutLossRate / 100) * hardCutWeeksTarget,
        lossKg * hardCutMaxFraction,
      );
      const dietLossKg = Math.max(lossKg - hardCutLossKg, 0);
      dietWeeks = dietLossKg > 0
        ? Math.ceil(dietLossKg / (currentWeight * (dietLossRate / 100)))
        : 0;
      hardCutWeeks = hardCutLossKg > 0 ? hardCutWeeksTarget : 0;
      projectedFatLossKg = lossKg;
    } else if (planStrategy === "BUILD") {
      // Taxa de ganho lean realista
      const baseBuildRatePct = athlete.biological_sex === "FEMALE" ? 0.25 : 0.35;
      const trackMultiplier =
        athlete.athlete_track === "NATURAL" ? 0.7 :
        athlete.athlete_track === "LIFESTYLE" ? 0.8 : 1.0;
      const effectiveBuildRatePct = baseBuildRatePct * trackMultiplier;

      buildWeeks = Math.ceil(gainKg / (currentWeight * (effectiveBuildRatePct / 100)));
      refineWeeks = athlete.biological_sex === "FEMALE" ? 8 : 6;
      projectedLeanGainKg = gainKg;
    }

    // 6. Datas reversas
    const compDate = new Date(comp.competition_date + "T00:00:00Z");
    const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z");

    const peakWeekStart = addDays(compDate, -7);
    const finalSharpeningStart = addDays(peakWeekStart, -finalSharpeningWeeks * 7);

    let hardCutStart: Date | null = null;
    let dietPhaseStart: Date | null = null;
    let prePrepStart: Date;
    let buildPhaseStart: Date | null = null;
    let refinePhaseStart: Date | null = null;
    let offSeasonEnd: Date;

    if (planStrategy === "CUT") {
      hardCutStart = addDays(finalSharpeningStart, -hardCutWeeks * 7);
      dietPhaseStart = addDays(hardCutStart, -dietWeeks * 7);
      prePrepStart = addDays(dietPhaseStart, -prePrepWeeks * 7);
      offSeasonEnd = addDays(prePrepStart, -bufferWeeks * 7);
    } else if (planStrategy === "BUILD") {
      refinePhaseStart = addDays(finalSharpeningStart, -refineWeeks * 7);
      buildPhaseStart = addDays(refinePhaseStart, -buildWeeks * 7);
      prePrepStart = buildPhaseStart;
      offSeasonEnd = addDays(buildPhaseStart, -bufferWeeks * 7);
    } else {
      refinePhaseStart = addDays(finalSharpeningStart, -4 * 7);
      prePrepStart = refinePhaseStart;
      offSeasonEnd = addDays(prePrepStart, -bufferWeeks * 7);
    }

    const postStageRecoveryEnd = addDays(compDate, recoveryWeeks * 7);

    const totalWeeksToStage = Math.max(diffWeeks(compDate, today), 0);
    const availableWeeks = diffWeeks(compDate, today);
    const requiredWeeks =
      planStrategy === "BUILD"
        ? buildWeeks + refineWeeks + finalSharpeningWeeks + peakWeekWeeks
        : planStrategy === "CUT"
        ? prePrepWeeks + dietWeeks + hardCutWeeks + finalSharpeningWeeks + peakWeekWeeks
        : refineWeeks + finalSharpeningWeeks + peakWeekWeeks;

    // 7. Warnings de viabilidade
    const warnings: string[] = [];
    let viabilityStatus = "GREEN";

    if (availableWeeks < requiredWeeks) {
      viabilityStatus = "RED";
      warnings.push(
        `Janela insuficiente: prova em ${availableWeeks} sem, prep mínima exige ${requiredWeeks} sem.`,
      );
    } else if (availableWeeks < requiredWeeks + bufferWeeks) {
      viabilityStatus = "YELLOW";
      warnings.push(
        `Buffer abaixo do recomendado (${availableWeeks - requiredWeeks} sem vs ${bufferWeeks} sem ideais).`,
      );
    }

    if (weightCapApplied !== null && stageTargetWeight === weightCapApplied) {
      warnings.push(
        `Weight cap aplicado: ${weightCapApplied} kg. Peso natural estimado acima do cap — perda adicional necessária.`,
      );
    }

    if (planStrategy === "CUT" && lossKg / currentWeight > 0.18) {
      warnings.push(
        `Perda total projetada (${(lossKg / currentWeight * 100).toFixed(1)}%) acima do ideal. Considere prep mais longa.`,
      );
    }

    // 7b. Warnings específicos por estratégia
    if (planStrategy === "BUILD") {
      warnings.push(
        `BUILD-FIRST: atleta abaixo do peso de palco projetado (precisa ganhar ${gainKg.toFixed(1)} kg de massa magra). Plano gera ${buildWeeks} sem de construção + ${refineWeeks} sem de refinamento. Não é prep tradicional.`,
      );
      const ideal = buildWeeks + refineWeeks + finalSharpeningWeeks + peakWeekWeeks + bufferWeeks;
      if (buildWeeks > 0 && availableWeeks < ideal) {
        warnings.push(
          `BUILD-FIRST: janela de ${availableWeeks} sem provavelmente insuficiente para ganho lean adequado (${ideal} sem ideais). Considere prova mais distante OU aceitar estética abaixo do target da categoria.`,
        );
      }
    }

    if (planStrategy === "MAINTENANCE") {
      warnings.push(
        "MAINTENANCE: atleta dentro do target. Plano foca em refinamento e manutenção, sem fases de corte ou construção significativas.",
      );
    }

    // 7c. RED-S / Tríade da Atleta Feminina
    if (athlete.biological_sex === "FEMALE") {
      const amenorrheaFlag = defaults.amenorrhea_is_red_flag === true;
      if (amenorrheaFlag && menstrualStatus === "AMENORRHEA") {
        if ((monthsSinceMenstruation ?? 0) >= 2) {
          viabilityStatus = "RED";
          warnings.push(
            "RED-S CRÍTICO: amenorreia ≥ 2 meses. Prep bloqueada — encaminhamento médico obrigatório antes de prosseguir.",
          );
        } else {
          if (viabilityStatus === "GREEN") viabilityStatus = "YELLOW";
          warnings.push(
            "RED-S ALERTA: amenorreia recente. Monitoramento hormonal semanal obrigatório.",
          );
        }
      }
      if (currentBf < 14) {
        if (viabilityStatus === "GREEN") viabilityStatus = "YELLOW";
        warnings.push(
          `BF inicial baixo (${currentBf}%). Risco elevado de RED-S durante a prep — priorizar energia disponível ≥ 30 kcal/kg LBM.`,
        );
      }
      if (defaults.cycle_sync_recommended) {
        warnings.push(
          "Cycle-sync recomendado: cargas e cardio sincronizados às fases folicular/lútea para preservar performance.",
        );
      }
    }

    // 7d. Track NATURAL — janelas mínimas mais longas + drug test calendar
    if (athlete.athlete_track === "NATURAL" && planStrategy === "CUT") {
      const naturalMinPrepWeeks = athlete.biological_sex === "FEMALE" ? 28 : 24;
      if (availableWeeks < naturalMinPrepWeeks) {
        if (viabilityStatus === "GREEN") viabilityStatus = "YELLOW";
        warnings.push(
          `NATURAL: prep abaixo da janela mínima recomendada (${availableWeeks} sem vs ${naturalMinPrepWeeks} sem).`,
        );
      }
      const lossRatePct = (lossKg / currentWeight) * 100;
      if (lossRatePct > 12) {
        if (viabilityStatus === "GREEN") viabilityStatus = "YELLOW";
        warnings.push(
          `NATURAL: perda total projetada ${lossRatePct.toFixed(1)}% acima do ideal (≤12% sem assistência farmacológica).`,
        );
      }
    }
    if (athlete.athlete_track === "NATURAL") {
      if (comp.is_natural_federation) {
        warnings.push(
          `NATURAL: federação ${comp.federation} exige drug test. Cadastre o calendário de testes no painel.`,
        );
      } else {
        warnings.push(
          `NATURAL: federação ${comp.federation} declarada como NÃO-tested. Confirme política antidoping antes de competir.`,
        );
      }
    }

    // 7e. Track LIFESTYLE
    if (isLifestyle && planStrategy === "CUT") {
      const lossRatePct = (lossKg / currentWeight) * 100;
      if (lossRatePct > 8) {
        if (viabilityStatus === "GREEN") viabilityStatus = "YELLOW";
        warnings.push(
          `LIFESTYLE: perda projetada ${lossRatePct.toFixed(1)}% acima do ideal sustentável (≤8%).`,
        );
      }
    }
    if (isLifestyle) {
      warnings.push(
        "LIFESTYLE: modo manutenção ativo — peak week opcional, foco em adesão e reverse diet pós-evento.",
      );
    }

    // 8. Persistir plano
    await admin
      .from("meridian_plans")
      .update({ is_active: false })
      .eq("competition_id", body.competition_id)
      .eq("is_active", true);

    const calculationInputs = {
      defaults_id: defaults.id,
      athlete_snapshot: athlete,
      plan_strategy: planStrategy,
      computed: {
        lossKg, gainKg, dietWeeks, hardCutWeeks, buildWeeks, refineWeeks,
        prePrepWeeks, bufferWeeks, availableWeeks, requiredWeeks,
        weightCapApplied, projectedLeanGainKg, projectedFatLossKg,
      },
      generated_at: new Date().toISOString(),
    };

    const { data: plan, error: insErr } = await admin
      .from("meridian_plans")
      .insert({
        user_id: userId,
        competition_id: body.competition_id,
        version: 1,
        is_active: true,
        plan_strategy: planStrategy,
        stage_target_weight_kg: Number(stageTargetWeight.toFixed(2)),
        stage_target_bf_percent: Number(stageBfTarget.toFixed(2)),
        total_weeks_to_stage: totalWeeksToStage,
        off_season_end_date: isoDate(offSeasonEnd),
        pre_prep_start_date: isoDate(prePrepStart),
        diet_phase_start_date: dietPhaseStart ? isoDate(dietPhaseStart) : null,
        hard_cut_start_date: hardCutStart ? isoDate(hardCutStart) : null,
        build_phase_start_date: buildPhaseStart ? isoDate(buildPhaseStart) : null,
        refine_phase_start_date: refinePhaseStart ? isoDate(refinePhaseStart) : null,
        final_sharpening_start_date: isoDate(finalSharpeningStart),
        peak_week_start_date: isoDate(peakWeekStart),
        post_stage_recovery_end_date: isoDate(postStageRecoveryEnd),
        buffer_weeks: bufferWeeks,
        projected_lean_gain_kg: planStrategy === "BUILD" ? Number(projectedLeanGainKg.toFixed(2)) : null,
        projected_fat_loss_kg: planStrategy === "CUT" ? Number(projectedFatLossKg.toFixed(2)) : null,
        generated_by: "meridian-calculate-plan-v2",
        calculation_inputs: calculationInputs,
        viability_status: viabilityStatus,
        warnings,
      })
      .select()
      .single();

    if (insErr) {
      console.error("meridian-calculate-plan insert error:", insErr);
      return jsonResponse({ error: insErr.message }, 500);
    }

    return jsonResponse({ plan });
  } catch (e) {
    console.error("meridian-calculate-plan error:", e);
    return jsonResponse(
      { error: e instanceof Error ? e.message : "Erro desconhecido" },
      500,
    );
  }
});
