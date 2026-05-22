import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  analyzePlateau,
  type PlateauAnalysis,
  type WorkoutSet,
} from "@/utils/plateauDetector";

// ─── Badge no card de exercício ───
export function PlateauBadge({ analysis }: { analysis?: PlateauAnalysis | null }) {
  if (!analysis?.temPlatô || analysis.score < 30) return null;
  const severo = analysis.score >= 70;
  const cor = severo ? "#EF4444" : "#FBBF24";
  const bg = severo ? "rgba(239,68,68,0.12)" : "rgba(251,191,36,0.12)";
  const border = severo ? "rgba(239,68,68,0.3)" : "rgba(251,191,36,0.3)";
  return (
    <span
      title={`Score ${analysis.score} — ${analysis.sinais[0]?.descricao ?? ""}`}
      style={{
        fontSize: 9, fontWeight: 600,
        color: cor, background: bg,
        border: `0.5px solid ${border}`,
        borderRadius: 6, padding: "1px 6px",
      }}
    >
      ⚠ Platô {analysis.score}
    </span>
  );
}

// ─── Card de Platô por Exercício ───
function PlateauExerciseCard({
  athleteId,
  nome,
  analysis,
}: {
  athleteId: string;
  nome: string;
  analysis: PlateauAnalysis;
}) {
  const [open, setOpen] = useState(false);
  const [applied, setApplied] = useState(false);

  const proto = analysis.protocolo;
  if (!proto) return null;

  const scoreCor =
    analysis.score >= 70 ? "#EF4444" : analysis.score >= 40 ? "#FBBF24" : "#FB923C";

  const apply = async () => {
    const { error } = await supabase.from("plateau_protocols").insert({
      athlete_id: athleteId,
      exercise_name: nome,
      protocol_type: proto.tipo,
      score: analysis.score,
      ajustes: proto.ajustes as any,
      sinais: analysis.sinais as any,
      applied_at: new Date().toISOString(),
    });
    if (error) {
      toast.error("Não foi possível salvar o protocolo");
      return;
    }
    setApplied(true);
    toast.success(`${proto.nome} aplicado a ${nome}`);
  };

  return (
    <div style={{
      marginBottom: 8,
      background: "rgba(255,255,255,0.03)",
      border: `0.5px solid ${scoreCor}30`,
      borderLeft: `2px solid ${scoreCor}`,
      borderRadius: 10, overflow: "hidden",
    }}>
      <div
        onClick={() => setOpen(!open)}
        style={{
          padding: "10px 14px", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.9)", margin: "0 0 3px" }}>
            {nome}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{
              fontSize: 10, fontWeight: 600,
              color: scoreCor, background: `${scoreCor}15`,
              border: `0.5px solid ${scoreCor}30`,
              padding: "1px 6px", borderRadius: 6,
            }}>
              Score {analysis.score}
            </span>
            {analysis.sinais.map((s, i) => (
              <span key={i} style={{
                fontSize: 9, color: "rgba(255,255,255,0.4)",
                background: "rgba(255,255,255,0.05)",
                padding: "1px 5px", borderRadius: 4,
              }}>
                {s.tipo} · {s.severidade}
              </span>
            ))}
          </div>
        </div>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
          {open ? "▲" : "▼"}
        </span>
      </div>

      {open && (
        <div style={{ padding: "0 14px 14px" }}>
          <p style={{
            fontSize: 10, color: "rgba(255,255,255,0.35)",
            letterSpacing: "0.06em", margin: "0 0 6px", textTransform: "uppercase",
          }}>
            EVIDÊNCIAS
          </p>
          {analysis.sinais.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 4, fontSize: 11 }}>
              <span style={{ color: scoreCor, flexShrink: 0 }}>·</span>
              <span style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
                {s.descricao}
                <span style={{ color: "rgba(255,255,255,0.25)", marginLeft: 5, fontStyle: "italic" }}>
                  ({s.evidencia})
                </span>
              </span>
            </div>
          ))}

          <div style={{
            marginTop: 12, padding: "12px 14px",
            background: `${scoreCor}08`,
            border: `0.5px solid ${scoreCor}25`,
            borderRadius: 10,
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: scoreCor, margin: "0 0 2px" }}>
                  {proto.nome}
                </p>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: 0 }}>
                  Duração: {proto.duracao}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                {proto.ajustes.volume_pct !== 0 && (
                  <p style={{
                    fontSize: 10,
                    color: proto.ajustes.volume_pct < 0 ? "#34D399" : "#EF4444",
                    margin: "0 0 2px",
                  }}>
                    Volume {proto.ajustes.volume_pct > 0 ? "+" : ""}{proto.ajustes.volume_pct}%
                  </p>
                )}
                {proto.ajustes.carga_pct !== 0 && (
                  <p style={{
                    fontSize: 10,
                    color: proto.ajustes.carga_pct < 0 ? "#34D399" : "#EF4444",
                    margin: 0,
                  }}>
                    Carga {proto.ajustes.carga_pct > 0 ? "+" : ""}{proto.ajustes.carga_pct}%
                  </p>
                )}
              </div>
            </div>

            <div style={{ marginBottom: 10 }}>
              {proto.instrucoes.map((inst, i) => (
                <p key={i} style={{
                  fontSize: 11, color: "rgba(255,255,255,0.55)",
                  margin: "0 0 4px", lineHeight: 1.5, paddingLeft: 10,
                  borderLeft: `1.5px solid ${scoreCor}40`,
                }}>
                  {inst}
                </p>
              ))}
            </div>

            <p style={{
              fontSize: 10, color: "rgba(52,211,153,0.7)",
              margin: "8px 0 10px", fontStyle: "italic",
            }}>
              Após o protocolo: {proto.retorno}
            </p>

            <button
              onClick={apply}
              disabled={applied}
              style={{
                width: "100%", padding: "8px",
                background: applied ? "rgba(52,211,153,0.15)" : `${scoreCor}20`,
                border: `0.5px solid ${applied ? "rgba(52,211,153,0.3)" : `${scoreCor}40`}`,
                borderRadius: 8,
                cursor: applied ? "default" : "pointer",
                fontSize: 12, fontWeight: 600,
                color: applied ? "#34D399" : scoreCor,
                transition: "all .2s",
              }}
            >
              {applied ? "✓ Protocolo aplicado" : `Aplicar ${proto.nome}`}
            </button>
          </div>

          {proto.exercicios_trocar.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <p style={{
                fontSize: 9, color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.08em", margin: "0 0 6px",
                textTransform: "uppercase",
              }}>
                SUBSTITUIR
              </p>
              {proto.exercicios_trocar.map((ex, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: "rgba(239,68,68,0.7)", textDecoration: "line-through" }}>
                    {ex}
                  </span>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>→</span>
                  <span style={{ fontSize: 11, color: "rgba(52,211,153,0.7)", fontStyle: "italic" }}>
                    variante equivalente
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Dashboard de Platô (busca histórico do atleta) ───
export function PlateauDashboard({
  athleteId,
  exercises,
  semanaMeso = 1,
  totalMeso = 4,
}: {
  athleteId: string;
  exercises: { nome: string }[];
  semanaMeso?: number;
  totalMeso?: number;
}) {
  const [analyses, setAnalyses] = useState<Record<string, PlateauAnalysis>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!athleteId || !exercises.length) {
        setLoading(false);
        return;
      }
      setLoading(true);

      // Buscar sets recentes do atleta (últimos 60 dias) via workout_diary
      const since = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
      const { data: diaries } = await supabase
        .from("workout_diary")
        .select("id, created_at")
        .eq("user_id", athleteId)
        .gte("created_at", since);

      const diaryIds = (diaries ?? []).map((d) => d.id);
      if (!diaryIds.length) {
        if (!cancelled) {
          setAnalyses({});
          setLoading(false);
        }
        return;
      }

      const { data: sets } = await supabase
        .from("workout_sets_detail")
        .select("carga, reps_realizadas, rir_alvo, rir_real, created_at, exercise_id, exercises:exercise_id(nome)")
        .in("diary_id", diaryIds)
        .order("created_at", { ascending: false })
        .limit(2000);

      const results: Record<string, PlateauAnalysis> = {};
      for (const ex of exercises) {
        const exLower = (ex.nome ?? "").toLowerCase();
        if (!exLower) continue;
        const matched = (sets ?? []).filter((s: any) => {
          const n = (s.exercises?.nome ?? "").toLowerCase();
          return n && (n.includes(exLower) || exLower.includes(n));
        }) as unknown as WorkoutSet[];
        if (matched.length < 6) continue;
        const analysis = analyzePlateau(matched, ex.nome, 2, semanaMeso, totalMeso);
        if (analysis.temPlatô) results[ex.nome] = analysis;
      }

      if (!cancelled) {
        setAnalyses(results);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [athleteId, JSON.stringify(exercises.map((e) => e.nome)), semanaMeso, totalMeso]);

  if (loading) {
    return (
      <div style={{
        padding: 12, textAlign: "center",
        fontSize: 11, color: "rgba(255,255,255,0.3)",
      }}>
        Analisando histórico de platô...
      </div>
    );
  }

  const emPlatô = Object.entries(analyses);

  if (!emPlatô.length) {
    return (
      <div style={{
        padding: "10px 14px", marginBottom: 12,
        background: "rgba(52,211,153,0.06)",
        border: "0.5px solid rgba(52,211,153,0.15)",
        borderRadius: 10,
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ fontSize: 14 }}>✓</span>
        <p style={{ fontSize: 11, color: "rgba(52,211,153,0.8)", margin: 0 }}>
          Sem sinais de platô detectados — progressão normal
        </p>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{
        fontSize: 10, color: "rgba(239,68,68,0.8)",
        letterSpacing: "0.08em", margin: "0 0 8px",
        textTransform: "uppercase",
      }}>
        ⚠ Platô detectado — {emPlatô.length} exercício(s)
      </p>
      {emPlatô.map(([nome, analysis]) => (
        <PlateauExerciseCard
          key={nome}
          athleteId={athleteId}
          nome={nome}
          analysis={analysis}
        />
      ))}
    </div>
  );
}
