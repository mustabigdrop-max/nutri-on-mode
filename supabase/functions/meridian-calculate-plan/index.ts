// MERIDIAN — Edge Function: calcula plano de prep com cálculo reverso determinístico.
// Sem IA nesta fase. Apenas matemática.

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
}

interface CalculatePlanBody {
  competition_id: string;
  athlete_params_override?: AthleteOverride;
}

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

// Aplica weight cap por altura (Classic Physique / 212).
function resolveWeightCapKg(
  capTable: any,
  heightCm: number,
): number | null {
  if (!capTable) return null;
  if (typeof capTable.global_cap_kg === "number") return capTable.global_cap_kg;
  if (Array.isArray(capTable.by_height_cm)) {
    for (const row of capTable.by_height_cm) {
      if (heightCm <= row.max) return row.cap_kg;
    }
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";
    const jwt = authHeader.replace("Bearer ", "");

    // Cliente com JWT do usuário para identificá-lo
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser(jwt);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Não autenticado." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    // Service client para operações seguras
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const body = (await req.json()) as CalculatePlanBody;
    if (!body.competition_id) {
      return new Response(JSON.stringify({ error: "competition_id obrigatório." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Competição
    const { data: comp, error: compErr } = await admin
      .from("meridian_competitions")
      .select("*")
      .eq("id", body.competition_id)
      .eq("user_id", userId)
      .single();
    if (compErr || !comp) {
      return new Response(JSON.stringify({ error: "Competição não encontrada." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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

    for (const [k, v] of Object.entries(athlete)) {
      if (v === undefined || v === null) {
        return new Response(
          JSON.stringify({ error: `Parâmetro do atleta ausente: ${k}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
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
      return new Response(
        JSON.stringify({
          error: `Sem parâmetros padrão para ${athlete.biological_sex}/${athlete.athlete_track}/${comp.category}/${comp.age_group}. Esta combinação ainda não foi liberada no MERIDIAN.`,
        }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // 4. Stage target weight
    const heightCm = Number(athlete.height_cm);
    const currentWeight = Number(athlete.current_weight_kg);
    const currentBf = Number(athlete.current_bf_percent);
    const stageBfMin = Number(defaults.stage_bf_min);
    const stageBfMax = Number(defaults.stage_bf_max);
    const stageBfTarget = (stageBfMin + stageBfMax) / 2;

    // LBM aproximado e peso de palco estimado pela perda de gordura
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

    // 5. Cálculo reverso de fases
    const lossKg = Math.max(currentWeight - stageTargetWeight, 0);

    const dietLossRate =
      (Number(defaults.diet_phase_loss_min) + Number(defaults.diet_phase_loss_max)) / 2;
    const hardCutLossRate =
      (Number(defaults.hard_cut_loss_min) + Number(defaults.hard_cut_loss_max)) / 2;

    const finalSharpeningWeeks = defaults.final_sharpening_weeks_default;
    const peakWeekWeeks = 1;
    const prePrepWeeks = defaults.pre_prep_weeks_default;
    const bufferWeeks = defaults.buffer_weeks_recommended;
    const recoveryWeeks = defaults.reverse_diet_weeks_recommended;

    // Distribuir perda entre Diet Phase e Hard Cut (Hard Cut tipicamente últimas 4-6 sem)
    const hardCutWeeksTarget = 5;
    const hardCutLossKg = Math.min(
      currentWeight * (hardCutLossRate / 100) * hardCutWeeksTarget,
      lossKg * 0.45,
    );
    const dietLossKg = Math.max(lossKg - hardCutLossKg, 0);

    const dietWeeks = dietLossKg > 0
      ? Math.ceil(dietLossKg / (currentWeight * (dietLossRate / 100)))
      : 0;
    const hardCutWeeks = hardCutLossKg > 0 ? hardCutWeeksTarget : 0;

    // Datas reversas a partir da prova
    const compDate = new Date(comp.competition_date + "T00:00:00Z");
    const today = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00Z");

    const peakWeekStart = addDays(compDate, -7);
    const finalSharpeningStart = addDays(peakWeekStart, -finalSharpeningWeeks * 7);
    const hardCutStart = addDays(finalSharpeningStart, -hardCutWeeks * 7);
    const dietPhaseStart = addDays(hardCutStart, -dietWeeks * 7);
    const prePrepStart = addDays(dietPhaseStart, -prePrepWeeks * 7);
    const offSeasonEnd = addDays(prePrepStart, -bufferWeeks * 7);
    const postStageRecoveryEnd = addDays(compDate, recoveryWeeks * 7);

    const totalWeeksToStage = Math.max(diffWeeks(compDate, today), 0);
    const availableWeeks = diffWeeks(compDate, today);
    const requiredWeeks =
      prePrepWeeks + dietWeeks + hardCutWeeks + finalSharpeningWeeks + peakWeekWeeks;

    // 6. Warnings de viabilidade
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
        `Weight cap aplicado: ${weightCapApplied} kg. Peso estimado natural acima do cap — perda adicional necessária.`,
      );
    }

    if (lossKg / currentWeight > 0.18) {
      warnings.push(
        `Perda total projetada (${(lossKg / currentWeight * 100).toFixed(1)}%) acima do ideal. Considere prep mais longa.`,
      );
    }

    // 7. Persistir plano
    // Desativa planos ativos anteriores
    await admin
      .from("meridian_plans")
      .update({ is_active: false })
      .eq("competition_id", body.competition_id)
      .eq("is_active", true);

    const calculationInputs = {
      defaults_id: defaults.id,
      athlete_snapshot: athlete,
      computed: {
        lossKg,
        dietLossKg,
        hardCutLossKg,
        dietLossRate,
        hardCutLossRate,
        dietWeeks,
        hardCutWeeks,
        prePrepWeeks,
        bufferWeeks,
        availableWeeks,
        requiredWeeks,
        weightCapApplied,
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
        stage_target_weight_kg: Number(stageTargetWeight.toFixed(2)),
        stage_target_bf_percent: Number(stageBfTarget.toFixed(2)),
        total_weeks_to_stage: totalWeeksToStage,
        off_season_end_date: isoDate(offSeasonEnd),
        pre_prep_start_date: isoDate(prePrepStart),
        diet_phase_start_date: isoDate(dietPhaseStart),
        hard_cut_start_date: isoDate(hardCutStart),
        final_sharpening_start_date: isoDate(finalSharpeningStart),
        peak_week_start_date: isoDate(peakWeekStart),
        post_stage_recovery_end_date: isoDate(postStageRecoveryEnd),
        buffer_weeks: bufferWeeks,
        generated_by: "meridian-calculate-plan-v1",
        calculation_inputs: calculationInputs,
        viability_status: viabilityStatus,
        warnings,
      })
      .select()
      .single();

    if (insErr) {
      return new Response(JSON.stringify({ error: insErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("meridian-calculate-plan error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
