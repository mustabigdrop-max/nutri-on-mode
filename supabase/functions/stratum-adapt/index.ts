// STRATUM ADAPT — Camada 2 (Protocolo Vivo)
// Analisa últimas sessões e detecta progressão / platô / deload / desequilíbrio
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: { user } } = await supabase.auth.getUser(auth.replace("Bearer ", ""));
    if (!user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Carrega últimas 12 sessões
    const { data: sessions } = await supabase
      .from("stratum_sessions")
      .select("id, data_sessao, tipo_treino, grupo_principal, volume_total, rpe_medio, fadiga_reportada")
      .eq("user_id", user.id)
      .order("data_sessao", { ascending: false })
      .limit(12);

    const { data: exercises } = await supabase
      .from("stratum_exercises")
      .select("session_id, exercicio, carga, rpe, rir, reps_realizadas, pr")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    const adaptations: any[] = [];
    const sess = sessions || [];
    const exs = exercises || [];

    // PROGRESSÃO: agrupa por exercício, vê últimas 2 ocorrências
    const byEx: Record<string, typeof exs> = {};
    exs.forEach(e => {
      if (!byEx[e.exercicio]) byEx[e.exercicio] = [];
      byEx[e.exercicio].push(e);
    });

    for (const [exName, list] of Object.entries(byEx)) {
      if (list.length >= 2) {
        const [latest, prev] = list;
        // Progressão: RPE<7 nas 2 últimas
        if ((latest.rpe || 10) < 7 && (prev.rpe || 10) < 7) {
          adaptations.push({
            tipo: "progressao",
            exercicio: exName,
            detalhe: `RPE <7 em 2 sessões consecutivas. Aumentar carga +2.5kg.`,
            dados: { carga_atual: latest.carga, sugerida: Number(latest.carga) + 2.5 },
          });
        }
        // Platô: 3 ocorrências mesma carga + reps + RPE
        if (list.length >= 3) {
          const [a, b, c] = list;
          if (a.carga === b.carga && b.carga === c.carga && a.rpe === b.rpe && b.rpe === c.rpe) {
            adaptations.push({
              tipo: "plato",
              exercicio: exName,
              detalhe: `Platô detectado. Trocar variação ou aplicar técnica avançada (rest-pause / drop set).`,
              dados: { semanas: 3 },
            });
          }
        }
      }
    }

    // DELOAD: fadiga >7 em 3+ sessões recentes
    const fadigaAlta = sess.filter(s => (s.fadiga_reportada || 0) > 7).length;
    if (fadigaAlta >= 3) {
      adaptations.push({
        tipo: "deload",
        detalhe: `Fadiga elevada em ${fadigaAlta} sessões. Deload recomendado: -40-50% volume, manter intensidade.`,
        dados: { fadiga_alta_count: fadigaAlta },
      });
    }

    // DESEQUILÍBRIO: ratio empurrar/puxar
    const empurrar = sess.filter(s => ["chest", "shoulders", "tríceps", "triceps", "push"].some(k => (s.grupo_principal || "").toLowerCase().includes(k))).length;
    const puxar = sess.filter(s => ["back", "costas", "bíceps", "biceps", "pull"].some(k => (s.grupo_principal || "").toLowerCase().includes(k))).length;
    if (empurrar > 0 && puxar / empurrar < 1) {
      adaptations.push({
        tipo: "desequilibrio",
        detalhe: `Ratio empurrar:puxar = ${empurrar}:${puxar}. Adicionar +2 sets de puxada na próxima semana.`,
        dados: { empurrar, puxar },
      });
    }

    // Persiste adaptações novas
    if (adaptations.length > 0) {
      await supabase.from("stratum_adaptations").insert(adaptations.map(a => ({ ...a, user_id: user.id })));
    }

    return new Response(JSON.stringify({ adaptations, analyzed: sess.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
