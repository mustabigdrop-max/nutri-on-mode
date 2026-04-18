// STRATUM WEEKLY — Camada 7 (Relatório Semanal)
// Analisa últimos 7 dias e gera relatório com IA adaptado ao PCA
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
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

    const today = new Date();
    const weekStart = new Date(today); weekStart.setDate(today.getDate() - 7);
    const ws = weekStart.toISOString().slice(0, 10);
    const we = today.toISOString().slice(0, 10);

    const [{ data: sessions }, { data: exercises }, { data: readiness }, { data: stratumProfile }] = await Promise.all([
      supabase.from("stratum_sessions").select("*").eq("user_id", user.id).gte("data_sessao", ws).lte("data_sessao", we),
      supabase.from("stratum_exercises").select("*").eq("user_id", user.id).gte("created_at", weekStart.toISOString()),
      supabase.from("stratum_readiness").select("*").eq("user_id", user.id).gte("check_date", ws),
      supabase.from("stratum_profiles").select("pca_perfil, modulo_recomendado, nivel").eq("user_id", user.id).maybeSingle(),
    ]);

    const sess = sessions || [];
    const exs = exercises || [];
    const reads = readiness || [];

    const aderencia = Math.min(100, Math.round((sess.length / 5) * 100));
    const volumeTotal = exs.reduce((s, e) => s + (e.sets || 0), 0);
    const rpeMedio = exs.length ? (exs.reduce((s, e) => s + (e.rpe || 0), 0) / exs.length) : 0;
    const prontidaoMedia = reads.length ? (reads.reduce((s, r) => s + (r.score || 0), 0) / reads.length) : 0;
    const prs = exs.filter(e => e.pr).map(e => ({ exercicio: e.exercicio, carga: e.carga }));

    const volumePorGrupo: Record<string, number> = {};
    sess.forEach(s => {
      const g = s.grupo_principal || "outros";
      volumePorGrupo[g] = (volumePorGrupo[g] || 0) + (s.volume_total || 0);
    });

    const empurrar = sess.filter(s => /chest|shoulder|tric|push/i.test(s.grupo_principal || "")).length;
    const puxar = sess.filter(s => /back|costas|bic|pull/i.test(s.grupo_principal || "")).length;
    const ratio = `${empurrar}:${puxar}`;

    const alertas: string[] = [];
    if (empurrar > 0 && puxar < empurrar) alertas.push(`⚠ Volume de puxada abaixo do ideal (ratio ${ratio})`);
    if (rpeMedio > 8.5) alertas.push(`⚠ RPE médio alto (${rpeMedio.toFixed(1)}) — risco de overtraining`);
    if (prontidaoMedia > 0 && prontidaoMedia < 60) alertas.push(`⚠ Prontidão média baixa (${prontidaoMedia.toFixed(0)}/100)`);
    if (alertas.length === 0) alertas.push("✓ Nenhum alerta crítico");

    const pca = stratumProfile?.pca_perfil || "Racional";

    const prompt = `Gere a ANÁLISE DO STRATUM (1 parágrafo, 3-5 linhas) adaptada ao perfil PCA "${pca}" baseada nos dados:
- Aderência: ${aderencia}% (${sess.length} sessões)
- Volume: ${volumeTotal} sets | RPE médio: ${rpeMedio.toFixed(1)}
- Prontidão média: ${prontidaoMedia.toFixed(0)}/100
- Ratio empurrar:puxar: ${ratio}
- PRs: ${prs.length}

REGRAS POR PCA:
- Racional: técnico, dados, sem emoção
- Emocional: contexto da conquista, jornada, parceria
- Pragmatico: ultra-direto, max 3 linhas, ação
- Social: contexto comunidade, benchmarks

Não use emojis. Não inclua título. Apenas o parágrafo.`;

    let analise = `Aderência ${aderencia}%, volume ${volumeTotal} sets, RPE ${rpeMedio.toFixed(1)}.`;
    try {
      const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (aiResp.ok) {
        const aiData = await aiResp.json();
        analise = aiData.choices?.[0]?.message?.content?.trim() || analise;
      }
    } catch (e) { console.error("AI weekly fail:", e); }

    // Próxima semana
    const semanaNum = Math.floor((Date.now() - new Date(2025, 0, 1).getTime()) / (7 * 86400000));
    const fase = semanaNum % 4 === 0 ? "Deload" : semanaNum % 4 === 3 ? "Intensidade" : "Volume";

    const proxima = {
      fase,
      ajustes: alertas.includes("⚠ Volume de puxada") ? ["+2 sets de puxada"] : ["Manter protocolo"],
    };

    const report = {
      user_id: user.id,
      semana_inicio: ws,
      semana_fim: we,
      aderencia_pct: aderencia,
      volume_total: volumeTotal,
      rpe_medio: rpeMedio,
      prontidao_media: prontidaoMedia,
      volume_por_grupo: volumePorGrupo,
      ratio_empurrar_puxar: ratio,
      prs,
      alertas,
      analise_pca: analise,
      proxima_semana: proxima,
      fase_proxima: fase,
      ajustes_automaticos: proxima.ajustes,
      enviado: true,
    };

    await supabase.from("stratum_reports").upsert(report, { onConflict: "user_id,semana_inicio" });

    return new Response(JSON.stringify(report), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
