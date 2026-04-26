import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { plan_id } = await req.json();
    if (!plan_id) {
      return new Response(JSON.stringify({ error: "plan_id required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Buscar plano
    const { data: plan, error: planErr } = await supabase
      .from("competition_plans").select("*").eq("id", plan_id).maybeSingle();
    if (planErr || !plan) throw new Error("Plano não encontrado");

    // Buscar atleta + coach
    const [{ data: athlete }, { data: coachProfile }] = await Promise.all([
      supabase.from("profiles").select("full_name").eq("user_id", plan.athlete_id).maybeSingle(),
      supabase.from("coach_profiles").select("nome_completo, user_id").eq("id", plan.coach_id).maybeSingle(),
    ]);

    // Buscar logs
    const { data: logs } = await supabase
      .from("competition_weekly_logs")
      .select("*").eq("plan_id", plan_id).order("semana", { ascending: true });

    const checkIns = logs || [];
    const pesos = checkIns.filter((l: any) => l.peso !== null);
    const pesoInicial = Number(plan.peso_atual);
    const pesoFinal = pesos.length ? Number(pesos[pesos.length - 1].peso) : pesoInicial;
    const perdaTotal = pesoInicial - pesoFinal;

    const semanasTotal = (plan.blocos as any[])?.reduce(
      (acc, b) => Math.max(acc, b.semana_fim || 0), 0
    ) || 0;

    const avg = (key: string) => {
      const vals = checkIns.map((l: any) => l[key]).filter((v: any) => typeof v === "number");
      if (!vals.length) return 0;
      return vals.reduce((a: number, b: number) => a + b, 0) / vals.length;
    };

    const posingTotal = checkIns.reduce((acc: number, l: any) => acc + (l.posing_min_total || 0), 0);

    // ===== Construir HTML do relatório (será convertido em PDF no client) =====
    const reportData = {
      plano: {
        nome_competicao: plan.nome_competicao,
        federacao: plan.federacao,
        categoria: plan.categoria,
        data_competicao: plan.data_competicao,
        local_competicao: plan.local_competicao,
        atleta_nome: athlete?.full_name || "Atleta",
        coach_nome: coachProfile?.nome_completo || "Coach",
        data_relatorio: new Date().toISOString(),
      },
      biometria: {
        peso_inicial: pesoInicial,
        peso_palco_alvo: Number(plan.peso_alvo_palco),
        peso_final: pesoFinal,
        perda_total: perdaTotal,
        duracao_semanas: semanasTotal,
        bf_inicial: plan.bf_atual ? Number(plan.bf_atual) : null,
        bf_final_estimado: pesos.length && (pesos[pesos.length - 1] as any).bf_estimado
          ? Number((pesos[pesos.length - 1] as any).bf_estimado) : null,
        massa_magra: plan.massa_magra ? Number(plan.massa_magra) : null,
        altura: Number(plan.altura),
      },
      progresso: {
        peso_semana_a_semana: pesos.map((l: any) => ({
          semana: l.semana, peso: Number(l.peso), bf: l.bf_estimado ? Number(l.bf_estimado) : null,
        })),
      },
      aderencia: {
        treino_pct: Math.round(avg("aderencia_treino_pct")),
        dieta_pct: Math.round(avg("aderencia_dieta_pct")),
        recovery_medio: Number(avg("recovery_score").toFixed(1)),
        sono_medio: Number(avg("qualidade_sono").toFixed(1)),
        energia_media: Number(avg("energia").toFixed(1)),
        posing_min_total: Math.round(posingTotal),
        posing_horas_total: Number((posingTotal / 60).toFixed(1)),
        check_ins_realizados: checkIns.length,
        binge_episodios: checkIns.filter((l: any) => l.binge_episodio).length,
      },
      blocos: plan.blocos,
      protocolo_farmacologico: plan.protocolo_farmacologico || "",
    };

    return new Response(JSON.stringify({ success: true, report: reportData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[generate-competition-report] error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
