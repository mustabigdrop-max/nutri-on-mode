// MERIDIAN — Scanner de notificações automáticas. Roda via cron diário ou invocação manual.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  const inserts: any[] = [];

  // Pull active plans + competition + last checkpoint per plan.
  const { data: plans } = await supabase
    .from("meridian_plans")
    .select("id, user_id, competition_id, peak_week_start_date, viability_status")
    .eq("is_active", true);

  for (const p of plans ?? []) {
    const { data: comp } = await supabase
      .from("meridian_competitions")
      .select("id, competition_name, competition_date")
      .eq("id", p.competition_id)
      .maybeSingle();
    if (!comp) continue;

    const daysToStage = Math.floor(
      (new Date(comp.competition_date).getTime() - today.getTime()) / 86400000,
    );

    // 1. Peak week starting (≤14d, exact window)
    if (daysToStage <= 14 && daysToStage >= 0) {
      inserts.push({
        user_id: p.user_id,
        plan_id: p.id,
        competition_id: comp.id,
        kind: "PEAK_WEEK_WINDOW",
        severity: "WARN",
        title: `Peak window aberto — ${comp.competition_name}`,
        body: `Faltam ${daysToStage}d para o palco. Bloqueio tático: dieta/hidratação/sódio sob controle absoluto.`,
        dedupe_key: `peak:${p.id}:${comp.competition_date}`,
      });
    }

    // 2. Drug tests próximos (≤14d)
    const { data: drugs } = await supabase
      .from("meridian_drug_tests")
      .select("id, federation, test_type, scheduled_date, status")
      .eq("plan_id", p.id)
      .eq("status", "SCHEDULED")
      .gte("scheduled_date", todayIso);
    for (const d of drugs ?? []) {
      const dd = Math.floor(
        (new Date(d.scheduled_date).getTime() - today.getTime()) / 86400000,
      );
      if (dd <= 14) {
        inserts.push({
          user_id: p.user_id,
          plan_id: p.id,
          kind: "DRUG_TEST_NEAR",
          severity: dd <= 3 ? "CRITICAL" : "WARN",
          title: `Drug test em ${dd}d (${d.federation})`,
          body: `${d.test_type} agendado para ${d.scheduled_date}. Revise janela de washout.`,
          dedupe_key: `drug:${d.id}`,
          payload: { drug_test_id: d.id },
        });
      }
    }

    // 3. Checkpoint atrasado (>8d desde último)
    const { data: lastCp } = await supabase
      .from("meridian_weekly_checkpoints")
      .select("id, checkpoint_date")
      .eq("plan_id", p.id)
      .order("checkpoint_date", { ascending: false })
      .limit(1)
      .maybeSingle();
    const daysSince = lastCp
      ? Math.floor((today.getTime() - new Date(lastCp.checkpoint_date).getTime()) / 86400000)
      : 999;
    if (daysSince >= 8) {
      inserts.push({
        user_id: p.user_id,
        plan_id: p.id,
        kind: "CHECKPOINT_OVERDUE",
        severity: daysSince >= 14 ? "CRITICAL" : "WARN",
        title: `Checkpoint atrasado (${daysSince}d)`,
        body: `Último check-in há ${daysSince} dias. Sem dado, sem ajuste — registre agora.`,
        dedupe_key: `cp-overdue:${p.id}:${todayIso.slice(0, 7)}`,
      });
    }

    // 4. RED-S detectado (último triad_log RED dentro de 14d)
    const { data: triad } = await supabase
      .from("meridian_triad_log")
      .select("id, severity, log_date, flags")
      .eq("user_id", p.user_id)
      .eq("severity", "RED")
      .gte("log_date", new Date(today.getTime() - 14 * 86400000).toISOString().slice(0, 10))
      .order("log_date", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (triad) {
      inserts.push({
        user_id: p.user_id,
        plan_id: p.id,
        kind: "REDS_DETECTED",
        severity: "CRITICAL",
        title: "RED-S detectado — intervenção obrigatória",
        body: `Triad log em RED (${triad.log_date}). Pausar déficit, refeed, encaminhar para médica/o esportiva.`,
        dedupe_key: `reds:${triad.id}`,
        payload: { triad_id: triad.id, flags: triad.flags },
      });
    }
  }

  let inserted = 0;
  if (inserts.length) {
    const { error, count } = await supabase
      .from("meridian_notifications")
      .upsert(inserts, { onConflict: "user_id,dedupe_key", ignoreDuplicates: true, count: "exact" });
    if (error) {
      console.error("upsert error", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    inserted = count ?? 0;
  }

  return new Response(
    JSON.stringify({ scanned: plans?.length ?? 0, generated: inserts.length, inserted }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
