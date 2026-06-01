// MERIDIAN — Recalibração determinística pós-checkpoint (Bloco 3).
// Compara peso atual vs trajetória esperada para a fase e propõe ajuste (kcal/cardio).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Taxas-alvo de perda de peso por fase (% peso corporal / semana)
const TARGET_LOSS_RATE: Record<string, [number, number]> = {
  PRE_PREP: [0.3, 0.6],
  DIET_PRINCIPAL: [0.5, 0.8],
  HARD_CUT: [0.7, 1.0],
  FINAL_SHARPENING: [0.3, 0.6],
  PEAK_WEEK: [0.0, 0.3],
  OFF_SEASON: [-0.3, 0.2],
  POST_STAGE_RECOVERY: [-0.5, 0.0],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) {
      return new Response(JSON.stringify({ error: "Usuário inválido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const checkpointId = body?.checkpoint_id as string | undefined;
    if (!checkpointId) {
      return new Response(JSON.stringify({ error: "checkpoint_id obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Carrega checkpoint atual
    const { data: cp, error: cpErr } = await supabase
      .from("meridian_weekly_checkpoints")
      .select("*")
      .eq("id", checkpointId)
      .eq("user_id", userId)
      .single();
    if (cpErr || !cp) {
      return new Response(JSON.stringify({ error: "Checkpoint não encontrado" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!cp.plan_id || !cp.weight_kg) {
      return new Response(
        JSON.stringify({ error: "Checkpoint precisa de plan_id e weight_kg" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Checkpoint anterior do mesmo plano
    const { data: prev } = await supabase
      .from("meridian_weekly_checkpoints")
      .select("*")
      .eq("user_id", userId)
      .eq("plan_id", cp.plan_id)
      .lt("checkpoint_date", cp.checkpoint_date)
      .order("checkpoint_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    const phase = cp.current_phase ?? "DIET_PRINCIPAL";
    const [minRate, maxRate] = TARGET_LOSS_RATE[phase] ?? [0.4, 0.7];

    let kcalDelta = 0;
    let cardioDelta = 0;
    let reason = "Sem checkpoint anterior — manter plano atual.";
    let adjustmentType: "MAINTAIN" | "CUT_KCAL" | "RESTORE_KCAL" | "ADD_CARDIO" = "MAINTAIN";
    let aiRationale =
      "Sem ciclo anterior para comparar. Recalibração só ocorre a partir do 2º checkpoint.";

    if (prev?.weight_kg) {
      const daysGap = Math.max(
        1,
        Math.round(
          (new Date(cp.checkpoint_date).getTime() -
            new Date(prev.checkpoint_date).getTime()) /
            86400000,
        ),
      );
      const weeksGap = daysGap / 7;
      const lostKg = Number(prev.weight_kg) - Number(cp.weight_kg);
      const lostPctPerWeek = (lostKg / Number(prev.weight_kg)) * 100 / weeksGap;

      if (lostPctPerWeek < minRate) {
        // Perda abaixo do esperado → cortar kcal ou adicionar cardio
        const deficit = minRate - lostPctPerWeek;
        if (deficit > 0.3) {
          kcalDelta = -200;
          cardioDelta = 30;
          adjustmentType = "CUT_KCAL";
          reason = `Perda de ${lostPctPerWeek.toFixed(2)}%/sem abaixo do alvo ${minRate}% (fase ${phase}). Ajuste agressivo.`;
        } else {
          kcalDelta = -100;
          cardioDelta = 15;
          adjustmentType = "CUT_KCAL";
          reason = `Perda de ${lostPctPerWeek.toFixed(2)}%/sem ligeiramente abaixo do alvo. Ajuste conservador.`;
        }
        aiRationale = `Trajetória atrás do cronograma. Corte de ${Math.abs(kcalDelta)} kcal e +${cardioDelta}min cardio para realinhar.`;
      } else if (lostPctPerWeek > maxRate) {
        // Perda excessiva → restaurar kcal (risco de catabolismo)
        kcalDelta = +150;
        cardioDelta = -10;
        adjustmentType = "RESTORE_KCAL";
        reason = `Perda de ${lostPctPerWeek.toFixed(2)}%/sem acima do alvo ${maxRate}% (fase ${phase}). Restaurar kcal para proteger LBM.`;
        aiRationale = `Perda excessiva pode comprometer LBM. Adicionar ${kcalDelta} kcal (priorizar carbs) e reduzir cardio ${Math.abs(cardioDelta)}min.`;
      } else {
        reason = `Perda de ${lostPctPerWeek.toFixed(2)}%/sem dentro do alvo (${minRate}-${maxRate}%). Manter plano.`;
        aiRationale = "Trajetória ideal. Sem mudança nesta semana.";
      }

      // Sinais de stress alto → não cortar kcal
      const stressFlags: string[] = [];
      if ((cp.energy_level ?? 10) <= 3) stressFlags.push("energia muito baixa");
      if ((cp.sleep_quality ?? 10) <= 3) stressFlags.push("sono ruim");
      if ((cp.training_performance ?? 10) <= 3) stressFlags.push("performance caindo");
      if (stressFlags.length >= 2 && kcalDelta < 0) {
        kcalDelta = 0;
        cardioDelta = 0;
        adjustmentType = "MAINTAIN";
        reason += ` BLOQUEADO: ${stressFlags.join(", ")}. Recuperação > déficit.`;
        aiRationale = `Múltiplos sinais de overreaching (${stressFlags.join(", ")}). Manter kcal — recuperação prioritária.`;
      }
    }

    const { data: adjustment, error: adjErr } = await supabase
      .from("meridian_plan_adjustments")
      .insert({
        user_id: userId,
        plan_id: cp.plan_id,
        checkpoint_id: cp.id,
        adjustment_type: adjustmentType,
        kcal_delta: kcalDelta,
        cardio_delta_min: cardioDelta,
        reason,
        ai_rationale: aiRationale,
        applied_by: "SYSTEM",
      })
      .select()
      .single();

    if (adjErr) {
      return new Response(JSON.stringify({ error: adjErr.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ adjustment, sitrep: reason }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
